import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://web.yapil.art",
  srcDir: "./web/src",
  publicDir: "./web/public",
  outDir: "./dist-web",
  cacheDir: "./node_modules/.astro-web",
  output: "static",
  trailingSlash: "never",
  integrations: [sitemap()],
  server: { port: 4404, host: "127.0.0.1" },
  vite: { server: { strictPort: true } },
});
