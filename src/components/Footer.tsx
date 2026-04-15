import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold text-primary tracking-tight">GODFLIX</span>
            <p className="mt-3 text-sm text-muted-foreground">
              Financiando e produzindo conteúdo audiovisual cristão de qualidade para o mundo.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Plataforma</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Projetos</Link></li>
              <li><Link to="/membros" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Seja Membro</Link></li>
              <li><Link to="/empresas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Para Empresas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Produtores</h4>
            <ul className="space-y-2">
              <li><Link to="/enviar-projeto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Enviar Projeto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Contato</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">contato@godflix.com.br</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Godflix. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Feito com fé e propósito 🙏
          </p>
        </div>
      </div>
    </footer>
  );
}
