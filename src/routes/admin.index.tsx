import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag, Activity } from "lucide-react";
import type { ProjetoDB } from "@/lib/admin-types";
import { SortableProjectList } from "@/components/admin/SortableProjectList";
import { CategoriaManager } from "@/components/admin/CategoriaManager";
import { StatusManager } from "@/components/admin/StatusManager";
import { adminDashboardQuery } from "@/lib/queries";

export const Route = createFileRoute("/admin/")({
  // Client-only: dados do admin dependem de sessão autenticada (RLS),
  // que só existe no browser. SSR aqui causaria queries sem auth.
  ssr: false,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(adminDashboardQuery());
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Carregando...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(adminDashboardQuery());
  const projetos = data.projetos as ProjetoDB[];
  const categorias = data.categorias;
  const statusList = data.statusList;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });

  const statusLabels: Record<string, string> = Object.fromEntries(
    statusList.map((s: any) => [s.valor, s.label])
  );

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;
    await supabase.from("projetos" as any).delete().eq("id", id);
    refresh();
  };

  const handleReorderDestaques = async (newList: ProjetoDB[]) => {
    const updated = newList.map((p, i) => ({ ...p, ordem_destaque: i + 1 }));
    // Optimistic update
    queryClient.setQueryData(adminDashboardQuery().queryKey, (old: any) => {
      if (!old) return old;
      const map = new Map(updated.map((u) => [u.id, u]));
      return { ...old, projetos: old.projetos.map((p: any) => map.get(p.id) || p) };
    });
    await Promise.all(
      updated.map((p) =>
        supabase.from("projetos" as any).update({ ordem_destaque: p.ordem_destaque } as any).eq("id", p.id)
      )
    );
  };

  const handleReorderCategoria = async (newList: ProjetoDB[]) => {
    const updated = newList.map((p, i) => ({ ...p, ordem_categoria: i + 1 }));
    // Optimistic update
    queryClient.setQueryData(adminDashboardQuery().queryKey, (old: any) => {
      if (!old) return old;
      const map = new Map(updated.map((u) => [u.id, u]));
      return { ...old, projetos: old.projetos.map((p: any) => map.get(p.id) || p) };
    });
    await Promise.all(
      updated.map((p) =>
        supabase
          .from("projetos" as any)
          .update({ ordem_categoria: (p as any).ordem_categoria } as any)
          .eq("id", p.id)
      )
    );
  };

  const destaques = projetos
    .filter((p) => p.destaque)
    .sort((a, b) => (a.ordem_destaque ?? 0) - (b.ordem_destaque ?? 0));

  const categoriasOrdenadas = categorias.length > 0
    ? categorias.map((c: any) => c.nome)
    : Array.from(new Set(projetos.map((p) => p.categoria)));

  const projetosPorCategoria = categoriasOrdenadas
    .map((nome: string) => ({
      categoria: nome,
      items: projetos
        .filter((p) => p.categoria === nome)
        .sort((a: any, b: any) => (a.ordem_categoria ?? 0) - (b.ordem_categoria ?? 0)),
    }))
    .filter((g: any) => g.items.length > 0);

  const semCategoria = projetos.filter((p) => !categoriasOrdenadas.includes(p.categoria));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">{projetos.length} projetos cadastrados</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground gap-2">
          <Link to="/admin/projetos/$projetoId" params={{ projetoId: "novo" }}>
            <Plus className="h-4 w-4" /> Novo Projeto
          </Link>
        </Button>
      </div>

      {/* Categorias e Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriaManager categorias={categorias} onChange={refresh} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusManager status={statusList} onChange={refresh} />
          </CardContent>
        </Card>
      </div>

      {/* Banner rotativo */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Banner rotativo da home (arraste para reordenar)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Apenas projetos marcados como "destaque" aparecem aqui. Os banners giram a cada 5 segundos na ordem definida abaixo.
          </p>
        </CardHeader>
        <CardContent>
          {destaques.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum projeto marcado como destaque ainda.</p>
          ) : (
            <SortableProjectList
              projetos={destaques}
              statusLabels={statusLabels}
              onReorder={handleReorderDestaques}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Projetos por categoria */}
      {projetosPorCategoria.length === 0 && semCategoria.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado ainda.</p>
          <Button asChild className="bg-primary text-primary-foreground gap-2">
            <Link to="/admin/projetos/$projetoId" params={{ projetoId: "novo" }}>
              <Plus className="h-4 w-4" /> Criar primeiro projeto
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {projetosPorCategoria.map(({ categoria, items }: any) => (
            <Card key={categoria} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">
                  {categoria}{" "}
                  <span className="text-sm text-muted-foreground font-normal">({items.length})</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">Arraste para reordenar dentro desta categoria.</p>
              </CardHeader>
              <CardContent>
                <SortableProjectList
                  projetos={items}
                  statusLabels={statusLabels}
                  onReorder={handleReorderCategoria}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          ))}

          {semCategoria.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Sem categoria reconhecida ({semCategoria.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <SortableProjectList
                  projetos={semCategoria}
                  statusLabels={statusLabels}
                  onReorder={handleReorderCategoria}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
