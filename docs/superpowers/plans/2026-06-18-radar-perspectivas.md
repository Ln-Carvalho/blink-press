# Radar Perspectivas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a seção `/radar/perspectivas` — artigos editoriais de análise da Blink para PMEs — com o primeiro post publicado (Simples Nacional / PLP 140/2026).

**Architecture:** Nova coleção `perspectivas` espelhando a estrutura de `radar`, mas sem campo `sources` obrigatório (análise editorial, não noticiário). Schema próprio em `lib/schemas.ts`, loader em `lib/content.ts`, páginas em `app/(site)/radar/perspectivas/`, coleção no Keystatic e entry no sitemap. O Radar page ganha um aside de chamada para Perspectivas.

**Tech Stack:** Next.js 16 App Router (SSG) · Tailwind v4 · MDX via `next-mdx-remote/rsc` · Zod v4 · Keystatic CMS · Vitest

## Global Constraints

- Next.js 16.2.9 — leia `node_modules/next/dist/docs/` antes de escrever código de rota
- React 19.2.4 — `params` em page/layout é `Promise<{...}>`, sempre `await params`
- Tailwind v4 — sem `tailwind.config.js`; tokens via `@theme` em `app/globals.css`; classes existentes: `text-orange`, `text-muted`, `text-ink`, `border-line`, `brand-gradient`, `brand-gradient-text`, `font-display`, `font-mono`
- Zod v4 (`zod@^4`) — `z.enum()` recebe tuple literal (`as const`), não array
- Vitest v4 — testes em `tests/*.test.ts`, fixtures em `tests/fixtures/`, fixtures inválidas em `tests/fixtures-invalid/`
- `dynamicParams = false` em todas as rotas `[slug]` (build falha em slug fora da lista)
- `status: 'published'` = no ar; `status: 'draft'` = só visível em `/preview/*`
- Nunca commitar `node_modules`, `.env*`, segredos

---

## Files Map

| Ação | Arquivo |
|---|---|
| Modify | `lib/schemas.ts` |
| Modify | `lib/content.ts` |
| Create | `content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx` |
| Create | `app/(site)/radar/perspectivas/page.tsx` |
| Create | `app/(site)/radar/perspectivas/[slug]/page.tsx` |
| Create | `app/(site)/radar/perspectivas/[slug]/opengraph-image.tsx` |
| Create | `app/preview/radar/perspectivas/[slug]/page.tsx` |
| Modify | `keystatic.config.ts` |
| Modify | `app/(site)/radar/page.tsx` |
| Modify | `app/sitemap.ts` |
| Modify | `tests/schemas.test.ts` |
| Modify | `tests/content.test.ts` |
| Create | `tests/fixtures/perspectivas/perspectiva-publicada.mdx` |
| Create | `tests/fixtures/perspectivas/perspectiva-draft.mdx` |
| Create | `tests/fixtures-invalid/perspectivas/perspectiva-quebrada.mdx` |

---

### Task 1: Schema `perspectivaSchema`

**Files:**
- Modify: `lib/schemas.ts`
- Modify: `tests/schemas.test.ts`

**Interfaces:**
- Produces: `PERSPECTIVA_CATEGORIES`, `perspectivaSchema`, `Perspectiva` (usados em Tasks 2, 4, 5, 6)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao final de `tests/schemas.test.ts`:

```ts
describe('perspectivaSchema', () => {
  const perspectivaOk = {
    title: 'Análise de teste',
    date: '2026-06-18',
    category: 'Tributário',
    summary: 'Resumo da análise.',
    status: 'published',
  };
  it('aceita frontmatter válido e coage a data', () => {
    const r = perspectivaSchema.parse(perspectivaOk);
    expect(r.date).toBeInstanceOf(Date);
    expect(r.category).toBe('Tributário');
  });
  it('aceita author opcional', () => {
    expect(perspectivaSchema.parse({ ...perspectivaOk, author: 'Blink Team' }).author).toBe('Blink Team');
    expect(perspectivaSchema.parse(perspectivaOk).author).toBeUndefined();
  });
  it('rejeita categoria fora do enum', () => {
    expect(() => perspectivaSchema.parse({ ...perspectivaOk, category: 'Brasil' })).toThrow();
  });
  it('rejeita status desconhecido', () => {
    expect(() => perspectivaSchema.parse({ ...perspectivaOk, status: 'rascunho' })).toThrow();
  });
  it('expõe as 5 categorias editoriais', () => {
    expect(PERSPECTIVA_CATEGORIES).toEqual(['Tributário', 'Operações', 'Tecnologia', 'Mercado', 'Regulação']);
  });
});
```

Adicionar ao import no topo do arquivo:
```ts
import { noticiaSchema, paperSchema, perspectivaSchema, CATEGORIES, PERSPECTIVA_CATEGORIES } from '../lib/schemas';
```

- [ ] **Step 2: Rodar o teste para confirmar falha**

```bash
cd "C:\Users\gusta\OneDrive\Área de Trabalho\BLINK - MKT v3\blink-press"
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: erro de importação — `perspectivaSchema` não existe ainda.

- [ ] **Step 3: Implementar o schema**

Adicionar ao final de `lib/schemas.ts` (antes do último export de tipos):

```ts
export const PERSPECTIVA_CATEGORIES = ['Tributário', 'Operações', 'Tecnologia', 'Mercado', 'Regulação'] as const;

export const perspectivaSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum(PERSPECTIVA_CATEGORIES),
  summary: z.string().min(1),
  status: statusSchema,
  author: z.string().optional(),
});

export type Perspectiva = z.infer<typeof perspectivaSchema>;
```

- [ ] **Step 4: Rodar o teste para confirmar aprovação**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: todos os testes `perspectivaSchema` PASS, demais testes sem regressão.

- [ ] **Step 5: Commit**

```bash
git add lib/schemas.ts tests/schemas.test.ts
git commit -m "feat(schemas): add perspectivaSchema with 5 editorial categories"
```

---

### Task 2: Content loader `getPerspectivas`

**Files:**
- Modify: `lib/content.ts`
- Modify: `tests/content.test.ts`
- Create: `tests/fixtures/perspectivas/perspectiva-publicada.mdx`
- Create: `tests/fixtures/perspectivas/perspectiva-draft.mdx`
- Create: `tests/fixtures-invalid/perspectivas/perspectiva-quebrada.mdx`

**Interfaces:**
- Consumes: `perspectivaSchema`, `Perspectiva` de `lib/schemas.ts`; `loadCollection`, `visible` de `lib/content.ts`
- Produces: `getPerspectivas(opts?)`, `getPerspectiva(slug, opts?)` (usados em Tasks 4 e 5)

- [ ] **Step 1: Criar fixtures**

`tests/fixtures/perspectivas/perspectiva-publicada.mdx`:
```mdx
---
title: Perspectiva publicada
date: 2026-06-01
category: Tributário
summary: Resumo da perspectiva publicada.
status: published
---

Corpo da perspectiva publicada.
```

`tests/fixtures/perspectivas/perspectiva-draft.mdx`:
```mdx
---
title: Perspectiva rascunho
date: 2026-06-05
category: Operações
summary: Resumo da perspectiva rascunho.
status: draft
---

Corpo do rascunho.
```

`tests/fixtures-invalid/perspectivas/perspectiva-quebrada.mdx`:
```mdx
---
title: Sem categoria
date: 2026-06-06
summary: Frontmatter incompleto.
status: published
---

Não deve passar na validação.
```

- [ ] **Step 2: Escrever os testes que falham**

Adicionar ao final de `tests/content.test.ts`:

```ts
import { getPerspectivas, getPerspectiva } from '../lib/content';

describe('getPerspectivas (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getPerspectivas({ baseDir: FIXTURES });
    expect(pub.map((p) => p.slug)).toEqual(['perspectiva-publicada']);
  });
  it('inclui drafts quando pedido', () => {
    const all = getPerspectivas({ baseDir: FIXTURES, includeDrafts: true });
    expect(all[0].slug).toBe('perspectiva-draft'); // mais recente primeiro
    expect(all).toHaveLength(2);
  });
  it('getPerspectiva acha por slug e respeita includeDrafts', () => {
    expect(getPerspectiva('perspectiva-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(
      getPerspectiva('perspectiva-draft', { baseDir: FIXTURES, includeDrafts: true })?.title,
    ).toBe('Perspectiva rascunho');
  });
  it('loadCollection lança erro em frontmatter inválido de perspectiva', () => {
    expect(() => loadCollection(path.join(INVALID, 'perspectivas'), perspectivaSchema)).toThrow(/quebrada/);
  });
});
```

Adicionar ao import no topo de `tests/content.test.ts`:
```ts
import { loadCollection, getNoticias, getNoticia, getPapers, getPaper, getPerspectivas, getPerspectiva } from '../lib/content';
import { noticiaSchema, perspectivaSchema } from '../lib/schemas';
```

- [ ] **Step 3: Rodar para confirmar falha**

```bash
npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: erro de importação — `getPerspectivas` não existe ainda.

- [ ] **Step 4: Implementar o loader**

Adicionar ao final de `lib/content.ts`, após o bloco de `getPaper`:

```ts
export function getPerspectivas(opts: Opts = {}): Entry<Perspectiva>[] {
  return visible(
    loadCollection(path.join(opts.baseDir ?? defaultBase(), 'perspectivas'), perspectivaSchema),
    opts,
  );
}

export function getPerspectiva(slug: string, opts: Opts = {}): Entry<Perspectiva> | undefined {
  return getPerspectivas({ ...opts }).find((p) => p.slug === slug);
}
```

Adicionar ao import no topo de `lib/content.ts`:
```ts
import type { z } from 'zod';
import { noticiaSchema, paperSchema, perspectivaSchema, type Noticia, type Paper, type Perspectiva } from './schemas';
```

(Substituir a linha de import existente de schemas.)

- [ ] **Step 5: Rodar os testes**

```bash
npm test -- --reporter=verbose 2>&1 | tail -30
```

Expected: todos os testes `getPerspectivas` PASS, sem regressão.

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts lib/schemas.ts tests/content.test.ts tests/fixtures/perspectivas/ tests/fixtures-invalid/perspectivas/
git commit -m "feat(content): add getPerspectivas/getPerspectiva loader + fixtures"
```

---

### Task 3: Primeiro post MDX

**Files:**
- Create: `content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx`

**Interfaces:**
- Consumes: `perspectivaSchema` (frontmatter deve passar a validação Zod no build)

- [ ] **Step 1: Criar o arquivo de conteúdo**

`content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx`:

```mdx
---
title: O Congresso discute dobrar o teto do Simples Nacional. Veja o que isso muda na operação de quem cresce.
date: 2026-06-18
category: Tributário
summary: A proposta ainda está em tramitação e não vale hoje, mas vale entender desde já — porque o que ela mexe não é só na conta do imposto, é na forma como o seu negócio registra, cobra e controla cada operação à medida que cresce.
status: published
---

## O que aconteceu

No dia 18 de maio, foi protocolado na Câmara dos Deputados o [Projeto de Lei Complementar 140/2026](https://www.reformatributaria.com/reforma-tributaria-congresso-nacional/projeto-amplia-faturamento-do-simples-para-ate-r-12-mi-com-limite-de-permanencia-como-pequeno-porte/), que propõe uma das maiores atualizações do Simples Nacional dos últimos anos. A ideia central é elevar os limites de faturamento que definem quem pode ficar no regime simplificado. Para a empresa de pequeno porte, a EPP, o teto anual [passaria dos atuais R$ 4,8 milhões para até R$ 12 milhões](https://www.sindifisco-ms.org.br/projeto-preve-ampliar-teto-do-simples-nacional-para-r-12-milhoes-e-criar-regra-de-transicao-para-empresas/); o da microempresa subiria de R$ 360 mil para R$ 1,2 milhão.

Vale separar dois termos que costumam se misturar. "Teto de faturamento" é o limite de receita anual que a empresa pode ter e ainda assim permanecer no Simples. "Desenquadramento" é o que acontece quando ela ultrapassa esse limite e precisa migrar para um regime tributário mais complexo, como o Lucro Presumido ou o Lucro Real — que pedem mais controle contábil e mais obrigações. O projeto também cria uma regra inédita: a empresa que chegar à faixa ampliada [poderia permanecer nela por até cinco anos antes de ser obrigada a migrar](https://www.sindifisco-ms.org.br/projeto-preve-ampliar-teto-do-simples-nacional-para-r-12-milhoes-e-criar-regra-de-transicao-para-empresas/).

Um ponto importante para não gerar confusão: nada disso vale ainda. O texto está em tramitação e, para entrar em vigor, [precisa ser aprovado pelo Congresso e sancionado pela Presidência](https://www.sindifisco-ms.org.br/quais-setores-seriam-mais-beneficiados-por-um-simples-nacional-de-ate-r-12-milhoes/). A correção dos limites é reivindicada há anos — eles estão congelados desde 2016 e já perderam boa parte do valor para a inflação —, mas propostas parecidas vêm enfrentando resistência por causa do impacto na arrecadação. É um movimento a acompanhar, não uma mudança a cumprir hoje.

## Por que isso é uma questão da operação, não apenas do contador

Para um negócio de serviço que vive de mensalidade ou de atendimento recorrente — um estúdio, uma academia, uma escola, uma clínica —, o regime tributário não é um assunto que mora longe, na sala da contabilidade. Ele define o quanto sai do caixa em imposto e, principalmente, o quanto de trabalho de registro e controle a operação precisa sustentar todo mês.

O que o crescimento do faturamento traz junto raramente aparece na conversa sobre limites. Quando uma empresa ultrapassa o teto e é desenquadrada, ela não só passa a pagar mais: passa a ter que registrar cada operação de um jeito mais detalhado, apurar valores com mais regras e cumprir obrigações que antes não existiam. Um teto maior, nesse sentido, é fôlego — adia o momento em que essa camada extra de controle se torna obrigatória e dá tempo para o negócio se organizar antes de chegar lá.

Há ainda um detalhe do projeto que merece atenção de quem atende outras empresas. O texto, como está, [retira do Simples a incidência dos novos tributos da reforma, o IBS e a CBS](https://documentacao.senior.com.br/exigenciaslegais/noticias/federal/2026/2026-05-20-congresso-nacional-plp-no-140-2026-novo-projeto-do-simples-nacional/), o que significa que a empresa do regime simplificado não geraria créditos tributários para seus clientes corporativos. Para quem vende para pessoa física, isso é indiferente. Mas para quem fatura com outras empresas, pode pesar na hora de o cliente comparar fornecedores. É o tipo de efeito que não aparece no número do teto, mas chega na negociação.

## Onde isso aparece na rotina

O enquadramento tributário parece uma definição única, feita uma vez por ano com o contador. Na prática, ele se desdobra em um conjunto de tarefas que acompanham o negócio o tempo todo, e quase todas dependem de alguém olhando os números de perto.

Há o acompanhamento do faturamento mês a mês, para saber a que distância o negócio está do limite. Há o registro de cada receita de um jeito que feche com o que a contabilidade vai apurar. Há a conferência no fechamento, quando os valores precisam ser batidos antes de seguir para a apuração do imposto. E há a decisão, que volta sempre, sobre se o regime atual ainda é o mais adequado ao tamanho que o negócio tomou.

Nenhuma dessas etapas costuma estar formalmente na agenda de ninguém. Elas se espremem nos intervalos do dia, entre um atendimento e outro, e por isso é difícil medir quanto tempo consomem. Somadas ao longo dos meses, no entanto, viram um trabalho de controle constante — e o risco real não é só o imposto a mais, é descobrir tarde demais que o negócio cruzou um limite sem ninguém ter percebido a tempo de se preparar.

## O que considerar diante do novo cenário

Se a proposta avançar, a resposta imediata será revisar o enquadramento e aproveitar o fôlego maior. Mas tratar a mudança apenas como "agora cabe mais faturamento no Simples" deixa de lado a pergunta que realmente sustenta a operação no longo prazo.

A questão mais relevante não é qual regime ou qual sistema fiscal adotar, e sim por que o controle do faturamento ainda depende de alguém conferindo planilha no fim do mês para saber onde o negócio está. Trabalhando dentro da operação de empresas de serviço, observamos um padrão que se repete: o problema raramente é falta de uma ferramenta de gestão. É que a ferramenta costuma ser escolhida antes de o processo ser pensado — contrata-se um sistema para "organizar as finanças" sem antes definir o que esse controle precisa enxergar e em que momento, e a automação acaba só acelerando um acompanhamento que nunca foi desenhado.

A discussão no Congresso funciona, nesse sentido, como um bom motivo para retomar uma pergunta que já estava atrasada: antes de pensar em qual regime ou qual software, o que o controle do faturamento realmente precisa dar conta, mês a mês, para que o crescimento não chegue como surpresa? Ao olhar a operação etapa por etapa, é comum descobrir que a ferramenta sozinha não resolve — e que o ganho real aparece quando o processo é desenhado primeiro, e a tecnologia entra depois, com propósito.

Publicamos toda semana análises nesse formato: o que muda no cenário e o que isso representa, de forma concreta, para quem administra um negócio de serviço. Se esse tipo de leitura ajuda a enxergar a própria operação com mais clareza, vale acompanhar — a cada mudança relevante, traremos a tradução para o seu contexto.
```

- [ ] **Step 2: Verificar que o frontmatter passa na validação**

```bash
cd "C:\Users\gusta\OneDrive\Área de Trabalho\BLINK - MKT v3\blink-press"
node -e "
const matter = require('gray-matter');
const fs = require('fs');
const { perspectivaSchema } = require('./lib/schemas');
// require não funciona com ESM — rodar via tsx
" 2>&1 || npx tsx -e "
import matter from 'gray-matter';
import fs from 'fs';
import { perspectivaSchema } from './lib/schemas.js';
const raw = fs.readFileSync('./content/perspectivas/congresso-dobrar-teto-simples-nacional-pmes.mdx', 'utf8');
const { data } = matter(raw);
const r = perspectivaSchema.safeParse(data);
console.log(r.success ? 'OK' : r.error.message);
"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add content/perspectivas/
git commit -m "content: first perspectiva post — Simples Nacional / PLP 140/2026"
```

---

### Task 4: Páginas da rota `/radar/perspectivas`

**Files:**
- Create: `app/(site)/radar/perspectivas/page.tsx`
- Create: `app/(site)/radar/perspectivas/[slug]/page.tsx`
- Create: `app/(site)/radar/perspectivas/[slug]/opengraph-image.tsx`
- Create: `app/preview/radar/perspectivas/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPerspectivas`, `getPerspectiva` de `lib/content.ts`; `Prose` de `components/Prose`; `NewsletterForm` de `components/NewsletterForm`
- Produces: rota SSG `/radar/perspectivas` + `/radar/perspectivas/[slug]` + preview `/preview/radar/perspectivas/[slug]`

- [ ] **Step 1: Criar página de listagem**

`app/(site)/radar/perspectivas/page.tsx`:

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPerspectivas } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';

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
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Perspectivas</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Análises para quem administra PMEs
        </h1>
        <p className="mt-3 text-muted">
          O que muda no cenário e o que isso representa, de forma concreta, para a operação do seu negócio.
        </p>
      </header>

      {destaque && (
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
      )}

      {resto.length > 0 && (
        <section className="space-y-10">
          {resto.map((p) => (
            <article key={p.slug} className="group">
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
          ))}
        </section>
      )}

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

      <aside className="border-t border-line pt-10">
        <h2 className="font-display text-xl font-semibold">Receba as perspectivas da semana</h2>
        <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
        <NewsletterForm />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Criar página de detalhe**

`app/(site)/radar/perspectivas/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPerspectiva, getPerspectivas } from '@/lib/content';
import Prose from '@/components/Prose';

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

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">{p.category} · {fmt(p.date)}</p>
      <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{p.title}</h1>

      <div className="mt-8 rounded-r-xl border-l-4 border-orange bg-white py-4 pl-5 pr-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Em resumo</p>
        <p className="mt-2 text-lg leading-relaxed">{p.summary}</p>
      </div>

      <Prose>
        <MDXRemote source={p.content} />
      </Prose>

      <footer className="mt-14 border-t border-line pt-6">
        <Link href="/radar/perspectivas" className="font-mono text-xs uppercase tracking-[0.2em] text-orange hover:text-red transition-colors">
          ← Todas as perspectivas
        </Link>
      </footer>
    </article>
  );
}
```

Adicionar o import de `Link` no topo do arquivo de detalhe:
```tsx
import Link from 'next/link';
```

- [ ] **Step 3: Criar OG image**

`app/(site)/radar/perspectivas/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';
import { getPerspectiva } from '@/lib/content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPerspectiva(slug);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', background: '#0a0a0a', color: '#fafaf7', padding: 64,
        fontFamily: 'Georgia, serif',
      }}>
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>
          Blink Perspectivas · {p?.category ?? ''}
        </div>
        <div style={{ display: 'flex', fontSize: 56, lineHeight: 1.15 }}>{p?.title ?? 'Blink Perspectivas'}</div>
        <div style={{ display: 'flex', fontSize: 24, opacity: 0.7 }}>blinkgroup.com.br/radar/perspectivas</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Criar rota de preview**

`app/preview/radar/perspectivas/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPerspectiva, getPerspectivas } from '@/lib/content';
import Prose from '@/components/Prose';

export const metadata: Metadata = { robots: { index: false, follow: false } };
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPerspectivas({ includeDrafts: true }).map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export default async function PreviewPerspectiva({ params }: Props) {
  const { slug } = await params;
  const p = getPerspectiva(slug, { includeDrafts: true });
  if (!p) notFound();
  return (
    <article>
      <p className="mb-6 border border-ink bg-white px-3 py-2 text-xs uppercase tracking-widest">
        Preview — status: {p.status}
      </p>
      <p className="text-xs uppercase tracking-widest text-muted">{p.category}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{p.title}</h1>
      <div className="mt-6 border-l-2 border-ink pl-4">
        <p className="text-sm uppercase tracking-widest text-muted">Em resumo</p>
        <p className="mt-1 text-lg leading-relaxed">{p.summary}</p>
      </div>
      <Prose><MDXRemote source={p.content} /></Prose>
    </article>
  );
}
```

- [ ] **Step 5: Verificar build sem erros**

```bash
cd "C:\Users\gusta\OneDrive\Área de Trabalho\BLINK - MKT v3\blink-press"
npm run build 2>&1 | tail -30
```

Expected: build bem-sucedido, rotas `/radar/perspectivas` e `/radar/perspectivas/congresso-dobrar-teto-simples-nacional-pmes` geradas.

- [ ] **Step 6: Commit**

```bash
git add app/\(site\)/radar/perspectivas/ app/preview/radar/perspectivas/
git commit -m "feat(pages): add /radar/perspectivas list, detail, OG image + preview route"
```

---

### Task 5: Integração — Keystatic, sitemap e link no Radar

**Files:**
- Modify: `keystatic.config.ts`
- Modify: `app/sitemap.ts`
- Modify: `app/(site)/radar/page.tsx`

**Interfaces:**
- Consumes: `PERSPECTIVA_CATEGORIES` de `lib/schemas.ts`; `getPerspectivas` de `lib/content.ts`

- [ ] **Step 1: Adicionar coleção `perspectivas` no Keystatic**

Em `keystatic.config.ts`, no import do topo adicionar `PERSPECTIVA_CATEGORIES`:
```ts
import { CATEGORIES, PERSPECTIVA_CATEGORIES } from './lib/schemas';
```

Dentro de `collections: { ... }`, após o bloco `papers`, adicionar:

```ts
    perspectivas: collection({
      label: 'Perspectivas (análise editorial)',
      slugField: 'title',
      path: 'content/perspectivas/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date', 'category'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft (rascunho)', value: 'draft' },
            { label: 'Published (no ar após deploy)', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Categoria',
          options: PERSPECTIVA_CATEGORIES.map((c) => ({ label: c, value: c })),
          defaultValue: 'Tributário',
        }),
        summary: fields.text({
          label: 'Em resumo',
          multiline: true,
          validation: { isRequired: true },
        }),
        author: fields.text({ label: 'Autor (opcional)' }),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
```

- [ ] **Step 2: Atualizar sitemap**

Em `app/sitemap.ts`, adicionar import:
```ts
import { getNoticias, getPapers, getPerspectivas } from '@/lib/content';
```

Dentro do array de retorno, após o entry de `/research`, adicionar:
```ts
    { url: `${BASE}/radar/perspectivas`, changeFrequency: 'weekly', priority: 0.8 },
    ...getPerspectivas().map((p) => ({ url: `${BASE}/radar/perspectivas/${p.slug}`, lastModified: p.date })),
```

- [ ] **Step 3: Adicionar aside de Perspectivas no Radar page**

Em `app/(site)/radar/page.tsx`, após o aside do Research (bloco `<aside className="rounded-2xl ...">`) e antes do aside do Newsletter, adicionar:

```tsx
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
```

- [ ] **Step 4: Build final + testes**

```bash
npm test 2>&1 | tail -10
npm run build 2>&1 | tail -20
```

Expected: todos os testes PASS, build bem-sucedido, sitemap inclui `/radar/perspectivas`.

- [ ] **Step 5: Commit**

```bash
git add keystatic.config.ts app/sitemap.ts app/\(site\)/radar/page.tsx
git commit -m "feat(integration): wire perspectivas into Keystatic, sitemap and Radar page"
```

---

## Self-Review

### Spec coverage
- [x] Rota `/radar/perspectivas` — Task 4
- [x] Slug `congresso-dobrar-teto-simples-nacional-pmes` — Task 3
- [x] Identidade visual Blink (orange, font-display, gradiente) — Task 4
- [x] Categorias simples (`Tributário`, `Operações`, `Tecnologia`, `Mercado`, `Regulação`) — Task 1
- [x] Keystatic para edição via `/admin` — Task 5
- [x] Sitemap — Task 5
- [x] Preview route (draft visível em `/preview/*`) — Task 4
- [x] OG image — Task 4
- [x] JSON-LD `Article` — Task 4
- [x] Link de volta ao Radar na listagem — Task 4
- [x] Link para Perspectivas no Radar page — Task 5
- [x] Testes de schema e loader — Tasks 1 e 2

### Placeholder scan
Nenhum TBD, TODO ou "similar ao Task N" encontrado. Todos os steps têm código completo.

### Type consistency
- `perspectivaSchema` / `Perspectiva` definidos em Task 1, usados em Tasks 2, 4, 5 — consistente.
- `getPerspectivas` / `getPerspectiva` definidos em Task 2, usados em Tasks 4 e 5 — consistente.
- `PERSPECTIVA_CATEGORIES` definido em Task 1, importado em Task 5 — consistente.
