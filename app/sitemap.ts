import type { MetadataRoute } from 'next';
import { getArticles, getPapers } from '@/lib/content';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/radar`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/research`, changeFrequency: 'weekly', priority: 0.9 },
    ...getArticles().map((a) => ({ url: `${BASE}/radar/${a.slug}`, lastModified: a.date })),
    ...getPapers().map((p) => ({ url: `${BASE}/research/${p.slug}`, lastModified: p.date })),
  ];
}
