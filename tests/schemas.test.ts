import { describe, it, expect } from 'vitest';
import { noticiaSchema, paperSchema, CATEGORIES } from '../lib/schemas';

const noticiaOk = {
  title: 'Pix parcelado chega às maquininhas',
  date: '2026-06-10',
  category: 'Capital',
  summary: 'Reduz custo de antecipação para PMEs do varejo.',
  sources: [{ label: 'Banco Central', url: 'https://www.bcb.gov.br/' }],
  status: 'published',
};

describe('noticiaSchema', () => {
  it('aceita frontmatter válido e coage a data', () => {
    const r = noticiaSchema.parse(noticiaOk);
    expect(r.date).toBeInstanceOf(Date);
    expect(r.category).toBe('Capital');
  });
  it('rejeita categoria fora do enum', () => {
    expect(() => noticiaSchema.parse({ ...noticiaOk, category: 'Esportes' })).toThrow();
  });
  it('rejeita fonte com URL inválida', () => {
    expect(() =>
      noticiaSchema.parse({ ...noticiaOk, sources: [{ label: 'x', url: 'nao-e-url' }] }),
    ).toThrow();
  });
  it('rejeita status desconhecido', () => {
    expect(() => noticiaSchema.parse({ ...noticiaOk, status: 'rascunho' })).toThrow();
  });
  it('expõe as 5 categorias do spec', () => {
    expect(CATEGORIES).toEqual(['Brasil', 'Mundo', 'Regulação', 'Tecnologia', 'Capital']);
  });
  it('rejeita fonte com scheme não-http(s)', () => {
    expect(() =>
      noticiaSchema.parse({ ...noticiaOk, sources: [{ label: 'x', url: 'javascript:alert(1)' }] }),
    ).toThrow();
  });
});

describe('paperSchema', () => {
  const paperOk = {
    title: 'Roteirização CVRP com stack gratuita',
    date: '2026-06-10',
    authors: ['Luan Carvalho'],
    abstract: 'Como PMEs podem otimizar rotas sem custo de software.',
    status: 'draft',
  };
  it('aceita paper válido sem pdf (opcional)', () => {
    expect(paperSchema.parse(paperOk).pdf).toBeUndefined();
  });
  it('exige ao menos um autor', () => {
    expect(() => paperSchema.parse({ ...paperOk, authors: [] })).toThrow();
  });
});
