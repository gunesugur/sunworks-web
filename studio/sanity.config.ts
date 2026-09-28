import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { documentInternationalization } from '@sanity/document-internationalization';
import { schemaTypes, translatedTypes } from './schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? '75kap9xi';
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

export default defineConfig({
  name: 'sunworks',
  title: 'SUN | WORKS',
  projectId,
  dataset,
  plugins: [
    structureTool(),
    documentInternationalization({
      supportedLanguages: [
        { id: 'tr', title: 'Türkçe' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: translatedTypes,
      languageField: 'language',
    }),
  ],
  schema: { types: schemaTypes },
});
