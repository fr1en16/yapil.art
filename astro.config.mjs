// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yapil.art',
  integrations: [sitemap()],
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.yapil.art' }],
  },
});
