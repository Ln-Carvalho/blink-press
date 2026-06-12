# blink-hub

Hub de conteúdo orgânico da Blink — **Radar** (notícias para PMEs, `/radar`) e **Research** (papers, `/research`) — servido sob `blinkgroup.com.br` via rewrites do site institucional.

Spec e plano: `blinksite/docs/superpowers/specs/2026-06-10-blink-organic-hub-design.md` e `blinksite/docs/superpowers/plans/2026-06-10-blink-organic-hub.md`.

## Stack

Next.js (App Router, SSG) · Tailwind v4 · MDX em `content/` validado com Zod no build (frontmatter inválido = build falha) · Keystatic CMS em `/keystatic` (redirect de `/admin`) · Resend (newsletter) · pipeline de notícias via Claude API (GitHub Action cron).

## Desenvolvimento

```bash
npm install
npm run dev      # site + /admin (Keystatic em modo local)
npm test         # vitest (schemas, loader, parser do pipeline)
npm run build
```

## Variáveis de ambiente

| Variável | Onde | Para quê | Sem ela |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel | URLs canônicas (sitemap, OG, JSON-LD) | fallback `https://blinkgroup.com.br` (correto em produção) |
| `RESEND_API_KEY` | Vercel | captura de newsletter | `/api/newsletter` responde 502 |
| `RESEND_AUDIENCE_ID` | Vercel | audiência destino | idem |
| `KEYSTATIC_GITHUB_CLIENT_ID` / `KEYSTATIC_GITHUB_CLIENT_SECRET` / `KEYSTATIC_SECRET` / `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Vercel | Keystatic em modo GitHub (salvar = commit) | Keystatic fica em modo local (não persiste em produção) |
| `ANTHROPIC_API_KEY` | GitHub Secret | pipeline de notícias (Action `radar-pipeline`) | job falha; nenhum rascunho é criado (fail-safe) |

As variáveis do Keystatic são geradas pelo fluxo de criação do GitHub App na primeira visita a `/keystatic` em produção.

## Fluxo editorial

```
GitHub Action (cron seg/qua/sex) → Claude API escreve MDX → commit na main com status: draft
  → humano abre /admin → edita → confere /preview/radar/<slug> → status: published → salvar (= commit)
  → deploy publica
```

O site só renderiza `status: published`; drafts são visíveis apenas nas rotas `/preview/*` (noindex).
