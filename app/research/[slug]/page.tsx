import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPaper, getPapers } from '@/lib/content';
import Prose from '@/components/Prose';

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-widest text-muted">Blink Research · {fmt(p.date)}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{p.title}</h1>
      <p className="mt-2 text-muted">{p.authors.join(', ')}</p>

      <div className="mt-6 border border-line p-5 bg-white">
        <p className="text-xs uppercase tracking-widest text-muted">Abstract</p>
        <p className="mt-2 leading-relaxed">{p.abstract}</p>
        {p.pdf && (
          <a href={p.pdf} className="mt-3 inline-block text-sm underline underline-offset-2">Baixar PDF →</a>
        )}
      </div>

      <Prose>
        <MDXRemote source={p.content} />
      </Prose>
    </article>
  );
}
