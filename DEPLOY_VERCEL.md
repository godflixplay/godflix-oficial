# Deploy na Vercel — Godflix

Este projeto foi configurado para deploy na **Vercel** (substituindo o preset Lovable/Cloudflare).

## Fluxo

```
Lovable (edição) → GitHub (push) → Vercel (deploy automático)
```

> ⚠️ O preview/dev integrado da Lovable **não funciona mais** com este setup. Use `npm run dev` localmente ou o preview da Vercel.

## Configuração na Vercel

1. Importe o repositório do GitHub na Vercel.
2. Em **Settings → Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `LOVABLE_API_KEY` (se usar Lovable AI)
3. Framework Preset: **Other** (o `vercel.json` já configura tudo).
4. Build Command: `npm run build` (já no `vercel.json`).
5. Output Directory: `dist/client` (já no `vercel.json`).
6. Aponte o domínio `godflix.com.br` em **Settings → Domains**.

## Como funciona

- `npm run build` gera:
  - `dist/client/` → assets estáticos (servidos diretamente pela Vercel CDN).
  - `dist/server/server.js` → handler SSR Web-fetch.
- `api/index.ts` é a serverless function Node.js que invoca o handler SSR.
- `vercel.json` faz rewrite de todas as rotas (exceto `/assets/*`) para `/api/index`.

## Desenvolvimento local

```bash
npm install
npm run dev    # http://localhost:8080
```
