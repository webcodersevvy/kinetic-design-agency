import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kinetic.nyc',
  // Pin legacy whitespace handling: Astro 7 defaults compressHTML to 'jsx',
  // which strips whitespace between inline elements. `true` preserves v5 output.
  compressHTML: true,
  integrations: [solidJs(), sitemap()],
  vite: {
    build: { cssMinify: true },
  },
});
