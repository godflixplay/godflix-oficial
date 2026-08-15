import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const projetosHomeQuery = () =>
  queryOptions({
    queryKey: ["projetos", "home"],
    queryFn: async () => {
      const [{ data: projetosData, error }, { data: catsData }] = await Promise.all([
        supabase
          .from("projetos")
          .select("*")
          .order("ordem_categoria", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase.from("categorias" as any).select("nome, ordem").order("ordem"),
      ]);

      if (error) throw error;

      return {
        projetos: projetosData ?? [],
        categorias: ((catsData as unknown as { nome: string; ordem: number }[]) ?? []).map((c) => c.nome),
      };
    },
  });

export const projetoDetalheQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projeto", slug],
    queryFn: async () => {
      const { data: projeto, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!projeto) return null;

      const [equipeRes, opcoesRes, reelsRes, statusRes] = await Promise.all([
        supabase.from("equipe_membros").select("*").eq("projeto_id", projeto.id).order("created_at"),
        supabase.from("opcoes_apoio").select("*").eq("projeto_id", projeto.id).order("ordem"),
        supabase.from("projeto_reels").select("*").eq("projeto_id", projeto.id).order("ordem"),
        supabase.from("status_options").select("valor, label"),
      ]);

      const statusLabel =
        (statusRes.data as { valor: string; label: string }[] | null)?.find((s) => s.valor === projeto.status)?.label ??
        projeto.status;

      return {
        projeto,
        equipe: equipeRes.data ?? [],
        opcoes: opcoesRes.data ?? [],
        reels: reelsRes.data ?? [],
        statusLabel,
      };
    },
  });

export const blogRecentesQuery = () =>
  queryOptions({
    queryKey: ["blog", "recentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("slug, titulo, dek, categorias, imagem_capa_url, tempo_leitura, publicado_em")
        .eq("publicado", true)
        .order("publicado_em", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });

export const blogIndexQuery = () =>
  queryOptions({
    queryKey: ["blog", "index"],
    queryFn: async () => {
      const [{ data: posts, error }, { data: cats }] = await Promise.all([
        supabase
          .from("blog_posts" as any)
          .select("slug, titulo, dek, categorias, imagem_capa_url, tempo_leitura, publicado_em")
          .eq("publicado", true)
          .order("publicado_em", { ascending: false }),
        supabase.from("blog_categorias" as any).select("nome, ordem").order("ordem"),
      ]);
      if (error) throw error;
      return {
        posts: (posts as any[]) ?? [],
        categorias: ((cats as any[]) ?? []).map((c) => c.nome as string),
      };
    },
  });

export const blogPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

export const adminBlogDashboardQuery = () =>
  queryOptions({
    queryKey: ["admin", "blog"],
    queryFn: async () => {
      const [{ data: posts }, { data: cats }] = await Promise.all([
        supabase.from("blog_posts" as any).select("*").order("created_at", { ascending: false }),
        supabase.from("blog_categorias" as any).select("*").order("ordem"),
      ]);
      return {
        posts: (posts as any[]) ?? [],
        categorias: (cats as any[]) ?? [],
      };
    },
  });

export const adminBlogPostQuery = (postId: string) =>
  queryOptions({
    queryKey: ["admin", "blog", "post", postId],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts" as any).select("*").eq("id", postId).single();
      if (error) throw error;
      return data as any;
    },
  });

export const adminDashboardQuery = () =>
  queryOptions({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [{ data: pData }, { data: cData }, { data: sData }] = await Promise.all([
        supabase
          .from("projetos" as any)
          .select("*")
          .order("ordem_categoria", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase.from("categorias" as any).select("*").order("ordem"),
        supabase.from("status_options" as any).select("*").order("ordem"),
      ]);
      return {
        projetos: (pData as any[]) ?? [],
        categorias: (cData as any[]) ?? [],
        statusList: (sData as any[]) ?? [],
      };
    },
  });
