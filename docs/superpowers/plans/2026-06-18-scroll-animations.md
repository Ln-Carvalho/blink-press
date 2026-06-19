# Scroll Animations & External Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll-triggered slide-up animations to all blink-press pages and make external MDX links open in a new tab.

**Architecture:** Two client components (`AnimateOnView` for structural blocks, `ProseAnimated` for article body paragraphs) plus a passive `ExternalLink` MDX override. CSS animations live in `globals.css`. No new npm packages. Six pages are modified to wrap their elements.

**Tech Stack:** Next.js 16 App Router · React 19 · Tailwind v4 · CSS IntersectionObserver

## Global Constraints

- All hook-using components must be `'use client'`; RSC output can be passed as `children` to client components
- No new npm packages — IntersectionObserver is native browser API
- `prefers-reduced-motion`: animations must be disabled via CSS media query
- CSS class names: `animate-on-view`, `is-visible`, `prose-child-hidden` — exact spelling required (tasks reference these)
- `AnimateOnView` renders a `<div>` wrapper — `key` prop goes on `AnimateOnView` when used inside `.map()`
- `ExternalLink` detects external URLs by `href?.startsWith('http://') || href?.startsWith('https://')`
- Verification: run `npm run build` — TypeScript errors = broken; zero errors = correct

---

## Files Map

| Action | File |
|--------|------|
| Modify | `app/globals.css` |
| Create | `components/AnimateOnView.tsx` |
| Create | `components/ProseAnimated.tsx` |
| Create | `components/ExternalLink.tsx` |
| Modify | `app/(site)/radar/page.tsx` |
| Modify | `app/(site)/radar/perspectivas/page.tsx` |
| Modify | `app/(site)/research/page.tsx` |
| Modify | `app/(site)/radar/[slug]/page.tsx` |
| Modify | `app/(site)/radar/perspectivas/[slug]/page.tsx` |
| Modify | `app/(site)/research/[slug]/page.tsx` |

---

### Task 1: CSS + AnimateOnView component

**Files:**
- Modify: `app/globals.css`
- Create: `components/AnimateOnView.tsx`

**Interfaces:**
- Produces:
  - CSS classes `animate-on-view` + `is-visible` (used by AnimateOnView and referenced by Tasks 3 & 4)
  - `AnimateOnView({ children, delay?, className? })` — default export (used by Tasks 3 & 4)

- [ ] **Step 1: Add animation CSS to globals.css**

Append to the end of `app/globals.css` (after the `.brand-gradient-text` block):

```css
/* Scroll animations */
.animate-on-view {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.animate-on-view.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.prose-child-hidden {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.prose-child-hidden.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .animate-on-view,
  .prose-child-hidden {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Create AnimateOnView component**

`components/AnimateOnView.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimateOnView({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`animate-on-view${className ? ` ${className}` : ''}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css components/AnimateOnView.tsx
git commit -m "feat(animations): add CSS scroll animation classes + AnimateOnView component"
```

---

### Task 2: ProseAnimated + ExternalLink components

**Files:**
- Create: `components/ProseAnimated.tsx`
- Create: `components/ExternalLink.tsx`

**Interfaces:**
- Consumes: CSS class `prose-child-hidden` + `is-visible` from Task 1
- Produces:
  - `ProseAnimated({ children })` — default export, wraps MDX body (used by Task 4)
  - `ExternalLink({ href?, children, ...rest })` — default export, MDX `a` override (used by Task 4)

- [ ] **Step 1: Create ProseAnimated**

`components/ProseAnimated.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';

export default function ProseAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const elements = container.querySelectorAll('p, h2, h3, li');
    const observers: IntersectionObserver[] = [];
    elements.forEach((el) => {
      el.classList.add('prose-child-hidden');
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

- [ ] **Step 2: Create ExternalLink**

`components/ExternalLink.tsx`:

```tsx
interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

export default function ExternalLink({ href, children, ...rest }: Props) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ProseAnimated.tsx components/ExternalLink.tsx
git commit -m "feat(animations): add ProseAnimated and ExternalLink components"
```

---

### Task 3: Animate listing pages

**Files:**
- Modify: `app/(site)/radar/page.tsx`
- Modify: `app/(site)/radar/perspectivas/page.tsx`
- Modify: `app/(site)/research/page.tsx`

**Interfaces:**
- Consumes: `AnimateOnView` from `@/components/AnimateOnView` (Task 1)

- [ ] **Step 1: Update radar/page.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getNoticias } from '@/lib/content';
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
  const noticias = getNoticias();
  const [destaque, ...resto] = noticias;

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
        {resto.map((n, i) => (
          <AnimateOnView key={n.slug} delay={Math.min(i, 4) * 80}>
            <article className="group">
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
        <aside className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Editorial</p>
          <h2 className="mt-2 font-display text-xl font-semibold">Blink Perspectivas</h2>
          <p className="mt-2 text-sm text-muted">
            Análises sobre o que muda no cenário e o que isso representa para a operação do seu negócio.
          </p>
          <Link
            href="/radar/perspectivas"
            className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-orange transition-colors hover:text-red"
          >
            Ler as perspectivas →
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

- [ ] **Step 2: Update radar/perspectivas/page.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPerspectivas } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';
import AnimateOnView from '@/components/AnimateOnView';

export const metadata: Metadata = {
  title: 'Perspectivas — análises para quem administra PMEs',
  description: 'Análises editoriais da Blink sobre o que muda no cenário e o que isso representa para quem administra um negócio de serviço.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function PerspectivásPage() {
  const perspectivas = getPerspectivas();
  const [destaque, ...resto] = perspectivas;

  return (
    <div className="space-y-14">
      <AnimateOnView>
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Perspectivas</p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Análises para quem administra PMEs
          </h1>
          <p className="mt-3 text-muted">
            O que muda no cenário e o que isso representa, de forma concreta, para a operação do seu negócio.
          </p>
        </header>
      </AnimateOnView>

      {destaque && (
        <AnimateOnView delay={80}>
          <article className="border-b border-line pb-12">
            <div className="flex items-center gap-3">
              <span className="brand-gradient text-white inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {destaque.category}
              </span>
              <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(destaque.date)}</span>
            </div>
            <h2 className="mt-4 font-display font-semibold leading-tight text-[clamp(1.75rem,5vw,2.5rem)]">
              <Link href={`/radar/perspectivas/${destaque.slug}`} className="transition-colors hover:text-orange">
                {destaque.title}
              </Link>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink">{destaque.summary}</p>
          </article>
        </AnimateOnView>
      )}

      {resto.length > 0 && (
        <section className="space-y-10">
          {resto.map((p, i) => (
            <AnimateOnView key={p.slug} delay={Math.min(i, 4) * 80}>
              <article className="group">
                <Link href={`/radar/perspectivas/${p.slug}`} className="block">
                  <div className="flex items-center gap-3">
                    <span className="inline-block rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      {p.category}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(p.date)}</span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold leading-snug transition-colors group-hover:text-orange">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-muted">{p.summary}</p>
                </Link>
              </article>
            </AnimateOnView>
          ))}
        </section>
      )}

      <AnimateOnView>
        <aside className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Radar</p>
          <h2 className="mt-2 font-display text-xl font-semibold">Notícias da semana para PMEs</h2>
          <p className="mt-2 text-sm text-muted">
            Seleção e análise das notícias que mais impactam quem administra um negócio de serviço.
          </p>
          <Link
            href="/radar"
            className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-orange transition-colors hover:text-red"
          >
            Ver o Radar →
          </Link>
        </aside>
      </AnimateOnView>

      <AnimateOnView>
        <aside className="border-t border-line pt-10">
          <h2 className="font-display text-xl font-semibold">Receba as perspectivas da semana</h2>
          <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
          <NewsletterForm />
        </aside>
      </AnimateOnView>
    </div>
  );
}
```

- [ ] **Step 3: Update research/page.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPapers } from '@/lib/content';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import AnimateOnView from '@/components/AnimateOnView';

export const metadata: Metadata = {
  title: 'Research — pesquisa aplicada para PMEs',
  description: 'O programa de pesquisa da Blink: ciência aplicada aos problemas reais de pequenas e médias empresas brasileiras.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function ResearchPage() {
  const papers = getPapers();
  return (
    <div className="space-y-14">
      <AnimateOnView>
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
      </AnimateOnView>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted border-b border-line pb-3">Publicações</h2>
        <div className="mt-8 space-y-10">
          {papers.length === 0 && (
            <AnimateOnView>
              <p className="text-muted">Primeira publicação em preparação.</p>
            </AnimateOnView>
          )}
          {papers.map((p, i) => (
            <AnimateOnView key={p.slug} delay={Math.min(i, 4) * 80}>
              <article className="rounded-2xl border border-line bg-white p-6 sm:p-8">
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
            </AnimateOnView>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/radar/page.tsx" "app/(site)/radar/perspectivas/page.tsx" "app/(site)/research/page.tsx"
git commit -m "feat(animations): apply AnimateOnView to listing pages"
```

---

### Task 4: Animate detail pages

**Files:**
- Modify: `app/(site)/radar/[slug]/page.tsx`
- Modify: `app/(site)/radar/perspectivas/[slug]/page.tsx`
- Modify: `app/(site)/research/[slug]/page.tsx`

**Interfaces:**
- Consumes:
  - `AnimateOnView` from `@/components/AnimateOnView` (Task 1)
  - `ProseAnimated` from `@/components/ProseAnimated` (Task 2)
  - `ExternalLink` from `@/components/ExternalLink` (Task 2)

- [ ] **Step 1: Update radar/[slug]/page.tsx**

Replace the entire file with:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoticia, getNoticias } from '@/lib/content';
import Prose from '@/components/Prose';
import AnimateOnView from '@/components/AnimateOnView';
import ProseAnimated from '@/components/ProseAnimated';
import ExternalLink from '@/components/ExternalLink';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNoticias().map((n) => ({ slug: n.slug }));
}
export const dynamicParams = false;

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

      <AnimateOnView>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">{n.category} · {fmt(n.date)}</p>
        <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{n.title}</h1>
      </AnimateOnView>

      <AnimateOnView delay={80}>
        <div className="mt-8 rounded-r-xl border-l-4 border-orange bg-white py-4 pl-5 pr-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Por que isso importa para sua PME</p>
          <p className="mt-2 text-lg leading-relaxed">{n.summary}</p>
        </div>
      </AnimateOnView>

      <ProseAnimated>
        <Prose>
          <MDXRemote source={n.content} components={{ a: ExternalLink }} />
        </Prose>
      </ProseAnimated>

      <AnimateOnView>
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
      </AnimateOnView>
    </article>
  );
}
```

- [ ] **Step 2: Update radar/perspectivas/[slug]/page.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPerspectiva, getPerspectivas } from '@/lib/content';
import Prose from '@/components/Prose';
import AnimateOnView from '@/components/AnimateOnView';
import ProseAnimated from '@/components/ProseAnimated';
import ExternalLink from '@/components/ExternalLink';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPerspectivas().map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPerspectiva(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, type: 'article', publishedTime: p.date.toISOString() },
  };
}

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function PerspectivaPage({ params }: Props) {
  const { slug } = await params;
  const p = getPerspectiva(slug);
  if (!p) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    datePublished: p.date.toISOString(),
    description: p.summary,
    author: p.author
      ? { '@type': 'Person', name: p.author }
      : { '@type': 'Organization', name: 'Blink Group', url: 'https://blinkgroup.com.br' },
    publisher: { '@type': 'Organization', name: 'Blink Group' },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <AnimateOnView>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">{p.category} · {fmt(p.date)}</p>
        <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{p.title}</h1>
      </AnimateOnView>

      <AnimateOnView delay={80}>
        <div className="mt-8 rounded-r-xl border-l-4 border-orange bg-white py-4 pl-5 pr-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Em resumo</p>
          <p className="mt-2 text-lg leading-relaxed">{p.summary}</p>
        </div>
      </AnimateOnView>

      <ProseAnimated>
        <Prose>
          <MDXRemote source={p.content} components={{ a: ExternalLink }} />
        </Prose>
      </ProseAnimated>

      <AnimateOnView>
        <footer className="mt-14 border-t border-line pt-6">
          <Link href="/radar/perspectivas" className="font-mono text-xs uppercase tracking-[0.2em] text-orange hover:text-red transition-colors">
            ← Todas as perspectivas
          </Link>
        </footer>
      </AnimateOnView>
    </article>
  );
}
```

- [ ] **Step 3: Update research/[slug]/page.tsx**

Replace the entire file with:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPaper, getPapers } from '@/lib/content';
import Prose from '@/components/Prose';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import AnimateOnView from '@/components/AnimateOnView';
import ProseAnimated from '@/components/ProseAnimated';
import ExternalLink from '@/components/ExternalLink';

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

      <AnimateOnView>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Research · {fmt(p.date)}</p>
        <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{p.title}</h1>
        <p className="mt-3 text-muted">{p.authors.join(', ')}</p>
      </AnimateOnView>

      <AnimateOnView delay={80}>
        <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Abstract</p>
          <p className="mt-3 leading-relaxed">{p.abstract}</p>
          {p.pdf && (
            <div className="mt-6">
              <PdfDownloadButton href={p.pdf} variant="primary" />
            </div>
          )}
        </div>
      </AnimateOnView>

      <ProseAnimated>
        <Prose>
          <MDXRemote source={p.content} components={{ a: ExternalLink }} />
        </Prose>
      </ProseAnimated>
    </article>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/radar/[slug]/page.tsx" "app/(site)/radar/perspectivas/[slug]/page.tsx" "app/(site)/research/[slug]/page.tsx"
git commit -m "feat(animations): apply ProseAnimated + ExternalLink to detail pages"
```

---

## Self-Review

### Spec coverage
- [x] Scroll-triggered slide-up — Tasks 1, 3, 4
- [x] Listing pages animated (Radar, Research, Perspectivas) — Task 3
- [x] Detail page blocks animated (header, summary callout) — Task 4
- [x] Detail page paragraphs animated individually (ProseAnimated) — Tasks 2, 4
- [x] External links open in new tab — Tasks 2, 4 (ExternalLink + MDXRemote override)
- [x] `prefers-reduced-motion` — Task 1 (CSS media query)
- [x] No new npm packages — confirmed
- [x] All pages covered: radar, radar/perspectivas, research (list + detail) — Tasks 3, 4

### Placeholder scan
None found. All steps have complete code.

### Type consistency
- `AnimateOnView` defined in Task 1 as `({ children, delay?, className? })` — used identically in Tasks 3 and 4 ✓
- `ProseAnimated` defined in Task 2 as `({ children })` — used identically in Task 4 ✓
- `ExternalLink` defined in Task 2 — passed as `components={{ a: ExternalLink }}` in Task 4 ✓
- CSS classes `animate-on-view`, `is-visible`, `prose-child-hidden` defined in Task 1, consumed by Task 2 ✓
