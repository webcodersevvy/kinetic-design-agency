import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://kinetic-design-agency.vercel.app',
  // Pin legacy whitespace handling: Astro 7 defaults compressHTML to 'jsx',
  // which strips whitespace between inline elements. `true` preserves v5 output.
  compressHTML: true,
  // Fully static site deployed on Vercel; the adapter emits Vercel build output.
  output: 'static',
  adapter: vercel(),
  integrations: [solidJs(), sitemap()],
  vite: {
    build: { cssMinify: true },
  },
});
