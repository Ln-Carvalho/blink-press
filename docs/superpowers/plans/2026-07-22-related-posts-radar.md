# Leituras Sugeridas no Rodapé do Post (Radar) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "← Radar" back-link at the bottom of a Radar post page with a section of 3 minimalist "related reading" cards plus a prominent CTA button back to the full listing.

**Architecture:** A new pure function `getRelatedArticles` in `lib/content.ts` selects 2 posts from the same category plus 1 overall-most-recent post (with fallback to overall-most-recent when the category has fewer than 2 other posts), reusing the existing `getArticles` loader. A new server component `components/RelatedPosts.tsx` renders the 3 cards (category chip + title only, no summary/image) in a responsive grid, plus the CTA button. A shared `components/Chip.tsx` is extracted from `app/(site)/radar/page.tsx` so both the listing and the new component render category pills identically. The post page (`app/(site)/radar/[slug]/page.tsx`) is wired to call `getRelatedArticles` and render `RelatedPosts` in place of the old back-link block.

**Tech Stack:** Next.js 16 (App Router, React Server Components), React 19, TypeScript, Tailwind v4, Vitest (unit tests for the pure selection logic only — no component/E2E test framework in this repo).

## Global Constraints

- Scope is **Radar only** (`app/(site)/radar/[slug]/page.tsx`). Do not touch `app/(site)/research/[slug]/page.tsx` or `app/preview/**`.
- No cover-image field exists on posts — cards must not reference one.
- Selection logic: 2 most recent posts from the same `category` as the current post, + 1 overall-most-recent post (any category), excluding the current post and duplicates. If the category has fewer than 2 other published posts, fill the remaining slots with the next most-recent posts overall. Display order: same-category picks first, then the fallback/most-recent pick last.
- Card style: minimalist — category `Chip` + title only, no summary, no date, no image. Grid: 1 column on mobile, 3 columns from the `sm` breakpoint (per project convention of always optimizing frontend changes for mobile).
- The old CTA becomes a **prominent button** ("Ver todas as notícias →" or equivalent), not a plain text link, linking to `/radar`. Full-width on mobile.
- All new/edited application code imports via the `@/*` path alias (per `tsconfig.json`); test files use **relative** imports (per existing convention in `tests/content.test.ts` — Vitest here has no path-alias resolution configured).
- **Environment constraint:** this machine has no Node.js/npm installed and the repo has no `node_modules`. `vitest`, `tsc`, `next build`, and `next lint` **cannot be executed locally** during this plan. Every "run test" step below documents the exact command for the record and for whoever runs it later (CI, a teammate, or a future session with Node available), but execution is skipped here with a note. Final functional verification happens only in Task 5, by pushing and checking the actual Vercel preview deployment in a browser — this matches the project's existing verification workflow (there is no local dev server either).
- Per `AGENTS.md`: this project pins a recent/prerelease Next.js — if any step requires an App Router API not shown explicitly in this plan, check `node_modules/next/dist/docs/` before improvising (not expected to be needed for this plan, since every API used below — `params: Promise<...>`, Server Components, `generateStaticParams` — is already used verbatim elsewhere in this codebase).

---

### Task 1: `getRelatedArticles` selection logic

**Files:**
- Create: `tests/fixtures-related/radar/current-post-a.mdx`
- Create: `tests/fixtures-related/radar/brasil-mais-recente.mdx`
- Create: `tests/fixtures-related/radar/brasil-segunda.mdx`
- Create: `tests/fixtures-related/radar/brasil-terceira.mdx`
- Create: `tests/fixtures-related/radar/tech-mais-recente-geral.mdx`
- Create: `tests/fixtures-related/radar/mundo-antiga.mdx`
- Create: `tests/fixtures-related/radar/capital-rascunho.mdx`
- Create: `tests/fixtures-related/radar/current-post-b.mdx`
- Create: `tests/fixtures-related-sparse/radar/current.mdx`
- Create: `tests/fixtures-related-sparse/radar/other.mdx`
- Modify: `tests/content.test.ts`
- Modify: `lib/content.ts`

**Interfaces:**
- Consumes: existing `getArticles(opts?: { includeDrafts?: boolean; baseDir?: string })`, existing `Entry<T> = T & { slug: string; content: string }`, existing `Article` type from `lib/schemas.ts` (already imported in `lib/content.ts`).
- Produces: `getRelatedArticles(current: Entry<Article>, opts?: { includeDrafts?: boolean; baseDir?: string }): Entry<Article>[]` — used by Task 4.

- [ ] **Step 1: Create the fixture files for the main scenario**

Create `tests/fixtures-related/radar/current-post-a.mdx`:

```mdx
---
title: Post atual A
date: 2026-06-10
category: Brasil
summary: Post usado como "atual" no cenário principal do teste.
status: published
---

Corpo do post atual A.
```

Create `tests/fixtures-related/radar/brasil-mais-recente.mdx`:

```mdx
---
title: Brasil mais recente
date: 2026-06-08
category: Brasil
summary: Primeiro relacionado esperado por categoria.
status: published
---

Corpo.
```

Create `tests/fixtures-related/radar/brasil-segunda.mdx`:

```mdx
---
title: Brasil segunda posição
date: 2026-06-06
category: Brasil
summary: Segundo relacionado esperado por categoria.
status: published
---

Corpo.
```

Create `tests/fixtures-related/radar/brasil-terceira.mdx`:

```mdx
---
title: Brasil terceira posição
date: 2026-06-02
category: Brasil
summary: Terceiro post da categoria Brasil — não deve ser escolhido (só os 2 mais recentes contam).
status: published
---

Corpo.
```

Create `tests/fixtures-related/radar/tech-mais-recente-geral.mdx`:

```mdx
---
title: Tecnologia mais recente geral
date: 2026-06-09
category: Tecnologia
summary: Post mais recente entre todos (exceto o atual) — vira o preenchimento "mais recente geral".
status: published
---

Corpo.
```

Create `tests/fixtures-related/radar/mundo-antiga.mdx`:

```mdx
---
title: Mundo antiga
date: 2026-05-01
category: Mundo
summary: Post antigo, usado só para ter mais candidatos no pool de fallback.
status: published
---

Corpo.
```

Create `tests/fixtures-related/radar/capital-rascunho.mdx`:

```mdx
---
title: Capital rascunho
date: 2026-06-11
category: Capital
summary: Draft mais recente que tudo — nunca deve aparecer como relacionado.
status: draft
---

Corpo.
```

Create `tests/fixtures-related/radar/current-post-b.mdx`:

```mdx
---
title: Post atual B
date: 2026-06-07
category: Capital
summary: Post usado como "atual" no cenário de fallback (categoria Capital só tem um draft, sem outro publicado).
status: published
---

Corpo do post atual B.
```

Create `tests/fixtures-related-sparse/radar/current.mdx`:

```mdx
---
title: Único post atual
date: 2026-01-02
category: Brasil
summary: Post usado como "atual" no cenário com poucos posts no total.
status: published
---

Corpo.
```

Create `tests/fixtures-related-sparse/radar/other.mdx`:

```mdx
---
title: Único outro post
date: 2026-01-01
category: Mundo
summary: Único outro post publicado — o resultado deve ter 1 item, não 3, e não quebrar.
status: published
---

Corpo.
```

- [ ] **Step 2: Write the failing tests**

In `tests/content.test.ts`, add `getRelatedArticles` to the existing import on line 3, and add a new `describe` block at the end of the file:

```ts
import { loadCollection, getArticles, getArticle, getRelatedArticles, getPapers, getPaper } from '../lib/content';
```

Append to the end of the file:

```ts
describe('getRelatedArticles (contra fixtures-related via baseDir)', () => {
  const RELATED_FIXTURES = path.join(import.meta.dirname, 'fixtures-related');
  const SPARSE_FIXTURES = path.join(import.meta.dirname, 'fixtures-related-sparse');

  it('escolhe os 2 mais recentes da mesma categoria e completa com o mais recente geral', () => {
    const current = getArticle('current-post-a', { baseDir: RELATED_FIXTURES })!;
    const related = getRelatedArticles(current, { baseDir: RELATED_FIXTURES });
    expect(related.map((r) => r.slug)).toEqual([
      'brasil-mais-recente',
      'brasil-segunda',
      'tech-mais-recente-geral',
    ]);
  });

  it('nunca inclui o próprio post nem drafts', () => {
    const current = getArticle('current-post-a', { baseDir: RELATED_FIXTURES })!;
    const related = getRelatedArticles(current, { baseDir: RELATED_FIXTURES });
    expect(related.some((r) => r.slug === 'current-post-a')).toBe(false);
    expect(related.some((r) => r.slug === 'capital-rascunho')).toBe(false);
  });

  it('faz fallback para os mais recentes gerais quando a categoria não tem 2 outros posts', () => {
    const current = getArticle('current-post-b', { baseDir: RELATED_FIXTURES })!;
    const related = getRelatedArticles(current, { baseDir: RELATED_FIXTURES });
    expect(related.map((r) => r.slug)).toEqual([
      'current-post-a',
      'tech-mais-recente-geral',
      'brasil-mais-recente',
    ]);
  });

  it('retorna menos de 3 itens sem quebrar quando não há posts suficientes', () => {
    const current = getArticle('current', { baseDir: SPARSE_FIXTURES })!;
    const related = getRelatedArticles(current, { baseDir: SPARSE_FIXTURES });
    expect(related.map((r) => r.slug)).toEqual(['other']);
  });
});
```

- [ ] **Step 3: Attempt to run the tests, confirm they cannot execute in this environment**

Command for the record (do not expect output here — see Global Constraints):

```bash
npx vitest run tests/content.test.ts -t getRelatedArticles
```

This machine has no Node.js/npm installed (confirmed: `node --version` and `npm --version` both fail with "command not found", and `node_modules/` does not exist). Skip execution. `getRelatedArticles` does not exist yet in `lib/content.ts`, so if this were run in an environment with Node, it would fail with a TypeScript/import error (`has no exported member 'getRelatedArticles'`) — treat that as the expected "red" state before Step 4.

- [ ] **Step 4: Implement `getRelatedArticles`**

In `lib/content.ts`, insert immediately after the existing `getArticle` function (right before `export function getPapers`):

```ts
export function getRelatedArticles(current: Entry<Article>, opts: Opts = {}): Entry<Article>[] {
  const others = getArticles(opts).filter((article) => article.slug !== current.slug);
  const sameCategory = others.filter((article) => article.category === current.category).slice(0, 2);
  const sameCategorySlugs = new Set(sameCategory.map((article) => article.slug));
  const rest = others.filter((article) => !sameCategorySlugs.has(article.slug));
  return [...sameCategory, ...rest.slice(0, 3 - sameCategory.length)];
}
```

No new imports are needed — `Article`, `Entry`, `Opts`, and `getArticles` are already defined/imported in this file.

- [ ] **Step 5: Verify correctness by manual trace (execution unavailable)**

Since `vitest` cannot run here, trace the logic by hand against the fixtures from Step 1 and confirm it matches the assertions in Step 2:

- For `current-post-a` (category `Brasil`, date `2026-06-10`): `others` sorted by date desc = `tech-mais-recente-geral`(06-09), `brasil-mais-recente`(06-08), `current-post-b`(06-07), `brasil-segunda`(06-06), `brasil-terceira`(06-02), `mundo-antiga`(05-01). `sameCategory` (Brasil, top 2) = `[brasil-mais-recente, brasil-segunda]`. `rest` minus those = `[tech-mais-recente-geral, current-post-b, brasil-terceira, mundo-antiga]`; `needed = 1` → `[tech-mais-recente-geral]`. Final: `[brasil-mais-recente, brasil-segunda, tech-mais-recente-geral]` — matches Step 2 assertion 1.
- For `current-post-b` (category `Capital`, date `2026-06-07`): `others` sorted desc = `current-post-a`(06-10), `tech-mais-recente-geral`(06-09), `brasil-mais-recente`(06-08), `brasil-segunda`(06-06), `brasil-terceira`(06-02), `mundo-antiga`(05-01) (`capital-rascunho` excluded — it's a draft, filtered by `getArticles` before this function ever sees it). `sameCategory` (Capital) = `[]` (no other published Capital post). `needed = 3` → top 3 of `rest` = `[current-post-a, tech-mais-recente-geral, brasil-mais-recente]` — matches Step 2 assertion 3.
- For the sparse fixtures: only `other` remains after excluding `current`; `sameCategory = []` (different category); `rest = [other]`; result `[other]`, length 1 — matches Step 2 assertion 4.

This confirms the implementation is correct without needing to execute it. Flag to the user that this was verified by manual trace, not by running the test suite, and that running `npm test` on a machine with Node installed is recommended as a follow-up sanity check.

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts tests/content.test.ts tests/fixtures-related tests/fixtures-related-sparse
git commit -m "feat: add getRelatedArticles selection logic for radar posts"
```

---

### Task 2: Extract shared `Chip` component

**Files:**
- Create: `components/Chip.tsx`
- Modify: `app/(site)/radar/page.tsx:1-38`

**Interfaces:**
- Produces: `Chip({ children: React.ReactNode; active?: boolean })` default export — consumed by Task 3's `RelatedPosts` and by the existing usages in `app/(site)/radar/page.tsx`.

- [ ] **Step 1: Create `components/Chip.tsx`**

```tsx
export default function Chip({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
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
```

This is a byte-for-byte move of the function currently defined locally in `app/(site)/radar/page.tsx:26-38`.

- [ ] **Step 2: Update `app/(site)/radar/page.tsx` to import the shared `Chip`**

Change the import block at the top of the file (currently lines 1-7):

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';
import AnimateOnView from '@/components/AnimateOnView';
import RadarCardBody from '@/components/RadarCardBody';
import RadarHeader, { GatedSplitText } from '@/components/RadarHeader';
```

to:

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';
import AnimateOnView from '@/components/AnimateOnView';
import RadarCardBody from '@/components/RadarCardBody';
import RadarHeader, { GatedSplitText } from '@/components/RadarHeader';
import Chip from '@/components/Chip';
```

Then delete the local `Chip` function definition (currently lines 26-38):

```tsx
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
```

Every usage of `<Chip>` further down in the file (lines 53 and 73) stays exactly as-is — only the definition moves.

- [ ] **Step 3: Confirm no other references to the removed local function**

```bash
grep -n "function Chip" "app/(site)/radar/page.tsx"
```

Expected: no output (the local definition is gone; only `<Chip` JSX usages and the new import remain).

Note: this cannot be run in this environment either (no `grep` needed here specifically — this one *is* runnable via Bash since it's a plain text search, not Node — go ahead and run it for real).

- [ ] **Step 4: Commit**

```bash
git add components/Chip.tsx "app/(site)/radar/page.tsx"
git commit -m "refactor: extract shared Chip component out of radar listing page"
```

---

### Task 3: `RelatedPosts` component

**Files:**
- Create: `components/RelatedPosts.tsx`

**Interfaces:**
- Consumes: `Chip` default export from `@/components/Chip` (Task 2); `Entry<T>` type from `@/lib/content`; `Article` type from `@/lib/schemas`.
- Produces: `RelatedPosts({ posts: Entry<Article>[] })` default export — consumed by Task 4.

- [ ] **Step 1: Create `components/RelatedPosts.tsx`**

```tsx
import Link from 'next/link';
import Chip from '@/components/Chip';
import type { Entry } from '@/lib/content';
import type { Article } from '@/lib/schemas';

export default function RelatedPosts({ posts }: { posts: Entry<Article>[] }) {
  if (posts.length === 0) return null;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Leituras sugeridas</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/radar/${post.slug}`} className="glass-card block rounded-2xl p-5">
            <Chip>{post.category}</Chip>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug link-gradient">{post.title}</h3>
          </Link>
        ))}
      </div>
      <Link
        href="/radar"
        className="brand-gradient mt-6 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 sm:inline-flex sm:w-auto"
      >
        Ver todas as notícias →
      </Link>
    </div>
  );
}
```

Notes on choices made here, for the reviewer:
- No `'use client'` directive — this is a plain server component (no hooks, no interactivity), unlike `RadarCardBody` which depends on a client-side `RadarHeader` context that doesn't exist on the post-detail page.
- Each whole card is the `<Link>` (not just the title), so the entire card is clickable — the `link-gradient` hover effect on the `<h3>` works because of the existing global CSS rule `a:hover .link-gradient` in `app/globals.css:112`, since the `<h3>` is a descendant of the `<a>` rendered by `<Link>`.
- The CTA button reuses `.brand-gradient`, which `app/globals.css:27-28` documents as intended for exactly this ("used only as an accent (buttons, rules, active chips)").
- `posts.length === 0` guard: defensive against the edge case (confirmed possible in Task 1, Step 2's sparse-fixture test) where fewer than 3 — or zero — related posts exist; renders nothing rather than an empty heading.

- [ ] **Step 2: Commit**

```bash
git add components/RelatedPosts.tsx
git commit -m "feat: add RelatedPosts component for radar post footer"
```

---

### Task 4: Wire `RelatedPosts` into the post page

**Files:**
- Modify: `app/(site)/radar/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getRelatedArticles` from `@/lib/content` (Task 1); `RelatedPosts` default export from `@/components/RelatedPosts` (Task 3).

- [ ] **Step 1: Update imports**

Change line 4 from:

```tsx
import { getArticle, getArticles } from '@/lib/content';
```

to:

```tsx
import { getArticle, getArticles, getRelatedArticles } from '@/lib/content';
```

Add a new import after line 11 (`import ReadingProgress from '@/components/ReadingProgress';`):

```tsx
import RelatedPosts from '@/components/RelatedPosts';
```

Remove the now-unused `Link` import (currently line 12, `import Link from 'next/link';`) — after this task, the page itself no longer renders a `<Link>` directly; the CTA link now lives inside `RelatedPosts`.

- [ ] **Step 2: Compute the related posts**

In the `ArticlePage` function body, immediately after the existing `if (!a) notFound();` (currently line 40), add:

```tsx
const related = getRelatedArticles(a);
```

- [ ] **Step 3: Replace the old back-link block with `RelatedPosts`**

Replace (currently lines 119-125):

```tsx
      <AnimateOnView>
        <div className="mt-10 border-t border-line pt-6">
          <Link href="/radar" className="font-mono text-xs uppercase tracking-[0.2em] text-orange hover:text-red transition-colors">
            ← Radar
          </Link>
        </div>
      </AnimateOnView>
```

with:

```tsx
      <AnimateOnView>
        <div className="mt-10 border-t border-line pt-6">
          <RelatedPosts posts={related} />
        </div>
      </AnimateOnView>
```

- [ ] **Step 4: Confirm no stray reference to the removed `Link` import remains**

```bash
grep -n "Link" "app/(site)/radar/[slug]/page.tsx"
```

Expected: no output — this is a real, runnable command (plain text search, no Node needed). If anything is printed, the `Link` import was needed elsewhere and Step 1's removal was wrong; re-add it in that case.

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/radar/[slug]/page.tsx"
git commit -m "feat: replace radar post back-link with related-posts section"
```

---

### Task 5: Push and verify against the real Vercel preview

**Files:** none (verification only).

**Interfaces:** none — this task consumes the finished feature from Tasks 1-4 as a whole.

This repo has no local dev server (no Node installed) and no CI gate that runs build/lint/test (`newsletter.yml` and `radar-pipeline.yml` don't). Per the project's established workflow, real verification happens by pushing and checking the live Vercel preview deployment in a browser.

- [ ] **Step 1: Ask the user for confirmation, then push**

Pushing is a shared-state action — confirm with the user before running:

```bash
git push
```

(Branch `novas-aparencias` already tracks `origin/novas-aparencias`.)

- [ ] **Step 2: Find the Vercel preview URL**

Ask the user for the preview URL (or check the GitHub PR/commit checks if one exists) once the deployment finishes.

- [ ] **Step 3: Visually verify on desktop**

Using the browser tool, navigate to a post page on the preview URL (e.g. `<preview-url>/radar/<any-existing-slug>`) and confirm:
- The old "← Radar" text link is gone.
- A "Leituras sugeridas" section with exactly 3 cards appears at the bottom (category chip + title, no summary/image), unless the site currently has fewer than 4 published Radar posts total, in which case fewer cards is correct per Task 1's design.
- Clicking a related card navigates to that post.
- A prominent "Ver todas as notícias" button appears below the cards and navigates to `/radar`.

- [ ] **Step 4: Visually verify on mobile**

Resize the browser viewport to mobile width (375px) and confirm:
- The 3 cards stack in a single column.
- The CTA button is full-width.

- [ ] **Step 5: Spot-check the selection logic against real content**

Pick a post whose category has several other published posts, and manually cross-check (via the `/radar` listing page, filtering by eye) that the 2 category-matched cards shown are indeed the 2 most recent in that category, and the 3rd card is the most recent post overall (or the next category match, if the site's real data doesn't hit the fallback path). This is the one check that can't be fully automated given the environment constraints — flag any mismatch back to Task 1's logic rather than papering over it here.
