// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://yapil.art',
  output: 'static',
  adapter: vercel(),
  server: {
    port: 4321,
  },
  integrations: [
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/kp/') }),
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
