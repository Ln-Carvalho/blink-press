import matter from 'gray-matter';
import { articleSchema } from './schemas';

const FILENAME_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.mdx$/;

export function parsePipelineOutput(text: string): { filename: string; mdx: string } {
  const fname = text.match(/<filename>([\s\S]*?)<\/filename>/)?.[1]?.trim();
  const body = text.match(/<mdx>\n?([\s\S]*?)\n?<\/mdx>/)?.[1];
  if (!fname || !body) throw new Error('Output da IA sem marcadores <filename>/<mdx>');
  if (!FILENAME_RE.test(fname)) throw new Error(`filename inválido: ${fname}`);

  const { data, content } = matter(body);

  // MDX compila import/export, JSX e expressões {} server-side. O corpo vindo da IA
  // deve ser markdown puro — qualquer construção executável é rejeitada (fail-safe).
  const EXECUTABLE_MDX = /^[ \t]*(import|export)\s|<[A-Za-z\/!]|\{[\s\S]*?\}/m;
  if (EXECUTABLE_MDX.test(content)) {
    throw new Error('Corpo MDX contém construções executáveis (import/export/JSX/expressões) — rejeitado');
  }

  // força draft independentemente do que a IA escreveu (gate de curadoria humana)
  const validated = articleSchema.parse({ ...data, status: 'draft' });

  const fm = [
    `title: ${JSON.stringify(validated.title)}`,
    `date: ${validated.date.toISOString().slice(0, 10)}`,
    `category: ${validated.category}`,
    `summary: ${JSON.stringify(validated.summary)}`,
    'sources:',
    ...(validated.sources ?? []).flatMap((s) => [`  - label: ${JSON.stringify(s.label)}`, `    url: ${JSON.stringify(s.url)}`]),
    'status: draft',
  ].join('\n');

  return { filename: fname, mdx: `---\n${fm}\n---\n${content}` };
}
