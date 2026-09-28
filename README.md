# SUN | WORKS — web

Bilingual (TR at `/`, EN at `/en`) site for SUN | WORKS, a small solo-led web studio in Bursa.
Astro 7 + TypeScript (strict), static-first, deployed to Cloudflare Workers with two API routes for forms.

## Stack

| Area | Choice |
| --- | --- |
| Framework | Astro 7, static output, `ClientRouter` view transitions, tiny vanilla TS islands |
| Hosting | Cloudflare Workers (static assets + `@astrojs/cloudflare` for `/api/*`) — free plan |
| CMS | Sanity (free) with document-level i18n; local typed seed content mirrors the Sanity schemas until connected |
| Forms | `/api/contact`, `/api/newsletter`: zod validation, honeypot, origin/CSRF checks, D1 rate limit, Turnstile, D1 storage |
| Fonts | Plus Jakarta Sans Variable, self-hosted via `@fontsource-variable` (latin + latin-ext) |
| Images | Unsplash (Unsplash License), optimized at build with `astro:assets` → WebP |

## Scripts

```bash
npm install
cp .dev.vars.example .dev.vars      # Turnstile always-pass test secret + local salt
npm run build                       # astro build + security headers/CSP
npm run db:migrate:local            # create local D1 tables (state lives next to the built worker)
npm run preview                     # wrangler dev on http://127.0.0.1:8788 (real Worker runtime, local D1)
npm run lint                        # ESLint (typescript-eslint strict, sonarjs, security, astro) — zero warnings
npm run typecheck                   # astro check + tsc
npm test                            # unit + API security tests (node:test, real SQLite for D1 SQL)
npm run test:e2e                    # Playwright: chromium/firefox/webkit × 390/768/1024/1440, axe, CLS, forms, headers
npm run sanity:seed                 # export local content → dist-sanity/seed.ndjson (images attached)
```

## Content model

`src/content/schema.ts` (zod) ⇄ `studio/schemaTypes` (Sanity) — same `_type`s and fields:
`siteSettings`, `navigation`, `homePage`, `service`, `post`, `page` (contact + legal). Each document has `language` (`tr`|`en`)
and a shared `translationKey`, used for hreflang and the language switch.

When `SANITY_PROJECT_ID` is set at build time, `src/lib/cms.ts` reads published documents from Sanity (GROQ over HTTPS, no SDK)
and validates them with the same zod schemas; otherwise it uses `src/content/data/*`.

A Sanity webhook (on publish) → Cloudflare **Workers Builds deploy hook** rebuilds the site.

## Environment

| Name | Where | Purpose |
| --- | --- | --- |
| `TURNSTILE_SECRET_KEY` | Worker secret | Turnstile verification (forms return 503 "unavailable" without it) |
| `RATE_LIMIT_SALT` | Worker secret | salt for the hashed rate-limit key |
| `PUBLIC_TURNSTILE_SITE_KEY` | build variable | Turnstile widget site key (defaults to Cloudflare's test key) |
| `SANITY_PROJECT_ID`, `SANITY_DATASET` | build variables | switch content source to Sanity |
| `FORMS_ENABLED` | `wrangler.jsonc` var | kill switch for both forms |
| `RESEND_API_KEY` | (later) | email delivery is not implemented yet; messages are stored in D1 only |

## Design

Figma file `QALdjrTAJQ2wvLlvkPBg2r` (frame `1:81`, design-system frame `1:9`). Tokens live in `src/styles/tokens.css`.
Palette is fixed: `#12100D`, `#F5F6F7`, `#1CDB9C` (accent never used as text on light backgrounds).
The "notched" image corners are built in `src/components/Notched.astro` + `src/lib/notch.ts` (`clip-path: path()` computed via
`ResizeObserver`, rounded-rectangle fallback).

## Legal pages

Privacy, terms and cookie texts describe only the data flows implemented in this repo and are flagged
**"requires legal review"** (`legalReviewRequired: true`) until a lawyer has checked them.

## Photo credits

All photos are from [Unsplash](https://unsplash.com) under the Unsplash License. IDs: see `docs/photo-credits.md`.
