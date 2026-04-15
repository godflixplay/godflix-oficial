import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/enviar-projeto")({
  head: () => ({
    meta: [
      { title: "Enviar Projeto — Godflix" },
      { name: "description", content: "Envie sua proposta de projeto audiovisual cristão para a curadoria da Godflix." },
      { property: "og:title", content: "Enviar Projeto — Godflix" },
      { property: "og:description", content: "Envie sua proposta de projeto audiovisual cristão para a curadoria da Godflix." },
    ],
  }),
  component: EnviarProjetoPage,
});

function EnviarProjetoPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Produtores</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Enviar Projeto</h1>
          <p className="text-lg text-muted-foreground">
            Tem uma ideia de projeto audiovisual cristão? Envie sua proposta para nossa curadoria. Todos os projetos são avaliados pela equipe da Godflix para garantir qualidade e alinhamento.
          </p>
        </div>

        {/* Info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 flex items-start gap-4">
          <Film className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Como funciona a curadoria</h3>
            <p className="text-sm text-muted-foreground">
              Após o envio, nossa equipe analisará sua proposta em até 15 dias úteis. Avaliaremos viabilidade, alinhamento com valores cristãos e potencial de impacto. Entraremos em contato por e-mail com o resultado.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-card border border-primary/30 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Proposta enviada com sucesso!</h3>
            <p className="text-muted-foreground">Agradecemos seu interesse. Nossa equipe avaliará sua proposta e entrará em contato em breve.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Projeto</Label>
              <Input id="titulo" placeholder="Nome do seu projeto" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filme">Filme</SelectItem>
                  <SelectItem value="serie">Série</SelectItem>
                  <SelectItem value="documentario">Documentário</SelectItem>
                  <SelectItem value="animacao">Animação</SelectItem>
                  <SelectItem value="teatro">Teatro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sinopse">Sinopse</Label>
              <Textarea id="sinopse" placeholder="Descreva seu projeto..." rows={5} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento Estimado (R$)</Label>
                <Input id="orcamento" type="number" placeholder="Ex: 250000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo Estimado</Label>
                <Input id="prazo" placeholder="Ex: 12 meses" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Link para Portfólio</Label>
              <Input id="portfolio" type="url" placeholder="https://seu-portfolio.com" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome-produtor">Seu Nome</Label>
                <Input id="nome-produtor" placeholder="Nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-produtor">E-mail</Label>
                <Input id="email-produtor" type="email" placeholder="seu@email.com" required />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
              <Send className="h-4 w-4" /> Enviar Proposta
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
