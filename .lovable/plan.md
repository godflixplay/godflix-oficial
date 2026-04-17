

# Diagnóstico definitivo

**Confirmado por inspeção do HTML em produção:** o servidor está entregando o `pendingComponent` ("Carregando admin...") e o JavaScript do cliente nunca consegue substituir essa tela pelo `AdminLayout` (que contém o formulário de login).

A prova está no manifesto serializado dentro do próprio HTML:
```
matches: [
  { i:"__root__",   s:"success", ssr:true  },
  { i:"/admin",     s:"pending", ssr:false },  // travado em pending
  { i:"/admin/",    s:"pending", ssr:false }   // travado em pending
]
```

**Causa raiz:** a combinação `ssr: false` + `pendingComponent` + `pendingMs: 0` faz o TanStack Router serializar a rota como "pending" no SSR. Quando o cliente hidrata, ele respeita o estado pendente e nunca avança para o `component`. A tela fica eternamente em "Carregando admin...".

**Status dos dados (confirmado via Supabase):**
- 9 projetos intactos ✅
- 5 categorias intactas ✅
- 1 admin cadastrado: `wnogueira@hotmail.com` ✅

Nada se perdeu. É só corrigir o render do front.

---

# Plano de correção

## 1. Remover `pendingComponent` + `pendingMs` das rotas admin

Manter `ssr: false` (admin precisa ser client-only por causa do `localStorage` da sessão Supabase), mas **eliminar o pendingComponent** que está congelando a hidratação. Sem SSR, o TanStack já mostra o `component` direto no cliente — não precisa de fallback de pending.

Arquivos:
- `src/routes/admin.tsx` — remover `pendingComponent`, `pendingMs` e a função `AdminLoadingScreen`
- `src/routes/admin.index.tsx` — remover `pendingComponent`, `pendingMs` e `AdminIndexPending`
- `src/routes/admin.projetos.$projetoId.tsx` — verificar e remover se houver

## 2. Garantir SSR shell visível para evitar tela preta

Como `ssr: false` faz o body inicial vir vazio, vou colocar um **shell mínimo direto no `RootShell`** (em `__root.tsx`) que aparece em qualquer rota com `ssr:false` enquanto o JS carrega. Esse shell vive no HTML estático, não passa pelo router, então não fica preso em "pending".

Implementação: adicionar dentro do `<body>`, antes de `{children}`, um `<div id="admin-fallback">` com a tela de loading que só fica visível quando a rota é `/admin*` (via CSS no `appCss`) — ou mais simples, deixar o próprio `AdminLayout` mostrar seu loading interno (que já existe no `useState(loading)`) sem depender do `pendingComponent` da rota.

## 3. Acesso facilitado ao admin

Hoje o link do admin não está em lugar nenhum visível. Vou adicionar:
- **URL alternativa simples**: criar `src/routes/login.tsx` como atalho que redireciona para `/admin`
- **Link discreto no Footer** (`src/components/Footer.tsx`): "Admin" no rodapé, só visível para quem souber procurar

## 4. Testar end-to-end após push

Depois do push para GitHub e redeploy na Vercel, validar via `curl` que o HTML de `/admin` agora não vem mais marcado como `pending`, e que o formulário de login aparece em `https://www.godflix.com.br/admin`.

---

## Detalhes técnicos

**Por que essa correção funciona:** o `pendingComponent` foi adicionado nas tentativas anteriores para evitar "tela preta", mas o efeito colateral é que o TanStack Router, ao ver `ssr:false` + `pendingComponent`, gera HTML estático com o estado "pending" e o cliente respeita esse estado durante a hidratação. Removendo o `pendingComponent`, o cliente entra direto no `component` (`AdminLayout`), que tem seu próprio gerenciamento de loading via `useState`.

**Por que não vai dar tela preta:** o `__root.tsx` carrega `Header` ou `Outlet` normalmente. Para `/admin*`, o `RootComponent` renderiza `<Outlet />` direto. O `AdminLayout` no `useEffect` resolve a sessão e mostra "Carregando..." → formulário de login → ou layout autenticado. Tudo no cliente, sem conflito de hidratação.

## Fluxo após o fix
```text
Browser → GET /admin
  ↓
HTML: shell + script bundle (sem "pending" travado)
  ↓
Cliente hidrata → AdminLayout monta
  ↓
useEffect → supabase.auth.getSession()
  ↓
sem sessão → AdminLoginForm (email/senha)
  ↓
login com wnogueira@hotmail.com → checa user_roles
  ↓
isAdmin=true → mostra Dashboard com 9 projetos
```

## Arquivos afetados
- `src/routes/admin.tsx` (remover pending)
- `src/routes/admin.index.tsx` (remover pending)
- `src/routes/admin.projetos.$projetoId.tsx` (verificar)
- `src/routes/login.tsx` (novo — atalho)
- `src/components/Footer.tsx` (link discreto)

## Passos pós-implementação
1. Push para GitHub
2. Aguardar redeploy automático na Vercel (~1 min)
3. Testar `https://www.godflix.com.br/admin` → deve mostrar formulário de login
4. Login com `wnogueira@hotmail.com` → dashboard com 9 projetos

