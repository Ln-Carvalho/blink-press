import Link from 'next/link';
import Chip from '@/components/Chip';
import type { Entry } from '@/lib/content';
import type { Article } from '@/lib/schemas';

export default function RelatedPosts({ posts }: { posts: Entry<Article>[] }) {
  if (posts.length === 0) return null;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Leituras sugeridas</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/radar/${post.slug}`} className="glass-card block rounded-2xl p-5">
            <Chip>{post.category}</Chip>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug link-gradient">{post.title}</h3>
          </Link>
        ))}
      </div>
      <Link
        href="/radar"
        className="brand-gradient mt-6 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 sm:inline-flex sm:w-auto"
      >
        Ver todas as notícias →
      </Link>
    </div>
  );
}
