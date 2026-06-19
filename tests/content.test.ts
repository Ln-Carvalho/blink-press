import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadCollection, getArticles, getArticle, getPapers, getPaper } from '../lib/content';
import { articleSchema } from '../lib/schemas';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const INVALID = path.join(import.meta.dirname, 'fixtures-invalid');

describe('loadCollection', () => {
  it('carrega entradas com slug derivado do filename e conteúdo MDX', () => {
    const all = loadCollection(path.join(FIXTURES, 'radar'), articleSchema);
    expect(all.length).toBeGreaterThanOrEqual(2);
    const pub = all.find((e) => e.slug === '2026-06-01-noticia-publicada')!;
    expect(pub.title).toBe('Notícia publicada');
    expect(pub.content).toContain('Corpo da notícia publicada');
  });
  it('lança erro em frontmatter inválido (gate de build)', () => {
    expect(() => loadCollection(path.join(INVALID, 'radar'), articleSchema)).toThrow(/quebrada/);
  });
  it('retorna [] para diretório inexistente', () => {
    expect(loadCollection(path.join(FIXTURES, 'nao-existe'), articleSchema)).toEqual([]);
  });
});

describe('getArticles (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getArticles({ baseDir: FIXTURES });
    const slugs = pub.map((n) => n.slug);
    expect(slugs).not.toContain('2026-06-05-noticia-draft');
    expect(slugs).not.toContain('perspectiva-draft');
    expect(slugs).toContain('2026-06-01-noticia-publicada');
    expect(slugs).toContain('perspectiva-publicada');
  });
  it('inclui drafts quando pedido e ordena por data desc', () => {
    const all = getArticles({ baseDir: FIXTURES, includeDrafts: true });
    expect(all[0].slug).toBe('2026-06-05-noticia-draft'); // mais recente primeiro
    expect(all).toHaveLength(4);
  });
  it('getArticle acha por slug e respeita includeDrafts', () => {
    expect(getArticle('2026-06-05-noticia-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(
      getArticle('2026-06-05-noticia-draft', { baseDir: FIXTURES, includeDrafts: true })?.title,
    ).toBe('Notícia rascunho');
  });
  it('getArticle encontra post ex-perspectiva por slug', () => {
    expect(
      getArticle('perspectiva-publicada', { baseDir: FIXTURES })?.category,
    ).toBe('Tributário');
  });
});

describe('getPapers (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getPapers({ baseDir: FIXTURES });
    expect(pub.map((p) => p.slug)).toEqual(['paper-publicado']);
  });
  it('getPaper respeita includeDrafts', () => {
    expect(getPaper('paper-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(getPaper('paper-draft', { baseDir: FIXTURES, includeDrafts: true })?.title).toBe('Paper rascunho');
  });
});
