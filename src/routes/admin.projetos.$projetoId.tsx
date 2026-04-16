import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Save, Upload, Instagram, Video, Users, Film } from "lucide-react";
import type { ProjetoDB, EquipeMembroDB, OpcaoApoioDB, CategoriaDB, StatusOptionDB, ReelDB } from "@/lib/admin-types";
import { ReelsManager, type ReelDraft } from "@/components/admin/ReelsManager";

export const Route = createFileRoute("/admin/projetos/$projetoId")({
  component: AdminProjetoEditor,
});

interface EquipeMembro {
  id?: string;
  nome: string;
  papel: string;
  instagram_url: string;
}

interface OpcaoApoio {
  id?: string;
  valor: number;
  titulo: string;
  descricao: string;
  recompensas: string[];
  ordem: number;
}

function AdminProjetoEditor() {
  const { projetoId } = Route.useParams();
  const navigate = useNavigate();
  const isNew = projetoId === "novo";

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Project fields
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

  // Team members
  const [equipe, setEquipe] = useState<EquipeMembro[]>([]);

  // Support tiers
  const [opcoes, setOpcoes] = useState<OpcaoApoio[]>([]);

  // Reels
  const [reels, setReels] = useState<ReelDraft[]>([]);

  // Dynamic categorias / status options
  const [categoriasList, setCategoriasList] = useState<CategoriaDB[]>([]);
  const [statusList, setStatusList] = useState<StatusOptionDB[]>([]);

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
      const { data: projeto } = await supabase
        .from("projetos" as any)
        .select("*")
        .eq("id", projetoId)
        .single();

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

      const [{ data: membros }, { data: opcoesData }] = await Promise.all([
        supabase.from("equipe_membros" as any).select("*").eq("projeto_id", projetoId),
        supabase.from("opcoes_apoio" as any).select("*").eq("projeto_id", projetoId).order("ordem", { ascending: true }),
      ]);

      if (membros) {
        setEquipe(
          (membros as any as EquipeMembroDB[]).map((m) => ({
            id: m.id,
            nome: m.nome,
            papel: m.papel,
            instagram_url: m.instagram_url || "",
          }))
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
          }))
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
    if (!file) return;

    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const path = `projetos/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("projeto-imagens")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("projeto-imagens").getPublicUrl(path);
      setImagemUrl(data.publicUrl);
    }
    setUploadingImage(false);
  };

  const handleSave = async () => {
    if (!titulo || !slug) {
      setSaveError("Preencha pelo menos o título e o slug do projeto.");
      return;
    }

    setSaving(true);
    setSaveError("");
    console.log("[admin] Salvando projeto:", { isNew, titulo, slug });

    try {
      const projetoData = {
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
      };

      const equipePayload = equipe
        .filter((m) => m.nome.trim())
        .map((m) => ({
          projeto_id: "",
          nome: m.nome.trim(),
          papel: m.papel.trim(),
          instagram_url: m.instagram_url.trim() || null,
        }));

      const opcoesPayload = opcoes
        .filter((o) => o.titulo.trim())
        .map((o, i) => ({
          projeto_id: "",
          valor: o.valor,
          titulo: o.titulo.trim(),
          descricao: o.descricao.trim(),
          recompensas: o.recompensas.map((item) => item.trim()).filter(Boolean),
          ordem: i,
        }));

      let projectId = projetoId;

      if (isNew) {
        const { data, error } = await supabase
          .from("projetos" as any)
          .insert(projetoData as any)
          .select("id")
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Não foi possível criar o projeto.");
        }

        projectId = (data as any).id;
      } else {
        const { error } = await supabase
          .from("projetos" as any)
          .update(projetoData as any)
          .eq("id", projetoId);

        if (error) {
          throw new Error(error.message);
        }
      }

      for (const item of equipePayload) {
        item.projeto_id = projectId;
      }

      for (const item of opcoesPayload) {
        item.projeto_id = projectId;
      }

      const [deleteEquipeResult, deleteOpcoesResult] = await Promise.all([
        supabase.from("equipe_membros" as any).delete().eq("projeto_id", projectId),
        supabase.from("opcoes_apoio" as any).delete().eq("projeto_id", projectId),
      ]);

      if (deleteEquipeResult.error) {
        throw new Error(deleteEquipeResult.error.message);
      }

      if (deleteOpcoesResult.error) {
        throw new Error(deleteOpcoesResult.error.message);
      }

      const insertOperations = [];

      if (equipePayload.length > 0) {
        insertOperations.push(supabase.from("equipe_membros" as any).insert(equipePayload as any));
      }

      if (opcoesPayload.length > 0) {
        insertOperations.push(supabase.from("opcoes_apoio" as any).insert(opcoesPayload as any));
      }

      const insertResults = insertOperations.length > 0 ? await Promise.all(insertOperations) : [];

      for (const result of insertResults) {
        if (result.error) {
          throw new Error(result.error.message);
        }
      }

      console.log("[admin] Projeto salvo com sucesso:", projectId);
      navigate({ to: "/admin" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao salvar o projeto.";
      console.error("[admin] erro ao salvar projeto:", error);
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  // Team helpers
  const addMembro = () => setEquipe([...equipe, { nome: "", papel: "", instagram_url: "" }]);
  const removeMembro = (i: number) => setEquipe(equipe.filter((_, idx) => idx !== i));
  const updateMembro = (i: number, field: keyof EquipeMembro, value: string) => {
    const updated = [...equipe];
    (updated[i] as any)[field] = value;
    setEquipe(updated);
  };

  // Support tier helpers
  const addOpcao = () =>
    setOpcoes([...opcoes, { valor: 0, titulo: "", descricao: "", recompensas: [], ordem: opcoes.length }]);
  const removeOpcao = (i: number) => setOpcoes(opcoes.filter((_, idx) => idx !== i));
  const updateOpcao = (i: number, field: string, value: any) => {
    const updated = [...opcoes];
    (updated[i] as any)[field] = value;
    setOpcoes(updated);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isNew ? "Novo Projeto" : `Editar: ${titulo}`}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
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

        {/* Media */}
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
                {imagemUrl && (
                  <img src={imagemUrl} alt="Capa" className="w-40 h-24 object-cover rounded-lg border border-border" />
                )}
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

        {/* Funding */}
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

        {/* Team */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipe.map((m, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* Support Tiers */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          {saveError && <p className="mr-auto text-sm text-destructive">{saveError}</p>}
          <Button asChild variant="outline">
            <Link to="/admin">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving || !titulo} className="bg-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Projeto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
