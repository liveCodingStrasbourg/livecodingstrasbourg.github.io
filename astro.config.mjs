// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://livecodingstrasbourg.github.io',
  base: '/',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
