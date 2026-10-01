# AUREA Dental — cinematic clinic demo

Standalone Astro project with static Cloudflare Workers assets and strict TypeScript.

Current contract: [Design and motion kit V5](docs/AUREA_DESIGN_MOTION_KIT_V5.md). V3/V4 contracts are historical. [V5 validation](docs/AUREA_VISUAL_QA_V5.md) records the motion restoration review.

```sh
npm install
npm run dev
npm run check
npm run build
npx wrangler deploy
```

The full-screen aperture hero, horizontal care commitments and five-chapter treatment desk use Lenis and GSAP. Locally bundled Manrope, mineral neutrals and forest accents form the current visual system. The supplied video informs the motion vocabulary; the composition and choreography are independently implemented. Navigation jumps directly to its destination and moves keyboard focus. Sticky cinematic destinations align with the viewport; other sections respect the fixed header.

Interactive modules retain the treatment accordion, named doctor tabs, before/after divider, FAQ and demo booking form. `src/styles/tokens.css` holds shared values; `editorial.css` defines general flow and typography. Benefits and journey use bounded CSS sticky canvases on desktop, with ScrollTrigger controlling their contents. Mobile, tablet and reduced-motion layouts expose all five treatment chapters in normal flow. Services change only through explicit selection.

If Node commands stall in the desktop environment, set `NODE_DISABLE_COMPILE_CACHE=1` before running the scripts.

Booking validates sample input locally and does not send requests or book appointments. Placeholder comparison imagery is visibly labeled as illustrative. Clinic names, biographies, treatment descriptions and contact values are demo content and need verification before real use. Footer policy links open static demo information pages. Core content remains readable without JavaScript.

`public/_headers` applies the CSP and security headers; `wrangler.jsonc` serves `dist` as a static-assets Worker. `SITE_URL` overrides the production canonical origin when needed. The existing image pack remains in `src/assets/aurea/`; no reference video or reference frames are copied into the repository.
