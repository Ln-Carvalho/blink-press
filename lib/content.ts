import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import { noticiaSchema, paperSchema, type Noticia, type Paper } from './schemas';

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
        // build falha aqui — segunda linha de defesa atrás do Keystatic
        throw new Error(`Frontmatter inválido em ${file}: ${parsed.error.message}`);
      }
      return { ...parsed.data, slug: file.replace(/\.mdx$/, ''), content };
    });
}

type Opts = { includeDrafts?: boolean; baseDir?: string };
const defaultBase = () => path.join(process.cwd(), 'content');

function visible<T extends { status: string; date: Date }>(entries: Entry<T>[], opts: Opts) {
  return entries
    .filter((e) => opts.includeDrafts || e.status === 'published')
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getNoticias(opts: Opts = {}): Entry<Noticia>[] {
  return visible(
    loadCollection(path.join(opts.baseDir ?? defaultBase(), 'radar'), noticiaSchema),
    opts,
  );
}

export function getNoticia(slug: string, opts: Opts = {}): Entry<Noticia> | undefined {
  return getNoticias({ ...opts }).find((n) => n.slug === slug);
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
