import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Clock } from "lucide-react";
import { adminBlogDashboardQuery } from "@/lib/queries";
import type { BlogPostDB } from "@/lib/blog-types";

export const Route = createFileRoute("/admin/conteudo/")({
  ssr: false,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(adminBlogDashboardQuery());
  },
  component: AdminBlogDashboard,
});

function AdminBlogDashboard() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Carregando...</div>}>
      <AdminBlogDashboardContent />
    </Suspense>
  );
}

function AdminBlogDashboardContent() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(adminBlogDashboardQuery());
  const posts = data.posts as BlogPostDB[];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;
    await supabase.from("blog_posts" as any).delete().eq("id", id);
    refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conteúdo</h1>
          <p className="text-sm text-muted-foreground">{posts.length} artigo(s) cadastrado(s)</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground gap-2">
          <Link to="/admin/conteudo/$postId" params={{ postId: "novo" }}>
            <Plus className="h-4 w-4" /> Novo Artigo
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground mb-4">Nenhum artigo cadastrado ainda.</p>
          <Button asChild className="bg-primary text-primary-foreground gap-2">
            <Link to="/admin/conteudo/$postId" params={{ postId: "novo" }}>
              <Plus className="h-4 w-4" /> Criar primeiro artigo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card border-border">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-20 h-14 rounded-md overflow-hidden bg-surface shrink-0 border border-border">
                  {post.imagem_capa_url && (
                    <img src={post.imagem_capa_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{post.titulo}</p>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                        post.publicado ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.publicado ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{(post.categorias ?? []).join(", ") || "sem categoria"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.tempo_leitura} min
                    </span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/conteudo/$postId" params={{ postId: post.id }}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(post.id, post.titulo)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
