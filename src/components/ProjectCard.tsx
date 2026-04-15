import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Projeto, formatCurrency, calcProgress } from "@/lib/mock-data";

interface ProjectCardProps {
  projeto: Projeto;
}

const statusLabel: Record<string, string> = {
  em_financiamento: "Em financiamento",
  em_producao: "Em produção",
  concluido: "Concluído",
};

export function ProjectCard({ projeto }: ProjectCardProps) {
  const progress = calcProgress(projeto.arrecadado, projeto.meta);

  return (
    <Link
      to="/projetos/$projetoId"
      params={{ projetoId: projeto.id }}
      className="group relative flex-shrink-0 w-[280px] sm:w-[300px] rounded-lg overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={projeto.imagem}
          alt={projeto.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs">
          {projeto.categoria}
        </Badge>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
          {projeto.titulo}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {projeto.sinopse}
        </p>

        <div className="space-y-2">
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-primary font-semibold">{formatCurrency(projeto.arrecadado)}</span>
            <span className="text-muted-foreground">{progress}% da meta</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{projeto.apoiadores} apoiadores</span>
            <span>{statusLabel[projeto.status]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
