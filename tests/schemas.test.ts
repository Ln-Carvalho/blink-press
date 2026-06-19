import { describe, it, expect } from 'vitest';
import { articleSchema, ARTICLE_CATEGORIES } from '../lib/schemas';

const base = {
  title: 'Pix parcelado chega às maquininhas',
  date: '2026-06-10',
  category: 'Capital',
  summary: 'Reduz custo de antecipação para PMEs do varejo.',
  status: 'published',
};

describe('articleSchema', () => {
  it('aceita artigo com sources (estilo notícia)', () => {
    const r = articleSchema.parse({
      ...base,
      sources: [{ label: 'Banco Central', url: 'https://www.bcb.gov.br/' }],
    });
    expect(r.date).toBeInstanceOf(Date);
    expect(r.sources).toHaveLength(1);
  });

  it('aceita artigo sem sources (estilo editorial)', () => {
    const r = articleSchema.parse(base);
    expect(r.sources).toBeUndefined();
    expect(r.date).toBeInstanceOf(Date);
  });

  it('aceita author opcional', () => {
    expect(articleSchema.parse({ ...base, author: 'Blink Team' }).author).toBe('Blink Team');
    expect(articleSchema.parse(base).author).toBeUndefined();
  });

  it('rejeita categoria fora do enum', () => {
    expect(() => articleSchema.parse({ ...base, category: 'Esportes' })).toThrow();
  });

  it('rejeita fonte com URL inválida', () => {
    expect(() =>
      articleSchema.parse({ ...base, sources: [{ label: 'x', url: 'nao-e-url' }] }),
    ).toThrow();
  });

  it('rejeita fonte com scheme não-http(s)', () => {
    expect(() =>
      articleSchema.parse({ ...base, sources: [{ label: 'x', url: 'javascript:alert(1)' }] }),
    ).toThrow();
  });

  it('rejeita status desconhecido', () => {
    expect(() => articleSchema.parse({ ...base, status: 'rascunho' })).toThrow();
  });

  it('aceita categoria Tributário (ex-Perspectivas)', () => {
    expect(() => articleSchema.parse({ ...base, category: 'Tributário' })).not.toThrow();
  });

  it('expõe as 8 categorias unificadas', () => {
    expect(ARTICLE_CATEGORIES).toEqual([
      'Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital',
      'Tributário', 'Operações', 'Mercado',
    ]);
  });
});

describe('paperSchema — inalterado', () => {
  // paper continua separado; smoke test para garantir que não quebramos
  it('importa sem erro', async () => {
    const { paperSchema } = await import('../lib/schemas');
    expect(paperSchema).toBeDefined();
  });
});
