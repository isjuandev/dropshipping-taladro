import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://viraly.shop',
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes('/gracias'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
