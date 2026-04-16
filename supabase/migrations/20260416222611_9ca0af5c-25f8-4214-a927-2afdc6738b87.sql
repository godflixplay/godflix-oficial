-- 1) Adiciona coluna de foto para os membros da equipe
ALTER TABLE public.equipe_membros
ADD COLUMN IF NOT EXISTS foto_url text;

-- 2) Índices para acelerar consultas por projeto_id
CREATE INDEX IF NOT EXISTS idx_equipe_membros_projeto_id
  ON public.equipe_membros (projeto_id);

CREATE INDEX IF NOT EXISTS idx_opcoes_apoio_projeto_id
  ON public.opcoes_apoio (projeto_id);

CREATE INDEX IF NOT EXISTS idx_projeto_reels_projeto_id
  ON public.projeto_reels (projeto_id);

-- 3) Índice para ordenação por categoria já usada na home
CREATE INDEX IF NOT EXISTS idx_projetos_categoria_ordem
  ON public.projetos (categoria, ordem_categoria);