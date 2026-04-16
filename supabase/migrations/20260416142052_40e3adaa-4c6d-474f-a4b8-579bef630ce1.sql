
-- Create enum types
CREATE TYPE public.categoria_projeto AS ENUM ('Filme', 'Série', 'Documentário', 'Animação', 'Teatro');
CREATE TYPE public.status_projeto AS ENUM ('em_financiamento', 'em_producao', 'concluido');
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create projetos table
CREATE TABLE public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  sinopse TEXT NOT NULL,
  sinopse_completa TEXT NOT NULL DEFAULT '',
  categoria public.categoria_projeto NOT NULL DEFAULT 'Filme',
  imagem_url TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  meta NUMERIC NOT NULL DEFAULT 0,
  arrecadado NUMERIC NOT NULL DEFAULT 0,
  apoiadores INTEGER NOT NULL DEFAULT 0,
  dias_restantes INTEGER NOT NULL DEFAULT 0,
  status public.status_projeto NOT NULL DEFAULT 'em_financiamento',
  destaque BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipe_membros table
CREATE TABLE public.equipe_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  papel TEXT NOT NULL DEFAULT '',
  instagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opcoes_apoio table
CREATE TABLE public.opcoes_apoio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL DEFAULT 0,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  recompensas TEXT[] NOT NULL DEFAULT '{}',
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipe_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_apoio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Projetos policies
CREATE POLICY "Anyone can view projetos" ON public.projetos
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert projetos" ON public.projetos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projetos" ON public.projetos
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projetos" ON public.projetos
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Equipe membros policies
CREATE POLICY "Anyone can view equipe" ON public.equipe_membros
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert equipe" ON public.equipe_membros
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update equipe" ON public.equipe_membros
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete equipe" ON public.equipe_membros
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Opcoes apoio policies
CREATE POLICY "Anyone can view opcoes_apoio" ON public.opcoes_apoio
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert opcoes_apoio" ON public.opcoes_apoio
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update opcoes_apoio" ON public.opcoes_apoio
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete opcoes_apoio" ON public.opcoes_apoio
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for projetos
CREATE TRIGGER update_projetos_updated_at
  BEFORE UPDATE ON public.projetos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('projeto-imagens', 'projeto-imagens', true);

CREATE POLICY "Anyone can view projeto images" ON storage.objects
  FOR SELECT USING (bucket_id = 'projeto-imagens');

CREATE POLICY "Admins can upload projeto images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'projeto-imagens' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projeto images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'projeto-imagens' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projeto images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'projeto-imagens' AND public.has_role(auth.uid(), 'admin'));
