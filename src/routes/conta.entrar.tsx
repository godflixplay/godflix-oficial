import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/conta/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Godflix" },
      { name: "description", content: "Entre ou crie sua conta Godflix." },
    ],
  }),
  ssr: false,
  component: EntrarPage,
});

// "next" aqui é o destino FINAL (ex: /membros) — sempre passamos primeiro
// por /conta/perfil, que depois encaminha pra esse destino.
function getFinalDestino() {
  if (typeof window === "undefined") return "/";
  return new URLSearchParams(window.location.search).get("next") || "/";
}

function perfilUrlComDestino() {
  const destino = getFinalDestino();
  return destino === "/" ? "/conta/perfil" : `/conta/perfil?next=${encodeURIComponent(destino)}`;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.5-4.6 2.5-7.7 2.5-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.5 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function EntrarPage() {
  const [modo, setModo] = useState<"entrar" | "cadastrar" | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [checandoSessao, setChecandoSessao] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.href = perfilUrlComDestino();
        return;
      }
      setChecandoSessao(false);
    })();
  }, []);

  const handleGoogle = async () => {
    setErro("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${perfilUrlComDestino()}` },
    });
    if (error) setErro(error.message);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (modo === "cadastrar" && senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { full_name: nome } },
        });
        if (error) throw error;
      }
      window.location.href = perfilUrlComDestino();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível continuar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (checandoSessao) {
    return <div className="min-h-screen flex items-center justify-center" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-24">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-1">GODFLIX</h1>
          <p className="text-sm text-muted-foreground">Como você quer continuar?</p>
        </div>

        <div className="space-y-3 bg-card border border-border rounded-xl p-6">
          <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogle}>
            <GoogleIcon /> Continuar com Google
          </Button>

          {modo === null ? (
            <>
              <div className="relative py-2 text-center text-xs text-muted-foreground">
                <span className="bg-card px-2 relative z-10">ou</span>
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => setModo("entrar")}>
                Continuar com e-mail
              </Button>
            </>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3 pt-2">
              {modo === "cadastrar" && (
                <div className="space-y-1">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
              </div>
              {modo === "cadastrar" && (
                <div className="space-y-1">
                  <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {erro && <p className="text-sm text-destructive">{erro}</p>}

              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={enviando}>
                {enviando ? "Enviando..." : modo === "entrar" ? "Entrar" : "Criar conta"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setModo(modo === "entrar" ? "cadastrar" : "entrar");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {modo === "entrar" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
