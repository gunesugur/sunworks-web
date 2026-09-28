# SUN | WORKS — Sanity Studio

Schema types here mirror `src/content/schema.ts` (zod) in the site one-to-one. The site validates Sanity data with the same zod schemas at build time.

```bash
cd studio
npm install
SANITY_STUDIO_PROJECT_ID=<id> npx sanity dev
```

Seeding from the local content: `npm run sanity:seed` in the repo root writes `dist-sanity/seed.ndjson` (images are attached with `_sanityAsset`), then `npm run import:local` here imports it.
