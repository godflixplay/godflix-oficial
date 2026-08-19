import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/conta/perfil")({
  head: () => ({
    meta: [
      { title: "Complete seu cadastro — Godflix" },
      { name: "description", content: "Complete seus dados pra fazer parte da comunidade Godflix." },
    ],
  }),
  ssr: false,
  component: PerfilPage,
});

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const TERM_VERSION = "v1";

const formatWhatsapp = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

function getNextParam() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}

function PerfilPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  // Reflete o que já estava salvo no banco ao carregar a página — não muda
  // enquanto o usuário digita, pra não trocar de tela antes de ele salvar.
  const [cadastroJaCompleto, setCadastroJaCompleto] = useState(false);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [aceitaWhatsapp, setAceitaWhatsapp] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        navigate({ to: "/conta/entrar" });
        return;
      }

      const { data: perfil } = await supabase.from("profiles" as any).select("*").eq("user_id", user.id).maybeSingle();
      const { data: prefs } = await supabase
        .from("communication_preferences" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const p = perfil as any;
      const nomeCarregado = p?.name || "";
      const whatsappCarregado = p?.whatsapp ? formatWhatsapp(p.whatsapp.replace(/^\+55/, "")) : "";
      const cidadeCarregada = p?.city || "";
      const estadoCarregado = p?.state || "";
      setNome(nomeCarregado);
      setWhatsapp(whatsappCarregado);
      setCidade(cidadeCarregada);
      setEstado(estadoCarregado);
      setAceitaWhatsapp(Boolean((prefs as any)?.whatsapp_opt_in));
      setCadastroJaCompleto(Boolean(nomeCarregado && whatsappCarregado && cidadeCarregada && estadoCarregado));
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      setErro("Informe um WhatsApp válido, com DDD.");
      return;
    }
    if (!cidade.trim() || !estado) {
      setErro("Preencha cidade e estado.");
      return;
    }

    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error("Sessão expirada. Entre novamente.");

      const whatsappNormalizado = `+55${digits}`;

      const { error: profileError } = await supabase.from("profiles" as any).upsert({
        user_id: user.id,
        name: nome.trim(),
        whatsapp: whatsappNormalizado,
        city: cidade.trim(),
        state: estado,
      });
      if (profileError) throw profileError;

      const { error: prefsError } = await supabase.from("communication_preferences" as any).upsert({
        user_id: user.id,
        whatsapp_opt_in: aceitaWhatsapp,
      });
      if (prefsError) throw prefsError;

      const { error: consentError } = await supabase.from("consent_log" as any).insert({
        user_id: user.id,
        channel: "whatsapp",
        opted_in: aceitaWhatsapp,
        term_version: TERM_VERSION,
      });
      if (consentError) throw consentError;

      const next = getNextParam();
      if (next) {
        navigate({ to: next });
      } else if (cadastroJaCompleto) {
        // Já era um cadastro completo, isso foi só uma edição — volta pro resumo.
        setEditando(false);
      } else {
        setConcluido(true);
        setEditando(false);
      }
      setCadastroJaCompleto(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar seus dados.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" />;
  }

  if (concluido) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Cadastro concluído</h1>
          <p className="text-sm text-muted-foreground">
            Você agora faz parte da comunidade Godflix, {nome.split(" ")[0]}. O apoio financeiro chega em breve —
            já deixamos tudo pronto pra quando estiver disponível.
          </p>
          <Button asChild className="bg-primary text-primary-foreground">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cadastroJaCompleto && !editando) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Olá, {nome.split(" ")[0]}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Você está cadastrado como: <span className="text-foreground">{nome}</span> — {cidade}/{estado}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setEditando(true)}>
              Revisar dados
            </Button>
            {getNextParam() ? (
              <Button className="bg-primary text-primary-foreground" onClick={() => navigate({ to: getNextParam()! })}>
                Continuar
              </Button>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground">
                <Link to="/">Voltar ao início</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-1">Complete seu cadastro</h1>
          <p className="text-sm text-muted-foreground">Só precisamos de mais alguns dados.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 bg-card border border-border rounded-xl p-6">
          <div className="space-y-1">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
              placeholder="(21) 98765-4321"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">UF</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <Checkbox id="whatsappOptIn" checked={aceitaWhatsapp} onCheckedChange={(v) => setAceitaWhatsapp(v === true)} />
            <Label htmlFor="whatsappOptIn" className="text-xs font-normal text-muted-foreground leading-snug">
              Quero receber novidades e informações do Godflix pelo WhatsApp.
            </Label>
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={saving}>
            {saving ? "Salvando..." : "Salvar e continuar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
