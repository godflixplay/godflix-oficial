import { createFileRoute, redirect } from "@tanstack/react-router";

// Atalho amigável para o painel administrativo.
// /login → redireciona para /admin
export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
