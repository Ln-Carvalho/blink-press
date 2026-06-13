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
