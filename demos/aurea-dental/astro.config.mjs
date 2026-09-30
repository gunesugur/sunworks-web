// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aurea-dental.example',
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  // Keep every script/asset a real file: the CSP forbids inline scripts.
  vite: {
    // Pin this project's tsconfig so the parent repo's tsconfig is never picked up.
    tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    build: { assetsInlineLimit: 0 },
  },
});
