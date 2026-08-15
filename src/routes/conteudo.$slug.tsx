import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlocoRenderer } from "@/components/BlocoRenderer";
import { blogPostQuery } from "@/lib/queries";

export const Route = createFileRoute("/conteudo/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Conteúdo Godflix` },
      { name: "description", content: "Artigo do blog da Godflix." },
    ],
  }),
  loader: ({ context: { queryClient }, params }) => {
    queryClient.ensureQueryData(blogPostQuery(params.slug));
  },
  component: ConteudoDetalhePage,
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Carregando artigo…</p>
    </div>
  ),
});

function ConteudoDetalhePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ConteudoDetalheContent />
    </Suspense>
  );
}

const formatarData = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";

function ConteudoDetalheContent() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(blogPostQuery(slug));

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <Link to="/conteudo" className="text-primary hover:underline">Voltar ao conteúdo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-sm text-muted-foreground">
        <Link to="/conteudo" className="hover:text-foreground">Conteúdo</Link>
        {post.categorias?.[0] && (
          <>
            {" "}/{" "}
            <span>{post.categorias[0]}</span>
          </>
        )}
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="flex flex-wrap gap-2 mb-5">
          {(post.categorias ?? []).map((cat: string, i: number) => (
            <span
              key={cat}
              className={
                i === 0
                  ? "text-[11px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2.5 py-1 rounded"
                  : "text-[11px] font-bold uppercase tracking-wide border border-primary/30 text-primary px-2.5 py-1 rounded"
              }
            >
              {cat}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance mb-4">
          {post.titulo}
        </h1>
        {post.dek && <p className="text-lg sm:text-xl text-muted-foreground mb-5">{post.dek}</p>}

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-muted border border-primary/30 text-primary font-bold text-xs">
            {post.autor?.[0] ?? "G"}
          </span>
          <span className="font-semibold text-foreground">{post.autor}</span>
          {post.publicado_em && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span>{formatarData(post.publicado_em)}</span>
            </>
          )}
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.tempo_leitura} min de leitura
          </span>
        </div>

        {post.imagem_capa_url && (
          <figure className="mb-10">
            <div className="aspect-video overflow-hidden rounded-xl border border-border bg-surface">
              <img src={post.imagem_capa_url} alt={post.titulo} className="h-full w-full object-cover" />
            </div>
            {post.imagem_capa_credito && (
              <figcaption className="mt-2 text-sm text-muted-foreground">{post.imagem_capa_credito}</figcaption>
            )}
          </figure>
        )}

        <BlocoRenderer blocos={post.conteudo ?? []} />

        <div className="mt-10 rounded-2xl border border-border bg-gradient-to-br from-gold-muted/50 via-transparent to-transparent p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">O convite da Godflix</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3 max-w-xl text-balance">
            Identificar o padrão é o primeiro passo. Mudar ele é o segundo.
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-6">
            A Godflix nasceu para isso: uma convocação a cristãos em todo o Brasil para apoiar e financiar
            produções brasileiras e cristãs — histórias em que o herói é quem a criança quer imitar, porque
            ele é bom, não apesar disso.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Link to="/membros">
              <Heart className="h-4 w-4" /> Junte-se à Godflix
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
