import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { planosMembro, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/membros")({
  head: () => ({
    meta: [
      { title: "Seja Membro — Godflix" },
      { name: "description", content: "Torne-se membro da Godflix e apoie a produção de conteúdo audiovisual cristão de qualidade." },
      { property: "og:title", content: "Seja Membro — Godflix" },
      { property: "og:description", content: "Torne-se membro da Godflix e apoie a produção de conteúdo audiovisual cristão." },
    ],
  }),
  component: MembrosPage,
});

function MembrosPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Associação</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Seja Membro da Godflix</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ao se tornar membro, você apoia diretamente a missão de financiar e produzir conteúdo audiovisual cristão de qualidade para o Brasil e o mundo.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {planosMembro.map((plano) => (
            <Card
              key={plano.id}
              className={`relative bg-card ${plano.destaque ? "border-primary ring-1 ring-primary/30" : "border-border"} hover:border-primary/40 transition-all`}
            >
              {plano.destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="h-3 w-3" /> Mais popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 pt-8">
                <h3 className="text-xl font-bold text-foreground mb-1">{plano.nome}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">{formatCurrency(plano.preco)}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plano.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plano.destaque ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  variant={plano.destaque ? "default" : "outline"}
                  size="lg"
                >
                  Assinar {plano.nome}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {[
              { q: "Como funciona a associação?", a: "Ao se associar, você contribui mensalmente com um valor fixo que é direcionado para financiar projetos audiovisuais cristãos aprovados pela curadoria da Godflix." },
              { q: "Posso cancelar a qualquer momento?", a: "Sim! Sua associação pode ser cancelada a qualquer momento, sem multas ou taxas adicionais." },
              { q: "Os membros participam das decisões criativas?", a: "A participação dos membros é financeira e institucional. As decisões criativas ficam a cargo dos produtores e da equipe da Godflix." },
              { q: "Posso mudar de plano?", a: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudança é aplicada no próximo ciclo de cobrança." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
