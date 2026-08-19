import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Users, Building2, ChevronRight, ArrowRight, Clock, Play } from "lucide-react";
import { type Projeto, type Categoria, formatCurrency, calcProgress } from "@/lib/mock-data";
import { projetosHomeQuery, blogRecentesQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Godflix — Uma cultura evangélica brasileira" },
      { name: "description", content: "A Godflix produz filmes, séries, documentários e desenhos brasileiros com raiz na Palavra — uma cultura evangélica própria, não imitação." },
      { property: "og:title", content: "Godflix — Uma cultura evangélica brasileira" },
      { property: "og:description", content: "A Godflix produz filmes, séries, documentários e desenhos brasileiros com raiz na Palavra — uma cultura evangélica própria, não imitação." },
    ],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(projetosHomeQuery());
    queryClient.ensureQueryData(blogRecentesQuery());
  },
  component: HomePage,
  pendingComponent: HomeLoading,
});

function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Carregando projetos…</p>
    </div>
  );
}

function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { data } = useSuspenseQuery(projetosHomeQuery());
  const projetos: Projeto[] = (data.projetos ?? []).map((p: any) => ({
    id: p.slug,
    titulo: p.titulo,
    sinopse: p.sinopse,
    sinopseCompleta: p.sinopse_completa ?? "",
    categoria: p.categoria as Categoria,
    imagem: p.imagem_url || "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=675&fit=crop",
    meta: Number(p.meta),
    arrecadado: Number(p.arrecadado),
    apoiadores: p.apoiadores,
    diasRestantes: p.dias_restantes,
    status: p.status,
    equipe: [],
    destaque: p.destaque,
    ordemDestaque: p.ordem_destaque ?? 0,
  }));
  if (projetos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground">Nenhum projeto cadastrado ainda</h1>
        <p className="text-muted-foreground max-w-md">
          Acesse o painel administrativo para adicionar o primeiro projeto da Godflix.
        </p>
        <Button asChild>
          <Link to="/admin">Ir para o admin</Link>
        </Button>
      </div>
    );
  }

  const destaques = projetos
    .filter((p) => p.destaque)
    .sort((a, b) => (a.ordemDestaque ?? 0) - (b.ordemDestaque ?? 0));
  const destaquesHero = destaques.length > 0 ? destaques : [projetos[0]];

  return (
    <div className="min-h-screen">
      {/* Hero de missão */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gold-muted/40 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 sm:pt-28 sm:pb-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary mb-5">
            Produção audiovisual cristã
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance leading-tight max-w-3xl mx-auto">
            O Brasil cristão não precisa de mais imitação da cultura do mundo.
            <br />
            <span className="text-muted-foreground">Precisa de uma cultura própria.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            A Godflix nasce pra construir isso: filmes, séries, documentários e desenhos brasileiros, com raiz na
            Palavra e qualidade que não faz concessão. Não é sobre competir com o mundo — é sobre não precisar mais imitar.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Button asChild variant="outline" size="lg">
              <a href="#como-funciona">Como funciona</a>
            </Button>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="#como-funciona">Quero fazer parte</a>
            </Button>
          </div>
        </div>
      </section>

      <DorSection />

      <ResponsabilidadeSection />

      <MetodoSection />

      <ConviteSection />

      <ConteudoSection />

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16 scroll-mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
          Como funciona
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Três formas de fazer parte da revolução do conteúdo audiovisual cristão
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Apoie Projetos</h3>
            <p className="text-sm text-muted-foreground">
              Escolha projetos que tocam seu coração e contribua financeiramente para que se tornem realidade.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Seja Membro</h3>
            <p className="text-sm text-muted-foreground">
              Associe-se à Godflix com contribuições mensais e apoie a missão de produzir conteúdo cristão de qualidade.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold-muted flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Patrocine</h3>
            <p className="text-sm text-muted-foreground">
              Empresas podem patrocinar projetos e ganhar visibilidade de marca junto a uma audiência engajada.
            </p>
          </div>
        </div>
      </section>

      <ProjetoDestaqueSection projeto={destaquesHero[0]} />

      {/* CTA Membership */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-10 sm:p-16">
          <div className="max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Faça parte desta missão
            </h2>
            <p className="text-muted-foreground mb-6">
              Torne-se membro da Godflix e ajude a transformar o cenário do conteúdo cristão no Brasil e no mundo.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Link to="/membros">
                Seja membro <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjetoDestaqueSection({ projeto }: { projeto: Projeto }) {
  const progresso = calcProgress(projeto.arrecadado, projeto.meta);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
        <Link
          to="/projetos/$projetoId"
          params={{ projetoId: projeto.id }}
          className="group relative block aspect-video rounded-2xl overflow-hidden border border-border bg-surface"
        >
          <img
            src={projeto.imagem}
            alt={projeto.titulo}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 border border-border">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Play className="h-3 w-3 fill-current" />
            </span>
            <span className="text-xs font-semibold text-foreground">Conheça o projeto</span>
          </div>
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-3">Projeto em destaque</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4 text-balance">{projeto.titulo}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">{projeto.sinopse}</p>

          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-extrabold text-foreground">{formatCurrency(projeto.arrecadado)}</span>
              <span className="text-sm text-muted-foreground">meta de {formatCurrency(projeto.meta)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progresso}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{progresso}% financiado</span>
              <span>{projeto.apoiadores} apoiadores</span>
            </div>
          </div>

          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Link to="/projetos/$projetoId" params={{ projetoId: projeto.id }}>
              Ver o projeto <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function DorSection() {
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">Seja honesto</p>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground text-balance leading-tight mb-6">
          Quantas vezes você trocou de canal, fechou o app, ou fingiu não ver — porque não tinha nada bom pra
          assistir com sua família?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Não é falta de opção. É falta de opção <span className="text-foreground font-semibold">boa</span>. Sobra
          imitação barata da cultura do mundo com verniz religioso, ou produção tão amadora que ninguém aguenta
          terminar. E enquanto isso, seus filhos crescem admirando histórias que não têm nada a ver com o que
          vocês creem.
        </p>
      </div>
    </section>
  );
}

function ResponsabilidadeSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">Ninguém vai fazer isso por nós</p>
      <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground text-balance mb-6">Se não formos nós, quem?</h2>
      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
        A indústria não vai construir isso — não é o negócio dela. Ninguém vai financiar de graça. Enquanto isso,
        a próxima geração cresce sem ver a fé dela representada com qualidade. A mudança começa com quem já
        decidiu que isso importa — e está disposto a bancar.
      </p>
    </section>
  );
}

function MetodoSection() {
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">Como isso funciona de verdade</p>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground text-balance mb-6">
          Financiamento coletivo, produção profissional.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Cada assinatura entra num fundo que financia produção real — roteiro, direção, elenco, pós-produção — no
          nível de qualquer streaming. Não é arrecadação pra "ajudar um projetinho". É construir, aos poucos, um
          catálogo inteiro: filmes, séries, documentários, desenhos. Você não está doando pra caridade. Está
          investindo numa indústria que ainda não existe no Brasil.
        </p>
      </div>
    </section>
  );
}

function ConviteSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-4">Sua parte nisso</p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground text-balance">
        Você não precisa saber fazer filme. Precisa decidir que vale a pena financiar um.
      </h2>
    </section>
  );
}

const temaSugestoes = ["Família", "Filhos", "Juventude", "Fé", "Cultura", "Relacionamentos"];

function ConteudoSection() {
  const { data: posts } = useSuspenseQuery(blogRecentesQuery());
  const [sugestao, setSugestao] = useState("");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-2">Conteúdo</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {posts.length > 0 ? "Conteúdos recentes" : "Esse espaço vai nascer com quem se importa"}
          </h2>
        </div>
        {posts.length > 0 && (
          <Link to="/conteudo" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 shrink-0">
            Ver todo o conteúdo <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gold-muted/50 via-transparent to-transparent" />
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3">
              Ajude a escolher o primeiro artigo
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ainda não publicamos nada — de propósito. As primeiras reflexões sobre fé, família e cultura vão
              nascer de temas sugeridos pela nossa comunidade.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {temaSugestoes.map((tema) => (
                <button
                  key={tema}
                  type="button"
                  onClick={() => setSugestao(tema)}
                  className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <form
              className="flex rounded-md border border-input bg-background overflow-hidden"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                value={sugestao}
                onChange={(e) => setSugestao(e.target.value)}
                type="text"
                placeholder="Que tema você quer ver aqui?"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <Button type="submit" className="rounded-none bg-primary text-primary-foreground">
                Sugerir
              </Button>
            </form>
            <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border px-3 py-2">
              <span className="text-sm text-foreground">Ou só quero saber quando sair o primeiro</span>
              <Link to="/membros" className="text-sm font-semibold text-primary hover:underline shrink-0">
                Avise-me →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link
              key={post.slug}
              to="/conteudo/$slug"
              params={{ slug: post.slug }}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
            >
              <div className="aspect-video bg-surface relative overflow-hidden">
                {post.imagem_capa_url && (
                  <img
                    src={post.imagem_capa_url}
                    alt={post.titulo}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {post.categorias?.[0] && (
                  <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded">
                    {post.categorias[0]}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.dek}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {post.tempo_leitura} min de leitura
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
