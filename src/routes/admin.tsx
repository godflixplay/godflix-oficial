import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Film, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const { data } = await supabase
            .from("user_roles" as any)
            .select("role")
            .eq("user_id", currentUser.id)
            .eq("role", "admin")
            .maybeSingle();
          setIsAdmin(!!data);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso negado</h1>
          <p className="text-muted-foreground mb-4">
            Sua conta ({user.email}) não possui permissão de administrador.
          </p>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 flex items-center px-4 gap-4">
        <Link to="/admin" className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary text-lg">GODFLIX</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Admin</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-4 ml-8">
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            activeProps={{ className: "text-sm text-primary font-medium flex items-center gap-1" }}
            activeOptions={{ exact: true }}
          >
            <LayoutDashboard className="h-4 w-4" /> Projetos
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => supabase.auth.signOut()}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-1">GODFLIX</h1>
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-xl p-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@godflix.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
