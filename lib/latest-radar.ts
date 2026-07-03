import { getArticles } from './content';

type LatestRadarOptions = {
  baseDir?: string;
};

export type LatestRadarPost = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  dateLabel: string;
  source: 'Blink Group Radar';
  readTime: '4 min de leitura';
  tags: string[];
};

const formatDateLabel = (date: Date) => (
  date
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .replace(/\sde\s/g, ' ')
);

export function getLatestRadarPost(opts: LatestRadarOptions = {}): LatestRadarPost | null {
  const [latest] = getArticles({ baseDir: opts.baseDir });

  if (!latest) {
    return null;
  }

  return {
    slug: latest.slug,
    href: `/radar/${latest.slug}`,
    title: latest.title,
    summary: latest.summary,
    category: latest.category,
    date: latest.date.toISOString(),
    dateLabel: formatDateLabel(latest.date),
    source: 'Blink Group Radar',
    readTime: '4 min de leitura',
    tags: [latest.category, 'Último post', 'PMEs'],
  };
}
