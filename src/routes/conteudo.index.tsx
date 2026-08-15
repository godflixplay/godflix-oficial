import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Clock } from "lucide-react";
import { blogIndexQuery } from "@/lib/queries";

export const Route = createFileRoute("/conteudo/")({
  head: () => ({
    meta: [
      { title: "Conteúdo — Godflix" },
      { name: "description", content: "Reflexões sobre fé, família e cultura da equipe Godflix." },
      { property: "og:title", content: "Conteúdo — Godflix" },
      { property: "og:description", content: "Reflexões sobre fé, família e cultura da equipe Godflix." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(blogIndexQuery());
  },
  component: ConteudoIndexPage,
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Carregando conteúdo…</p>
    </div>
  ),
});

function ConteudoIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ConteudoIndexContent />
    </Suspense>
  );
}

function ConteudoIndexContent() {
  const { data } = useSuspenseQuery(blogIndexQuery());
  const [filtro, setFiltro] = useState<string | null>(null);

  const posts = filtro ? data.posts.filter((p: any) => p.categorias?.includes(filtro)) : data.posts;

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-3">Conteúdo</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">Reflexões sobre fé, família e cultura</h1>
        <p className="text-muted-foreground">O mesmo espírito das produções da Godflix, em formato de leitura.</p>
      </div>

      {data.categorias.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setFiltro(null)}
            className={`text-sm rounded-full border px-4 py-1.5 transition-colors ${
              filtro === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            Todos
          </button>
          {data.categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFiltro(cat)}
              className={`text-sm rounded-full border px-4 py-1.5 transition-colors ${
                filtro === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-24 border border-border rounded-2xl bg-card">
          <p className="text-muted-foreground">
            {data.posts.length === 0
              ? "Ainda não publicamos nada por aqui — em breve."
              : "Nenhum artigo nessa categoria ainda."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link
              key={post.slug}
              to="/conteudo/$slug"
              params={{ slug: post.slug }}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="aspect-video bg-surface relative overflow-hidden">
                {post.imagem_capa_url && (
                  <img
                    src={post.imagem_capa_url}
                    alt={post.titulo}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {post.categorias?.[0] && (
                  <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded">
                    {post.categorias[0]}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.titulo}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.dek}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {post.tempo_leitura} min de leitura
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
