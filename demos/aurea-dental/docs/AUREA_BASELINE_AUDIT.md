# AUREA — Baseline audit (V2 codebase before V3 remediation)

Audited at commit `0ebc267` (plus the phase-1 foundation changes listed in §9). Scope: every component, token,
GSAP/ScrollTrigger/Lenis use, reveal system, reduced motion, breakpoints and each section against the reference
(`AUREA_REFERENCE_TIMELINE.md`).

## 1. Framework & build

| Item | Finding |
|---|---|
| Stack | Astro 7.3 static, TS strict (own tsconfig via `vite.tsconfig`), GSAP 3.15 (ScrollTrigger, CustomEase), Lenis 1.3, `@fontsource-variable/inter-tight`, sharp |
| Output / deploy | `dist/` served by an assets-only Cloudflare Worker (`wrangler.jsonc`); `public/_headers` strict CSP (`script-src 'self'`, no inline scripts; `assetsInlineLimit: 0`), HSTS, immutable `/_astro/*` |
| Boot | `Base.astro` → one external module `scripts/main.ts`: Lenis → lazy section modules (registry, DOM order) → reveals → `ScrollTrigger.sort/refresh` (+ refresh on fonts/load/lazy images) + breakpoint scroll-restore |
| Content | all copy in `src/content/site.ts` (typed); images via `src/lib/images.ts` keys → `ui/Img.astro` (`<Picture>`) |
| Health | `astro check` 0 errors; build OK. Architecture is sound → **kept** (brief: do not rewrite working architecture) |

## 2. Components

| File | Role | V3 verdict |
|---|---|---|
| `sections/Header.astro` + `header.ts` | full-width bar, 6 links, solid-on-scroll layer, mobile overlay menu (focus trap, inert, Esc) | **Rebuilt in phase 1** → central capsule (4 links), CTA right, hide-on-down; menu kept (7 destinations) |
| `sections/HeroIntro.astro` + `hero.ts` | editorial meta row, 96 px 2-line H1, image 9/12 cols, sticky 200 svh with scale .965 | rebuild on SceneFrame (stage, inner 21:9 expansion) |
| `sections/ClinicStatement.astro` + `statement.ts` | label, image (clip reveal, parallax), 3 stats, 4-line mask-reveal statement, secondary copy + link | rebuild as rising panel with phrase inking |
| `sections/HorizontalBenefitsScene.astro` + `benefits.ts` | full-bleed bg image + blurred depth copy + scrim; sticky 100 svh; scrubbed track 130 vh; `--focus` per card; mobile scroll-snap | keep track/focus logic, move into stage (grow entry) |
| `sections/ServicesSection.astro` + `services.ts` | `.panel-rise` over benefits, FLIP accordion 88/208 px, hover intent, scroll auto-activation with lock | keep logic; re-skin rows/thumbs, move to RisingPanel |
| `sections/TreatmentJourney.astro` + `journey.ts` | sticky stage, lift under services, 250 vh scrub, number roll, model swap (±4°), labels, progress | keep state machine; retune to brief values; SceneFrame beneath |
| `sections/DoctorsShowcase.astro` + `doctors.ts` | rounded panel over journey + veil; tablist; clip wipe ~700 ms; exit wipe to results | re-compose into wide inset stage; use `maskWipe` |
| `sections/ResultsSection.astro`, `results/BeforeAfterSlider.astro`, `results/TestimonialCard.astro` | 55/45 slider + testimonial; blurred bg copy; clip open; hint sweep | keep slider; stage (beneath), warm ambient; remove internal blurred bg |
| `sections/FAQSection.astro` + `faq.ts` | accordion (height/opacity/translate), sticky left column, recedes as booking rises | keep; `exit="recede"` via SceneFrame |
| `sections/BookingCTA.astro` + `booking.ts` | 4:5 portrait sticky + clip inset(35% 0) → 0; accessible form, honeypot, inline errors | keep form; 16:9 image left in stage, grow y 30 % |
| `sections/Footer.astro` + `footer.ts` | photo texture (clinic-wide) + drift, wordmark in `--fs-h2`, nav/contact/legal | remove photo; quiet warm block; beneath |
| `ui/Button, CircleArrow, Arrow, Img, RevealText, Label` | primitives | keep (Img gained per-breakpoint `positions`, AVIF + WebP only) |

## 3. Tokens (before → V3)

| Area | V2 | Issue vs brief | V3 (done) |
|---|---|---|---|
| Colours | bg #f4f4f1, text #141414, text-2 #686864, surface #ecece8… | close; names differ | V3 names (`--bg-main` … `--white`) + V2 aliases |
| Hero type | clamp(42→96 px), weight 480 | **brief: 52–64 px, w500, NOT 100** | clamp(52px, 4.4vw, 64px), 500 |
| H2 | 36 → 72 px | brief 46–58 | 34 → 56 |
| Statement | 28 → 52 | too loud for LOW–MED intro | 26 → 39 |
| Radii | md 18, lg 24, **xl 30** (panels) | brief stage 8–14, panels 18–26 | md 12, lg 18, xl 22; stage 12; panel 22 |
| Stage geometry | none (sections full-bleed 100 vw × 100 svh) | **reference is a centred 91 vw × ~58 svh stage** | `--stage-w/-max/-h/-top/-radius/-inset/-pad-*`, `--panel-w` |
| Container | 1560 max, gutter 48–96 | wider than reference column | `--container-max: var(--stage-max)` 1320; stage gutter 116 @1440 |
| Motion | `--duration-large` 1100 | brief 1050 | 1050; `DURATION.wipe`, `HANDOFF`, `INTENSITY` added |
| Header | `--header-h` 64/76 full bar | capsule | 56/60/40 + `--header-top` |

## 4. GSAP / ScrollTrigger / Lenis inventory

| Module | Triggers | Technique | Notes |
|---|---|---|---|
| `smooth-scroll.ts` | — | single Lenis (lerp .1), `gsap.ticker` → `lenis.raf`, `lenis.on('scroll', ScrollTrigger.update)`, `lagSmoothing(0)`; disabled under reduced motion; anchor delegation with header offset | ✅ correct, one instance |
| `reveal.ts` | 1 per `[data-reveal]` (once) | lines / fade / clip / stagger; reduced = opacity | ✅ keep; "fade" must not be used for major moments |
| `header.ts` | 2 + per nav link | solid layer + aria-current | replaced (hide-on-down + aria-current) |
| `hero.ts` | 1 intro TL (load) + 1 scrub | load: crop window opens via translate + clip-path (≈ reference idea), scroll lock ≤ 3.2 s; scroll: sticky stage scale .965 + radius + parallax | lock too long; composition/scale differ (§6) |
| `statement.ts` | 1 scrub | image parallax ±4 % | replace by inking |
| `benefits.ts` | timeline scrub .6 + live ticker toggle + recede scrub | measured centres on refresh, `--focus` per frame from rendered x — **good pattern** | keep |
| `services.ts` | rise scrub + auto-activation + visibility | FLIP with transforms + clip-path | keep |
| `journey.ts` | 6 | lift + scrubbed steps + cover (reads next section's negative margin on refresh) | keep structure; values off-brief |
| `doctors.ts` | 4 | veil scrub, card drift, exit wipe, tab wipe | keep tab wipe; exit wipe replaced by `beneath` |
| `results.ts` | 6 | clip open (scrub desktop / once mobile), quote in, one hint sweep | keep slider |
| `faq.ts` | 1 | recede scrub | now via SceneFrame `exit="recede"` |
| `booking.ts` | 2 | portrait clip scrub / once | via `grow="y"` |
| `footer.ts` | 1 | texture drift | remove |

No `pin: true` anywhere (CSS sticky everywhere) ✅. No layout reads inside scroll callbacks found ✅
(benefits/journey measure on refresh). Each module returns cleanup and uses `withMotion` (gsap.matchMedia) ✅.
`keepScrollAcrossBreakpoints` fixes a real GSAP matchMedia quirk ✅.

## 5. Reveal system, reduced motion, breakpoints

- Reveals: CSS start states in `base.css` (no flash), `motion-fallback` class + `<noscript>` safety net ✅.
- Reduced motion: Lenis off, pins off (sections gate sticky on `no-preference`), reveals opacity-only, hero final
  state ✅. All scrubs are gated by `withMotion` conditions (desktop/mobile = motion only) ✅.
- Breakpoints: 640 (tablet), 1024 (desktop), 1280 (one component), 1600 (gutter). `withMotion` had only
  desktop/mobile → **tablet 834×1194 had no own composition** (it got the phone layout). Phase 1 adds `tablet` /
  `phone` flags and tablet stage tokens.

## 6. Section-by-section discrepancies vs reference / brief

| # | Scene | Current (V2) | Reference / brief | Required change |
|---|---|---|---|---|
| 1 | Nav | full-width bar, 6 links, solid layer after hero | small central translucent capsule, 4 links, CTA right, inside stage top band | ✅ done (phase 1) |
| 2 | Hero | editorial meta row + 96 px headline above a 9-col image; no outer stage; image opens from a small crop but into a non-stage layout | large outer stage already present; small 21:9 inner image (40–50 % width) with white breathing room expands (bounds, not scale) to fill the stage; headline 52–64 px appears after; ONE dark CTA + quiet link | rebuild on SceneFrame stage (height fixed); remove meta row; 21:9 window → full; headline inside stage lower-left |
| 3 | Hero→Intro | stage scale .965 + radius while statement slides over | hero pinned briefly, scale ≈.94 + up-translate, panel rises, both coexist | `RisingPanel overlap="short"` (hero values in HANDOFF.hero) |
| 4 | Intro | 4-line statement mask reveal (fade-up family), stats, secondary copy + link, parallax image | asymmetric: small 1:1 visual left, metrics lower-left, large statement right, **phrase inking by scroll** | replace reveal by `inkPhrases`; drop secondary paragraph or move under; metrics `verified:false` (done in site.ts) |
| 5 | Intro→Benefits | none (next section scrolls in) | thumbnail grows into the full stage | `enter="grow"` rect + intro `exit="recede"` |
| 6 | Benefits | full-bleed 100 vw photo + blurred copy + scrim; heading block above cards | photo inside stage; translucent warm cards; active = brighter; names 001–006 per brief | move into stage; card names updated (done); keep track logic |
| 7 | Benefits→Services | `.panel-rise` full-width panel radius 30 | panel inset 16 px, radius 18–26, rises while stage pinned; image still visible | `RisingPanel` (inset, `--panel-radius` 22) |
| 8 | Services / Treatments | rows 88/208 px, abstract stone images, link CTA | 76–96 / 170–220 px, dental objects, circle arrow, one expanded; layout interpolates | re-skin with service-* images (done in site.ts), keep FLIP |
| 9 | Treatments→Journey | journey pulled up under services (lift) ✅ concept | panel recedes/lifts while journey prepares | `enter="beneath"` (same concept, via primitive) |
| 10 | Journey | abstract sculpture models; out/in scale .96/1.04, rotateY ±4°, no x | dental models (journey-01…05); out 1→.97 / x −8 / rotY −2°; in 1.025→1 / x 8 / rotY 2°; list shifts so active is at top; thin progress far right | retune values, swap images (done), list shift |
| 11 | Journey→Doctors | doctors panel margin −radius, veil dims journey | doctor stage rises over pinned journey (inset) | `RisingPanel frame="stage"` |
| 12 | Doctors | portrait 4:5 card, stone placeholder portraits, heading above | wide landscape stage, text upper-left, portrait centre-right, avatars bottom-left, no arrows; real clinicians | recompose (asset-map recipe); real doctor-01…04 (done) |
| 13 | Doctors→Results | exit wipe on the card (clip → 42 %) | doctor stage moves up, results rises from underneath | `enter="beneath"` on results; drop exit wipe |
| 14 | Results | derived "before" (tinted copy of after), blurred bg copy, quote | registered real pair, 1 px divider + small handle, tiny labels, restrained placeholder testimonial, warm spill | real pair (done), ambient warm via backdrop, remove internal blur |
| 15 | Results→FAQ | — | intensity drop, results recedes | `exit="recede"` |
| 16 | FAQ | ✅ close (thin rules, one open, height+opacity) | quiet column | keep; `frame="column"` |
| 17 | FAQ→Booking | faq recedes/scales .97 while portrait clip opens | image emerges from below/behind | `grow="y"` + FAQ recede |
| 18 | Booking | 4:5 portrait sticky, clip 35 % | 16:9 authentic smile, clip 30 % → 0, form integrated, bottom-border inputs, dark submit | recompose in stage (image left, fade into form) |
| 19 | Booking→Footer | — | booking lifts to expose quiet footer | footer `enter="beneath"` |
| 20 | Footer | photo texture + drift, big wordmark | warm neutral, no photo, extremely faint wordmark | remove texture (`footer.texture` key to be dropped) |
| 21 | Ambient | none (each section full-bleed) | active image spill outside the stage | ✅ AmbientBackdrop + scene opt-in (phase 1) |
| 22 | Imagery | 23 abstract SVG-rendered "light studies" (fail the dental no-label test) | real dental asset pack | ✅ replaced (phase 1) |

## 7. Accessibility baseline (keep)

Skip link, focus-visible outline, ARIA accordions (services, FAQ), tablist doctors (roving tabindex), role=slider
before/after with keyboard, real labels + inline errors in booking, menu dialog with focus trap + inert, `aria-current`
on nav. All must survive the rebuild.

## 8. Risks for the rebuild

- Sticky stages inside transformed ancestors break: never transform a `.scene` root (only `[data-stage]`).
- `:has()` drives rise tails (Chrome 105+, Safari 15.4+, Firefox 121+). Without it, a rising panel covers the last
  overlap of the previous scene instead of it being pinned — acceptable degradation.
- Existing sections still paint full-bleed backgrounds; they hide the ambient until they are moved into SceneFrame.
- `--header-h` changed (76 → 40 desktop): V2 sections that pad by it (hero, journey head) will shift until rebuilt.
- `.container` is now 1320 max (was 1560).

## 9. Phase-1 changes already made (foundation)

Assets → `src/assets/aurea/` (trimmed, registered) + new keys; placeholder JPGs and scripts removed; site.ts: nav
(4 + menu 7), benefit names 001–006, `verified:false` metrics, new image keys + alts, doctor focus; tokens V3 (+
aliases); `motion/tokens.ts` (DURATION.large 1.05, expand 1.1, wipe, HANDOFF, INTENSITY); `motion/media.ts`
tablet/phone; primitives `components/scene/{SceneFrame,RisingPanel,MaskedMedia,AmbientBackdrop}.astro`,
`styles/scene.css`, `motion/scenes.ts` (initScenes in main.ts); Header capsule; Img per-breakpoint positions.
