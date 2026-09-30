# AUREA Dental — motion-first clinic homepage (demo)

Standalone Astro project (static output, TS strict). Independent of the parent site: own `package.json`,
own `tsconfig.json` (pinned in `astro.config.mjs` via `vite.tsconfig`), ignored by the root ESLint/TS config.
Binding brief: [`docs/REMEDIATION_BRIEF_V3.md`](docs/REMEDIATION_BRIEF_V3.md) (V2 spec: `docs/BRIEF.md`).
**Implementation source of truth (V3):** [`docs/AUREA_DESIGN_KIT_V3.md`](docs/AUREA_DESIGN_KIT_V3.md) ·
[`docs/AUREA_MOTION_RULE_KIT_V3.md`](docs/AUREA_MOTION_RULE_KIT_V3.md) · [`docs/AUREA_ASSET_MAP.md`](docs/AUREA_ASSET_MAP.md) ·
[`docs/AUREA_REFERENCE_TIMELINE.md`](docs/AUREA_REFERENCE_TIMELINE.md) · [`docs/AUREA_BASELINE_AUDIT.md`](docs/AUREA_BASELINE_AUDIT.md) ·
[`docs/AUREA_VISUAL_QA.md`](docs/AUREA_VISUAL_QA.md).

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # → dist/  (Cloudflare Workers static assets: `npx wrangler deploy`)
npx astro check
```

## Structure

| Path | Role |
| --- | --- |
| `src/content/site.ts` | **All copy & editable values** (typed). Sections only consume it. Stats are placeholders flagged `verified: false`. |
| `src/lib/images.ts` | Image key → build-time import of the asset pack in `src/assets/aurea/` (hero-operatory, clinic-detail, benefits-clinic, booking-patient, services/*, journey/01–05, doctors/01–04, results/before+after). `<Picture>` emits AVIF + WebP. See `docs/AUREA_ASSET_MAP.md`. |
| `src/styles/tokens.css` | V3 palette (+ V2 aliases), type scale, **stage geometry** (`--stage-w/-max/-h/-top/-radius/-inset/-pad-*`, `--panel-w`), ambient recipe, radii, motion tokens, scene lengths/overlaps, z-layers. |
| `src/styles/scene.css` | Scene primitives: `.scene`, `.scene__pin`, `.stage`, `.panel`, `.scene__column`, rise/beneath overlaps, `.mm` (MaskedMedia), `[data-ink]`, `.ambient`. |
| `src/components/scene/` | `SceneFrame` (stage/panel/column shell + declared hand-offs), `RisingPanel`, `MaskedMedia`, `AmbientBackdrop`. |
| `src/motion/scenes.ts` | `initScenes` (builds every declared hand-off + ambient), `scenePin`, `maskWipe`, `inkPhrases`, `ambientChanged`. |
| `src/styles/base.css` | Reset, typography helpers, focus, `.container`, `.grid`, `.label`, `.mask-line`, `.link-line`, `.media-zoom`, `.panel-rise`, reveal start states, reduced-motion rules, Lenis CSS. |
| `src/motion/tokens.ts` | GSAP mirror of motion tokens (`EASE`, `DURATION`, `STAGGER`, `FADE_Y`, `HANDOFF`, `INTENSITY`); registers ScrollTrigger + CustomEase. Import `gsap`/`ScrollTrigger` from here. |
| `src/motion/media.ts` | `MQ`, `BREAKPOINT` (tablet 640, desktop 1024), `prefersReducedMotion()`, `isDesktop()`, `withMotion(scope, ({desktop, tablet, phone, mobile, reduce}) => …)` (gsap.matchMedia; auto-revert). |
| `src/motion/smooth-scroll.ts` | Lenis (off under reduced motion) synced to `gsap.ticker` + `ScrollTrigger.update`; `getLenis()`, `lockScroll(bool)`, `scrollToTarget(el)`, delegated `#anchor` handling with header offset. |
| `src/motion/reveal.ts` | Site-wide data-attribute reveals (below). `revealElement(el)` / `prepareReveal(el)` for manual timelines. |
| `src/scripts/main.ts` | Boot: smooth scroll → section modules (DOM order) → `initScenes` → reveals → `ScrollTrigger.sort/refresh` (+ refresh on fonts/images). |
| `src/scripts/sections/registry.ts` | `data-section` name → lazy module. |
| `src/components/ui/` | `Button` (primary/ghost/link), `CircleArrow`, `Arrow`, `Img` (AVIF/WebP `<picture>`), `RevealText` (lines → masks), `Label`. |
| `src/components/sections/` | One component per section, composed in `src/pages/index.astro`. |

## Section-module contract

1. Component root: `<SceneFrame name="…" section="<name>" …>` (V3; declares the scene's hand-off) — legacy roots are
   `<section id="…" data-section="<name>">`.
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

See `docs/AUREA_DESIGN_KIT_V3.md` (exact values). V3 names: `--bg-main | --bg-soft | --surface | --surface-muted |
--text-primary | --text-secondary | --text-faint | --border-soft | --black | --white | --glass | --glass-active | --capsule`;
V2 `--color-*` names remain as aliases. Type `--fs-hero | -h2 | -statement | -h3 | -num | -h4 | -stat | -body-lg | -body | -small | -label`.
Stage `--stage-w | -h | -top | -radius | -inset | -pad-x | -pad-y`, `--panel-w | --panel-radius | --media-radius | --card-radius`.
Motion `--ease-primary|soft`, `--duration-fast|ui|medium|large`; scene lengths `--len-*`, overlaps `--overlap-rise|beneath`.

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

## Images

The AUREA asset pack lives in `src/assets/aurea/` (edge-trimmed WebP masters; before/after share one crop). Never
add the reference video/frames to the repo.
