'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Entry } from '@/lib/content';
import type { Article } from '@/lib/schemas';
import AnimateOnView from '@/components/AnimateOnView';
import PostCard from '@/components/blog/PostCard';
import RadarSidebar from '@/components/blog/RadarSidebar';

const ALL = 'Todos';
const PAGE_SIZE = 6;

const fmt = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function RadarBoard({ articles }: { articles: Entry<Article>[] }) {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory]);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles],
  );

  const filtered = useMemo(
    () => (activeCategory === ALL ? articles : articles.filter((a) => a.category === activeCategory)),
    [articles, activeCategory],
  );

  const [destaque, ...resto] = filtered;
  const visibleResto = resto.slice(0, visibleCount);
  const hasMore = visibleCount < resto.length;

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <RadarSidebar categories={categories} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      </aside>

      <div className="mt-10 lg:mt-0">
        {filtered.length === 0 ? (
          <p className="text-muted">Nenhuma notícia nesta categoria ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {destaque && (
              <AnimateOnView variant="blur-rise" className="sm:col-span-2">
                <PostCard
                  category={destaque.category}
                  title={destaque.title}
                  excerpt={destaque.summary}
                  date={fmt(destaque.date)}
                  slug={destaque.slug}
                  featured
                />
              </AnimateOnView>
            )}
            {visibleResto.map((a, i) => (
              <AnimateOnView key={a.slug} variant="blur-rise" delay={Math.min(i, 4) * 50}>
                <PostCard category={a.category} title={a.title} excerpt={a.summary} date={fmt(a.date)} slug={a.slug} />
              </AnimateOnView>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="inline-flex min-h-[44px] items-center rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-orange/40"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
