# AUREA Dental — motion-first clinic homepage (demo)

Standalone Astro project (static output, TS strict). Independent of the parent site: own `package.json`,
own `tsconfig.json` (pinned in `astro.config.mjs` via `vite.tsconfig`), ignored by the root ESLint/TS config.
Design & motion spec: [`docs/BRIEF.md`](docs/BRIEF.md).

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # → dist/  (Cloudflare Workers static assets: `npx wrangler deploy`)
npx astro check
node scripts/placeholders.mjs [--force] [--only=key,key]   # art-directed placeholder photos (skips existing files)
node scripts/derive-before.mjs                           # result-after.jpg → result-before.jpg
```

## Structure

| Path | Role |
| --- | --- |
| `src/content/site.ts` | **All copy & editable values** (typed). Sections only consume it. Stats are `// CMS-editable placeholder`. |
| `src/lib/images.ts` | Image key → build-time import of `src/assets/images/<key>.jpg`. `ImageKey` union. Real photos replace files 1:1. |
| `src/styles/tokens.css` | Palette, clamp type scale, spacing, gutters per breakpoint, radii, motion tokens, z-layers. |
| `src/styles/base.css` | Reset, typography helpers, focus, `.container`, `.grid`, `.label`, `.mask-line`, `.link-line`, `.media-zoom`, `.panel-rise`, reveal start states, reduced-motion rules, Lenis CSS. |
| `src/motion/tokens.ts` | GSAP mirror of motion tokens (`EASE`, `DURATION`, `STAGGER`, `FADE_Y`); registers ScrollTrigger + CustomEase. Import `gsap`/`ScrollTrigger` from here. |
| `src/motion/media.ts` | `MQ`, `BREAKPOINT` (desktop = 1024), `prefersReducedMotion()`, `isDesktop()`, `withMotion(scope, ({desktop, mobile, reduce}) => …)` (gsap.matchMedia; auto-revert). |
| `src/motion/smooth-scroll.ts` | Lenis (off under reduced motion) synced to `gsap.ticker` + `ScrollTrigger.update`; `getLenis()`, `lockScroll(bool)`, `scrollToTarget(el)`, delegated `#anchor` handling with header offset. |
| `src/motion/reveal.ts` | Site-wide data-attribute reveals (below). `revealElement(el)` / `prepareReveal(el)` for manual timelines. |
| `src/scripts/main.ts` | Boot: smooth scroll → section modules (DOM order) → reveals → `ScrollTrigger.sort/refresh` (+ refresh on fonts/images). |
| `src/scripts/sections/registry.ts` | `data-section` name → lazy module. |
| `src/components/ui/` | `Button` (primary/ghost/link), `CircleArrow`, `Arrow`, `Img` (AVIF/WebP `<picture>`), `RevealText` (lines → masks), `Label`. |
| `src/components/sections/` | One component per section, composed in `src/pages/index.astro`. |

## Section-module contract

1. Component root: `<section id="…" data-section="<name>">` (Services root also has class `panel-rise`).
2. `src/scripts/sections/<name>.ts` exports
   `export function init(root: HTMLElement): void | (() => void)` — query **inside `root`**, return a cleanup.
3. Add **one line** to `registry.ts`: `<name>: () => import('./<name>'),`
4. Build motion with `withMotion(root, ({ desktop, mobile, reduce }) => { … })`. Desktop pinned/scrubbed work only under `desktop`;
   `reduce` = opacity only, no pinning/parallax. Use `EASE`/`DURATION` only. Animate transform/opacity/clip-path; measure in
   `onRefreshInit`/refresh callbacks, never inside scroll updates. Prefer CSS `position: sticky` stages over `pin`.

## Reveals (no JS needed in sections)

```html
<h2 data-reveal="lines">…mask lines… (use <RevealText lines={[…]} />)</h2>
<p data-reveal="fade" data-reveal-delay="0.1">…</p>          <!-- opacity + 16px -->
<figure data-reveal="clip" data-reveal-from="left|right|center-y">…</figure>
<ul data-reveal="stagger">…children fade up, 50ms…</ul>
<!-- options: data-reveal-start="top 80%", data-reveal-trigger="manual" (play it yourself with revealElement) -->
```

## Tokens other sections must use

Colours `--color-bg | -bg-alt | -white | -panel | -surface | -footer | -border | -border-soft | -border-strong | -text | -text-2 | -text-3 | -cta | -cta-hover | -cta-text | -accent | -card`.
Type `--fs-hero | -h2 | -statement | -h3 | -h4 | -stat | -body-lg | -body | -small | -button | -label`, `--fw-*`, `--lh-*`, `--ls-*`
(helpers `.t-hero .t-h2 .t-statement .t-h3 .t-body-lg .t-muted .label`).
Space `--space-1…10`, `--section-pad`, `--section-pad-sm`, `--gutter`, `--grid-gap`, `--container-max`, `--header-h`.
Radii `--radius-xs|sm|md|lg|xl|round`. Motion `--ease-primary|soft`, `--duration-fast|ui|medium|large`. Layers `--z-panel|header|menu`.
`--panel-rise-overlap` (100svh on desktop+motion, else 0).

## Booking form

`BookingCTA` posts `name, phone, email, interest[], message` (+ honeypot `company`, must stay empty) to
`POST /api/booking`. Without JS the browser validates natively and submits; with JS `booking.ts` validates inline
and — since no backend exists in this demo — intercepts the submit and shows the success state. To go live, add
`data-endpoint="live"` to the form: it then `fetch`es the action and falls back to a normal POST on failure.
The parent Sunworks repo's form stack (Worker route + D1 storage + Turnstile verification) can back this endpoint;
add the Turnstile widget inside the form and allow `challenges.cloudflare.com` in `public/_headers` CSP.

## Security / deploy

`public/_headers`: strict CSP (`script-src 'self'`, no inline scripts — Astro emits one external module; `assetsInlineLimit: 0`),
HSTS, nosniff, Referrer-Policy, Permissions-Policy, immutable `/_astro/*`. `wrangler.jsonc`: assets-only Worker serving `./dist`.

## Placeholders

`scripts/placeholders.mjs` renders seeded SVG "architectural light studies" (ivory/stone/grey, raking light, sculptural
volumes, film grain) at the final file names. It never overwrites an existing file unless `--force`.
