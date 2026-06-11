import Link from 'next/link';
import type { Metadata } from 'next';
import { getNoticias } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
  title: 'Radar — notícias que importam para sua PME',
  description: 'Seleção e análise de notícias para PMEs brasileiras: Brasil, Mundo, Regulação, Tecnologia e Capital.',
};

const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function RadarPage() {
  const noticias = getNoticias();
  const [destaque, ...resto] = noticias;

  return (
    <div className="space-y-12">
      {destaque && (
        <article className="border-b border-line pb-10">
          <p className="text-xs uppercase tracking-widest text-muted">{destaque.category} · {fmt(destaque.date)}</p>
          <h1 className="font-display text-4xl mt-2 leading-tight">
            <Link href={`/radar/${destaque.slug}`}>{destaque.title}</Link>
          </h1>
          <p className="mt-4 text-lg leading-relaxed"><em className="font-display">Por que importa:</em> {destaque.summary}</p>
        </article>
      )}

      <section className="space-y-8">
        {resto.map((n) => (
          <article key={n.slug}>
            <p className="text-xs uppercase tracking-widest text-muted">{n.category} · {fmt(n.date)}</p>
            <h2 className="font-display text-2xl mt-1">
              <Link href={`/radar/${n.slug}`}>{n.title}</Link>
            </h2>
            <p className="mt-2 text-muted">{n.summary}</p>
          </article>
        ))}
      </section>

      <aside className="border border-line p-6">
        <h2 className="font-display text-xl">Blink Research</h2>
        <p className="mt-2 text-sm text-muted">
          Nosso programa de pesquisa aplicada para PMEs — estudos com rigor acadêmico e aplicação imediata.
        </p>
        <Link href="/research" className="mt-3 inline-block text-sm underline underline-offset-2">Conhecer o programa →</Link>
      </aside>

      <aside className="border-t border-line pt-8">
        <h2 className="font-display text-xl">Receba o radar da semana</h2>
        <p className="mt-1 mb-4 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
        <NewsletterForm />
      </aside>
    </div>
  );
}
