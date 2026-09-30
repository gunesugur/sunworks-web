# AUREA Dental — editorial clinic demo

Standalone Astro project with static Cloudflare Workers assets and strict TypeScript.

Current contracts: [Design kit V4](docs/AUREA_DESIGN_KIT_V4.md) and [Motion rule kit V4](docs/AUREA_MOTION_RULE_KIT_V4.md). V3 briefs and reference timelines are archived; they must not drive new implementation. [V4 validation](docs/AUREA_VISUAL_QA_V4.md) records the redesign review.

```sh
npm install
npm run dev
npm run check
npm run build
npx wrangler deploy
```

The full-screen hero, cream/forest palette, Georgia display type, locally bundled Manrope and natural section flow are intentionally independent of the original reference composition. Navigation jumps directly to a destination with a fixed-header offset and keyboard focus. Native scrolling does not drive service selection or hide treatment steps.

Interactive modules retain the treatment accordion, named doctor tabs, before/after divider, FAQ and demo booking form. `src/styles/tokens.css` holds the shared values; `editorial.css` defines the current flow and typography. `SceneFrame` cannot declare pinned or overlapping scenes. Some legacy motion utilities remain for compatibility; `initScenes`, Lenis and the old hero/journey/benefits choreography are not initialized.

Booking validates sample input locally and does not send requests or book appointments. Placeholder comparison imagery is visibly labeled as illustrative. Clinic names, biographies, treatment descriptions and contact values are demo content and need verification before real use. Footer policy links open static demo information pages. Core content remains readable without JavaScript.

`public/_headers` applies the CSP and security headers; `wrangler.jsonc` serves `dist` as a static-assets Worker. `SITE_URL` overrides the production canonical origin when needed. The existing image pack remains in `src/assets/aurea/`; no reference video or reference frames are copied into the repository.
