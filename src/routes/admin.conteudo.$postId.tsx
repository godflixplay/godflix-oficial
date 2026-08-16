import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Upload, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import type { BlocoConteudo, BlogPostDB } from "@/lib/blog-types";
import { saveBlogPostAdmin } from "@/lib/admin-save-blog.functions";

export const Route = createFileRoute("/admin/conteudo/$postId")({
  ssr: false,
  component: AdminPostEditor,
});

const TIPO_LABELS: Record<BlocoConteudo["tipo"], string> = {
  paragrafo: "Parágrafo",
  titulo: "Título de seção",
  citacao: "Citação",
  callout: "Callout (perguntas/destaques)",
  imagem: "Imagem",
  galeria: "Galeria (2 imagens)",
  lista: "Lista numerada",
};

const novoBloco = (tipo: BlocoConteudo["tipo"]): BlocoConteudo => {
  switch (tipo) {
    case "paragrafo":
      return { tipo, texto: "" };
    case "titulo":
      return { tipo, texto: "" };
    case "citacao":
      return { tipo, texto: "", fonte: "" };
    case "callout":
      return { tipo, titulo: "", itens: [""] };
    case "imagem":
      return { tipo, url: "", legenda: "" };
    case "galeria":
      return { tipo, itens: [{ url: "", legenda: "" }, { url: "", legenda: "" }] };
    case "lista":
      return { tipo, itens: [{ titulo: "", texto: "" }] };
  }
};

async function uploadBlogImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("blog-imagens").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("blog-imagens").getPublicUrl(path);
  return data.publicUrl;
}

function AdminPostEditor() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = postId === "novo";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const [uploadingBlocoIndex, setUploadingBlocoIndex] = useState<number | null>(null);

  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [dek, setDek] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [autor, setAutor] = useState("Redação Godflix");
  const [imagemCapaUrl, setImagemCapaUrl] = useState("");
  const [imagemCapaCredito, setImagemCapaCredito] = useState("");
  const [tempoLeitura, setTempoLeitura] = useState(5);
  const [publicado, setPublicado] = useState(false);
  const [blocos, setBlocos] = useState<BlocoConteudo[]>([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("blog_categorias" as any).select("nome").order("ordem");
      setCategoriasDisponiveis(((data as any[]) ?? []).map((c) => c.nome));
    })();
  }, []);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("blog_posts" as any).select("*").eq("id", postId).maybeSingle();
      if (!data) {
        navigate({ to: "/admin/conteudo" });
        return;
      }
      const p = data as unknown as BlogPostDB;
      setTitulo(p.titulo);
      setSlug(p.slug);
      setDek(p.dek);
      setCategorias(p.categorias ?? []);
      setAutor(p.autor);
      setImagemCapaUrl(p.imagem_capa_url);
      setImagemCapaCredito(p.imagem_capa_credito);
      setTempoLeitura(p.tempo_leitura);
      setPublicado(p.publicado);
      setBlocos(p.conteudo ?? []);
      setLoading(false);
    })();
  }, [postId]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTituloChange = (value: string) => {
    setTitulo(value);
    if (isNew || !slug) setSlug(generateSlug(value));
  };

  const toggleCategoria = (cat: string) => {
    setCategorias((current) => (current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat]));
  };

  const handleCapaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingCapa(true);
    try {
      setImagemCapaUrl(await uploadBlogImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      setUploadingCapa(false);
    }
  };

  const addBloco = (tipo: BlocoConteudo["tipo"]) => setBlocos((current) => [...current, novoBloco(tipo)]);
  const removeBloco = (i: number) => setBlocos((current) => current.filter((_, idx) => idx !== i));
  const updateBloco = (i: number, next: BlocoConteudo) =>
    setBlocos((current) => current.map((b, idx) => (idx === i ? next : b)));
  const moveBloco = (i: number, dir: -1 | 1) => {
    setBlocos((current) => {
      const j = i + dir;
      if (j < 0 || j >= current.length) return current;
      const copy = [...current];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const handleSave = async () => {
    if (!titulo || !slug) {
      setSaveError("Preencha pelo menos o título e o slug do artigo.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Sua sessão expirou. Entre novamente para salvar.");

      const result = await saveBlogPostAdmin({
        data: {
          post: {
            id: isNew ? undefined : postId,
            slug: slug.trim(),
            titulo: titulo.trim(),
            dek: dek.trim(),
            categorias,
            autor: autor.trim(),
            imagem_capa_url: imagemCapaUrl.trim(),
            imagem_capa_credito: imagemCapaCredito.trim(),
            tempo_leitura: tempoLeitura,
            conteudo: blocos,
            publicado,
          },
        },
        headers: { authorization: `Bearer ${accessToken}` },
      });

      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      toast.success("Artigo salvo com sucesso.");
      navigate({ to: "/admin/conteudo/$postId", params: { postId: result.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao salvar o artigo.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/conteudo">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{isNew ? "Novo Artigo" : `Editar: ${titulo}`}</h1>
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
                <Input value={titulo} onChange={(e) => handleTituloChange(e.target.value)} placeholder="Título do artigo" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="titulo-do-artigo" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dek (resumo, aparece no card e abaixo do título)</Label>
              <Textarea value={dek} onChange={(e) => setDek(e.target.value)} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Categorias</Label>
              <div className="flex flex-wrap gap-2">
                {categoriasDisponiveis.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategoria(cat)}
                    className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
                      categorias.includes(cat)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={autor} onChange={(e) => setAutor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tempo de leitura (min)</Label>
                <Input type="number" value={tempoLeitura} onChange={(e) => setTempoLeitura(Number(e.target.value))} />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-3 h-9">
                  <Switch checked={publicado} onCheckedChange={setPublicado} />
                  <Label>Publicado</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Imagem de Capa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-4">
              {imagemCapaUrl && <img src={imagemCapaUrl} alt="Capa" className="w-40 h-24 object-cover rounded-lg border border-border" />}
              <div className="flex-1 space-y-2">
                <Input value={imagemCapaUrl} onChange={(e) => setImagemCapaUrl(e.target.value)} placeholder="URL da imagem ou faça upload" />
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                  {uploadingCapa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingCapa ? "Enviando..." : "Fazer upload de imagem"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCapaUpload} disabled={uploadingCapa} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Crédito da imagem (ex: Divulgação/Estúdio X)</Label>
              <Input value={imagemCapaCredito} onChange={(e) => setImagemCapaCredito(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Corpo do artigo</CardTitle>
            <p className="text-xs text-muted-foreground">Monte o artigo em blocos, na ordem em que devem aparecer.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocos.map((bloco, i) => (
              <BlocoEditor
                key={i}
                bloco={bloco}
                index={i}
                total={blocos.length}
                uploading={uploadingBlocoIndex === i}
                onChange={(next) => updateBloco(i, next)}
                onRemove={() => removeBloco(i)}
                onMove={(dir) => moveBloco(i, dir)}
                onUploadStart={() => setUploadingBlocoIndex(i)}
                onUploadEnd={() => setUploadingBlocoIndex(null)}
              />
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              {(Object.keys(TIPO_LABELS) as BlocoConteudo["tipo"][]).map((tipo) => (
                <Button key={tipo} type="button" variant="outline" size="sm" onClick={() => addBloco(tipo)} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> {TIPO_LABELS[tipo]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pb-8">
          {saveError && <p className="mr-auto text-sm text-destructive">{saveError}</p>}
          <Button asChild variant="outline">
            <Link to="/admin/conteudo">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving || !titulo} className="bg-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Artigo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BlocoEditor({
  bloco,
  index,
  total,
  uploading,
  onChange,
  onRemove,
  onMove,
  onUploadStart,
  onUploadEnd,
}: {
  bloco: BlocoConteudo;
  index: number;
  total: number;
  uploading: boolean;
  onChange: (b: BlocoConteudo) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  const uploadInto = async (file: File, apply: (url: string) => void) => {
    onUploadStart();
    try {
      apply(await uploadBlogImage(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      onUploadEnd();
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">{TIPO_LABELS[bloco.tipo]}</span>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {bloco.tipo === "paragrafo" && (
        <Textarea value={bloco.texto} onChange={(e) => onChange({ ...bloco, texto: e.target.value })} rows={4} placeholder="Texto do parágrafo" />
      )}

      {bloco.tipo === "titulo" && (
        <Input value={bloco.texto} onChange={(e) => onChange({ ...bloco, texto: e.target.value })} placeholder="Título da seção" />
      )}

      {bloco.tipo === "citacao" && (
        <div className="space-y-2">
          <Textarea value={bloco.texto} onChange={(e) => onChange({ ...bloco, texto: e.target.value })} rows={2} placeholder="Texto citado" />
          <Input value={bloco.fonte} onChange={(e) => onChange({ ...bloco, fonte: e.target.value })} placeholder="Fonte (ex: Isaías 5:20)" />
        </div>
      )}

      {bloco.tipo === "callout" && (
        <div className="space-y-2">
          <Input value={bloco.titulo} onChange={(e) => onChange({ ...bloco, titulo: e.target.value })} placeholder="Título do callout" />
          {bloco.itens.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const itens = [...bloco.itens];
                  itens[i] = e.target.value;
                  onChange({ ...bloco, itens });
                }}
                placeholder={`Item ${i + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onChange({ ...bloco, itens: bloco.itens.filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...bloco, itens: [...bloco.itens, ""] })} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Adicionar item
          </Button>
        </div>
      )}

      {bloco.tipo === "imagem" && (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            {bloco.url && <img src={bloco.url} alt="" className="w-32 h-20 object-cover rounded-md border border-border" />}
            <div className="flex-1 space-y-2">
              <Input value={bloco.url} onChange={(e) => onChange({ ...bloco, url: e.target.value })} placeholder="URL da imagem" />
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.currentTarget.value = "";
                    if (file) uploadInto(file, (url) => onChange({ ...bloco, url }));
                  }}
                />
              </label>
            </div>
          </div>
          <Input value={bloco.legenda} onChange={(e) => onChange({ ...bloco, legenda: e.target.value })} placeholder="Legenda / crédito" />
        </div>
      )}

      {bloco.tipo === "galeria" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bloco.itens.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start gap-3">
                {item.url && <img src={item.url} alt="" className="w-24 h-16 object-cover rounded-md border border-border" />}
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.url}
                    onChange={(e) => {
                      const itens = [...bloco.itens];
                      itens[i] = { ...itens[i], url: e.target.value };
                      onChange({ ...bloco, itens });
                    }}
                    placeholder="URL da imagem"
                  />
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-primary hover:underline">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file)
                          uploadInto(file, (url) => {
                            const itens = [...bloco.itens];
                            itens[i] = { ...itens[i], url };
                            onChange({ ...bloco, itens });
                          });
                      }}
                    />
                  </label>
                </div>
              </div>
              <Input
                value={item.legenda}
                onChange={(e) => {
                  const itens = [...bloco.itens];
                  itens[i] = { ...itens[i], legenda: e.target.value };
                  onChange({ ...bloco, itens });
                }}
                placeholder="Legenda / crédito"
              />
            </div>
          ))}
        </div>
      )}

      {bloco.tipo === "lista" && (
        <div className="space-y-3">
          {bloco.itens.map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-md p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={item.titulo}
                  onChange={(e) => {
                    const itens = [...bloco.itens];
                    itens[i] = { ...itens[i], titulo: e.target.value };
                    onChange({ ...bloco, itens });
                  }}
                  placeholder="Destaque (negrito, opcional)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive shrink-0"
                  onClick={() => onChange({ ...bloco, itens: bloco.itens.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Textarea
                value={item.texto}
                onChange={(e) => {
                  const itens = [...bloco.itens];
                  itens[i] = { ...itens[i], texto: e.target.value };
                  onChange({ ...bloco, itens });
                }}
                rows={2}
                placeholder="Texto do item"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...bloco, itens: [...bloco.itens, { titulo: "", texto: "" }] })}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar item
          </Button>
        </div>
      )}
    </div>
  );
}
