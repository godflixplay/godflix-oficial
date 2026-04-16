import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { ProjetoDB } from "@/lib/admin-types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const statusLabel: Record<string, string> = {
  em_financiamento: "Em financiamento",
  em_producao: "Em produção",
  concluido: "Concluído",
};

function AdminDashboard() {
  const [projetos, setProjetos] = useState<ProjetoDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjetos = async () => {
    const { data } = await supabase
      .from("projetos" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setProjetos((data as any as ProjetoDB[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjetos(); }, []);

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;
    await supabase.from("projetos" as any).delete().eq("id", id);
    fetchProjetos();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-sm text-muted-foreground">{projetos.length} projetos cadastrados</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground gap-2">
          <Link to="/admin/projetos/$projetoId" params={{ projetoId: "novo" }}>
            <Plus className="h-4 w-4" /> Novo Projeto
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando projetos...</div>
      ) : projetos.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado ainda.</p>
          <Button asChild className="bg-primary text-primary-foreground gap-2">
            <Link to="/admin/projetos/$projetoId" params={{ projetoId: "novo" }}>
              <Plus className="h-4 w-4" /> Criar primeiro projeto
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projetos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-24 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                {p.imagem_url ? (
                  <img src={p.imagem_url} alt={p.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Sem imagem
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{p.titulo}</h3>
                  {p.destaque && <Star className="h-4 w-4 text-primary shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{p.categoria}</Badge>
                  <span className="text-xs text-muted-foreground">{statusLabel[p.status]}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/projetos/$projetoId" params={{ projetoId: p.id }}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(p.id, p.titulo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
