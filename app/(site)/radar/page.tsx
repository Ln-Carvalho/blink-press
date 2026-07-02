import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/content';
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
  const articles = getArticles();
  const [destaque, ...resto] = articles;

  return (
    <div className="space-y-14">
      <header>
        <AnimateOnView>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Radar</p>
        </AnimateOnView>
        <AnimateOnView variant="clip-line" delay={80}>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Notícias que importam para sua PME
          </h1>
        </AnimateOnView>
      </header>

      {destaque && (
        <AnimateOnView variant="blur-rise" delay={160}>
          <article className="border-b border-line pb-12">
            <div className="flex items-center gap-3">
              <Chip active>{destaque.category}</Chip>
              <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(destaque.date)}</span>
            </div>
            <h2 className="mt-4 font-display font-semibold leading-tight text-[clamp(1.75rem,5vw,2.5rem)]">
              <Link href={`/radar/${destaque.slug}`}>
                <span className="link-gradient">{destaque.title}</span>
              </Link>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink text-justify hyphens-auto">
              <span className="font-semibold brand-gradient-text">Por que importa:</span> {destaque.summary}
            </p>
          </article>
        </AnimateOnView>
      )}

      <section className="space-y-10">
        {resto.map((a, i) => (
          <AnimateOnView key={a.slug} variant="blur-rise" delay={Math.min(i, 4) * 80}>
            <article className="group">
              <Link href={`/radar/${a.slug}`} className="block">
                <div className="flex items-center gap-3">
                  <Chip>{a.category}</Chip>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(a.date)}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug">
                  <span className="link-gradient">{a.title}</span>
                  <span className="card-arrow" aria-hidden="true">→</span>
                </h2>
                <p className="mt-2 text-muted text-justify hyphens-auto">{a.summary}</p>
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
        <aside className="border-t border-line pt-10">
          <h2 className="font-display text-xl font-semibold">Receba o radar da semana</h2>
          <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
          <NewsletterForm />
        </aside>
      </AnimateOnView>
    </div>
  );
}
