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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-xs uppercase tracking-widest text-muted">{n.category} · {fmt(n.date)}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{n.title}</h1>

      <div className="mt-6 border-l-2 border-ink pl-4">
        <p className="text-sm uppercase tracking-widest text-muted">Por que isso importa para sua PME</p>
        <p className="mt-1 text-lg leading-relaxed">{n.summary}</p>
      </div>

      <Prose>
        <MDXRemote source={n.content} />
      </Prose>

      <footer className="mt-12 border-t border-line pt-6">
        <p className="text-sm uppercase tracking-widest text-muted">Fontes</p>
        <ul className="mt-2 space-y-1 text-sm">
          {n.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} rel="noopener noreferrer" target="_blank" className="underline underline-offset-2">{s.label}</a>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
