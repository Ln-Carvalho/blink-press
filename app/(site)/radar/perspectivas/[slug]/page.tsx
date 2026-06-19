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
