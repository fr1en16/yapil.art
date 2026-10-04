// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import { readdirSync, readFileSync } from 'node:fs';
import { buildPermanentRedirects, isIndexableGeoPath, isPrivatePath } from './src/data/seoPolicy.mjs';

const articlesRoot = new URL('./content-drafts/seo/', import.meta.url);
const articleEntries = /** @type {string[]} */ (readdirSync(articlesRoot, { recursive: true, encoding: 'utf8' }));
const publishedArticles = articleEntries
  .filter((entry) => entry.endsWith('.md') && entry !== 'ARTICLE_TEMPLATE.md')
  .map((entry) => ({ entry, source: readFileSync(new URL(entry, articlesRoot), 'utf8') }))
  .filter(({ source }) => /^status:\s*["']?published["']?\s*$/m.test(source))
  .map(({ entry, source }) => {
    const pathname = `/articles/${entry.slice(entry.lastIndexOf('/') + 1).replace(/\.md$/, '')}`;
    const updatedAt = source.match(/^updatedAt:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
    const publishedAt = source.match(/^publishedAt:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
    const articleDate = updatedAt ?? publishedAt;

    if (!articleDate) throw new Error(`Published article is missing publishedAt: ${entry}`);

    return /** @type {[string, string]} */ ([pathname, articleDate]);
  });
const publishedArticleDates = new Map(publishedArticles);
const publishedArticlePaths = new Set(publishedArticleDates.keys());
const casesRoot = new URL('./src/content/cases/', import.meta.url);
const legacyEnglishCaseRedirects = Object.fromEntries(
  readdirSync(casesRoot)
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => {
      const slug = entry.replace(/\.md$/, '');
      return [`/en/case/${slug}`, { destination: `/case/${slug}`, status: 301 }];
    }),
);

// https://astro.build/config
export default defineConfig({
  site: 'https://yapil.art',
  trailingSlash: 'never',
  output: 'static',
  build: {
    inlineStylesheets: 'always',
  },
  adapter: cloudflare(),
  redirects: {
    '/en': { destination: '/', status: 301 },
    '/en/privacy': { destination: '/privacy', status: 301 },
    ...legacyEnglishCaseRedirects,
    '/brief/ready-food': { destination: '/brief/identity', status: 301 },
    '/бриф/айдентика': { destination: '/brief/identity', status: 301 },
    ...buildPermanentRedirects(),
    '/ads': { destination: '/', status: 301 },
    '/services/websites-static': { destination: '/services/websites', status: 301 },
  },
  server: {
    port: 4321,
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        const normalizedPath = pathname.replace(/\/$/, '') || '/';

        if (['/ads/corporate-site', '/ads/landing', '/ads/online-store'].includes(normalizedPath)) return false;

        if (normalizedPath === '/articles') return publishedArticlePaths.size > 0;
        if (normalizedPath.startsWith('/articles/')) return publishedArticlePaths.has(normalizedPath);

        return !isPrivatePath(normalizedPath) && isIndexableGeoPath(normalizedPath);
      },
      serialize: (item) => {
        const pathname = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const articleDate = publishedArticleDates.get(pathname);

        if (articleDate) item.lastmod = new Date(articleDate).toISOString();

        return item;
      },
      namespaces: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    }),
    react(),
    sanity({
      projectId: 'j2cx2dtx',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/sanity-legacy',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      strictPort: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
      exclude: ['gsap'],
    },
  },
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.yapil.art' }],
  },
});
