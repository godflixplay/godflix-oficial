import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/Carousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Heart, Users, Building2, ChevronRight, ArrowRight, Clock } from "lucide-react";
import { type Projeto, type Categoria } from "@/lib/mock-data";
import { projetosHomeQuery, blogRecentesQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Godflix — Produção Audiovisual Cristã" },
      { name: "description", content: "Financie e apoie projetos audiovisuais cristãos. Filmes, séries, documentários e animações que transformam vidas." },
      { property: "og:title", content: "Godflix — Produção Audiovisual Cristã" },
      { property: "og:description", content: "Financie e apoie projetos audiovisuais cristãos que transformam vidas." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(projetosHomeQuery());
    queryClient.ensureQueryData(blogRecentesQuery());
  },
  component: HomePage,
  pendingComponent: HomeLoading,
});

function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Carregando projetos…</p>
    </div>
  );
}

function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { data } = useSuspenseQuery(projetosHomeQuery());
  const projetos: Projeto[] = (data.projetos ?? []).map((p: any) => ({
    id: p.slug,
    titulo: p.titulo,
    sinopse: p.sinopse,
    sinopseCompleta: p.sinopse_completa ?? "",
    categoria: p.categoria as Categoria,
    imagem: p.imagem_url || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=675&fit=crop",
    meta: Number(p.meta),
    arrecadado: Number(p.arrecadado),
    apoiadores: p.apoiadores,
    diasRestantes: p.dias_restantes,
    status: p.status,
    equipe: [],
    destaque: p.destaque,
    ordemDestaque: p.ordem_destaque ?? 0,
  }));
  const categorias: Categoria[] = data.categorias as Categoria[];

  if (projetos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground">Nenhum projeto cadastrado ainda</h1>
        <p className="text-muted-foreground max-w-md">
          Acesse o painel administrativo para adicionar o primeiro projeto da Godflix.
        </p>
        <Button asChild>
          <Link to="/admin">Ir para o admin</Link>
        </Button>
      </div>
    );
  }

  const destaques = projetos
    .filter((p) => p.destaque)
    .sort((a, b) => (a.ordemDestaque ?? 0) - (b.ordemDestaque ?? 0));
  const destaquesHero = destaques.length > 0 ? destaques : [projetos[0]];

  const categoriasOrdenadas = categorias.length > 0 ? categorias : Array.from(new Set(projetos.map((p) => p.categoria)));
  const categoriasComProjetos = categoriasOrdenadas
    .map((cat) => ({ categoria: cat, projetos: projetos.filter((p) => p.categoria === cat) }))
    .filter((c) => c.projetos.length > 0);

  return (
    <div className="min-h-screen">
      {/* Hero de missão */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gold-muted/40 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 sm:pt-28 sm:pb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-5">
            Produção audiovisual cristã
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance leading-tight">
            Histórias que fortalecem a fé.
            <br />
            <span className="text-muted-foreground">Conteúdos que protegem a família.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            A Godflix financia, produz e distribui filmes, séries e conteúdo que sua família pode assistir com
            identificação — e sua audiência ajuda a decidir o que sai do papel.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Button asChild variant="outline" size="lg">
              <a href="#como-funciona">Conheça a Godflix</a>
            </Button>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="#projetos">Conheça os projetos</a>
            </Button>
          </div>
        </div>
      </section>

      <HeroCarousel destaques={destaquesHero} />

      {/* Carousels */}
      <div id="projetos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12 scroll-mt-20">
        <Carousel titulo="Todos os Projetos" projetos={projetos} />

        {categoriasComProjetos.map(({ categoria, projetos: projs }) => (
          <Carousel key={categoria} titulo={categoria + "s"} projetos={projs} />
        ))}
      </div>

      <ConteudoSection />

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16 scroll-mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
          Como funciona
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Três formas de fazer parte da revolução do conteúdo audiovisual cristão
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Apoie Projetos</h3>
            <p className="text-sm text-muted-foreground">
              Escolha projetos que tocam seu coração e contribua financeiramente para que se tornem realidade.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Seja Membro</h3>
            <p className="text-sm text-muted-foreground">
              Associe-se à Godflix com contribuições mensais e apoie a missão de produzir conteúdo cristão de qualidade.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Patrocine</h3>
            <p className="text-sm text-muted-foreground">
              Empresas podem patrocinar projetos e ganhar visibilidade de marca junto a uma audiência engajada.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Membership */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-10 sm:p-16">
          <div className="max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Faça parte desta missão
            </h2>
            <p className="text-muted-foreground mb-6">
              Torne-se membro da Godflix e ajude a transformar o cenário do conteúdo cristão no Brasil e no mundo.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Link to="/membros">
                Seja membro <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const temaSugestoes = ["Família", "Filhos", "Juventude", "Fé", "Cultura", "Relacionamentos"];

function ConteudoSection() {
  const { data: posts } = useSuspenseQuery(blogRecentesQuery());
  const [sugestao, setSugestao] = useState("");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-2">Conteúdo</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {posts.length > 0 ? "Conteúdos recentes" : "Esse espaço vai nascer com quem se importa"}
          </h2>
        </div>
        {posts.length > 0 && (
          <Link to="/conteudo" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0">
            Ver todo o conteúdo <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gold-muted/50 via-transparent to-transparent" />
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3">
              Ajude a escolher o primeiro artigo
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ainda não publicamos nada — de propósito. As primeiras reflexões sobre fé, família e cultura vão
              nascer de temas sugeridos pela nossa comunidade.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {temaSugestoes.map((tema) => (
                <button
                  key={tema}
                  type="button"
                  onClick={() => setSugestao(tema)}
                  className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <form
              className="flex rounded-md border border-input bg-background overflow-hidden"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={sugestao}
                onChange={(e) => setSugestao(e.target.value)}
                type="text"
                placeholder="Que tema você quer ver aqui?"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button type="submit" className="rounded-none bg-primary text-primary-foreground">
                Sugerir
              </Button>
            </form>
            <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border px-3 py-2">
              <span className="text-sm text-foreground">Ou só quero saber quando sair o primeiro</span>
              <Link to="/membros" className="text-sm font-semibold text-primary hover:underline shrink-0">
                Avise-me →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                <h3 className="font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.dek}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {post.tempo_leitura} min de leitura
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
