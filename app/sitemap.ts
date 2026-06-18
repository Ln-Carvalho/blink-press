import type { MetadataRoute } from 'next';
import { getNoticias, getPapers, getPerspectivas } from '@/lib/content';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/radar`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/research`, changeFrequency: 'weekly', priority: 0.9 },
    ...getNoticias().map((n) => ({ url: `${BASE}/radar/${n.slug}`, lastModified: n.date })),
    ...getPapers().map((p) => ({ url: `${BASE}/research/${p.slug}`, lastModified: p.date })),
    { url: `${BASE}/radar/perspectivas`, changeFrequency: 'weekly', priority: 0.8 },
    ...getPerspectivas().map((p) => ({ url: `${BASE}/radar/perspectivas/${p.slug}`, lastModified: p.date })),
  ];
}
