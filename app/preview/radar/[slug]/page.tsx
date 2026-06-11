import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getNoticia, getNoticias } from '@/lib/content';
import Prose from '@/components/Prose';

export const metadata: Metadata = { robots: { index: false, follow: false } };
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNoticias({ includeDrafts: true }).map((n) => ({ slug: n.slug }));
}
export const dynamicParams = false;

export default async function PreviewNoticia({ params }: Props) {
  const { slug } = await params;
  const n = getNoticia(slug, { includeDrafts: true });
  if (!n) notFound();
  return (
    <article>
      <p className="mb-6 border border-ink bg-white px-3 py-2 text-xs uppercase tracking-widest">
        Preview — status: {n.status}
      </p>
      <p className="text-xs uppercase tracking-widest text-muted">{n.category}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{n.title}</h1>
      <div className="mt-6 border-l-2 border-ink pl-4">
        <p className="text-sm uppercase tracking-widest text-muted">Por que isso importa para sua PME</p>
        <p className="mt-1 text-lg leading-relaxed">{n.summary}</p>
      </div>
      <Prose><MDXRemote source={n.content} /></Prose>
    </article>
  );
}
