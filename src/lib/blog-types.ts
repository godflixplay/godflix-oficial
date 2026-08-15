// Database types for the blog (mirrors Supabase tables blog_posts / blog_categorias)

export interface BlogCategoriaDB {
  id: string;
  nome: string;
  ordem: number;
}

export interface BlocoParagrafo {
  tipo: "paragrafo";
  texto: string;
}

export interface BlocoTitulo {
  tipo: "titulo";
  texto: string;
}

export interface BlocoCitacao {
  tipo: "citacao";
  texto: string;
  fonte: string;
}

export interface BlocoCallout {
  tipo: "callout";
  titulo: string;
  itens: string[];
}

export interface BlocoImagem {
  tipo: "imagem";
  url: string;
  legenda: string;
}

export interface BlocoGaleria {
  tipo: "galeria";
  itens: { url: string; legenda: string }[];
}

export interface BlocoListaItem {
  titulo: string;
  texto: string;
}

export interface BlocoLista {
  tipo: "lista";
  itens: BlocoListaItem[];
}

export type BlocoConteudo =
  | BlocoParagrafo
  | BlocoTitulo
  | BlocoCitacao
  | BlocoCallout
  | BlocoImagem
  | BlocoGaleria
  | BlocoLista;

export interface BlogPostDB {
  id: string;
  slug: string;
  titulo: string;
  dek: string;
  categorias: string[];
  autor: string;
  imagem_capa_url: string;
  imagem_capa_credito: string;
  tempo_leitura: number;
  conteudo: BlocoConteudo[];
  publicado: boolean;
  publicado_em: string | null;
  created_at: string;
  updated_at: string;
}
