import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const blocoParagrafoSchema = z.object({ tipo: z.literal("paragrafo"), texto: z.string().trim().min(1).max(5000) });
const blocoTituloSchema = z.object({ tipo: z.literal("titulo"), texto: z.string().trim().min(1).max(300) });
const blocoCitacaoSchema = z.object({
  tipo: z.literal("citacao"),
  texto: z.string().trim().min(1).max(1000),
  fonte: z.string().trim().max(200),
});
const blocoCalloutSchema = z.object({
  tipo: z.literal("callout"),
  titulo: z.string().trim().max(200),
  itens: z.array(z.string().trim().min(1).max(500)).max(20),
});
const blocoImagemSchema = z.object({
  tipo: z.literal("imagem"),
  url: z.string().trim().max(2000),
  legenda: z.string().trim().max(500),
});
const blocoGaleriaSchema = z.object({
  tipo: z.literal("galeria"),
  itens: z.array(z.object({ url: z.string().trim().max(2000), legenda: z.string().trim().max(500) })).max(10),
});
const blocoListaSchema = z.object({
  tipo: z.literal("lista"),
  itens: z.array(z.object({ titulo: z.string().trim().max(200), texto: z.string().trim().max(1000) })).max(20),
});
const blocoVideoSchema = z.object({
  tipo: z.literal("video"),
  videoId: z.string().trim().min(1).max(50),
  inicio: z.number().int().min(0).max(999999),
  legenda: z.string().trim().max(500),
});

const blocoSchema = z.discriminatedUnion("tipo", [
  blocoParagrafoSchema,
  blocoTituloSchema,
  blocoCitacaoSchema,
  blocoCalloutSchema,
  blocoImagemSchema,
  blocoGaleriaSchema,
  blocoListaSchema,
  blocoVideoSchema,
]);

const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(180),
  titulo: z.string().trim().min(1).max(200),
  dek: z.string().trim().max(500),
  categorias: z.array(z.string().trim().min(1).max(60)).max(10),
  autor: z.string().trim().max(120),
  imagem_capa_url: z.string().trim().max(2000),
  imagem_capa_credito: z.string().trim().max(300),
  tempo_leitura: z.number().int().min(1).max(120),
  conteudo: z.array(blocoSchema).max(200),
  publicado: z.boolean(),
});

const savePostSchema = z.object({ post: blogPostSchema });

export const saveBlogPostAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(savePostSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      throw new Error(`Falha ao validar permissão: ${roleError.message}`);
    }

    if (!roleRow) {
      throw new Error("Apenas administradores podem salvar artigos.");
    }

    const post = data.post;

    let publicadoEm: string | null = null;
    if (post.publicado) {
      if (post.id) {
        const { data: existing } = await (supabase.from("blog_posts" as any) as any)
          .select("publicado_em")
          .eq("id", post.id)
          .maybeSingle();
        publicadoEm = existing?.publicado_em ?? new Date().toISOString();
      } else {
        publicadoEm = new Date().toISOString();
      }
    }

    const payload = {
      slug: post.slug.trim(),
      titulo: post.titulo.trim(),
      dek: post.dek.trim(),
      categorias: post.categorias,
      autor: post.autor.trim() || "Redação Godflix",
      imagem_capa_url: post.imagem_capa_url.trim(),
      imagem_capa_credito: post.imagem_capa_credito.trim(),
      tempo_leitura: post.tempo_leitura,
      conteudo: post.conteudo,
      publicado: post.publicado,
      publicado_em: publicadoEm,
    };

    let postId = post.id;

    if (postId) {
      const { error } = await (supabase.from("blog_posts" as any) as any).update(payload).eq("id", postId);
      if (error) throw new Error(`Erro ao atualizar artigo: ${error.message}`);
    } else {
      const { data: created, error } = await (supabase.from("blog_posts" as any) as any)
        .insert(payload)
        .select("id")
        .single();
      if (error || !created) throw new Error(error?.message || "Não foi possível criar o artigo.");
      postId = created.id;
    }

    return { id: postId! };
  });
