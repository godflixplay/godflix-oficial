// Database types for admin panel (mirrors Supabase tables)

export interface ProjetoDB {
  id: string;
  slug: string;
  titulo: string;
  sinopse: string;
  sinopse_completa: string;
  categoria: "Filme" | "Série" | "Documentário" | "Animação" | "Teatro";
  imagem_url: string;
  video_url: string | null;
  meta: number;
  arrecadado: number;
  apoiadores: number;
  dias_restantes: number;
  status: "em_financiamento" | "em_producao" | "concluido";
  destaque: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipeMembroDB {
  id: string;
  projeto_id: string;
  nome: string;
  papel: string;
  instagram_url: string | null;
  created_at: string;
}

export interface OpcaoApoioDB {
  id: string;
  projeto_id: string;
  valor: number;
  titulo: string;
  descricao: string;
  recompensas: string[];
  ordem: number;
  created_at: string;
}

export const CATEGORIAS = ["Filme", "Série", "Documentário", "Animação", "Teatro"] as const;
export const STATUS_OPTIONS = [
  { value: "em_financiamento", label: "Em financiamento" },
  { value: "em_producao", label: "Em produção" },
  { value: "concluido", label: "Concluído" },
] as const;
