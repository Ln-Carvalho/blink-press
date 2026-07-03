import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/content';
import NewsletterForm from '@/components/NewsletterForm';
import AnimateOnView from '@/components/AnimateOnView';
import SplitText from '@/components/SplitText';
import RadarBoard from '@/components/blog/RadarBoard';

export const metadata: Metadata = {
  title: 'Radar — notícias que importam para sua PME',
  description: 'Seleção e análise de notícias para PMEs brasileiras: Brasil, Mundo, Regulação, Tecnologia e Capital.',
};

export default function RadarPage() {
  const articles = getArticles();

  return (
    <div className="space-y-14">
      <RadarBoard articles={articles} />

      <AnimateOnView>
        <aside className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange">Programa</p>
          <SplitText tag="h2" text="Blink Research" className="mt-2 font-display text-xl font-semibold" textAlign="left" />
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
          <SplitText tag="h2" text="Receba o radar da semana" className="font-display text-xl font-semibold" textAlign="left" />
          <p className="mb-4 mt-1 text-sm text-muted">O essencial para sua PME, por e-mail. Sem spam.</p>
          <NewsletterForm />
        </aside>
      </AnimateOnView>
    </div>
  );
}
