import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Play } from "lucide-react";
import { type Projeto, formatCurrency, calcProgress } from "@/lib/mock-data";

interface HeroCarouselProps {
  destaques: Projeto[];
  intervalMs?: number;
}

export function HeroCarousel({ destaques, intervalMs = 5000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (destaques.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % destaques.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [destaques.length, intervalMs]);

  if (destaques.length === 0) return null;

  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-end overflow-hidden">
      {destaques.map((destaque, i) => (
        <img
          key={destaque.id}
          src={destaque.imagem}
          alt={destaque.titulo}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {destaques.map((destaque, i) => {
        const progress = calcProgress(destaque.arrecadado, destaque.meta);
        return (
          <div
            key={destaque.id}
            className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none absolute"
            }`}
          >
            <Badge className="mb-4 bg-primary/90 text-primary-foreground">{destaque.categoria}</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 max-w-2xl leading-tight">
              {destaque.titulo}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-6 leading-relaxed">
              {destaque.sinopse}
            </p>

            <div className="max-w-md mb-6">
              <Progress value={progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary font-semibold">{formatCurrency(destaque.arrecadado)}</span>
                <span className="text-muted-foreground">Meta: {formatCurrency(destaque.meta)}</span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{destaque.apoiadores} apoiadores</span>
                <span>{destaque.diasRestantes} dias restantes</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Link to="/projetos/$projetoId" params={{ projetoId: destaque.id }}>
                  <Heart className="h-5 w-5" /> Apoiar este projeto
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/projetos/$projetoId" params={{ projetoId: destaque.id }}>
                  <Play className="h-5 w-5" /> Saiba mais
                </Link>
              </Button>
            </div>
          </div>
        );
      })}

      {destaques.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {destaques.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
