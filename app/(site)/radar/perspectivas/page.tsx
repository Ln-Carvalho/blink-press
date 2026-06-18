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
