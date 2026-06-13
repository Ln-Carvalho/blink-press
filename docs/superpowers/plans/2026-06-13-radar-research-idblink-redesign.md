# Radar & Research — ID Blink (leve) Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the Radar & Research pages (4 screens + shared header/footer) of the `blink-press` app with a light "ID Blink" identity — Blink logo, cream/orange/red brand accents, MuseoModerno / Plus Jakarta Sans / IBM Plex Mono fonts — and make the Research PDF download prominent in both list cards and detail.

**Architecture:** Tailwind v4 `@theme` tokens + `next/font/google` carry the brand foundation; a shared `app/(site)/layout.tsx` renders the branded chrome; the four route pages are restyled in place (no data/schema changes); a new `PdfDownloadButton` server component renders the PDF affordance. All pages stay React Server Components reading from the existing `lib/content.ts` + Keystatic content. The Vercel rewrites in the `blinksite` repo are untouched.

**Tech Stack:** Next.js 16 (App Router, RSC), Tailwind CSS v4, Keystatic CMS, `next/font/google`, `next/image`, vitest.

---

## Verification strategy (read first)

The spec defines acceptance as: **`npm run build` passes** + **visual inspection of the 4 routes at ~375px and desktop, with and without PDF.** This project has **no jsdom / @testing-library/react**, and the spec's non-goals forbid adding scope. Therefore:

- Every task's gate is **`npm run build` passing** (lint + type-check + static render of all routes).
- **Task 6** adds one real **pure-function unit test** for `PdfDownloadButton` (it has a `null` branch) using only the already-installed `vitest` — no DOM, no new deps.
- **Task 11** is the final visual pass (screenshots at mobile + desktop, with and without PDF) using a temporary content edit that is reverted before completion.

Because the only published Research paper (`roteirizador-cvrp`) is `status: draft` with no `pdf`, the published Research list is currently **empty**. Task 11 temporarily flips it to `published` + adds a test `pdf` URL to exercise the PDF surfaces, then reverts. Do **not** commit that temporary edit.

## File structure

| File | Responsibility | Action |
|---|---|---|
| `app/layout.tsx` | Root: load brand fonts, expose CSS vars | Modify |
| `app/globals.css` | Brand tokens (palette, font tokens) + gradient utilities + base reading type | Modify |
| `public/brand/LogoBlink_Preta.png` | Black Blink logo for the header | Create (copy) |
| `components/PdfDownloadButton.tsx` | PDF download affordance, `primary`/`compact` variants, null-guard | Create |
| `components/PdfDownloadButton.test.ts` | Unit test for the null-guard + element shape | Create |
| `app/(site)/layout.tsx` | Branded sticky header + gradient rule + footer | Modify |
| `components/Prose.tsx` | Recalibrated long-form reading styles | Modify |
| `components/NewsletterForm.tsx` | Inputs/button restyled to brand | Modify |
| `app/(site)/radar/page.tsx` | Radar list redesign (highlight + feed + chips + cross-promo + newsletter) | Modify |
| `app/(site)/radar/[slug]/page.tsx` | Radar detail redesign (kicker, gradient callout, sources) | Modify |
| `app/(site)/research/page.tsx` | Research list redesign + PDF button in cards | Modify |
| `app/(site)/research/[slug]/page.tsx` | Research detail redesign + prominent PDF button | Modify |

**Out of scope (do not touch):** `keystatic.config.ts` (pdf field already exists), `lib/*`, schemas, rewrites in `blinksite`, the main-site Navbar, `app/(site)/page.tsx`.

---

### Task 1: Brand foundation — fonts + tokens + gradient utilities

Establishes the design tokens everything else consumes. Must land first.

**Files:**
- Copy: `~/Documents/GitHub/blinksite/src/assets/brand/LogoBlink_Preta.png` → `public/brand/LogoBlink_Preta.png`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Copy the logo into the app's public dir**

```bash
mkdir -p public/brand
cp ~/Documents/GitHub/blinksite/src/assets/brand/LogoBlink_Preta.png public/brand/LogoBlink_Preta.png
ls -la public/brand/LogoBlink_Preta.png   # expect ~135K file present
```

- [ ] **Step 2: Swap root fonts to the Blink brand** — replace the whole contents of `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { MuseoModerno, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = MuseoModerno({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-museo' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br'),
  title: { default: 'Blink Radar', template: '%s — Blink' },
  description: 'O que PMEs brasileiras precisam saber para crescer. Notícias com análise e pesquisa aplicada, pela Blink.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `app/globals.css`** with the brand tokens, gradient utilities, and base reading type:

```css
@import "tailwindcss";

@theme {
  --color-paper: #FDFAF4;
  --color-ink: #212121;
  --color-muted: #6b6b6b;
  --color-line: #e3e3de;
  --color-orange: #FF6A00;
  --color-gold: #FFA52E;
  --color-red: #F21A1A;

  --font-display: var(--font-museo), system-ui, sans-serif;
  --font-body: var(--font-jakarta), system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Brand gradient — used only as an accent (buttons, rules, active chips). */
.brand-gradient {
  background-image: linear-gradient(135deg, var(--color-gold), var(--color-orange) 55%, var(--color-red));
}
.brand-gradient-text {
  background-image: linear-gradient(135deg, var(--color-gold), var(--color-orange) 55%, var(--color-red));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

- [ ] **Step 4: Verify the build compiles with the new foundation**

Run: `npm run build`
Expected: PASS (compiles, type-checks, renders all routes). Fonts download during build; ensure no font-import errors.

- [ ] **Step 5: Commit**

```bash
git add public/brand/LogoBlink_Preta.png app/layout.tsx app/globals.css
git commit -m "feat(brand): fontes Blink + paleta clara + utilitários de gradiente"
```

---

### Task 2: Branded shared chrome (header + footer)

**Files:**
- Modify: `app/(site)/layout.tsx`

- [ ] **Step 1: Replace `app/(site)/layout.tsx`** with the branded sticky header (logo + nav + gradient rule) and footer:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/brand/LogoBlink_Preta.png';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between gap-4">
          <a href="https://blinkgroup.com.br" className="flex items-center" aria-label="Blink — blinkgroup.com.br">
            <Image src={logo} alt="Blink" priority className="h-6 w-auto" />
          </a>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/radar" className="text-ink hover:text-orange transition-colors">Radar</Link>
            <Link href="/research" className="text-ink hover:text-orange transition-colors">Research</Link>
            <a href="https://blinkgroup.com.br" className="text-muted hover:text-ink transition-colors">← blinkgroup.com.br</a>
          </nav>
        </div>
        <div className="h-0.5 w-full brand-gradient" />
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-line mt-8">
        <div className="mx-auto max-w-3xl px-5 py-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Image src={logo} alt="Blink" className="h-5 w-auto" />
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Blink Group ·{' '}
            <a href="https://blinkgroup.com.br" className="hover:text-orange transition-colors underline underline-offset-2">
              blinkgroup.com.br
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS. The static import of the PNG resolves and `next/image` accepts it.

- [ ] **Step 3: Commit**

```bash
git add app/(site)/layout.tsx
git commit -m "feat(chrome): header/footer com logo Blink e régua em gradiente"
```

---

### Task 3: Recalibrate `Prose` for long-form reading

**Files:**
- Modify: `components/Prose.tsx`

- [ ] **Step 1: Replace `components/Prose.tsx`** with reading-optimized styles (orange links, calmer headings, comfortable measure):

```tsx
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        mt-8 text-[1.0625rem] leading-[1.75] text-ink
        [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:leading-snug
        [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2
        [&_p]:my-5
        [&_a]:text-orange [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-orange/40 hover:[&_a]:decoration-orange
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_li]:my-2
        [&_strong]:font-semibold [&_strong]:text-ink
        [&_blockquote]:border-l-2 [&_blockquote]:border-orange [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted [&_blockquote]:my-6
      "
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/Prose.tsx
git commit -m "feat(prose): tipografia de leitura recalibrada com links laranja"
```

---

### Task 4: Restyle the newsletter form to the brand

**Files:**
- Modify: `components/NewsletterForm.tsx`

- [ ] **Step 1: Replace `components/NewsletterForm.tsx`** — keep all logic, restyle inputs/button (gradient submit, rounded, ≥44px targets):

```tsx
'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setState(res?.ok ? 'ok' : 'error');
  }

  if (state === 'ok') return <p className="text-sm">Pronto — você vai receber o radar da semana. 📬</p>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com.br"
        className="flex-1 min-h-[44px] rounded-full border border-line bg-white px-4 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
      />
      <button type="submit" disabled={state === 'loading'}
        className="brand-gradient min-h-[44px] rounded-full px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
        {state === 'loading' ? 'Enviando…' : 'Assinar'}
      </button>
      {state === 'error' && <p className="text-sm text-red self-center">Falhou — tente de novo.</p>}
    </form>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/NewsletterForm.tsx
git commit -m "feat(newsletter): inputs e botão na identidade Blink"
```

---

### Task 5: Create the `PdfDownloadButton` component

**Files:**
- Create: `components/PdfDownloadButton.tsx`

- [ ] **Step 1: Create `components/PdfDownloadButton.tsx`** — server component, null-guard, two variants, inline download SVG, ≥44px target:

```tsx
type Props = {
  href: string;
  variant?: 'primary' | 'compact';
};

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function PdfDownloadButton({ href, variant = 'primary' }: Props) {
  if (!href) return null;

  const base =
    'inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full font-semibold transition';
  const styles =
    variant === 'primary'
      ? 'brand-gradient text-white px-6 text-sm hover:opacity-90'
      : 'border border-orange text-orange px-5 text-sm hover:bg-orange hover:text-white';

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles}`}>
      <DownloadIcon />
      Baixar PDF
    </a>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS (component is unused so far — that's fine; it must still type-check).

- [ ] **Step 3: Commit**

```bash
git add components/PdfDownloadButton.tsx
git commit -m "feat(pdf): componente PdfDownloadButton (primary/compact) com guarda de href"
```

---

### Task 6: Unit-test the `PdfDownloadButton` null-guard

This is the one piece with branching logic. It returns `ReactElement | null`, so it can be tested as a pure function with the already-installed `vitest` — no DOM, no new deps.

**Files:**
- Create: `components/PdfDownloadButton.test.ts`

- [ ] **Step 1: Write the failing test** — create `components/PdfDownloadButton.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import PdfDownloadButton from './PdfDownloadButton';

describe('PdfDownloadButton', () => {
  it('renders nothing when href is empty', () => {
    expect(PdfDownloadButton({ href: '' })).toBeNull();
  });

  it('renders an external anchor when href is provided', () => {
    const el = PdfDownloadButton({ href: 'https://example.com/p.pdf' }) as React.ReactElement<
      { href: string; target: string; rel: string }
    >;
    expect(el).not.toBeNull();
    expect(el.type).toBe('a');
    expect(el.props.href).toBe('https://example.com/p.pdf');
    expect(el.props.target).toBe('_blank');
    expect(el.props.rel).toBe('noopener noreferrer');
  });
});
```

- [ ] **Step 2: Run the test to confirm it passes against the Task 5 implementation**

Run: `npm test`
Expected: PASS — 2 passing tests. (The implementation already exists from Task 5; this test pins its contract. If it fails, fix `PdfDownloadButton.tsx`, not the test.)

- [ ] **Step 3: Commit**

```bash
git add components/PdfDownloadButton.test.ts
git commit -m "test(pdf): cobre guarda de href e atributos do link"
```

---

### Task 7: Redesign the Radar list

**Files:**
- Modify: `app/(site)/radar/page.tsx`

- [ ] **Step 1: Replace `app/(site)/radar/page.tsx`** — highlight + feed of cards, mono kickers, brand category chips, repainted cross-promo + newsletter blocks. Data access unchanged (`getNoticias`, `destaque`/`resto`).

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getNoticias } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';

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
  const noticias = getNoticias();
  const [destaque, ...resto] = noticias;

  return (
    <div className="space-y-14">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Radar</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Notícias que importam para sua PME
        </h1>
      </header>

      {destaque && (
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
      )}

      <section className="space-y-10">
        {resto.map((n) => (
          <article key={n.slug} className="group">
            <Link href={`/radar/${n.slug}`} className="block">
              <div className="flex items-center gap-3">
                <Chip>{n.category}</Chip>
                <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(n.date)}</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-snug transition-colors group-hover:text-orange">
                {n.title}
              </h2>
              <p className="mt-2 text-muted">{n.summary}</p>
            </Link>
          </article>
        ))}
      </section>

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

      <aside className="border-t border-line pt-10">
        <h2 className="font-display text-xl font-semibold">Receba o radar da semana</h2>
        <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
        <NewsletterForm />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/(site)/radar/page.tsx
git commit -m "feat(radar): redesenho da lista com destaque, chips e feed na marca"
```

---

### Task 8: Redesign the Radar detail

**Files:**
- Modify: `app/(site)/radar/[slug]/page.tsx`

- [ ] **Step 1: Replace `app/(site)/radar/[slug]/page.tsx`** — keep `generateStaticParams`, `dynamicParams`, `generateMetadata`, and the `NewsArticle` JSON-LD exactly; restyle kicker, gradient-bordered callout, sources footer.

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoticia, getNoticias } from '@/lib/content';
import Prose from '@/components/Prose';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNoticias().map((n) => ({ slug: n.slug })); // só published
}
export const dynamicParams = false; // slug fora da lista => 404

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNoticia(slug);
  if (!n) return {};
  return {
    title: n.title,
    description: n.summary,
    openGraph: { title: n.title, description: n.summary, type: 'article', publishedTime: n.date.toISOString() },
  };
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params;
  const n = getNoticia(slug);
  if (!n) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.title,
    datePublished: n.date.toISOString(),
    description: n.summary,
    author: { '@type': 'Organization', name: 'Blink Group', url: 'https://blinkgroup.com.br' },
    publisher: { '@type': 'Organization', name: 'Blink Group' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">{n.category} · {fmt(n.date)}</p>
      <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{n.title}</h1>

      <div className="mt-8 rounded-r-xl border-l-4 border-orange bg-white py-4 pl-5 pr-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Por que isso importa para sua PME</p>
        <p className="mt-2 text-lg leading-relaxed">{n.summary}</p>
      </div>

      <Prose>
        <MDXRemote source={n.content} />
      </Prose>

      <footer className="mt-14 border-t border-line pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Fontes</p>
        <ul className="mt-3 space-y-2 text-sm">
          {n.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} rel="noopener noreferrer" target="_blank"
                className="text-orange underline underline-offset-2 decoration-orange/40 hover:decoration-orange">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/(site)/radar/[slug]/page.tsx
git commit -m "feat(radar): redesenho do detalhe com callout em gradiente e fontes repaginadas"
```

---

### Task 9: Redesign the Research list + PDF button in cards

**Files:**
- Modify: `app/(site)/research/page.tsx`

- [ ] **Step 1: Replace `app/(site)/research/page.tsx`** — hero text preserved, publication cards with `compact` PDF button when `p.pdf` exists, empty state preserved.

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPapers } from '@/lib/content';
import PdfDownloadButton from '@/components/PdfDownloadButton';

export const metadata: Metadata = {
  title: 'Research — pesquisa aplicada para PMEs',
  description: 'O programa de pesquisa da Blink: ciência aplicada aos problemas reais de pequenas e médias empresas brasileiras.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function ResearchPage() {
  const papers = getPapers();
  return (
    <div className="space-y-14">
      <section>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Research</p>
        <h1 className="mt-2 font-display font-semibold leading-tight text-[clamp(1.875rem,5vw,2.75rem)]">
          Pesquisa aplicada, <span className="brand-gradient-text">para quem opera</span>
        </h1>
        <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed">
          <p>
            A Blink mantém um programa de pesquisa dedicado aos problemas reais de PMEs
            brasileiras: otimização de operações, precificação, logística e acesso a
            tecnologia que antes só grandes empresas alcançavam.
          </p>
          <p>
            O programa é conduzido com orientação acadêmica formal — professor orientador
            e bolsa de pesquisa — e tem um compromisso: todo estudo publicado aqui vem
            acompanhado de uma aplicação que qualquer PME pode usar.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted border-b border-line pb-3">Publicações</h2>
        <div className="mt-8 space-y-10">
          {papers.length === 0 && <p className="text-muted">Primeira publicação em preparação.</p>}
          {papers.map((p) => (
            <article key={p.slug} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(p.date)} · {p.authors.join(', ')}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-snug">
                <Link href={`/research/${p.slug}`} className="transition-colors hover:text-orange">{p.title}</Link>
              </h3>
              <p className="mt-3 text-muted">{p.abstract}</p>
              {p.pdf && (
                <div className="mt-5">
                  <PdfDownloadButton href={p.pdf} variant="compact" />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/(site)/research/page.tsx
git commit -m "feat(research): redesenho da lista com botão Baixar PDF nos cards"
```

---

### Task 10: Redesign the Research detail + prominent PDF button

**Files:**
- Modify: `app/(site)/research/[slug]/page.tsx`

- [ ] **Step 1: Replace `app/(site)/research/[slug]/page.tsx`** — keep `generateStaticParams`, `dynamicParams`, `generateMetadata`, and the `ScholarlyArticle` JSON-LD exactly; abstract card with a `primary` PDF button.

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPaper, getPapers } from '@/lib/content';
import Prose from '@/components/Prose';
import PdfDownloadButton from '@/components/PdfDownloadButton';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPapers().map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPaper(slug);
  if (!p) return {};
  return { title: p.title, description: p.abstract, openGraph: { title: p.title, description: p.abstract, type: 'article' } };
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function PaperPage({ params }: Props) {
  const { slug } = await params;
  const p = getPaper(slug);
  if (!p) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: p.title,
    abstract: p.abstract,
    datePublished: p.date.toISOString(),
    author: p.authors.map((a) => ({ '@type': 'Person', name: a })),
    publisher: { '@type': 'Organization', name: 'Blink Group' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Research · {fmt(p.date)}</p>
      <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{p.title}</h1>
      <p className="mt-3 text-muted">{p.authors.join(', ')}</p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Abstract</p>
        <p className="mt-3 leading-relaxed">{p.abstract}</p>
        {p.pdf && (
          <div className="mt-6">
            <PdfDownloadButton href={p.pdf} variant="primary" />
          </div>
        )}
      </div>

      <Prose>
        <MDXRemote source={p.content} />
      </Prose>
    </article>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/(site)/research/[slug]/page.tsx
git commit -m "feat(research): redesenho do detalhe com Baixar PDF em destaque"
```

---

### Task 11: Final verification — full build + visual pass (mobile/desktop, with/without PDF)

No code changes ship from this task except a temporary, reverted content edit used only to exercise the PDF + Research-list surfaces.

**Files:**
- Temp-edit then revert: `content/research/roteirizador-cvrp.mdx`

- [ ] **Step 1: Full clean build**

Run: `npm run build`
Expected: PASS — all routes prerender, no type/lint errors.

- [ ] **Step 2: Confirm the "no PDF / empty list" path first**

With the repo as-is, `roteirizador-cvrp` is `status: draft` → Research list is empty ("Primeira publicação em preparação.") and no PDF button anywhere. Start the dev server and capture this state.

Run: `npm run dev` (background)
Visit at ~375px and desktop: `/radar`, `/radar/2026-06-10-por-que-a-blink-lancou-um-radar-para-pmes`, `/research`, and a research detail (none published yet — verify `/research` shows the empty state cleanly).
Check: branded header/footer with logo + gradient rule; no horizontal scroll at 375px; tap targets ≥44px; text contrast on cream.

- [ ] **Step 3: Temporarily enable the PDF path** — edit `content/research/roteirizador-cvrp.mdx` frontmatter ONLY for local verification:

```yaml
# change:
status: draft
# to:
status: published
# and add a pdf line:
pdf: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
```

- [ ] **Step 4: Verify the PDF surfaces render**

Reload dev (content is read at request/build time). Visit at ~375px and desktop:
- `/research` → publication card shows the `compact` "Baixar PDF" outlined button.
- `/research/roteirizador-cvrp` → abstract card shows the `primary` gradient "Baixar PDF" button; body renders.
Confirm the button links to the pdf URL, opens in a new tab, and is ≥44px tall.

- [ ] **Step 5: Revert the temporary content edit**

```bash
git checkout -- content/research/roteirizador-cvrp.mdx
git status   # expect: clean working tree (no content changes staged or unstaged)
```

- [ ] **Step 6: Final build after revert + stop dev server**

Run: `npm run build`
Expected: PASS. Stop the backgrounded dev server.

- [ ] **Step 7 (optional): If verification revealed visual issues**, fix in the relevant task's file, rebuild, and commit with a focused message (e.g. `fix(radar): ...`). Otherwise this task ships no commit.

---

## Self-Review

**Spec coverage:**
- ID Blink leve (logo + orange/red accents + MuseoModerno/Plus Jakarta/IBM Plex Mono, light) → Tasks 1, 2.
- Light theme (paper #FDFAF4, ink #212121) → Task 1 tokens.
- Gradient `#FFA52E→#FF6A00→#F21A1A` as accent only (buttons, header rule, active chip, link hover) → Task 1 utilities, used in Tasks 2/4/5/7/8/9/10.
- Logo `LogoBlink_Preta.png` copied to `public/brand/`, used in header/footer → Tasks 1, 2.
- Shared chrome: sticky light header, logo→blinkgroup, nav Radar·Research·← blinkgroup, gradient rule, footer, `max-w-3xl` main → Task 2.
- Radar list: highlight (chip+date+clamp headline+"Por que importa"), feed cards, brand chips (active=gradient), cross-promo, newsletter → Task 7.
- Radar detail: mono kicker, gradient-left callout, Prose, sources, NewsArticle JSON-LD preserved → Tasks 3, 8.
- Research list: hero (text preserved), cards with compact PDF button when `paper.pdf`, empty state preserved → Task 9.
- Research detail: kicker→title→authors, abstract card with primary PDF button, Prose, ScholarlyArticle JSON-LD preserved → Tasks 3, 10.
- PdfDownloadButton: `href`+`variant?`, null-guard, external `_blank`/`noopener`, primary=gradient/compact=outlined, ≥44px → Tasks 5, 6.
- Legibility/mobile: ~17px body, 1.7 leading, clamp headlines, ~max-w-3xl measure, ≥44px targets, recalibrated Prose → Tasks 1, 2, 3.
- PDF stays a URL field (no schema change) → confirmed; `keystatic.config.ts` untouched.
- Verification: build + visual at 375px/desktop with & without PDF → Task 11.

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to Task N". All code is complete and self-contained.

**Type consistency:** `PdfDownloadButton` props `{ href: string; variant?: 'primary' | 'compact' }` are identical across Tasks 5, 6, 9 (`variant="compact"`), and 10 (`variant="primary"`). Content accessors (`getNoticias`, `getNoticia`, `getPapers`, `getPaper`) and fields (`category`, `date`, `summary`, `sources[].label/url`, `title`, `authors`, `abstract`, `pdf`, `content`, `slug`) match `lib/schemas.ts`. Font CSS vars (`--font-museo`/`--font-jakarta`/`--font-plex-mono`) defined in Task 1 layout match the `@theme` references in Task 1 globals. Gradient utility classes (`brand-gradient`, `brand-gradient-text`) defined in Task 1 are used consistently downstream.
