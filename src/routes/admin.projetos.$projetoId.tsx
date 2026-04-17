import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Upload, Instagram, Video, Users, Film, Loader2 } from "lucide-react";
import type { ProjetoDB, EquipeMembroDB, OpcaoApoioDB, CategoriaDB, StatusOptionDB, ReelDB } from "@/lib/admin-types";
import { ReelsManager, type ReelDraft } from "@/components/admin/ReelsManager";
import { saveProjetoAdmin } from "@/lib/admin-save.functions";

export const Route = createFileRoute("/admin/projetos/$projetoId")({
  component: AdminProjetoEditor,
});

interface EquipeMembro {
  id?: string;
  nome: string;
  papel: string;
  instagram_url: string;
  foto_url?: string;
}

const normalizeInstagramUrl = (value: string) => {
  const raw = value.trim();
  if (!raw) return "";

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

interface OpcaoApoio {
  id?: string;
  valor: number;
  titulo: string;
  descricao: string;
  recompensas: string[];
  ordem: number;
}

interface ProjetoSnapshot {
  titulo: string;
  slug: string;
  sinopse: string;
  sinopseCompleta: string;
  categoria: string;
  imagemUrl: string;
  videoUrl: string;
  meta: number;
  arrecadado: number;
  apoiadores: number;
  diasRestantes: number;
  status: string;
  destaque: boolean;
  equipe: Array<{
    nome: string;
    papel: string;
    instagram_url: string;
    foto_url: string;
  }>;
  opcoes: Array<{
    valor: number;
    titulo: string;
    descricao: string;
    recompensas: string[];
    ordem: number;
  }>;
  reels: Array<{
    titulo: string;
    video_url: string;
    thumbnail_url: string;
    tipo: "upload" | "link";
    ordem: number;
  }>;
}

interface ChangedField {
  path: string;
  label: string;
  before: string;
  after: string;
}

const formatDiffValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length ? value.join(" • ") : "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const createProjetoSnapshot = (input: {
  titulo: string;
  slug: string;
  sinopse: string;
  sinopseCompleta: string;
  categoria: string;
  imagemUrl: string;
  videoUrl: string;
  meta: number;
  arrecadado: number;
  apoiadores: number;
  diasRestantes: number;
  status: string;
  destaque: boolean;
  equipe: EquipeMembro[];
  opcoes: OpcaoApoio[];
  reels: ReelDraft[];
}): ProjetoSnapshot => ({
  titulo: input.titulo.trim(),
  slug: input.slug.trim(),
  sinopse: input.sinopse.trim(),
  sinopseCompleta: input.sinopseCompleta.trim(),
  categoria: input.categoria,
  imagemUrl: input.imagemUrl.trim(),
  videoUrl: input.videoUrl.trim(),
  meta: input.meta,
  arrecadado: input.arrecadado,
  apoiadores: input.apoiadores,
  diasRestantes: input.diasRestantes,
  status: input.status,
  destaque: input.destaque,
  equipe: input.equipe.map((membro) => ({
    nome: membro.nome.trim(),
    papel: membro.papel.trim(),
    instagram_url: normalizeInstagramUrl(membro.instagram_url),
    foto_url: membro.foto_url?.trim() || "",
  })),
  opcoes: input.opcoes.map((opcao, index) => ({
    valor: opcao.valor,
    titulo: opcao.titulo.trim(),
    descricao: opcao.descricao.trim(),
    recompensas: opcao.recompensas.map((item) => item.trim()).filter(Boolean),
    ordem: index,
  })),
  reels: input.reels.map((reel, index) => ({
    titulo: reel.titulo.trim(),
    video_url: reel.video_url.trim(),
    thumbnail_url: reel.thumbnail_url?.trim() || "",
    tipo: reel.tipo,
    ordem: index,
  })),
});

const getChangedFields = (before: ProjetoSnapshot | null, after: ProjetoSnapshot): ChangedField[] => {
  if (!before) return [];

  const changes: ChangedField[] = [];
  const pushChange = (path: string, label: string, previous: unknown, next: unknown) => {
    if (JSON.stringify(previous) === JSON.stringify(next)) return;
    changes.push({
      path,
      label,
      before: formatDiffValue(previous),
      after: formatDiffValue(next),
    });
  };

  [
    ["titulo", "Título"],
    ["slug", "Slug"],
    ["sinopse", "Sinopse curta"],
    ["sinopseCompleta", "Sinopse completa"],
    ["categoria", "Categoria"],
    ["imagemUrl", "Imagem de capa"],
    ["videoUrl", "Vídeo promocional"],
    ["meta", "Meta"],
    ["arrecadado", "Arrecadado"],
    ["apoiadores", "Apoiadores"],
    ["diasRestantes", "Dias restantes"],
    ["status", "Status"],
    ["destaque", "Destaque"],
  ].forEach(([key, label]) => {
    pushChange(key, label, before[key as keyof ProjetoSnapshot], after[key as keyof ProjetoSnapshot]);
  });

  pushChange("equipe.length", "Total de integrantes", before.equipe.length, after.equipe.length);
  Array.from({ length: Math.max(before.equipe.length, after.equipe.length) }).forEach((_, index) => {
    const previous = before.equipe[index];
    const next = after.equipe[index];
    if (!previous || !next) {
      pushChange(`equipe.${index}`, `Equipe ${index + 1}`, previous ? "Removido" : "Novo integrante", next ? next.nome || "Preenchimento iniciado" : "Removido");
      return;
    }
    pushChange(`equipe.${index}.nome`, `Equipe ${index + 1} · Nome`, previous.nome, next.nome);
    pushChange(`equipe.${index}.papel`, `Equipe ${index + 1} · Papel`, previous.papel, next.papel);
    pushChange(`equipe.${index}.instagram_url`, `Equipe ${index + 1} · Instagram`, previous.instagram_url, next.instagram_url);
    pushChange(`equipe.${index}.foto_url`, `Equipe ${index + 1} · Foto`, previous.foto_url, next.foto_url);
  });

  pushChange("opcoes.length", "Total de níveis", before.opcoes.length, after.opcoes.length);
  Array.from({ length: Math.max(before.opcoes.length, after.opcoes.length) }).forEach((_, index) => {
    const previous = before.opcoes[index];
    const next = after.opcoes[index];
    if (!previous || !next) {
      pushChange(`opcoes.${index}`, `Nível ${index + 1}`, previous ? "Removido" : "Novo nível", next ? next.titulo || "Preenchimento iniciado" : "Removido");
      return;
    }
    pushChange(`opcoes.${index}.titulo`, `Nível ${index + 1} · Título`, previous.titulo, next.titulo);
    pushChange(`opcoes.${index}.valor`, `Nível ${index + 1} · Valor`, previous.valor, next.valor);
    pushChange(`opcoes.${index}.descricao`, `Nível ${index + 1} · Descrição`, previous.descricao, next.descricao);
    pushChange(`opcoes.${index}.recompensas`, `Nível ${index + 1} · Recompensas`, previous.recompensas, next.recompensas);
  });

  pushChange("reels.length", "Total de reels", before.reels.length, after.reels.length);
  Array.from({ length: Math.max(before.reels.length, after.reels.length) }).forEach((_, index) => {
    const previous = before.reels[index];
    const next = after.reels[index];
    if (!previous || !next) {
      pushChange(`reels.${index}`, `Reel ${index + 1}`, previous ? "Removido" : "Novo reel", next ? next.titulo || next.video_url || "Preenchimento iniciado" : "Removido");
      return;
    }
    pushChange(`reels.${index}.titulo`, `Reel ${index + 1} · Título`, previous.titulo, next.titulo);
    pushChange(`reels.${index}.video_url`, `Reel ${index + 1} · Vídeo`, previous.video_url, next.video_url);
    pushChange(`reels.${index}.thumbnail_url`, `Reel ${index + 1} · Thumbnail`, previous.thumbnail_url, next.thumbnail_url);
    pushChange(`reels.${index}.tipo`, `Reel ${index + 1} · Tipo`, previous.tipo, next.tipo);
  });

  return changes;
};

function AdminProjetoEditor() {
  const { projetoId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = projetoId === "novo";

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingTeamPhotoIndex, setUploadingTeamPhotoIndex] = useState<number | null>(null);
  const [pendingReelUploads, setPendingReelUploads] = useState(0);
  const [saveError, setSaveError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [sinopseCompleta, setSinopseCompleta] = useState("");
  const [categoria, setCategoria] = useState<string>("Filme");
  const [imagemUrl, setImagemUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [meta, setMeta] = useState(0);
  const [arrecadado, setArrecadado] = useState(0);
  const [apoiadores, setApoiadores] = useState(0);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [status, setStatus] = useState("em_financiamento");
  const [destaque, setDestaque] = useState(false);

  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);
  const [opcoes, setOpcoes] = useState<OpcaoApoio[]>([]);
  const [reels, setReels] = useState<ReelDraft[]>([]);
  const [categoriasList, setCategoriasList] = useState<CategoriaDB[]>([]);
  const [statusList, setStatusList] = useState<StatusOptionDB[]>([]);
  const [baselineSnapshot, setBaselineSnapshot] = useState<ProjetoSnapshot>(() =>
    createProjetoSnapshot({
      titulo: "",
      slug: "",
      sinopse: "",
      sinopseCompleta: "",
      categoria: "Filme",
      imagemUrl: "",
      videoUrl: "",
      meta: 0,
      arrecadado: 0,
      apoiadores: 0,
      diasRestantes: 0,
      status: "em_financiamento",
      destaque: false,
      equipe: [],
      opcoes: [],
      reels: [],
    }),
  );

  const hasPendingUploads = uploadingImage || uploadingTeamPhotoIndex !== null || pendingReelUploads > 0;
  const currentSnapshot = useMemo(
    () =>
      createProjetoSnapshot({
        titulo,
        slug,
        sinopse,
        sinopseCompleta,
        categoria,
        imagemUrl,
        videoUrl,
        meta,
        arrecadado,
        apoiadores,
        diasRestantes,
        status,
        destaque,
        equipe,
        opcoes,
        reels,
      }),
    [titulo, slug, sinopse, sinopseCompleta, categoria, imagemUrl, videoUrl, meta, arrecadado, apoiadores, diasRestantes, status, destaque, equipe, opcoes, reels],
  );
  const changedFields = useMemo(() => getChangedFields(baselineSnapshot, currentSnapshot), [baselineSnapshot, currentSnapshot]);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: stats }] = await Promise.all([
        supabase.from("categorias" as any).select("*").order("ordem"),
        supabase.from("status_options" as any).select("*").order("ordem"),
      ]);
      setCategoriasList((cats as unknown as CategoriaDB[]) || []);
      setStatusList((stats as unknown as StatusOptionDB[]) || []);
    })();
    if (!isNew) loadProjeto();
  }, [projetoId]);

  const loadProjeto = async () => {
    try {
      const { data: projeto } = await supabase.from("projetos" as any).select("*").eq("id", projetoId).single();

      if (!projeto) {
        navigate({ to: "/admin" });
        return;
      }

      const p = projeto as any as ProjetoDB;
      setTitulo(p.titulo);
      setSlug(p.slug);
      setSinopse(p.sinopse);
      setSinopseCompleta(p.sinopse_completa);
      setCategoria(p.categoria);
      setImagemUrl(p.imagem_url);
      setVideoUrl(p.video_url || "");
      setMeta(p.meta);
      setArrecadado(p.arrecadado);
      setApoiadores(p.apoiadores);
      setDiasRestantes(p.dias_restantes);
      setStatus(p.status);
      setDestaque(p.destaque);

      const [{ data: membros }, { data: opcoesData }, { data: reelsData }] = await Promise.all([
        supabase.from("equipe_membros" as any).select("*").eq("projeto_id", projetoId),
        supabase.from("opcoes_apoio" as any).select("*").eq("projeto_id", projetoId).order("ordem", { ascending: true }),
        supabase.from("projeto_reels" as any).select("*").eq("projeto_id", projetoId).order("ordem", { ascending: true }),
      ]);

      if (membros) {
        const membrosState = (membros as any as EquipeMembroDB[]).map((m) => ({
          id: m.id,
          nome: m.nome,
          papel: m.papel,
          instagram_url: m.instagram_url || "",
          foto_url: (m as any).foto_url || "",
        }));
        setEquipe(membrosState);

        const opcoesState = ((opcoesData as any as OpcaoApoioDB[]) || []).map((o) => ({
          id: o.id,
          valor: o.valor,
          titulo: o.titulo,
          descricao: o.descricao,
          recompensas: o.recompensas,
          ordem: o.ordem,
        }));

        const reelsState = ((reelsData as unknown as ReelDB[]) || []).map((r) => ({
          id: r.id,
          tempId: r.id,
          titulo: r.titulo,
          video_url: r.video_url,
          thumbnail_url: r.thumbnail_url || "",
          tipo: r.tipo,
        }));

        setBaselineSnapshot(
          createProjetoSnapshot({
            titulo: p.titulo,
            slug: p.slug,
            sinopse: p.sinopse,
            sinopseCompleta: p.sinopse_completa,
            categoria: p.categoria,
            imagemUrl: p.imagem_url,
            videoUrl: p.video_url || "",
            meta: p.meta,
            arrecadado: p.arrecadado,
            apoiadores: p.apoiadores,
            diasRestantes: p.dias_restantes,
            status: p.status,
            destaque: p.destaque,
            equipe: membrosState,
            opcoes: opcoesState,
            reels: reelsState,
          }),
        );
      }

      if (opcoesData) {
        setOpcoes(
          (opcoesData as any as OpcaoApoioDB[]).map((o) => ({
            id: o.id,
            valor: o.valor,
            titulo: o.titulo,
            descricao: o.descricao,
            recompensas: o.recompensas,
            ordem: o.ordem,
          })),
        );
      }

      if (reelsData) {
        setReels(
          (reelsData as unknown as ReelDB[]).map((r) => ({
            id: r.id,
            tempId: r.id,
            titulo: r.titulo,
            video_url: r.video_url,
            thumbnail_url: r.thumbnail_url || "",
            tipo: r.tipo,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTituloChange = (value: string) => {
    setTitulo(value);
    if (isNew || !slug) setSlug(generateSlug(value));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `projetos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("projeto-imagens").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("projeto-imagens").getPublicUrl(path);
      setImagemUrl(data.publicUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload da imagem.";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!titulo || !slug) {
      setSaveError("Preencha pelo menos o título e o slug do projeto.");
      return;
    }

    if (hasPendingUploads) {
      setSaveError("Aguarde o término dos uploads antes de salvar o projeto.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Sua sessão expirou. Entre novamente para salvar.");
      }

      const result = await saveProjetoAdmin({
        data: {
          projeto: {
            id: isNew ? undefined : projetoId,
            slug: slug.trim(),
            titulo: titulo.trim(),
            sinopse: sinopse.trim(),
            sinopse_completa: sinopseCompleta.trim(),
            categoria,
            imagem_url: imagemUrl.trim(),
            video_url: videoUrl.trim() || null,
            meta,
            arrecadado,
            apoiadores,
            dias_restantes: diasRestantes,
            status,
            destaque,
            equipe: equipe.map((m) => ({
              nome: m.nome.trim(),
              papel: m.papel.trim(),
              instagram_url: normalizeInstagramUrl(m.instagram_url) || null,
              foto_url: m.foto_url?.trim() || null,
            })),
            opcoes: opcoes.map((o, index) => ({
              valor: o.valor,
              titulo: o.titulo.trim(),
              descricao: o.descricao.trim(),
              recompensas: o.recompensas.map((item) => item.trim()).filter(Boolean),
              ordem: index,
            })),
            reels: reels.map((r, index) => ({
              titulo: (r.titulo || "").trim(),
              video_url: r.video_url.trim(),
              thumbnail_url: r.thumbnail_url?.trim() || null,
              tipo: r.tipo,
              ordem: index,
            })),
          },
        },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["projetos", "home"] });
      queryClient.invalidateQueries({ queryKey: ["projeto"] });
      setBaselineSnapshot(currentSnapshot);
      toast.success("Projeto salvo com sucesso.");
      navigate({ to: "/admin/projetos/$projetoId", params: { projetoId: result.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao salvar o projeto.";
      console.error("[admin] save failed:", error);
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addMembro = () => {
    setEquipe((current) => [...current, { nome: "", papel: "", instagram_url: "", foto_url: "" }]);
  };

  const removeMembro = (i: number) => {
    setEquipe((current) => current.filter((_, idx) => idx !== i));
  };

  const updateMembro = (i: number, field: keyof EquipeMembro, value: string) => {
    setEquipe((current) =>
      current.map((membro, idx) =>
        idx === i
          ? {
              ...membro,
              [field]: value,
            }
          : membro,
      ),
    );
  };

  const handleMembroPhotoUpload = async (index: number, file: File) => {
    setUploadingTeamPhotoIndex(index);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `equipe/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from("projeto-imagens").upload(path, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "3600",
      });

      if (error) throw error;
      const { data } = supabase.storage.from("projeto-imagens").getPublicUrl(path);
      updateMembro(index, "foto_url", data.publicUrl);
      toast.success("Foto enviada com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha no upload da foto.";
      toast.error(message);
    } finally {
      setUploadingTeamPhotoIndex(null);
    }
  };

  const addOpcao = () => {
    setOpcoes((current) => [...current, { valor: 0, titulo: "", descricao: "", recompensas: [], ordem: current.length }]);
  };

  const removeOpcao = (i: number) => {
    setOpcoes((current) => current.filter((_, idx) => idx !== i));
  };

  const updateOpcao = (i: number, field: string, value: any) => {
    setOpcoes((current) =>
      current.map((opcao, idx) =>
        idx === i
          ? {
              ...opcao,
              [field]: value,
            }
          : opcao,
      ),
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{isNew ? "Novo Projeto" : `Editar: ${titulo}`}</h1>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={titulo} onChange={(e) => handleTituloChange(e.target.value)} placeholder="Nome do projeto" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="nome-do-projeto" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categoriasList.length === 0 && <option value={categoria}>{categoria}</option>}
                  {categoriasList.map((c) => (
                    <option key={c.id} value={c.nome} className="bg-background text-foreground">
                      {c.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Gerencie as categorias na página inicial do admin.</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {statusList.length === 0 && <option value={status}>{status}</option>}
                  {statusList.map((s) => (
                    <option key={s.id} value={s.valor} className="bg-background text-foreground">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sinopse (curta)</Label>
              <Textarea value={sinopse} onChange={(e) => setSinopse(e.target.value)} rows={2} placeholder="Resumo breve do projeto" />
            </div>

            <div className="space-y-2">
              <Label>Sinopse Completa</Label>
              <Textarea value={sinopseCompleta} onChange={(e) => setSinopseCompleta(e.target.value)} rows={5} placeholder="Descrição detalhada do projeto" />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={destaque} onCheckedChange={setDestaque} />
              <Label>Projeto em destaque (aparece no hero da home)</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" /> Mídia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <div className="flex items-start gap-4">
                {imagemUrl && <img src={imagemUrl} alt="Capa" className="w-40 h-24 object-cover rounded-lg border border-border" />}
                <div className="flex-1 space-y-2">
                  <Input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="URL da imagem ou faça upload" />
                  <div>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                      <Upload className="h-4 w-4" />
                      {uploadingImage ? "Enviando..." : "Fazer upload de imagem"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vídeo Promocional (YouTube ou Vimeo)</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-muted-foreground">Cole o link do vídeo promocional do projeto</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Financiamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Meta (R$)</Label>
                <Input type="number" value={meta} onChange={(e) => setMeta(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Arrecadado (R$)</Label>
                <Input type="number" value={arrecadado} onChange={(e) => setArrecadado(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Apoiadores</Label>
                <Input type="number" value={apoiadores} onChange={(e) => setApoiadores(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Dias restantes</Label>
                <Input type="number" value={diasRestantes} onChange={(e) => setDiasRestantes(Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipe.map((m, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                <div className="w-24 shrink-0 space-y-2">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-gradient-to-b from-muted to-card">
                    {m.foto_url ? (
                      <img src={m.foto_url} alt={m.nome || "Foto do integrante"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-end bg-gradient-to-t from-background via-transparent to-muted p-2 text-[10px] text-muted-foreground">
                        Retrato
                      </div>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline">
                    {uploadingTeamPhotoIndex === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file) handleMembroPhotoUpload(i, file);
                      }}
                      disabled={uploadingTeamPhotoIndex !== null}
                    />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input value={m.nome} onChange={(e) => updateMembro(i, "nome", e.target.value)} placeholder="Ex: Maria Silva" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Papel</Label>
                    <Input value={m.papel} onChange={(e) => updateMembro(i, "papel", e.target.value)} placeholder="Ex: Diretora" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Instagram className="h-3 w-3" /> Instagram
                    </Label>
                    <Input
                      value={m.instagram_url}
                      onChange={(e) => updateMembro(i, "instagram_url", e.target.value)}
                      placeholder="https://instagram.com/usuario"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">URL da foto</Label>
                    <Input value={m.foto_url || ""} onChange={(e) => updateMembro(i, "foto_url", e.target.value)} placeholder="URL da foto do integrante" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive mt-5" onClick={() => removeMembro(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMembro} className="gap-1">
              <Plus className="h-4 w-4" /> Adicionar membro
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Diagnóstico antes de salvar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {changedFields.length === 0
                ? "Nenhuma alteração pendente no momento."
                : `${changedFields.length} alteração(ões) detectada(s) entre o estado carregado e o formulário atual.`}
            </p>

            {changedFields.length > 0 && (
              <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3">
                {changedFields.map((change) => (
                  <div key={change.path} className="rounded-lg border border-border bg-card/70 p-3">
                    <p className="text-sm font-medium text-foreground">{change.label}</p>
                    <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                      <div className="rounded-md border border-border bg-background/60 p-2">
                        <span className="mb-1 block text-[10px] uppercase tracking-[0.18em]">Antes</span>
                        <span className="break-words text-foreground/80">{change.before}</span>
                      </div>
                      <div className="rounded-md border border-border bg-background/60 p-2">
                        <span className="mb-1 block text-[10px] uppercase tracking-[0.18em]">Agora</span>
                        <span className="break-words text-foreground">{change.after}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Níveis de Contribuição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opcoes.map((o, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Nível {i + 1}</span>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeOpcao(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Título</Label>
                    <Input value={o.titulo} onChange={(e) => updateOpcao(i, "titulo", e.target.value)} placeholder="Ex: Apoiador" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input type="number" value={o.valor} onChange={(e) => updateOpcao(i, "valor", Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea value={o.descricao} onChange={(e) => updateOpcao(i, "descricao", e.target.value)} rows={2} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Recompensas (uma por linha)</Label>
                  <Textarea
                    value={o.recompensas.join("\n")}
                    onChange={(e) => updateOpcao(i, "recompensas", e.target.value.split("\n").filter(Boolean))}
                    rows={3}
                    placeholder="Agradecimento digital&#10;Acesso antecipado&#10;Nome nos créditos"
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOpcao} className="gap-1">
              <Plus className="h-4 w-4" /> Adicionar nível de contribuição
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" /> Reels (vídeos verticais)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReelsManager
              reels={reels}
              onChange={setReels}
              onUploadingChange={(uploading) => {
                setPendingReelUploads((current) => Math.max(0, current + (uploading ? 1 : -1)));
              }}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          {saveError && <p className="mr-auto text-sm text-destructive">{saveError}</p>}
          {hasPendingUploads && <p className="mr-auto text-sm text-muted-foreground">Aguarde o término dos uploads antes de salvar.</p>}
          <Button asChild variant="outline">
            <Link to="/admin">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving || !titulo || hasPendingUploads} className="bg-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Projeto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
