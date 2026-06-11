import { z } from 'zod';

export const CATEGORIES = ['Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital'] as const;

export const statusSchema = z.enum(['draft', 'published']);

export const noticiaSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.enum(CATEGORIES),
  summary: z.string().min(1), // "por que isso importa para sua PME"
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url().regex(/^https?:\/\//, 'apenas http(s)'),
      }),
    )
    .min(1),
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

export type Noticia = z.infer<typeof noticiaSchema>;
export type Paper = z.infer<typeof paperSchema>;
