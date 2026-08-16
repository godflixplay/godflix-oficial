import type { BlocoConteudo } from "@/lib/blog-types";

export function BlocoRenderer({ blocos }: { blocos: BlocoConteudo[] }) {
  return (
    <div className="max-w-[700px] text-[1.04rem] leading-8 text-foreground/90">
      {blocos.map((bloco, i) => (
        <Bloco key={i} bloco={bloco} />
      ))}
    </div>
  );
}

function Bloco({ bloco }: { bloco: BlocoConteudo }) {
  switch (bloco.tipo) {
    case "paragrafo":
      return <p className="mb-6 whitespace-pre-line">{bloco.texto}</p>;

    case "titulo":
      return <h2 className="mt-10 mb-4 text-2xl font-extrabold tracking-tight text-foreground text-balance">{bloco.texto}</h2>;

    case "citacao":
      return (
        <blockquote className="my-8 border-l-[3px] border-primary pl-6 py-1 text-lg italic text-foreground leading-relaxed">
          "{bloco.texto}"
          <cite className="mt-2 block text-sm not-italic text-muted-foreground">{bloco.fonte}</cite>
        </blockquote>
      );

    case "callout":
      return (
        <div className="my-6 rounded-2xl border border-border bg-card p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{bloco.titulo}</p>
          <div className="space-y-3">
            {bloco.itens.map((item, i) => (
              <p key={i} className="text-base font-semibold leading-snug text-foreground before:content-['\201C'] before:mr-1 before:text-primary before:font-bold">
                {item}
              </p>
            ))}
          </div>
        </div>
      );

    case "imagem":
      return (
        <figure className="my-8">
          <div className="aspect-video overflow-hidden rounded-xl border border-border bg-surface">
            {bloco.url && <img src={bloco.url} alt={bloco.legenda} className="h-full w-full object-cover" />}
          </div>
          {bloco.legenda && <figcaption className="mt-2 text-sm leading-snug text-muted-foreground">{bloco.legenda}</figcaption>}
        </figure>
      );

    case "galeria":
      return (
        <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bloco.itens.map((item, i) => (
            <figure key={i}>
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface">
                {item.url && <img src={item.url} alt={item.legenda} className="h-full w-full object-cover" />}
              </div>
              {item.legenda && <figcaption className="mt-2 text-sm leading-snug text-muted-foreground">{item.legenda}</figcaption>}
            </figure>
          ))}
        </div>
      );

    case "video":
      return (
        <figure className="my-8">
          <div className="aspect-video overflow-hidden rounded-xl border border-border bg-surface">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${bloco.videoId}${bloco.inicio ? `?start=${bloco.inicio}` : ""}`}
              title={bloco.legenda || "Vídeo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {bloco.legenda && <figcaption className="mt-2 text-sm leading-snug text-muted-foreground">{bloco.legenda}</figcaption>}
        </figure>
      );

    case "lista":
      return (
        <ol className="mb-6 flex flex-col gap-4">
          {bloco.itens.map((item, i) => (
            <li key={i} className="flex gap-4 rounded-xl border border-border bg-card/60 p-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-gold-muted text-sm font-bold text-primary">
                {i + 1}
              </span>
              <p className="leading-relaxed">
                {item.titulo && <strong className="text-foreground">{item.titulo} </strong>}
                {item.texto}
              </p>
            </li>
          ))}
        </ol>
      );

    default:
      return null;
  }
}
