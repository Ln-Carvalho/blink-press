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

      <AnimateOnView delay={50}>
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
