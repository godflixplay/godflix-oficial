-- 1) Categorias do blog (independente das categorias de projeto)
CREATE TABLE public.blog_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog_categorias" ON public.blog_categorias FOR SELECT USING (true);
CREATE POLICY "Admins can insert blog_categorias" ON public.blog_categorias FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update blog_categorias" ON public.blog_categorias FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blog_categorias" ON public.blog_categorias FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.blog_categorias (nome, ordem) VALUES
  ('Família', 1), ('Filhos', 2), ('Juventude', 3), ('Fé', 4),
  ('Cultura', 5), ('Relacionamentos', 6), ('Educação', 7), ('Sociedade', 8);

-- 2) Posts do blog. Conteúdo é uma lista de blocos tipados (jsonb) para
-- renderizar parágrafo, título, citação, callout, imagem, galeria e lista numerada
-- sem precisar de editor rich-text / sanitização de HTML solto.
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  dek text NOT NULL DEFAULT '',
  categorias text[] NOT NULL DEFAULT '{}',
  autor text NOT NULL DEFAULT 'Redação GodFlix',
  imagem_capa_url text NOT NULL DEFAULT '',
  imagem_capa_credito text NOT NULL DEFAULT '',
  tempo_leitura integer NOT NULL DEFAULT 5,
  conteudo jsonb NOT NULL DEFAULT '[]'::jsonb,
  publicado boolean NOT NULL DEFAULT false,
  publicado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_publicado ON public.blog_posts (publicado, publicado_em DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog_posts" ON public.blog_posts FOR SELECT USING (publicado = true);
CREATE POLICY "Admins can view all blog_posts" ON public.blog_posts FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert blog_posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update blog_posts" ON public.blog_posts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blog_posts" ON public.blog_posts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Bucket de imagens do blog (mesmo padrão de projeto-imagens)
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-imagens', 'blog-imagens', true);

CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-imagens');
CREATE POLICY "Admins can upload blog images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-imagens' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update blog images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-imagens' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete blog images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-imagens' AND has_role(auth.uid(), 'admin'::app_role));
