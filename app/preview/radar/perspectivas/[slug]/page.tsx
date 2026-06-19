import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPerspectiva, getPerspectivas } from '@/lib/content';
import Prose from '@/components/Prose';

export const metadata: Metadata = { robots: { index: false, follow: false } };
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPerspectivas({ includeDrafts: true }).map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export default async function PreviewPerspectiva({ params }: Props) {
  const { slug } = await params;
  const p = getPerspectiva(slug, { includeDrafts: true });
  if (!p) notFound();
  return (
    <article>
      <p className="mb-6 border border-ink bg-white px-3 py-2 text-xs uppercase tracking-widest">
        Preview — status: {p.status}
      </p>
      <p className="text-xs uppercase tracking-widest text-muted">{p.category}</p>
      <h1 className="font-display text-4xl mt-2 leading-tight">{p.title}</h1>
      <div className="mt-6 border-l-2 border-ink pl-4">
        <p className="text-sm uppercase tracking-widest text-muted">Em resumo</p>
        <p className="mt-1 text-lg leading-relaxed">{p.summary}</p>
      </div>
      <Prose><MDXRemote source={p.content} /></Prose>
    </article>
  );
}
