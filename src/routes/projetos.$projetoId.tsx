import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Clock, ArrowLeft } from "lucide-react";
import { getProjetoById, projetos, opcoesApoio, formatCurrency, calcProgress } from "@/lib/mock-data";
import { ProjectCard } from "@/components/ProjectCard";

export const Route = createFileRoute("/projetos/$projetoId")({
  head: ({ params }) => {
    const projeto = getProjetoById(params.projetoId);
    return {
      meta: [
        { title: projeto ? `${projeto.titulo} — Godflix` : "Projeto — Godflix" },
        { name: "description", content: projeto?.sinopse || "Projeto audiovisual cristão na Godflix" },
        { property: "og:title", content: projeto ? `${projeto.titulo} — Godflix` : "Projeto — Godflix" },
        { property: "og:description", content: projeto?.sinopse || "" },
      ],
    };
  },
  component: ProjetoPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
        <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
      </div>
    </div>
  ),
});

const statusLabel: Record<string, string> = {
  em_financiamento: "Em financiamento",
  em_producao: "Em produção",
  concluido: "Concluído",
};

function ProjetoPage() {
  const { projetoId } = Route.useParams();
  const projeto = getProjetoById(projetoId);

  if (!projeto) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Projeto não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const progress = calcProgress(projeto.arrecadado, projeto.meta);
  const relacionados = projetos.filter((p) => p.id !== projeto.id && p.categoria === projeto.categoria).slice(0, 4);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={projeto.imagem} alt={projeto.titulo} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <Badge className="mb-3 bg-primary/90 text-primary-foreground">{projeto.categoria}</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-2">{projeto.titulo}</h1>
          <p className="text-sm text-muted-foreground">{statusLabel[projeto.status]}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Sinopse</h2>
              <p className="text-muted-foreground leading-relaxed">{projeto.sinopseCompleta}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Equipe</h2>
              <div className="flex flex-wrap gap-2">
                {projeto.equipe.map((m) => (
                  <Badge key={m} variant="secondary">{m}</Badge>
                ))}
              </div>
            </div>

            {/* Opções de apoio */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Opções de Apoio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opcoesApoio.map((opcao) => (
                  <Card key={opcao.id} className="bg-card hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="font-bold text-foreground">{opcao.titulo}</h3>
                        <span className="text-primary font-bold">{formatCurrency(opcao.valor)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{opcao.descricao}</p>
                      <ul className="space-y-1 mb-4">
                        {opcao.recompensas.map((r) => (
                          <li key={r} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">✦</span> {r}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                        Apoiar com {formatCurrency(opcao.valor)}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right: funding sidebar */}
          <div>
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 space-y-4">
              <Progress value={progress} className="h-2.5" />
              <div>
                <span className="text-2xl font-bold text-primary">{formatCurrency(projeto.arrecadado)}</span>
                <span className="text-sm text-muted-foreground ml-2">de {formatCurrency(projeto.meta)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-bold">{projeto.apoiadores}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">apoiadores</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-bold">{projeto.diasRestantes}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">dias restantes</span>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
                <Heart className="h-5 w-5" /> Apoiar este projeto
              </Button>
            </div>
          </div>
        </div>

        {/* Related */}
        {relacionados.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Projetos Relacionados</h2>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {relacionados.map((p) => (
                <ProjectCard key={p.id} projeto={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
