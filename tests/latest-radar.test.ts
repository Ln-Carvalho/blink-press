import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getLatestRadarPost } from '../lib/latest-radar';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

describe('getLatestRadarPost', () => {
  it('returns the newest published Radar post and excludes drafts', () => {
    const post = getLatestRadarPost({ baseDir: FIXTURES });

    expect(post).toEqual({
      slug: '2026-06-01-noticia-publicada',
      href: '/radar/2026-06-01-noticia-publicada',
      title: 'Notícia publicada',
      summary: 'Importa porque sim.',
      category: 'Brasil',
      date: '2026-06-01T00:00:00.000Z',
      dateLabel: '01 jun. 2026',
      source: 'Blink Radar',
      readTime: '4 min de leitura',
      tags: ['Brasil', 'Último post', 'PMEs'],
    });
  });

  it('returns null when there is no published Radar post', () => {
    const post = getLatestRadarPost({ baseDir: path.join(FIXTURES, 'nao-existe') });

    expect(post).toBeNull();
  });
});
