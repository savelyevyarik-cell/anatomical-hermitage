import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anatomical-hermitage.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/exposition', '/excursions', '/history', '/visitors', '/contacts'];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
