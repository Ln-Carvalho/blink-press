import { config, collection, fields } from '@keystatic/core';
import { ARTICLE_CATEGORIES } from './lib/schemas';

const isProd = process.env.NODE_ENV === 'production';

export default config({
  storage: isProd
    ? { kind: 'github', repo: { owner: 'Ln-Carvalho', name: 'blink-press' } }
    : { kind: 'local' },
  ui: { brand: { name: 'Blink Press' } },
  collections: {
    radar: collection({
      label: 'Radar (notícias e editorial)',
      slugField: 'title',
      path: 'content/radar/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date', 'category'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft (fila de curadoria)', value: 'draft' },
            { label: 'Published (no ar após deploy)', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Categoria',
          options: ARTICLE_CATEGORIES.map((c) => ({ label: c, value: c })),
          defaultValue: 'Brasil',
        }),
        summary: fields.text({
          label: 'Por que isso importa para sua PME',
          multiline: true,
          validation: { isRequired: true },
        }),
        sources: fields.array(
          fields.object({
            label: fields.text({ label: 'Fonte', validation: { isRequired: true } }),
            url: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          { label: 'Fontes (opcional)', itemLabel: (p) => p.fields.label.value || 'fonte' },
        ),
        author: fields.text({ label: 'Autor', validation: { isRequired: true } }),
        authorRole: fields.text({ label: 'Cargo do autor', validation: { isRequired: true } }),
        authorPhoto: fields.text({ label: 'URL da foto do autor (opcional)' }),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
    papers: collection({
      label: 'Papers (Research)',
      slugField: 'title',
      path: 'content/research/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['status', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        authors: fields.array(fields.text({ label: 'Autor' }), {
          label: 'Autores',
          itemLabel: (p) => p.value || 'autor',
        }),
        abstract: fields.text({ label: 'Abstract', multiline: true, validation: { isRequired: true } }),
        pdf: fields.text({ label: 'URL do PDF (opcional)' }),
        content: fields.mdx({ label: 'Conteúdo' }),
      },
    }),
  },
});
