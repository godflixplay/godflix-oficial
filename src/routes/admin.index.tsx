import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag, Activity } from "lucide-react";
import type { ProjetoDB, CategoriaDB, StatusOptionDB } from "@/lib/admin-types";
import { SortableProjectList } from "@/components/admin/SortableProjectList";
import { CategoriaManager } from "@/components/admin/CategoriaManager";
import { StatusManager } from "@/components/admin/StatusManager";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [projetos, setProjetos] = useState<ProjetoDB[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [statusList, setStatusList] = useState<StatusOptionDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [{ data: pData }, { data: cData }, { data: sData }] = await Promise.all([
      supabase.from("projetos" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("categorias" as any).select("*").order("ordem"),
      supabase.from("status_options" as any).select("*").order("ordem"),
    ]);
    setProjetos((pData as unknown as ProjetoDB[]) || []);
    setCategorias((cData as unknown as CategoriaDB[]) || []);
    setStatusList((sData as unknown as StatusOptionDB[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const statusLabels: Record<string, string> = Object.fromEntries(
    statusList.map((s) => [s.valor, s.label])
  );

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;
    await supabase.from("projetos" as any).delete().eq("id", id);
    fetchAll();
  };

  const handleReorderDestaques = async (newList: ProjetoDB[]) => {
    // Update local state immediately for snappy UI
    const updated = newList.map((p, i) => ({ ...p, ordem_destaque: i + 1 }));
    setProjetos((prev) => {
      const map = new Map(updated.map((u) => [u.id, u]));
      return prev.map((p) => map.get(p.id) || p);
    });
    // Persist
    await Promise.all(
      updated.map((p) =>
        supabase.from("projetos" as any).update({ ordem_destaque: p.ordem_destaque } as any).eq("id", p.id)
      )
    );
  };

  const destaques = projetos
    .filter((p) => p.destaque)
    .sort((a, b) => (a.ordem_destaque ?? 0) - (b.ordem_destaque ?? 0));

  // Group by category
  const categoriasOrdenadas = categorias.length > 0
    ? categorias.map((c) => c.nome)
    : Array.from(new Set(projetos.map((p) => p.categoria)));

  const projetosPorCategoria = categoriasOrdenadas
    .map((nome) => ({ categoria: nome, items: projetos.filter((p) => p.categoria === nome) }))
    .filter((g) => g.items.length > 0);

  // Projects with categories not in the list
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

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <>
          {/* Categorias e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> Categorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoriaManager categorias={categorias} onChange={fetchAll} />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusManager status={statusList} onChange={fetchAll} />
              </CardContent>
            </Card>
          </div>

          {/* Banner rotativo - drag&drop */}
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
              {projetosPorCategoria.map(({ categoria, items }) => (
                <Card key={categoria} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{categoria} <span className="text-sm text-muted-foreground font-normal">({items.length})</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SortableProjectList
                      projetos={items}
                      statusLabels={statusLabels}
                      onReorder={() => { /* per-category ordering not persisted */ }}
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
                      onReorder={() => {}}
                      onDelete={handleDelete}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
