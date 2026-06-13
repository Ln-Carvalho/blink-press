# Redesenho Radar & Research — ID Blink (leve), mobile-first, com download de PDF

**Data:** 2026-06-13
**Repo:** `Ln-Carvalho/blink-press` (pasta local `blink-hub`)
**Branch:** `feature/radar-research-idblink-redesign`
**Stack:** Next.js (App Router) + Tailwind v4 + Keystatic CMS

---

## Contexto e problema

As páginas **Radar** e **Research** vivem no projeto `blink-press` e são servidas em
`blinkgroup.com.br/radar` e `/research` via rewrites do Vercel (configurados no repo
`blinksite`). Hoje elas usam uma identidade visual "jornal" (fontes Newsreader/Libre
Franklin, preto-e-branco, sem logo) que **não tem relação com a marca Blink** do site
principal (MuseoModerno + Plus Jakarta Sans, paleta creme/laranja/vermelho).

Resultado: o visitante que vem de `blinkgroup.com.br` e clica em Radar/Research sente
uma quebra — parece outro site. Além disso, as páginas não estão otimizadas para
leitura no celular e o download de PDF das pesquisas é discreto e só existe no detalhe.

## Objetivos

1. **ID Blink (leve):** trazer logo, paleta e fontes da Blink para as páginas, dando
   continuidade visual com o site principal — porém num visual **claro/clean** otimizado
   para leitura longa (não a home escura).
2. **Mobile-first + legibilidade:** ótimas para ler no telefone (tipo, espaçamento,
   medida de leitura, alvos de toque).
3. **Download de PDF:** botão de baixar PDF visível e bonito, no **detalhe** e também
   **nos cards da lista** de Research.

## Não-objetivos (YAGNI)

- Upload de PDF dentro do CMS (continua campo URL; sem mudança de schema).
- Busca, filtro de categorias interativo, paginação.
- Modo escuro / toggle de tema.
- Mudanças no Navbar do site principal (`blinksite`).
- Mudança nos rewrites do Vercel.

---

## Decisões (confirmadas com o usuário)

| Tema | Decisão |
|---|---|
| ID Blink | Marca Blink **leve** — logo + acentos laranja + fontes da marca, visual claro |
| Fundo | **Claro** (creme/branco) |
| PDF | **Colar URL** (sem mudar schema), só melhorar a superfície |
| Escopo | 4 telas (lista+detalhe de Radar e Research) + **botão de download nos cards** de Research |

---

## Sistema de marca (fundação)

Arquivos: `app/layout.tsx`, `app/globals.css`, `public/`.

- **Fontes** (via `next/font/google`, substituindo Newsreader/Libre):
  - `MuseoModerno` → `--font-display` (títulos/headlines)
  - `Plus Jakarta Sans` → `--font-body` (corpo)
  - `IBM Plex Mono` → `--font-mono` (kickers/labels uppercase)
- **Paleta** (tokens em `@theme` do globals.css):
  - `--color-paper: #FDFAF4` (creme — fundo)
  - `--color-ink: #212121` (texto principal)
  - `--color-muted: #6b6b6b` (apoio)
  - `--color-line: #e3e3de` (divisórias)
  - `--color-orange: #FF6A00`, `--color-gold: #FFA52E`, `--color-red: #F21A1A`
- **Gradiente da marca** (`#FFA52E → #FF6A00 → #F21A1A`, 135deg) como utilitário
  reutilizável (`.brand-gradient`, `.brand-gradient-text`), usado **só como acento**:
  botões primários, hover de links, divisória sob o header, chip de categoria ativo.
- **Logo:** copiar `LogoBlink_Preta.png` (logo preto, bom contraste no creme) do repo
  `blinksite/src/assets/brand/` para `public/brand/` do blink-press. Usado no header.

## Chrome compartilhado — `app/(site)/layout.tsx`

- **Header** claro, `sticky top-0`, com leve blur/borda:
  - Esquerda: logo Blink (link para `https://blinkgroup.com.br`).
  - Direita: nav — `Radar` · `Research` · `← blinkgroup.com.br`.
  - Linha fina com `.brand-gradient` logo abaixo do header.
  - Mobile: nav colapsa de forma limpa (wrap ou menu simples), alvos ≥44px.
- **Footer** claro: símbolo/logo Blink + copyright + link de volta ao site.
- `<main>` mantém `max-w-3xl` (boa medida de leitura) com padding responsivo.

## Tela 1 — Radar (lista) — `app/(site)/radar/page.tsx`

- **Destaque** (primeiro item): chip de categoria + data, headline grande
  (MuseoModerno, `clamp`), lead "Por que importa".
- **Feed** (resto): cards espaçados — chip de categoria, data, título, resumo;
  hover com acento laranja; toda a área do card clicável.
- **Chips de categoria**: estilo de marca; o de destaque/ativo usa gradiente.
- Mantém os blocos repaginados:
  - Cross-promo do Research (card com botão "Conhecer o programa →").
  - Newsletter (`NewsletterForm`) — botão repaginado com a marca.

## Tela 2 — Radar (detalhe) — `app/(site)/radar/[slug]/page.tsx`

- Kicker `categoria · data` (mono, uppercase) → headline grande.
- Callout **"Por que isso importa para sua PME"** com borda-esquerda em gradiente.
- Corpo via `Prose` recalibrado (ver seção de legibilidade); links em laranja.
- Rodapé **Fontes** (mantém comportamento atual, repaginado).
- Mantém JSON-LD `NewsArticle`.

## Tela 3 — Research (lista) — `app/(site)/research/page.tsx`

- **Hero**: título do programa + 2 parágrafos de descrição (mantém o texto atual).
- **Cards de publicação**: kicker `data · autores`, título, abstract, e
  **botão "Baixar PDF"** (gradiente, com ícone de download) **dentro do card** quando
  `paper.pdf` existir. Título continua linkando para o detalhe.
- Estado vazio: "Primeira publicação em preparação." (mantém).

## Tela 4 — Research (detalhe) — `app/(site)/research/[slug]/page.tsx`

- Kicker `Blink Research · data` → título → autores.
- Card de **Abstract** com **botão "Baixar PDF" em destaque** (gradiente + ícone)
  quando `paper.pdf` existir.
- Corpo via `Prose`.
- Mantém JSON-LD `ScholarlyArticle`.

## Componente de download de PDF

Novo componente compartilhado, ex.: `components/PdfDownloadButton.tsx`.

- Props: `href: string`, `variant?: 'primary' | 'compact'`.
- Renderiza **somente** quando `href` é truthy (chamador controla; o componente
  também faz guarda defensiva).
- `<a>` com ícone de download (lucide ou SVG inline), `target="_blank"`,
  `rel="noopener noreferrer"`. Texto "Baixar PDF".
- `primary`: pílula com `.brand-gradient`, texto claro (detalhe).
- `compact`: versão menor/contornada para os cards da lista.
- Alvo de toque ≥44px de altura.

## Legibilidade e mobile (vale para as 4 telas)

- Corpo base ~17–18px; entrelinha ~1.7 no corpo de leitura.
- Escala de tipo responsiva com `clamp()` nas headlines.
- Medida de leitura ~`max-w-3xl` (~68ch).
- Alvos de toque ≥44px; sem rolagem horizontal; padding lateral confortável no mobile.
- `Prose` recalibrado: tamanho/entrelinha de `<p>`, espaçamento de `<h2>`, links em
  laranja com underline, listas e citações legíveis.

## Componentes afetados

| Arquivo | Mudança |
|---|---|
| `app/layout.tsx` | trocar fontes para MuseoModerno/Plus Jakarta/IBM Plex Mono |
| `app/globals.css` | nova paleta + utilitários de gradiente |
| `app/(site)/layout.tsx` | header/footer com logo e marca |
| `app/(site)/radar/page.tsx` | redesenho da lista |
| `app/(site)/radar/[slug]/page.tsx` | redesenho do detalhe |
| `app/(site)/research/page.tsx` | redesenho + botão PDF nos cards |
| `app/(site)/research/[slug]/page.tsx` | redesenho + botão PDF em destaque |
| `components/Prose.tsx` | recalibrar para leitura |
| `components/NewsletterForm.tsx` | botão/inputs na marca |
| `components/PdfDownloadButton.tsx` | **novo** |
| `public/brand/LogoBlink_Preta.png` | **novo** (copiado do blinksite) |

## Verificação

- `npm run build` passa (lint + type-check) no blink-hub.
- `npm run dev` e inspeção visual das 4 rotas em viewport mobile (~375px) e desktop.
- Conferir: download de PDF aparece na lista e no detalhe de Research (com o paper
  `roteirizador-cvrp` — adicionar/confirmar uma URL de PDF de teste no frontmatter, ou
  validar que o botão some quando `pdf` está vazio).
- Sem rolagem horizontal no mobile; alvos de toque ok; contraste do texto sobre creme.
- JSON-LD e metadados preservados.

## Riscos / observações

- Tailwind v4 aqui (`@import "tailwindcss"` + `@theme`) difere do site principal (v3);
  os tokens são portados, não copiados literalmente.
- O paper de exemplo pode não ter `pdf` preenchido — validar os dois caminhos
  (com e sem PDF).
