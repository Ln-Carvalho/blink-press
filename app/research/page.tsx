import Link from 'next/link';
import type { Metadata } from 'next';
import { getPapers } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Research — pesquisa aplicada para PMEs',
  description: 'O programa de pesquisa da Blink: ciência aplicada aos problemas reais de pequenas e médias empresas brasileiras.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function ResearchPage() {
  const papers = getPapers();
  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-display text-4xl leading-tight">Pesquisa aplicada, <em className="font-normal">para quem opera</em></h1>
        <div className="mt-6 space-y-4 leading-relaxed">
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
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted border-b border-line pb-2">Publicações</h2>
        <div className="mt-6 space-y-8">
          {papers.length === 0 && <p className="text-muted">Primeira publicação em preparação.</p>}
          {papers.map((p) => (
            <article key={p.slug}>
              <p className="text-xs uppercase tracking-widest text-muted">{fmt(p.date)} · {p.authors.join(', ')}</p>
              <h3 className="font-display text-2xl mt-1">
                <Link href={`/research/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="mt-2 text-muted">{p.abstract}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
