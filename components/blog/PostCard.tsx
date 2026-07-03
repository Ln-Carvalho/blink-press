import Link from 'next/link';

interface PostCardProps {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  featured?: boolean;
}

export default function PostCard({ category, title, excerpt, date, slug, featured = false }: PostCardProps) {
  return (
    <Link
      href={`/radar/${slug}`}
      className="group block rounded-2xl border border-line bg-white p-6 transition-colors hover:border-orange/40 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span
          className={
            featured
              ? 'brand-gradient inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'
              : 'inline-block rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted'
          }
        >
          {category}
        </span>
        <span className="font-mono text-xs uppercase tracking-wide text-muted">{date}</span>
      </div>
      <h3
        className={
          featured
            ? 'link-gradient mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl'
            : 'link-gradient mt-3 font-display text-xl font-semibold leading-snug'
        }
      >
        {title}
      </h3>
      <p className="mt-2 line-clamp-2 text-muted text-justified">{excerpt}</p>
    </Link>
  );
}
