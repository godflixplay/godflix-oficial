import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export interface ReelItem {
  id: string;
  titulo: string;
  video_url: string;
  thumbnail_url: string | null;
  tipo: "upload" | "link";
}

interface ReelsCarouselProps {
  reels: ReelItem[];
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function getInstagramEmbed(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/);
  return m ? `https://www.instagram.com/p/${m[1]}/embed` : null;
}

function ReelPlayer({ reel }: { reel: ReelItem }) {
  if (reel.tipo === "upload") {
    return (
      <video
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        controls
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  const ytId = getYouTubeId(reel.video_url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}`}
        title={reel.titulo}
        allow="accelerated-sensors; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    );
  }

  const igEmbed = getInstagramEmbed(reel.video_url);
  if (igEmbed) {
    return <iframe src={igEmbed} title={reel.titulo} allowFullScreen className="w-full h-full" />;
  }

  return (
    <a
      href={reel.video_url}
      target="_blank"
      rel="noreferrer"
      className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground"
    >
      <Play className="h-10 w-10" />
    </a>
  );
}

export function ReelsCarousel({ reels }: ReelsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (reels.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="relative">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Bastidores & Equipe</h2>
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
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="shrink-0 w-[200px] aspect-[9/16] rounded-xl overflow-hidden bg-muted border border-border"
            >
              <ReelPlayer reel={reel} />
            </div>
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
