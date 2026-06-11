import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPaper, getPapers } from '@/lib/content';
import Prose from '@/components/Prose';

export const metadata: Metadata = { robots: { index: false, follow: false } };
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPapers({ includeDrafts: true }).map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export default async function PreviewPaper({ params }: Props) {
  const { slug } = await params;
  const p = getPaper(slug, { includeDrafts: true });
  if (!p) notFound();
  return (
    <article>
      <p className="mb-6 border border-ink bg-white px-3 py-2 text-xs uppercase tracking-widest">
        Preview — status: {p.status}
      </p>
      <h1 className="font-display text-4xl leading-tight">{p.title}</h1>
      <p className="mt-2 text-muted">{p.authors.join(', ')}</p>
      <div className="mt-6 border border-line p-5 bg-white">
        <p className="text-xs uppercase tracking-widest text-muted">Abstract</p>
        <p className="mt-2 leading-relaxed">{p.abstract}</p>
      </div>
      <Prose><MDXRemote source={p.content} /></Prose>
    </article>
  );
}
