import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Início" },
    { to: "/membros", label: "Seja Membro" },
    { to: "/empresas", label: "Para Empresas" },
    { to: "/enviar-projeto", label: "Enviar Projeto" },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight">GODFLIX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "text-sm font-medium text-primary" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/membros">Apoiar</Link>
            </Button>
          </nav>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="flex flex-col px-4 py-4 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                activeProps={{ className: "text-sm font-medium text-primary py-2" }}
                activeOptions={{ exact: link.to === "/" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-2 bg-primary text-primary-foreground">
              <Link to="/membros" onClick={() => setMobileOpen(false)}>Apoiar</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
