// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'https://sunworks.studio';

export default defineConfig({
  site,
  trailingSlash: 'never',
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  build: { inlineStylesheets: 'never', format: 'file' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'tr', locales: { tr: 'tr-TR', en: 'en-US' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  security: { checkOrigin: true },
  // Keep every asset a real file so the CSP needs no data: sources.
  vite: { build: { assetsInlineLimit: 0 } },
});
