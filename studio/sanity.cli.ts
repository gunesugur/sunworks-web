import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  studioHost: 'sunworks',
  deployment: { autoUpdates: true },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '75kap9xi',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
});
