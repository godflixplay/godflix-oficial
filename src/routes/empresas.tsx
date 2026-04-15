import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Eye, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Para Empresas — Godflix" },
      { name: "description", content: "Patrocine projetos audiovisuais cristãos e conecte sua marca a uma audiência engajada e apaixonada." },
      { property: "og:title", content: "Para Empresas — Godflix" },
      { property: "og:description", content: "Patrocine projetos audiovisuais cristãos e conecte sua marca a uma audiência engajada." },
    ],
  }),
  component: EmpresasPage,
});

function EmpresasPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Patrocínio</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Para Empresas</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conecte sua marca a projetos que impactam milhões de pessoas. Patrocine produções audiovisuais cristãs e ganhe visibilidade junto a uma audiência fiel e engajada.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Eye, title: "Visibilidade", desc: "Sua marca presente em produções vistas por milhares de pessoas" },
            { icon: Users, title: "Audiência Engajada", desc: "Público cristão fiel, conectado e apaixonado por conteúdo de qualidade" },
            { icon: TrendingUp, title: "Impacto Social", desc: "Associe sua marca a valores positivos e impacto real na sociedade" },
            { icon: Building2, title: "Branding Premium", desc: "Presença em produções de alto nível com padrão cinematográfico" },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-card border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-card border border-border rounded-xl p-8 mb-20 text-center">
          <p className="text-lg text-foreground italic mb-4">
            "Patrocinar um projeto na Godflix foi uma das melhores decisões de branding que tomamos. O retorno em imagem e engajamento superou nossas expectativas."
          </p>
          <p className="text-sm text-muted-foreground">— Empresa parceira (depoimento ilustrativo)</p>
        </div>

        {/* Contact Form */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Entre em Contato</h2>

          {submitted ? (
            <div className="bg-card border border-primary/30 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Mensagem enviada!</h3>
              <p className="text-muted-foreground">Nossa equipe entrará em contato em breve. Obrigado pelo interesse!</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" placeholder="Nome da empresa" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea id="mensagem" placeholder="Conte-nos sobre seu interesse em patrocinar..." rows={4} required />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                Enviar mensagem
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
