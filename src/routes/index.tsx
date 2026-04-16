import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/Carousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Heart, Users, Building2, ChevronRight } from "lucide-react";
import { type Projeto, type Categoria } from "@/lib/mock-data";
import { projetosHomeQuery } from "@/lib/queries";

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
      <HeroCarousel destaques={destaquesHero} />

      {/* Carousels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        <Carousel titulo="Todos os Projetos" projetos={projetos} />

        {categoriasComProjetos.map(({ categoria, projetos: projs }) => (
          <Carousel key={categoria} titulo={categoria + "s"} projetos={projs} />
        ))}
      </div>

      {/* Como funciona */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
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
