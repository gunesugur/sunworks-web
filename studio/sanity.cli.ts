import { fileURLToPath } from 'node:url';
import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  studioHost: 'sunworks',
  deployment: { autoUpdates: true },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '75kap9xi',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  // Pin the Studio's own tsconfig; auto-discovery walks up to the site's tsconfig, whose
  // `extends: astro/...` is unresolvable here because the Studio installs its deps separately.
  vite: (config) => ({ ...config, tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)) }),
});
