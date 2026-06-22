import { z } from 'zod';

export const ARTICLE_CATEGORIES = [
  'Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital',
  'Tributário', 'Operações', 'Mercado',
] as const;

export const statusSchema = z.enum(['draft', 'published']);

export const articleSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum(ARTICLE_CATEGORIES),
  summary: z.string().min(1),
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url().regex(/^https?:\/\//, 'apenas http(s)'),
      }),
    )
    .min(1)
    .optional(),
  author: z.string().min(1),
  authorRole: z.string().min(1),
  authorPhoto: z.string().optional(),
  status: statusSchema,
});

export const paperSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  authors: z.array(z.string().min(1)).min(1),
  abstract: z.string().min(1),
  pdf: z.string().optional(),
  status: statusSchema,
});

export type Article = z.infer<typeof articleSchema>;
export type Paper = z.infer<typeof paperSchema>;
