// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';

const articlesRoot = new URL('./content-drafts/seo/', import.meta.url);
const articleEntries = /** @type {string[]} */ (readdirSync(articlesRoot, { recursive: true, encoding: 'utf8' }));
const publishedArticlePaths = new Set(
  articleEntries
    .filter((entry) => entry.endsWith('.md') && entry !== 'ARTICLE_TEMPLATE.md')
    .filter((entry) => /^status:\s*["']?published["']?\s*$/m.test(readFileSync(new URL(entry, articlesRoot), 'utf8')))
    .map((entry) => `/articles/${entry.slice(entry.lastIndexOf('/') + 1).replace(/\.md$/, '')}`),
);

// https://astro.build/config
export default defineConfig({
  site: 'https://yapil.art',
  output: 'static',
  adapter: vercel(),
  server: {
    port: 4321,
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        const normalizedPath = pathname.replace(/\/$/, '') || '/';

        if (normalizedPath === '/articles') return publishedArticlePaths.size > 0;
        if (normalizedPath.startsWith('/articles/')) return publishedArticlePaths.has(normalizedPath);

        return ![
          '/anal',
          '/archive/shanding',
          '/brief',
          '/crm',
          '/kp',
          '/light',
          '/site-map',
        ].some((privatePath) => normalizedPath === privatePath || normalizedPath.startsWith(`${privatePath}/`));
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      strictPort: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'gsap'],
    },
  },
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.yapil.art' }],
  },
});
