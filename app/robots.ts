import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/preview/', '/keystatic/', '/admin'] }],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blinkgroup.com.br'}/sitemap.xml`,
  };
}
