// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://livecodingstrasbourg.github.io',
  base: '/',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
  redirects: {
    '/tools': '/ressources',
    '/en/tools': '/en/ressources',
    '/chaos-labs': '/agenda',
    '/en/chaos-labs': '/en/agenda',
    '/chaos-labs/2022-07-chaos-lab-1': '/agenda/2022-07-chaos-lab-1',
    '/chaos-labs/2022-10-chaos-lab-2': '/agenda/2022-10-chaos-lab-2',
    '/chaos-labs/2023-03-chaos-lab-3': '/agenda/2023-03-chaos-lab-3',
    '/chaos-labs/2023-11-chaos-lab-4': '/agenda/2023-11-chaos-lab-4',
    '/chaos-labs/2023-11-chaos-lab-5': '/agenda/2023-11-chaos-lab-5',
    '/chaos-labs/2024-08-chaos-lab-6': '/agenda/2024-08-chaos-lab-6',
    '/chaos-labs/2024-12-chaos-lab-6-5': '/agenda/2024-12-chaos-lab-6-5',
    '/chaos-labs/2025-05-chaos-lab-7': '/agenda/2025-05-chaos-lab-7',
    '/chaos-labs/2025-10-chaos-lab-8': '/agenda/2025-10-chaos-lab-8',
    '/chaos-labs/2025-11-chaos-lab-8-2': '/agenda/2025-11-chaos-lab-8-2',
    '/chaos-labs/2026-01-chaos-bits': '/agenda/2026-01-chaos-bits',
    '/chaos-labs/2026-06-chaos-lab-11': '/agenda/2026-06-chaos-lab-11',
    '/chaos-labs/2026-07-chaos-lab-12': '/agenda/2026-07-chaos-lab-12',
    '/en/chaos-labs/2022-07-chaos-lab-1': '/en/agenda/2022-07-chaos-lab-1',
    '/en/chaos-labs/2022-10-chaos-lab-2': '/en/agenda/2022-10-chaos-lab-2',
    '/en/chaos-labs/2023-03-chaos-lab-3': '/en/agenda/2023-03-chaos-lab-3',
    '/en/chaos-labs/2023-11-chaos-lab-4': '/en/agenda/2023-11-chaos-lab-4',
    '/en/chaos-labs/2023-11-chaos-lab-5': '/en/agenda/2023-11-chaos-lab-5',
    '/en/chaos-labs/2024-08-chaos-lab-6': '/en/agenda/2024-08-chaos-lab-6',
    '/en/chaos-labs/2024-12-chaos-lab-6-5': '/en/agenda/2024-12-chaos-lab-6-5',
    '/en/chaos-labs/2025-05-chaos-lab-7': '/en/agenda/2025-05-chaos-lab-7',
    '/en/chaos-labs/2025-10-chaos-lab-8': '/en/agenda/2025-10-chaos-lab-8',
    '/en/chaos-labs/2025-11-chaos-lab-8-2': '/en/agenda/2025-11-chaos-lab-8-2',
    '/en/chaos-labs/2026-01-chaos-bits': '/en/agenda/2026-01-chaos-bits',
    '/en/chaos-labs/2026-06-chaos-lab-11': '/en/agenda/2026-06-chaos-lab-11',
    '/en/chaos-labs/2026-07-chaos-lab-12': '/en/agenda/2026-07-chaos-lab-12',
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
