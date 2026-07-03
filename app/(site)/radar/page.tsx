import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';
import AnimateOnView from '@/components/AnimateOnView';
import RadarCardBody from '@/components/RadarCardBody';
import RadarHeader, { GatedSplitText } from '@/components/RadarHeader';

export const metadata: Metadata = {
  title: 'Radar — notícias que importam para sua PME',
  description: 'Seleção e análise de notícias para PMEs brasileiras: Brasil, Mundo, Regulação, Tecnologia e Capital.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

const MORE_SECTION_ID = 'mais-noticias';

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

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
  const articles = getArticles();
  const [destaque, ...resto] = articles;

  return (
    <div className="space-y-14">
      <RadarHeader
        moreId={MORE_SECTION_ID}
        hero={
          destaque && (
            <AnimateOnView variant="blur-rise" delay={100}>
              <article>
                <div className="flex items-center gap-3">
                  <Chip active>{destaque.category}</Chip>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(destaque.date)}</span>
                </div>
                <RadarCardBody
                  title={destaque.title}
                  summary={truncate(destaque.summary, 200)}
                  titleHref={`/radar/${destaque.slug}`}
                  featured
                />
              </article>
            </AnimateOnView>
          )
        }
      >
        <section id={MORE_SECTION_ID} className="space-y-10 scroll-mt-24">
          {resto.map((a, i) => (
            <AnimateOnView key={a.slug} variant="blur-rise" delay={Math.min(i, 4) * 50}>
              <article className="group">
                <Link href={`/radar/${a.slug}`} className="block">
                  <div className="flex items-center gap-3">
                    <Chip>{a.category}</Chip>
                    <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(a.date)}</span>
                  </div>
                  <RadarCardBody title={a.title} summary={a.summary} />
                </Link>
              </article>
            </AnimateOnView>
          ))}
        </section>

        <AnimateOnView>
          <aside className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Programa</p>
            <GatedSplitText tag="h2" text="Blink Research" className="mt-2 font-display text-xl font-semibold" textAlign="left" />
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
          <aside className="border-t border-line pt-10">
            <GatedSplitText tag="h2" text="Receba o radar da semana" className="font-display text-xl font-semibold" textAlign="left" />
            <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
            <NewsletterForm />
          </aside>
        </AnimateOnView>
      </RadarHeader>
    </div>
  );
}
