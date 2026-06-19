# Radar Unificado — Design Spec

**Data:** 2026-06-18
**Branch:** updates

## Contexto

O blink-press tem dois tipos de conteúdo editorial distintos hoje:

- **Radar** (`content/radar/`) — notícias curadas com contextualização para PMEs. Schema: `noticiaSchema` com `sources` obrigatório.
- **Perspectivas** (`content/perspectivas/`) — análises editoriais mais longas. Schema: `perspectivaSchema` com `author` opcional e sem `sources`.

A separação não reflete a realidade editorial: o Radar já é o produto editorial da Blink — é onde as notícias recebem contextualização e análise para quem administra PMEs. Perspectivas e Radar são a mesma coisa. A única distinção relevante no site é entre **Radar** (editorial/notícias) e **Research** (papers acadêmicos aplicados).

## Objetivo

Unificar Radar e Perspectivas em uma única coleção, rota e schema. Eliminar a seção Perspectivas como entidade separada.

## Design

### 1. Schema unificado

Substituir `noticiaSchema` e `perspectivaSchema` por um único `articleSchema` em `lib/schemas.ts`:

```ts
export const ARTICLE_CATEGORIES = [
  'Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital',
  'Tributário', 'Operações', 'Mercado',
] as const;

export const articleSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum(ARTICLE_CATEGORIES),
  summary: z.string().min(1),
  sources: z.array(z.object({
    label: z.string().min(1),
    url: z.string().url().regex(/^https?:\/\//, 'apenas http(s)'),
  })).optional(),
  author: z.string().optional(),
  status: statusSchema,
});

export type Article = z.infer<typeof articleSchema>;
```

Remover: `noticiaSchema`, `perspectivaSchema`, `CATEGORIES`, `PERSPECTIVA_CATEGORIES`, tipos `Noticia` e `Perspectiva`.

### 2. Migração de conteúdo

Mover `content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx` → `content/radar/congresso-dobrar-teto-simples-nacional-pmes.mdx`.

Remover o diretório `content/perspectivas/`.

O frontmatter existente do post não precisa de alteração — é válido no novo schema (`sources` e `author` são opcionais).

### 3. lib/content.ts

Substituir `getNoticias`, `getNoticia`, `getPerspectivas`, `getPerspectiva` por:

```ts
export function getArticles(opts: Opts = {}): Entry<Article>[]
export function getArticle(slug: string, opts?: Opts): Entry<Article> | undefined
```

Apontando para `content/radar/` como única fonte.

### 4. Rotas

| Rota | Ação |
|---|---|
| `/radar` | Mantém — listing agora usa `getArticles()` |
| `/radar/[slug]` | Mantém — detail agora usa `getArticle()`. Bloco de fontes renderiza condicionalmente (`sources` presente) |
| `/radar/perspectivas` | Removida — diretório `app/(site)/radar/perspectivas/` deletado |
| `/radar/perspectivas/[slug]` | Redirect 301 → `/radar/[slug]` via `next.config.ts` |

### 5. Mudanças visuais

**Página `/radar` (listing):**
- Feed passa a incluir posts anteriormente em Perspectivas, mesclados por data
- Card de "Blink Perspectivas" no rodapé da listagem é removido
- Resto do layout permanece idêntico

**Página `/radar/[slug]` (detail):**
- Bloco de fontes externas renderiza apenas se `post.sources` existir
- Bloco "Em resumo" (hoje exclusivo de Perspectivas) pode ser exibido se `summary` existir — já está presente em todos os posts
- Ajustar o link "voltar" no footer de "← Todas as perspectivas" para "← Radar"

### 6. Keystatic CMS

Atualizar `keystatic.config.ts` para refletir a coleção unificada: remover collection `perspectivas`, garantir que a collection `radar` use o novo schema.

## O que não muda

- `/research` e toda a lógica de `Paper` permanecem intactos
- URLs de posts existentes em `/radar/[slug]` não mudam
- Visual geral do site não muda
- Pipeline de geração automática de notícias (GitHub Action) não muda

## Critério de sucesso

- Build passa sem erros
- `/radar` lista todos os posts (ex-radar + ex-perspectivas) ordenados por data
- `/radar/perspectivas/congresso-dobrar-teto-simples-nacional-pmes` redireciona para `/radar/congresso-dobrar-teto-simples-nacional-pmes`
- Nenhuma referência a `Noticia`, `Perspectiva`, `getNoticias`, `getPerspectivas` permanece no código
