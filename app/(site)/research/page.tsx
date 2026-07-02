import Link from 'next/link';
import type { Metadata } from 'next';
import { getPapers } from '@/lib/content';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import AnimateOnView from '@/components/AnimateOnView';

export const metadata: Metadata = {
  title: 'Research — pesquisa aplicada para PMEs',
  description: 'O programa de pesquisa da Blink: ciência aplicada aos problemas reais de pequenas e médias empresas brasileiras.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function ResearchPage() {
  const papers = getPapers();
  return (
    <div className="space-y-14">
      <section>
        <AnimateOnView>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Blink Research</p>
        </AnimateOnView>
        <AnimateOnView variant="clip-line" delay={80}>
          <h1 className="mt-2 font-display font-semibold leading-tight text-[clamp(1.875rem,5vw,2.75rem)]">
            Pesquisa aplicada, <span className="brand-gradient-text">para quem opera</span>
          </h1>
        </AnimateOnView>
        <AnimateOnView delay={160}>
          <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-justify hyphens-auto">
            <p>
              A Blink mantém um programa de pesquisa dedicado aos problemas reais de PMEs
              brasileiras: otimização de operações, precificação, logística e acesso a
              tecnologia que antes só grandes empresas alcançavam.
            </p>
            <p>
              O programa é conduzido com orientação acadêmica formal — professor orientador
              e bolsa de pesquisa — e tem um compromisso: todo estudo publicado aqui vem
              acompanhado de uma aplicação que qualquer PME pode usar.
            </p>
          </div>
        </AnimateOnView>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted border-b border-line pb-3">Publicações</h2>
        <div className="mt-8 space-y-10">
          {papers.length === 0 && (
            <AnimateOnView>
              <p className="text-muted">Primeira publicação em preparação.</p>
            </AnimateOnView>
          )}
          {papers.map((p, i) => (
            <AnimateOnView key={p.slug} variant="blur-rise" delay={Math.min(i, 4) * 80}>
              <article className="rounded-2xl border border-line bg-white p-6 sm:p-8">
                <p className="font-mono text-xs uppercase tracking-wide text-muted">{fmt(p.date)} · {p.authors.join(', ')}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-snug">
                  <Link href={`/research/${p.slug}`}>
                    <span className="link-gradient">{p.title}</span>
                  </Link>
                </h3>
                <p className="mt-3 text-muted">{p.abstract}</p>
                {p.pdf && (
                  <div className="mt-5">
                    <PdfDownloadButton href={p.pdf} variant="compact" />
                  </div>
                )}
              </article>
            </AnimateOnView>
          ))}
        </div>
      </section>
    </div>
  );
}
