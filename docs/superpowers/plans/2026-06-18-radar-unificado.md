# Radar Unificado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar Radar e Perspectivas em uma única coleção, schema e rota, eliminando a seção Perspectivas como entidade separada.

**Architecture:** Um único `articleSchema` substitui `noticiaSchema` e `perspectivaSchema`. Todos os MDX vivem em `content/radar/`. A rota `/radar/perspectivas` some e um redirect 301 cobre a URL antiga.

**Tech Stack:** Next.js App Router (SSG) · Tailwind v4 · Zod · Vitest · Keystatic CMS · MDX

## Global Constraints

- Branch: `updates`
- `npm test` deve passar em verde após cada task
- `npm run build` deve passar sem erros na task final
- Nunca remover o bloco de fontes — apenas torná-lo condicional
- Manter `/research` e toda lógica de `Paper` intacta
- URL dos posts existentes em `/radar/[slug]` não muda

---

## Mapa de arquivos

| Arquivo | Ação |
|---|---|
| `lib/schemas.ts` | Modificar — trocar dois schemas por `articleSchema` unificado |
| `lib/content.ts` | Modificar — trocar 4 funções por `getArticles` / `getArticle` |
| `tests/schemas.test.ts` | Modificar — reescrever testes de schema |
| `tests/content.test.ts` | Modificar — reescrever testes de content |
| `tests/fixtures/perspectivas/` | Mover arquivos para `tests/fixtures/radar/` e deletar dir |
| `tests/fixtures-invalid/perspectivas/` | Deletar |
| `content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx` | Mover para `content/radar/` e deletar dir |
| `next.config.ts` | Modificar — adicionar redirect 301 |
| `app/(site)/radar/page.tsx` | Modificar — trocar `getNoticias` por `getArticles` |
| `app/(site)/radar/[slug]/page.tsx` | Modificar — trocar funções, tornar sources condicional |
| `app/(site)/radar/perspectivas/` | Deletar diretório inteiro |
| `keystatic.config.ts` | Modificar — remover collection perspectivas, atualizar noticias |

---

## Task 1: Schema unificado

**Files:**
- Modify: `lib/schemas.ts`
- Modify: `tests/schemas.test.ts`

**Interfaces:**
- Produces: `articleSchema`, `ARTICLE_CATEGORIES`, `type Article` — usados em Tasks 2, 4, 5

- [ ] **Step 1: Escrever testes que falham**

Substituir todo o conteúdo de `tests/schemas.test.ts` por:

```ts
import { describe, it, expect } from 'vitest';
import { articleSchema, ARTICLE_CATEGORIES } from '../lib/schemas';

const base = {
  title: 'Pix parcelado chega às maquininhas',
  date: '2026-06-10',
  category: 'Capital',
  summary: 'Reduz custo de antecipação para PMEs do varejo.',
  status: 'published',
};

describe('articleSchema', () => {
  it('aceita artigo com sources (estilo notícia)', () => {
    const r = articleSchema.parse({
      ...base,
      sources: [{ label: 'Banco Central', url: 'https://www.bcb.gov.br/' }],
    });
    expect(r.date).toBeInstanceOf(Date);
    expect(r.sources).toHaveLength(1);
  });

  it('aceita artigo sem sources (estilo editorial)', () => {
    const r = articleSchema.parse(base);
    expect(r.sources).toBeUndefined();
    expect(r.date).toBeInstanceOf(Date);
  });

  it('aceita author opcional', () => {
    expect(articleSchema.parse({ ...base, author: 'Blink Team' }).author).toBe('Blink Team');
    expect(articleSchema.parse(base).author).toBeUndefined();
  });

  it('rejeita categoria fora do enum', () => {
    expect(() => articleSchema.parse({ ...base, category: 'Esportes' })).toThrow();
  });

  it('rejeita fonte com URL inválida', () => {
    expect(() =>
      articleSchema.parse({ ...base, sources: [{ label: 'x', url: 'nao-e-url' }] }),
    ).toThrow();
  });

  it('rejeita fonte com scheme não-http(s)', () => {
    expect(() =>
      articleSchema.parse({ ...base, sources: [{ label: 'x', url: 'javascript:alert(1)' }] }),
    ).toThrow();
  });

  it('rejeita status desconhecido', () => {
    expect(() => articleSchema.parse({ ...base, status: 'rascunho' })).toThrow();
  });

  it('aceita categoria Tributário (ex-Perspectivas)', () => {
    expect(() => articleSchema.parse({ ...base, category: 'Tributário' })).not.toThrow();
  });

  it('expõe as 8 categorias unificadas', () => {
    expect(ARTICLE_CATEGORIES).toEqual([
      'Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital',
      'Tributário', 'Operações', 'Mercado',
    ]);
  });
});

describe('paperSchema — inalterado', () => {
  // paper continua separado; smoke test para garantir que não quebramos
  it('importa sem erro', async () => {
    const { paperSchema } = await import('../lib/schemas');
    expect(paperSchema).toBeDefined();
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar que falham**

```bash
cd "C:/Users/gusta/OneDrive/Área de Trabalho/BLINK - MKT v3/blink-press"
npm test -- --reporter=verbose tests/schemas.test.ts
```

Esperado: FAIL com "articleSchema is not exported" ou similar.

- [ ] **Step 3: Implementar `articleSchema` em `lib/schemas.ts`**

Substituir o conteúdo completo de `lib/schemas.ts` por:

```ts
import { z } from 'zod';

export const ARTICLE_CATEGORIES = [
  'Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital',
  'Tributário', 'Operações', 'Mercado',
] as const;

export const statusSchema = z.enum(['draft', 'published']);

export const articleSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum(ARTICLE_CATEGORIES),
  summary: z.string().min(1),
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url().regex(/^https?:\/\//, 'apenas http(s)'),
      }),
    )
    .min(1)
    .optional(),
  author: z.string().optional(),
  status: statusSchema,
});

export const paperSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  authors: z.array(z.string().min(1)).min(1),
  abstract: z.string().min(1),
  pdf: z.string().optional(),
  status: statusSchema,
});

export type Article = z.infer<typeof articleSchema>;
export type Paper = z.infer<typeof paperSchema>;
```

- [ ] **Step 4: Rodar testes e confirmar que passam**

```bash
npm test -- --reporter=verbose tests/schemas.test.ts
```

Esperado: todos os testes PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/schemas.ts tests/schemas.test.ts
git commit -m "feat: unify article schema (articleSchema replaces noticiaSchema + perspectivaSchema)"
```

---

## Task 2: lib/content.ts — funções unificadas

**Files:**
- Modify: `lib/content.ts`
- Modify: `tests/content.test.ts`
- Modify: `tests/fixtures/` (mover arquivos de perspectivas para radar)
- Delete: `tests/fixtures/perspectivas/` e `tests/fixtures-invalid/perspectivas/`

**Interfaces:**
- Consumes: `articleSchema`, `Article`, `paperSchema`, `Paper` de `lib/schemas.ts` (Task 1)
- Produces: `getArticles(opts?)`, `getArticle(slug, opts?)`, `getPapers(opts?)`, `getPaper(slug, opts?)`, `loadCollection` — usados em Tasks 4 e 5

- [ ] **Step 1: Mover fixtures de perspectivas para radar**

```bash
cd "C:/Users/gusta/OneDrive/Área de Trabalho/BLINK - MKT v3/blink-press"
cp tests/fixtures/perspectivas/perspectiva-publicada.mdx tests/fixtures/radar/perspectiva-publicada.mdx
cp tests/fixtures/perspectivas/perspectiva-draft.mdx tests/fixtures/radar/perspectiva-draft.mdx
rm -rf tests/fixtures/perspectivas
rm -rf tests/fixtures-invalid/perspectivas
```

- [ ] **Step 2: Verificar conteúdo dos fixtures movidos**

Os arquivos em `tests/fixtures/radar/` agora devem ser 4:
- `2026-06-01-noticia-publicada.mdx` (published, category Brasil)
- `2026-06-05-noticia-draft.mdx` (draft, category Tecnologia)
- `perspectiva-publicada.mdx` (published, category Tributário)
- `perspectiva-draft.mdx` (precisa ter category Tributário ou outra categoria válida em ARTICLE_CATEGORIES — verificar)

```bash
head -10 tests/fixtures/radar/perspectiva-draft.mdx
```

Se `category` for `Tributário`, está ok. Se não estiver em ARTICLE_CATEGORIES, editar o arquivo para usar uma categoria válida.

- [ ] **Step 3: Escrever testes que falham**

Substituir `tests/content.test.ts` por:

```ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadCollection, getArticles, getArticle, getPapers, getPaper } from '../lib/content';
import { articleSchema } from '../lib/schemas';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const INVALID = path.join(import.meta.dirname, 'fixtures-invalid');

describe('loadCollection', () => {
  it('carrega entradas com slug derivado do filename e conteúdo MDX', () => {
    const all = loadCollection(path.join(FIXTURES, 'radar'), articleSchema);
    expect(all.length).toBeGreaterThanOrEqual(2);
    const pub = all.find((e) => e.slug === '2026-06-01-noticia-publicada')!;
    expect(pub.title).toBe('Notícia publicada');
    expect(pub.content).toContain('Corpo da notícia publicada');
  });
  it('lança erro em frontmatter inválido (gate de build)', () => {
    expect(() => loadCollection(path.join(INVALID, 'radar'), articleSchema)).toThrow(/quebrada/);
  });
  it('retorna [] para diretório inexistente', () => {
    expect(loadCollection(path.join(FIXTURES, 'nao-existe'), articleSchema)).toEqual([]);
  });
});

describe('getArticles (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getArticles({ baseDir: FIXTURES });
    const slugs = pub.map((n) => n.slug);
    expect(slugs).not.toContain('2026-06-05-noticia-draft');
    expect(slugs).not.toContain('perspectiva-draft');
    expect(slugs).toContain('2026-06-01-noticia-publicada');
    expect(slugs).toContain('perspectiva-publicada');
  });
  it('inclui drafts quando pedido e ordena por data desc', () => {
    const all = getArticles({ baseDir: FIXTURES, includeDrafts: true });
    expect(all[0].slug).toBe('2026-06-05-noticia-draft'); // mais recente primeiro
    expect(all).toHaveLength(4);
  });
  it('getArticle acha por slug e respeita includeDrafts', () => {
    expect(getArticle('2026-06-05-noticia-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(
      getArticle('2026-06-05-noticia-draft', { baseDir: FIXTURES, includeDrafts: true })?.title,
    ).toBe('Notícia rascunho');
  });
  it('getArticle encontra post ex-perspectiva por slug', () => {
    expect(
      getArticle('perspectiva-publicada', { baseDir: FIXTURES })?.category,
    ).toBe('Tributário');
  });
});

describe('getPapers (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getPapers({ baseDir: FIXTURES });
    expect(pub.map((p) => p.slug)).toEqual(['paper-publicado']);
  });
  it('getPaper respeita includeDrafts', () => {
    expect(getPaper('paper-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(getPaper('paper-draft', { baseDir: FIXTURES, includeDrafts: true })?.title).toBe('Paper rascunho');
  });
});
```

- [ ] **Step 4: Rodar testes para confirmar que falham**

```bash
npm test -- --reporter=verbose tests/content.test.ts
```

Esperado: FAIL com "getArticles is not exported" ou similar.

- [ ] **Step 5: Implementar `getArticles` / `getArticle` em `lib/content.ts`**

Substituir o conteúdo completo de `lib/content.ts` por:

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import { articleSchema, paperSchema, type Article, type Paper } from './schemas';

export type Entry<T> = T & { slug: string; content: string };

export function loadCollection<S extends z.ZodType>(
  absDir: string,
  schema: S,
): Entry<z.infer<S>>[] {
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(absDir, file), 'utf8');
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`Frontmatter inválido em ${file}: ${parsed.error.message}`);
      }
      return { ...(parsed.data as object), slug: file.replace(/\.mdx$/, ''), content } as Entry<z.infer<S>>;
    });
}

type Opts = { includeDrafts?: boolean; baseDir?: string };
const defaultBase = () => path.join(process.cwd(), 'content');

function visible<T extends { status: string; date: Date }>(entries: Entry<T>[], opts: Opts) {
  return entries
    .filter((e) => opts.includeDrafts || e.status === 'published')
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getArticles(opts: Opts = {}): Entry<Article>[] {
  return visible(
    loadCollection(path.join(opts.baseDir ?? defaultBase(), 'radar'), articleSchema),
    opts,
  );
}

export function getArticle(slug: string, opts: Opts = {}): Entry<Article> | undefined {
  return getArticles({ ...opts }).find((a) => a.slug === slug);
}

export function getPapers(opts: Opts = {}): Entry<Paper>[] {
  return visible(
    loadCollection(path.join(opts.baseDir ?? defaultBase(), 'research'), paperSchema),
    opts,
  );
}

export function getPaper(slug: string, opts: Opts = {}): Entry<Paper> | undefined {
  return getPapers({ ...opts }).find((p) => p.slug === slug);
}
```

- [ ] **Step 6: Rodar testes e confirmar que passam**

```bash
npm test -- --reporter=verbose tests/content.test.ts
```

Esperado: todos PASS.

- [ ] **Step 7: Rodar todos os testes**

```bash
npm test
```

Esperado: todos PASS (incluindo `pipeline.test.ts`).

- [ ] **Step 8: Commit**

```bash
git add lib/content.ts tests/content.test.ts tests/fixtures/radar/ tests/fixtures-invalid/ tests/fixtures/perspectivas/
git commit -m "feat: getArticles/getArticle replace getNoticias/getPerspectivas; migrate test fixtures"
```

---

## Task 3: Migração de conteúdo + redirect + remoção da rota

**Files:**
- Move: `content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx` → `content/radar/`
- Delete: `content/perspectivas/`
- Modify: `next.config.ts`
- Delete: `app/(site)/radar/perspectivas/`

**Interfaces:**
- Consumes: nada de tasks anteriores
- Produces: redirect `/radar/perspectivas/:slug*` → `/radar/:slug*`

- [ ] **Step 1: Mover arquivo de conteúdo**

```bash
cd "C:/Users/gusta/OneDrive/Área de Trabalho/BLINK - MKT v3/blink-press"
cp "content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx" "content/radar/congresso-dobrar-teto-simples-nacional-pmes.mdx"
rm -rf content/perspectivas
```

- [ ] **Step 2: Adicionar redirect em `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic/:path*', permanent: false },
      { source: '/radar/perspectivas/:slug*', destination: '/radar/:slug*', permanent: true },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Deletar rota `/radar/perspectivas`**

```bash
rm -rf "app/(site)/radar/perspectivas"
```

- [ ] **Step 4: Commit**

```bash
git add content/radar/congresso-dobrar-teto-simples-nacional-pmes.mdx next.config.ts
git rm -r "content/perspectivas" "app/(site)/radar/perspectivas"
git commit -m "feat: migrate perspectivas content to radar; add redirect; remove /radar/perspectivas route"
```

---

## Task 4: Atualizar páginas do Radar

**Files:**
- Modify: `app/(site)/radar/page.tsx`
- Modify: `app/(site)/radar/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getArticles`, `getArticle`, `Entry<Article>` de `lib/content.ts` (Task 2)

- [ ] **Step 1: Atualizar `app/(site)/radar/page.tsx`**

Substituir o conteúdo por:

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';
import AnimateOnView from '@/components/AnimateOnView';

export const metadata: Metadata = {
  title: 'Radar — notícias que importam para sua PME',
  description: 'Seleção e análise de notícias para PMEs brasileiras: Brasil, Mundo, Regulação, Tecnologia e Capital.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

function Chip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={
        active
          ? 'brand-gradient text-white inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'
          : 'inline-block rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted'
      }
    >
      {children}
    </span>
  );
}

export default function RadarPage() {
  const articles = getArticles();
  const [destaque, ...resto] = articles;

  return (
    <div className="space-y-14">
      <AnimateOnView>
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Radar</p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Notícias que importam para sua PME
          </h1>
        </header>
      </AnimateOnView>

      {destaque && (
        <AnimateOnView delay={80}>
          <article className="border-b border-line pb-12">
            <div className="flex items-center gap-3">
              <Chip active>{destaque.category}</Chip>
              <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(destaque.date)}</span>
            </div>
            <h2 className="mt-4 font-display font-semibold leading-tight text-[clamp(1.75rem,5vw,2.5rem)]">
              <Link href={`/radar/${destaque.slug}`} className="transition-colors hover:text-orange">
                {destaque.title}
              </Link>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              <span className="font-semibold brand-gradient-text">Por que importa:</span> {destaque.summary}
            </p>
          </article>
        </AnimateOnView>
      )}

      <section className="space-y-10">
        {resto.map((a, i) => (
          <AnimateOnView key={a.slug} delay={Math.min(i, 4) * 80}>
            <article className="group">
              <Link href={`/radar/${a.slug}`} className="block">
                <div className="flex items-center gap-3">
                  <Chip>{a.category}</Chip>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(a.date)}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug transition-colors group-hover:text-orange">
                  {a.title}
                </h2>
                <p className="mt-2 text-muted">{a.summary}</p>
              </Link>
            </article>
          </AnimateOnView>
        ))}
      </section>

      <AnimateOnView>
        <aside className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Programa</p>
          <h2 className="mt-2 font-display text-xl font-semibold">Blink Research</h2>
          <p className="mt-2 text-sm text-muted">
            Nosso programa de pesquisa aplicada para PMEs — estudos com rigor acadêmico e aplicação imediata.
          </p>
          <Link
            href="/research"
            className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-orange transition-colors hover:text-red"
          >
            Conhecer o programa →
          </Link>
        </aside>
      </AnimateOnView>

      <AnimateOnView>
        <aside className="border-t border-line pt-10">
          <h2 className="font-display text-xl font-semibold">Receba o radar da semana</h2>
          <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
          <NewsletterForm />
        </aside>
      </AnimateOnView>
    </div>
  );
}
```

- [ ] **Step 2: Atualizar `app/(site)/radar/[slug]/page.tsx`**

Substituir o conteúdo por:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getArticle, getArticles } from '@/lib/content';
import Prose from '@/components/Prose';
import AnimateOnView from '@/components/AnimateOnView';
import ProseAnimated from '@/components/ProseAnimated';
import ExternalLink from '@/components/ExternalLink';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary,
    openGraph: { title: a.title, description: a.summary, type: 'article', publishedTime: a.date.toISOString() },
  };
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    datePublished: a.date.toISOString(),
    description: a.summary,
    author: a.author
      ? { '@type': 'Person', name: a.author }
      : { '@type': 'Organization', name: 'Blink Group', url: 'https://blinkgroup.com.br' },
    publisher: { '@type': 'Organization', name: 'Blink Group' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <AnimateOnView>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">{a.category} · {fmt(a.date)}</p>
        <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{a.title}</h1>
      </AnimateOnView>

      <AnimateOnView delay={80}>
        <div className="mt-8 rounded-r-xl border-l-4 border-orange bg-white py-4 pl-5 pr-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Por que isso importa para sua PME</p>
          <p className="mt-2 text-lg leading-relaxed">{a.summary}</p>
        </div>
      </AnimateOnView>

      <ProseAnimated>
        <Prose>
          <MDXRemote source={a.content} components={{ a: ExternalLink }} />
        </Prose>
      </ProseAnimated>

      {a.sources && a.sources.length > 0 && (
        <AnimateOnView>
          <footer className="mt-14 border-t border-line pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Fontes</p>
            <ul className="mt-3 space-y-2 text-sm">
              {a.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-orange underline underline-offset-2 decoration-orange/40 hover:decoration-orange"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </AnimateOnView>
      )}

      <AnimateOnView>
        <div className="mt-10 border-t border-line pt-6">
          <Link href="/radar" className="font-mono text-xs uppercase tracking-[0.2em] text-orange hover:text-red transition-colors">
            ← Radar
          </Link>
        </div>
      </AnimateOnView>
    </article>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(site)/radar/page.tsx" "app/(site)/radar/[slug]/page.tsx"
git commit -m "feat: update radar pages to use getArticles; sources conditional; remove perspectivas card"
```

---

## Task 5: Keystatic config

**Files:**
- Modify: `keystatic.config.ts`

**Interfaces:**
- Consumes: `ARTICLE_CATEGORIES` de `lib/schemas.ts` (Task 1)

- [ ] **Step 1: Atualizar `keystatic.config.ts`**

Substituir o conteúdo por:

```ts
import { config, collection, fields } from '@keystatic/core';
import { ARTICLE_CATEGORIES } from './lib/schemas';

const isProd = process.env.NODE_ENV === 'production';

export default config({
  storage: isProd
    ? { kind: 'github', repo: { owner: 'Ln-Carvalho', name: 'blink-press' } }
    : { kind: 'local' },
  ui: { brand: { name: 'Blink Press' } },
  collections: {
    radar: collection({
      label: 'Radar (notícias e editorial)',
      slugField: 'title',
      path: 'content/radar/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date', 'category'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft (fila de curadoria)', value: 'draft' },
            { label: 'Published (no ar após deploy)', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Categoria',
          options: ARTICLE_CATEGORIES.map((c) => ({ label: c, value: c })),
          defaultValue: 'Brasil',
        }),
        summary: fields.text({
          label: 'Por que isso importa para sua PME',
          multiline: true,
          validation: { isRequired: true },
        }),
        sources: fields.array(
          fields.object({
            label: fields.text({ label: 'Fonte', validation: { isRequired: true } }),
            url: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          { label: 'Fontes (opcional)', itemLabel: (p) => p.fields.label.value || 'fonte' },
        ),
        author: fields.text({ label: 'Autor (opcional)' }),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
    papers: collection({
      label: 'Papers (Research)',
      slugField: 'title',
      path: 'content/research/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        authors: fields.array(fields.text({ label: 'Autor' }), {
          label: 'Autores',
          itemLabel: (p) => p.value || 'autor',
        }),
        abstract: fields.text({ label: 'Abstract', multiline: true, validation: { isRequired: true } }),
        pdf: fields.text({ label: 'URL do PDF (opcional)' }),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add keystatic.config.ts
git commit -m "feat: update keystatic — merge perspectivas into radar collection"
```

---

## Task 6: Build final

- [ ] **Step 1: Rodar todos os testes**

```bash
cd "C:/Users/gusta/OneDrive/Área de Trabalho/BLINK - MKT v3/blink-press"
npm test
```

Esperado: todos PASS.

- [ ] **Step 2: Rodar build de produção**

```bash
npm run build
```

Esperado: build completo sem erros TypeScript ou de validação de schema.

- [ ] **Step 3: Verificar que não há referências antigas**

```bash
grep -r "getNoticias\|getPerspectivas\|noticiaSchema\|perspectivaSchema\|Perspectiva\|PERSPECTIVA_CATEGORIES\|CATEGORIES\b" --include="*.ts" --include="*.tsx" .
```

Esperado: nenhuma ocorrência (exceto dentro de `docs/` ou arquivos de plano).
