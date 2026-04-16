import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Clock, ArrowLeft, Star, Sparkles, Crown, Instagram } from "lucide-react";
import { formatCurrency, calcProgress } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projetos/$projetoId")({
  head: ({ params }) => ({
    meta: [
      { title: `Projeto ${params.projetoId} — Godflix` },
      { name: "description", content: "Projeto audiovisual cristão na Godflix" },
    ],
  }),
  component: ProjetoPage,
});

const statusLabel: Record<string, string> = {
  em_financiamento: "Em financiamento",
  em_producao: "Em produção",
  concluido: "Concluído",
};

const tierIcons = [Star, Sparkles, Crown];

interface ProjetoData {
  id: string;
  slug: string;
  titulo: string;
  sinopse: string;
  sinopse_completa: string;
  categoria: string;
  imagem_url: string;
  meta: number;
  arrecadado: number;
  apoiadores: number;
  dias_restantes: number;
  status: string;
}

interface EquipeMembro {
  id: string;
  nome: string;
  papel: string;
  instagram_url: string | null;
}

interface OpcaoApoio {
  id: string;
  valor: number;
  titulo: string;
  descricao: string;
  recompensas: string[];
}

function ProjetoPage() {
  const { projetoId } = Route.useParams();
  const [projeto, setProjeto] = useState<ProjetoData | null>(null);
  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);
  const [opcoes, setOpcoes] = useState<OpcaoApoio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data: projetoData } = await supabase
        .from("projetos")
        .select("*")
        .eq("slug", projetoId)
        .maybeSingle();

      if (!active) return;
      if (!projetoData) {
        setProjeto(null);
        setLoading(false);
        return;
      }
      setProjeto(projetoData as ProjetoData);

      const [{ data: equipeData }, { data: opcoesData }] = await Promise.all([
        supabase.from("equipe_membros").select("*").eq("projeto_id", projetoData.id),
        supabase.from("opcoes_apoio").select("*").eq("projeto_id", projetoData.id).order("ordem"),
      ]);

      if (!active) return;
      setEquipe((equipeData as EquipeMembro[]) || []);
      setOpcoes((opcoesData as OpcaoApoio[]) || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [projetoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-muted-foreground">Carregando projeto...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={projeto.imagem_url} alt={projeto.titulo} className="absolute inset-0 w-full h-full object-cover" />
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
        {/* Funding Area */}
        <section className="mb-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl sm:text-4xl font-bold text-primary">{formatCurrency(projeto.arrecadado)}</span>
                  <span className="text-muted-foreground text-sm">arrecadados</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Meta: <span className="text-foreground font-medium">{formatCurrency(projeto.meta)}</span>
                </p>
                <Progress value={progress} className="h-3 rounded-full" />
                <p className="text-xs text-muted-foreground mt-1.5">{progress}% da meta alcançada</p>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-lg">{projeto.apoiadores.toLocaleString("pt-BR")}</span>
                    <p className="text-xs text-muted-foreground">apoiadores</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-lg">{projeto.dias_restantes}</span>
                    <p className="text-xs text-muted-foreground">dias restantes</p>
                  </div>
                </div>
              </div>

              <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-8" size="lg">
                <Heart className="h-5 w-5" /> Apoiar este projeto
              </Button>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-3 p-6 rounded-xl bg-primary/5 border border-primary/10">
              <Heart className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Faça parte desta história</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Cada contribuição nos aproxima de transformar esta visão em realidade. Escolha sua forma de apoio abaixo.
              </p>
            </div>
          </div>
        </section>

        {/* Contribution Tiers */}
        {opcoes.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Níveis de Contribuição</h2>
            <p className="text-muted-foreground mb-6">Escolha como deseja apoiar este projeto e receba recompensas exclusivas.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {opcoes.map((opcao, index) => {
                const Icon = tierIcons[index] || Star;
                const isHighlight = index === 2;
                return (
                  <Card
                    key={opcao.id}
                    className={`relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 ${
                      isHighlight ? "border-primary/40 bg-gradient-to-b from-primary/10 to-card" : "bg-card hover:border-primary/20"
                    }`}
                  >
                    {isHighlight && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                    )}
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isHighlight ? "bg-primary/20" : "bg-primary/10"}`}>
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{opcao.titulo}</h3>
                          {isHighlight && (
                            <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Mais popular</span>
                          )}
                        </div>
                      </div>

                      <span className="text-2xl font-bold text-primary mb-2">{formatCurrency(opcao.valor)}</span>
                      <p className="text-sm text-muted-foreground mb-4">{opcao.descricao}</p>

                      <ul className="space-y-2 mb-6 flex-1">
                        {opcao.recompensas.map((r) => (
                          <li key={r} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5 shrink-0">✦</span> {r}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full gap-2 ${
                          isHighlight
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                        }`}
                        size="lg"
                      >
                        <Heart className="h-4 w-4" /> Apoiar com {formatCurrency(opcao.valor)}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Sinopse</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {projeto.sinopse_completa || projeto.sinopse}
              </p>
            </div>

            {equipe.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Equipe</h2>
                <div className="flex flex-wrap gap-2">
                  {equipe.map((m) => (
                    <Badge key={m.id} variant="secondary" className="gap-1.5">
                      {m.papel ? `${m.papel}: ` : ""}{m.nome}
                      {m.instagram_url && (
                        <a href={m.instagram_url} target="_blank" rel="noreferrer" className="ml-1 hover:text-primary">
                          <Instagram className="h-3 w-3" />
                        </a>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                    <span className="font-bold">{projeto.dias_restantes}</span>
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
      </div>
    </div>
  );
}
