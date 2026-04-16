-- 1) Tabela de categorias dinâmicas
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Admins can insert categorias" ON public.categorias FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update categorias" ON public.categorias FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete categorias" ON public.categorias FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Popula com as categorias atuais
INSERT INTO public.categorias (nome, ordem) VALUES
  ('Filme', 1), ('Série', 2), ('Documentário', 3), ('Animação', 4), ('Teatro', 5);

-- 2) Tabela de status dinâmicos
CREATE TABLE public.status_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valor text NOT NULL UNIQUE,
  label text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.status_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view status_options" ON public.status_options FOR SELECT USING (true);
CREATE POLICY "Admins can insert status_options" ON public.status_options FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update status_options" ON public.status_options FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete status_options" ON public.status_options FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.status_options (valor, label, ordem) VALUES
  ('em_financiamento', 'Em financiamento', 1),
  ('em_producao', 'Em produção', 2),
  ('concluido', 'Concluído', 3);

-- 3) Migrar coluna categoria de enum para texto livre (permite novas categorias)
ALTER TABLE public.projetos ALTER COLUMN categoria TYPE text USING categoria::text;
ALTER TABLE public.projetos ALTER COLUMN categoria SET DEFAULT 'Filme';

-- 4) Migrar status para texto livre também
ALTER TABLE public.projetos ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE public.projetos ALTER COLUMN status SET DEFAULT 'em_financiamento';

-- 5) Coluna ordem_destaque para controlar ordem do banner rotativo
ALTER TABLE public.projetos ADD COLUMN ordem_destaque integer NOT NULL DEFAULT 0;

-- Inicializa ordem dos destaques existentes
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.projetos WHERE destaque = true
)
UPDATE public.projetos p SET ordem_destaque = r.rn FROM ranked r WHERE p.id = r.id;

-- 6) Tabela de reels (vídeos verticais)
CREATE TABLE public.projeto_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  titulo text NOT NULL DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text,
  tipo text NOT NULL DEFAULT 'upload', -- 'upload' ou 'link'
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projeto_reels_projeto_id ON public.projeto_reels(projeto_id);

ALTER TABLE public.projeto_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reels" ON public.projeto_reels FOR SELECT USING (true);
CREATE POLICY "Admins can insert reels" ON public.projeto_reels FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reels" ON public.projeto_reels FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reels" ON public.projeto_reels FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 7) Bucket para reels
INSERT INTO storage.buckets (id, name, public) VALUES ('projeto-reels', 'projeto-reels', true);

CREATE POLICY "Anyone can view reels videos" ON storage.objects FOR SELECT USING (bucket_id = 'projeto-reels');
CREATE POLICY "Admins can upload reels" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projeto-reels' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reels storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projeto-reels' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reels storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projeto-reels' AND has_role(auth.uid(), 'admin'::app_role));