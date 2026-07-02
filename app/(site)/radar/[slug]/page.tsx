import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getArticle, getArticles } from '@/lib/content';
import Prose from '@/components/Prose';
import AnimateOnView from '@/components/AnimateOnView';
import ProseAnimated from '@/components/ProseAnimated';
import ExternalLink from '@/components/ExternalLink';
import AuthorCard from '@/components/AuthorCard';
import ReadingProgress from '@/components/ReadingProgress';
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
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <AnimateOnView>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">{a.category} · {fmt(a.date)}</p>
        <h1 className="mt-3 font-display font-semibold leading-tight text-[clamp(2rem,6vw,3rem)]">{a.title}</h1>
        {a.author && (
          <AuthorCard
            name={a.author}
            role={a.authorRole}
            photo={a.authorPhoto}
            linkedin="https://linkedin.com/in/gustavo-ferreira-237821305"
          />
        )}
      </AnimateOnView>

      <AnimateOnView delay={50}>
        <div className="mt-8 rounded-r-xl border-l-4 border-orange bg-white py-4 pl-5 pr-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Por que isso importa para sua PME</p>
          <p className="mt-2 text-lg leading-relaxed text-justified">{a.summary}</p>
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
