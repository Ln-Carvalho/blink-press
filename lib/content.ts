import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import { articleSchema, paperSchema, type Article, type Paper } from './schemas';

export type Entry<T> = T & { slug: string; content: string };

export function loadCollection<S extends z.ZodType>(
  absDir: string,
  schema: S,
): Entry<z.infer<S>>[] {
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(absDir, file), 'utf8');
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`Frontmatter inválido em ${file}: ${parsed.error.message}`);
      }
      return { ...(parsed.data as object), slug: file.replace(/\.mdx$/, ''), content } as Entry<z.infer<S>>;
    });
}

type Opts = { includeDrafts?: boolean; baseDir?: string };
const defaultBase = () => path.join(process.cwd(), 'content');

function visible<T extends { status: string; date: Date }>(entries: Entry<T>[], opts: Opts) {
  return entries
    .filter((e) => opts.includeDrafts || e.status === 'published')
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getArticles(opts: Opts = {}): Entry<Article>[] {
  return visible(
    loadCollection(path.join(opts.baseDir ?? defaultBase(), 'radar'), articleSchema),
    opts,
  );
}

export function getArticle(slug: string, opts: Opts = {}): Entry<Article> | undefined {
  return getArticles({ ...opts }).find((a) => a.slug === slug);
}

export function getRelatedArticles(current: Entry<Article>, opts: Opts = {}): Entry<Article>[] {
  const others = getArticles(opts).filter((article) => article.slug !== current.slug);
  const sameCategory = others.filter((article) => article.category === current.category).slice(0, 2);
  const sameCategorySlugs = new Set(sameCategory.map((article) => article.slug));
  const rest = others.filter((article) => !sameCategorySlugs.has(article.slug));
  return [...sameCategory, ...rest.slice(0, 3 - sameCategory.length)];
}

export function getPapers(opts: Opts = {}): Entry<Paper>[] {
  return visible(
    loadCollection(path.join(opts.baseDir ?? defaultBase(), 'research'), paperSchema),
    opts,
  );
}

export function getPaper(slug: string, opts: Opts = {}): Entry<Paper> | undefined {
  return getPapers({ ...opts }).find((p) => p.slug === slug);
}
