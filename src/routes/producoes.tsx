import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/Carousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ArrowRight } from "lucide-react";
import { type Projeto, type Categoria } from "@/lib/mock-data";
import { projetosHomeQuery } from "@/lib/queries";

export const Route = createFileRoute("/producoes")({
  head: () => ({
    meta: [
      { title: "Produções — Godflix" },
      { name: "description", content: "Conheça os filmes, séries, documentários e animações que a Godflix está financiando e produzindo." },
      { property: "og:title", content: "Produções — Godflix" },
      { property: "og:description", content: "Conheça os filmes, séries, documentários e animações que a Godflix está financiando e produzindo." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(projetosHomeQuery());
  },
  component: ProducoesPage,
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-muted-foreground">Carregando produções…</p>
    </div>
  ),
});

function ProducoesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProducoesContent />
    </Suspense>
  );
}

function ProducoesContent() {
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center pt-16">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-2">Produções</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">Filmes, séries e documentários em construção</h1>
        <p className="text-muted-foreground max-w-2xl">Cada produção nasce do apoio de quem acredita nela antes das câmeras ligarem.</p>
      </div>

      <HeroCarousel destaques={destaquesHero} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        <Carousel titulo="Todos os Projetos" projetos={projetos} />

        {categoriasComProjetos.map(({ categoria, projetos: projs }) => (
          <Carousel key={categoria} titulo={categoria + "s"} projetos={projs} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Tem um projeto audiovisual cristão?</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Se você é produtor, diretor ou roteirista e quer financiar sua produção com a Godflix, envie seu projeto pra nossa equipe avaliar.
            </p>
          </div>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0">
            <Link to="/enviar-projeto">
              Enviar Projeto <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
