import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { type Projeto } from "@/lib/mock-data";

interface CarouselProps {
  titulo: string;
  projetos: Projeto[];
}

export function Carousel({ titulo, projetos }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (projetos.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="relative">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 px-4 sm:px-0">
        {titulo}
      </h2>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {projetos.map((projeto) => (
            <ProjectCard key={projeto.id} projeto={projeto} />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-background to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Próximo"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      </div>
    </section>
  );
}
