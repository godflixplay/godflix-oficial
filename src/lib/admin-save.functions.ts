import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const equipeSchema = z.object({
  nome: z.string().trim().max(160),
  papel: z.string().trim().max(160).default(""),
  instagram_url: z.string().trim().max(500).nullable(),
  foto_url: z.string().trim().max(2000).nullable(),
});

const opcaoSchema = z.object({
  valor: z.number().finite().min(0),
  titulo: z.string().trim().min(1).max(160),
  descricao: z.string().trim().max(2000),
  recompensas: z.array(z.string().trim().min(1).max(300)).max(50),
  ordem: z.number().int().min(0),
});

const reelSchema = z.object({
  titulo: z.string().trim().max(160),
  video_url: z.string().trim().min(1).max(2000),
  thumbnail_url: z.string().trim().max(2000).nullable(),
  tipo: z.enum(["upload", "link"]),
  ordem: z.number().int().min(0),
});

const projetoSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(180),
  titulo: z.string().trim().min(1).max(180),
  sinopse: z.string().trim().max(1000),
  sinopse_completa: z.string().trim().max(10000),
  categoria: z.string().trim().min(1).max(120),
  imagem_url: z.string().trim().max(2000),
  video_url: z.string().trim().max(2000).nullable(),
  meta: z.number().finite().min(0),
  arrecadado: z.number().finite().min(0),
  apoiadores: z.number().int().min(0),
  dias_restantes: z.number().int().min(0),
  status: z.string().trim().min(1).max(120),
  destaque: z.boolean(),
  equipe: z.array(equipeSchema).max(100),
  opcoes: z.array(opcaoSchema).max(100),
  reels: z.array(reelSchema).max(200),
});

const saveProjetoSchema = z.object({
  projeto: projetoSchema,
});

const normalizeInstagramUrl = (value: string | null | undefined) => {
  const raw = value?.trim() ?? "";
  if (!raw) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^@/, "instagram.com/")}`;
    const url = new URL(withProtocol);

    if (!url.hostname.includes("instagram.com")) {
      return raw;
    }

    url.protocol = "https:";
    url.hash = "";
    url.search = "";
    url.hostname = "www.instagram.com";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";

    return url.toString();
  } catch {
    return raw;
  }
};

const normalizeReelUrl = (value: string, tipo: "upload" | "link") => {
  const trimmed = value.trim();
  if (tipo !== "link") return trimmed;
  return normalizeInstagramUrl(trimmed) ?? trimmed;
};

export const saveProjetoAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(saveProjetoSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verifica se o usuário tem papel de admin
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
      throw new Error("Apenas administradores podem salvar projetos.");
    }

    const projeto = data.projeto;
    const projetoPayload = {
      slug: projeto.slug.trim(),
      titulo: projeto.titulo.trim(),
      sinopse: projeto.sinopse.trim(),
      sinopse_completa: projeto.sinopse_completa.trim(),
      categoria: projeto.categoria,
      imagem_url: projeto.imagem_url.trim(),
      video_url: projeto.video_url?.trim() || null,
      meta: projeto.meta,
      arrecadado: projeto.arrecadado,
      apoiadores: projeto.apoiadores,
      dias_restantes: projeto.dias_restantes,
      status: projeto.status,
      destaque: projeto.destaque,
    };

    let projectId = projeto.id;

    if (projectId) {
      const { error } = await supabase.from("projetos").update(projetoPayload).eq("id", projectId);
      if (error) throw new Error(`Erro ao atualizar projeto: ${error.message}`);
    } else {
      const { data: created, error } = await supabase
        .from("projetos")
        .insert(projetoPayload)
        .select("id")
        .single();

      if (error || !created) throw new Error(error?.message || "Não foi possível criar o projeto.");
      projectId = created.id;
    }

    const equipePayload = projeto.equipe
      .filter((m) => m.nome.trim())
      .map((m) => ({
        projeto_id: projectId!,
        nome: m.nome.trim(),
        papel: m.papel.trim(),
        instagram_url: normalizeInstagramUrl(m.instagram_url) || null,
        foto_url: m.foto_url?.trim() || null,
      }));

    const opcoesPayload = projeto.opcoes
      .filter((o) => o.titulo.trim())
      .map((o, index) => ({
        projeto_id: projectId!,
        valor: o.valor,
        titulo: o.titulo.trim(),
        descricao: o.descricao.trim(),
        recompensas: o.recompensas.map((item) => item.trim()).filter(Boolean),
        ordem: index,
      }));

    const reelsPayload = projeto.reels
      .filter((r) => r.video_url.trim())
      .map((r, index) => ({
        projeto_id: projectId!,
        titulo: r.titulo.trim(),
        video_url: normalizeReelUrl(r.video_url, r.tipo),
        thumbnail_url: r.thumbnail_url?.trim() || null,
        tipo: r.tipo,
        ordem: index,
      }));

    const [deleteEquipe, deleteOpcoes, deleteReels] = await Promise.all([
      supabase.from("equipe_membros").delete().eq("projeto_id", projectId!),
      supabase.from("opcoes_apoio").delete().eq("projeto_id", projectId!),
      supabase.from("projeto_reels").delete().eq("projeto_id", projectId!),
    ]);

    if (deleteEquipe.error) throw new Error(`Erro ao limpar equipe: ${deleteEquipe.error.message}`);
    if (deleteOpcoes.error) throw new Error(`Erro ao limpar opções: ${deleteOpcoes.error.message}`);
    if (deleteReels.error) throw new Error(`Erro ao limpar reels: ${deleteReels.error.message}`);

    const insertOperations: PromiseLike<{ error: { message: string } | null }>[] = [];

    if (equipePayload.length > 0) {
      insertOperations.push(supabase.from("equipe_membros").insert(equipePayload).then(({ error }) => ({ error })));
    }

    if (opcoesPayload.length > 0) {
      insertOperations.push(supabase.from("opcoes_apoio").insert(opcoesPayload).then(({ error }) => ({ error })));
    }

    if (reelsPayload.length > 0) {
      insertOperations.push(supabase.from("projeto_reels").insert(reelsPayload).then(({ error }) => ({ error })));
    }

    const insertResults = await Promise.all(insertOperations);
    const firstError = insertResults.find((result) => result.error);
    if (firstError?.error) {
      throw new Error(`Erro ao salvar dados do projeto: ${firstError.error.message}`);
    }

    return { id: projectId };
  });
