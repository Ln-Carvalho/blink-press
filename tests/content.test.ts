import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadCollection, getNoticias, getNoticia, getPapers, getPaper } from '../lib/content';
import { noticiaSchema } from '../lib/schemas';

// import.meta.dirname requer Node 20.11+ (CI usa Node 22)
const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const INVALID = path.join(import.meta.dirname, 'fixtures-invalid');

describe('loadCollection', () => {
  it('carrega entradas com slug derivado do filename e conteúdo MDX', () => {
    const all = loadCollection(path.join(FIXTURES, 'radar'), noticiaSchema);
    expect(all).toHaveLength(2);
    const pub = all.find((e) => e.slug === '2026-06-01-noticia-publicada')!;
    expect(pub.title).toBe('Notícia publicada');
    expect(pub.content).toContain('Corpo da notícia publicada');
  });
  it('lança erro em frontmatter inválido (gate de build)', () => {
    expect(() => loadCollection(path.join(INVALID, 'radar'), noticiaSchema)).toThrow(/quebrada/);
  });
  it('retorna [] para diretório inexistente', () => {
    expect(loadCollection(path.join(FIXTURES, 'nao-existe'), noticiaSchema)).toEqual([]);
  });
});

describe('getNoticias (contra fixtures via baseDir)', () => {
  it('filtra drafts por padrão e ordena por data desc', () => {
    const pub = getNoticias({ baseDir: FIXTURES });
    expect(pub.map((n) => n.slug)).toEqual(['2026-06-01-noticia-publicada']);
  });
  it('inclui drafts quando pedido', () => {
    const all = getNoticias({ baseDir: FIXTURES, includeDrafts: true });
    expect(all[0].slug).toBe('2026-06-05-noticia-draft'); // mais recente primeiro
    expect(all).toHaveLength(2);
  });
  it('getNoticia acha por slug e respeita includeDrafts', () => {
    expect(getNoticia('2026-06-05-noticia-draft', { baseDir: FIXTURES })).toBeUndefined();
    expect(
      getNoticia('2026-06-05-noticia-draft', { baseDir: FIXTURES, includeDrafts: true })?.title,
    ).toBe('Notícia rascunho');
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
