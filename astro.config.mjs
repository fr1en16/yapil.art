// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yapil.art',
  integrations: [sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'media.yapil.art' }],
  },
});
