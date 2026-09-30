> Archived V3 reference. Superseded on 2026-10-01 by [Design kit V4](AUREA_DESIGN_KIT_V4.md) and [Motion rule kit V4](AUREA_MOTION_RULE_KIT_V4.md). Do not use this file as the current implementation contract.

# AUREA — Motion rule kit V3 (implementation source of truth)

Goal: ONE continuously directed film. A scene never "ends and fades"; the next scene physically takes the
viewport (rises over, lies beneath, grows out of, or receives the previous). All hand-offs are **declared** on
`<SceneFrame>` and **built** in one place (`src/motion/scenes.ts`). Sections only choreograph their own interior.

## 1. Tokens

| CSS | GSAP (`motion/tokens.ts`) | Value | Use |
|---|---|---|---|
| `--ease-primary` | `EASE.primary` ('aurea.primary') | cubic-bezier(.22,1,.36,1) | every time-based move |
| `--ease-soft` | `EASE.soft` | cubic-bezier(.33,1,.68,1) | opacity, colour, UI |
| — | `EASE.linear` ('none') | — | every scrubbed timeline |
| `--duration-fast` | `DURATION.fast` | 220 ms | hover, small UI |
| `--duration-ui` | `DURATION.ui` | 320 ms | accordion, chips, capsule |
| `--duration-medium` | `DURATION.medium` | 650 ms | text/line reveals, row FLIP |
| `--duration-large` | `DURATION.large` | 1050 ms | ambient crossfade, masked reveals |
| — | `DURATION.expand` | 1.1 s | hero inner-image expansion |
| — | `DURATION.wipe` | 0.65 s | doctor mask wipe (550–750) |
| — | `STAGGER.lines` / `.items` | 60 / 50 ms | headline lines (40–80 allowed) / lists |
| — | `HANDOFF.*` | see §4 | hand-off magnitudes (never hard-code) |

Forbidden: elastic/back/bounce/spring/overshoot, idle floating/looping, rotation beyond ±2°, blur animation,
animating width/height/top/left on scroll (use transform / opacity / clip-path; FLIP for layout changes).
Rule: every large animation must change a spatial relationship. "Fade in" alone is only for ≤ 16 px details.

## 2. Intensity & rhythm

| Scene | Intensity | Vocabulary allowed | Rhythm slot |
|---|---|---|---|
| Hero | HIGH | inner-image expansion, line masks, rise-over | cinematic |
| Intro | LOW–MED | phrase inking, small clip reveal of thumb | quiet |
| Benefits | HIGH | grow, pinned horizontal track, active card | cinematic |
| Services / Treatments | MED–HIGH | rise-over, row FLIP expand | interactive |
| Journey | HIGH | lift-off entry, pinned state machine (number roll, model swap, list shift) | cinematic |
| Doctors | MED | rise-over, directional mask wipe | human |
| Results | MED | lift-off, draggable divider | interactive |
| FAQ | LOW | accordion only, no scroll choreography | quiet |
| Booking | MED | grow (y), field stagger | finale |
| Footer | VERY LOW | beneath counter-drift only | quiet |

Breaths (no motion, ≥ 0.4 s / ≥ 25 vh): after hero reveal, services heading, journey heading → pin, doctor
(len-doctors), FAQ.

## 3. Primitive APIs

### 3.1 `<SceneFrame>` — `src/components/scene/SceneFrame.astro`
```astro
<SceneFrame name="journey" section="journey" id="journey" labelledby="journey-title"
  frame="stage" height="stage" pin="all" length="var(--len-journey)"
  enter="beneath" exit="none" tone="muted">
  …stage content (absolute/grid inside .stage)…
  <Fragment slot="after">…content that must live outside the stage…</Fragment>
</SceneFrame>
```
| Prop | Values (default) | Effect |
|---|---|---|
| `name` | string (req.) | `data-scene`; hero/intro/benefits/services/journey/doctors/results/faq/booking/footer |
| `section` | string | `data-section` → `src/scripts/sections/<section>.ts` is lazy-loaded (registry) |
| `as` | section \| footer \| div (`section`) | root tag |
| `frame` | stage \| panel \| column (`stage`) | stage: 100svh wrapper `.scene__pin` + `.stage[data-stage]`; panel: flow `.panel[data-stage]` (`--panel-w`); column: `.scene__column[data-stage]` (no surface) |
| `height` | stage \| fixed \| auto (`stage`) | stage: `--stage-h` ≥ 640, auto on phones · fixed: `--stage-h` everywhere (hero, journey) · auto: min `--stage-h`, grows (booking, results) |
| `pin` | tablet \| desktop \| all \| none (`tablet`) | where `.scene__pin` is `position: sticky; top:0; height:100svh`. Never under reduced motion |
| `length` | CSS length (`0px`) | `--scene-len`: extra pinned scroll for the scene's own choreography (use the `--len-*` tokens) |
| `inset` | boolean | stage `--panel-w` wide + `--panel-radius` (rising stages: doctors) |
| `enter` | flow \| rise \| beneath \| grow (`flow`) | hand-off INTO this scene (§4) |
| `overlap` | full \| short (`full`) | rise overlap = `--overlap-rise` or 60 % of it (hero → intro) |
| `exit` | none \| recede | hand-off OUT of this scene (§4) |
| `ambient` / `ambientTone` | ImageKey / neutral \| warm | registers with AmbientBackdrop |
| `tone` | surface \| muted \| bg \| soft \| photo (`surface`) | `--scene-surface` of stage/panel |
| `class`, `stageClass` | | extra classes on root / stage |

Pinned scene height (CSS, automatic): `100svh + --scene-head + --scene-len + --scene-tail`.
`--scene-head` = `--overlap-beneath` when `enter="beneath"` (stage); `--scene-tail` = the next scene's rise
overlap (set by `:has(+ [data-enter=rise])`). **A `rise` scene must follow a pinned stage scene.**
Hooks inside: `[data-stage]` (the moving surface), `[data-scene-dim]` (dim overlay, z 20), `[data-recede]`
(optional: elements that recede instead of the whole stage).

### 3.2 `<RisingPanel>` — `src/components/scene/RisingPanel.astro`
`<RisingPanel name="services" section="services" id="services" labelledby="services-title">…</RisingPanel>` =
SceneFrame with `enter="rise"`, `frame="panel"`, `inset` by default. For a rising pinned stage pass `frame="stage"`.

### 3.3 `<MaskedMedia>` — `src/components/scene/MaskedMedia.astro`
```astro
<MaskedMedia image="benefits-clinic" alt="" sizes="92vw" fill grow="rect"
  positions={{ desktop: '50% 58%', tablet: '64% 50%', mobile: '66% 50%' }} radius="stage" />
```
Props: `image, alt, sizes, widths?, priority?, quality?, fill?` (absolute inset 0) or `ratio?` ('1 / 1'),
`grow?: 'rect'|'y'|'x'`, `position? | positions?`, `radius?: 'media'|'stage'|'none'`, `attrs?` (extra data-*),
default slot (overlays). Hooks: `[data-masked-media]`, `[data-mm-inner]` (scale target). Grow start states are in
CSS (≥ 640 + motion) so nothing flashes.

### 3.4 `<AmbientBackdrop>` — `src/components/scene/AmbientBackdrop.astro`
Placed once in `index.astro` with `sources={[{ key, tone? }]}` (already: hero-operatory, benefits-clinic,
doctor-01…04, result-after warm, booking-patient). Scenes opt in with `ambient="key"`. To follow a state change
(doctor switch): `scene.dataset.ambient = 'doctor-03'; ambientChanged();` (from `motion/scenes.ts`).

### 3.5 `motion/scenes.ts`
| Export | Signature | Use |
|---|---|---|
| `initScenes` | `(root = document) => cleanup` | called by `main.ts` after section modules; builds every declared hand-off + ambient |
| `scenePin` | `(scene, vars?: ScrollTrigger.Vars) => ScrollTrigger` | the scene's OWN scrub range = after `--scene-head`, over `--scene-len` (px measured on refresh). Pass `animation` or `onUpdate`. Call inside `withMotion` |
| `maskWipe` | `(out, next, { forward?, duration?, reduce? }) => Timeline` | directional clip-path swap (doctors) |
| `inkPhrases` | `(container, { start?, end? }) => ScrollTrigger` | intro statement: `[data-ink]` phrase spans get `--ink` 0→1 sequentially (CSS maps colour .14→1) |
| `ambientChanged` | `() => void` | re-evaluate ambient after changing `data-ambient` |
| `lengthPx` | `(el, '--prop') => px` | resolve a length custom property (refresh-time only) |

### 3.6 `motion/media.ts` — `withMotion(scope, ({ desktop, tablet, phone, mobile, reduce }) => cleanup?)`
desktop ≥ 1024 + motion · tablet 640–1023 + motion · phone < 640 + motion · mobile = tablet || phone · reduce.

## 4. Hand-off recipes (exact)

All scrubbed with `scrub: true`, `ease: 'none'`, built by `initScenes` for **desktop + tablet** (phones: flow; only
`grow` runs, time-based). Values from `HANDOFF` in `motion/tokens.ts`.

| Name | Declared as | Trigger / start → end | Properties |
|---|---|---|---|
| **rise** | incoming `enter="rise"` | incoming root, `top bottom` → `top top` (= overlap distance) | outgoing `[data-stage]` scale 1 → .955, yPercent 0 → −2; outgoing `[data-scene-dim]` 0 → .10. Hero outgoing: scale 1 → .94, y 0 → −6 vh, dim 0 → .06. Incoming moves by document flow (negative margin, z 2) |
| **beneath (stage)** | incoming `enter="beneath"` + frame stage | incoming root, `top top` → `+= --scene-head` | incoming `[data-stage]` scale .965 → 1, yPercent 6 → 0; incoming dim .10 → 0. Outgoing lifts by flow (z above) |
| **beneath (column)** | `enter="beneath"` + frame column | incoming, `top bottom` → `bottom bottom` | incoming `[data-stage]` y −22 vh → 0 (appears to sit under the lifting scene) |
| **grow** | incoming `enter="grow"` + `<MaskedMedia grow>` | incoming root, `top bottom` → `top top` | media clip `rect` inset(22% 32% 22% 32% round 14px) / `y` inset(30% 0 30% 0) / `x` inset(0 30% 0 30%) → inset(0); `[data-mm-inner]` scale 1.16 → 1. Phones: once at `top 85%`, 1050 ms ease-primary |
| **recede** | outgoing `exit="recede"` | outgoing root, `bottom bottom` → `bottom top` | `[data-recede]` (or stage) y 0 → −8 vh, opacity 1 → .4 |

### The nine hand-offs (declarations the section agents must use)

| # | From → To | Declaration | Distance desktop · tablet · phone | Notes |
|---|---|---|---|---|
| 1 | Hero → Intro | Hero `frame=stage height=fixed pin=tablet`; Intro `RisingPanel overlap="short"` | 60 svh · 42 svh · flow | hero values (.94 / −6 vh / .06). Intro panel radius 22 top; its head (label + first statement line) must be visible within the first 30 vh of the rise |
| 2 | Intro → Benefits | Intro `exit="recede"` (on `[data-recede]` = statement column); Benefits `enter="grow"` with `MaskedMedia fill grow="rect"` | 100 vh (entry) · 100 vh · once | ambient crossfades white → benefits-clinic as benefits reaches 60 % |
| 3 | Benefits → Services | Benefits `length="var(--len-benefits)"`; Services `RisingPanel` (inset) | 100 svh · 70 svh · flow | cards dim with the stage; panel covers from below |
| 4 | Services → Journey | Journey `enter="beneath" pin="all" height="fixed"` | head 60 svh · 50 svh · 0 | journey stage settles while services' bottom edge lifts past |
| 5 | Journey → Doctors | Doctors `RisingPanel frame="stage" height="stage" length="var(--len-doctors)"` | 100 svh · 70 svh · flow | journey visible behind the inset (16 px) edges → depth |
| 6 | Doctors → Results | Results `enter="beneath" height="auto" length="var(--len-results)"` | head 60 svh · 50 svh · 0 | doctor stage lifts off; results settles underneath |
| 7 | Results → FAQ | Results `exit="recede"`; FAQ `frame="column"` flow | 100 vh · 100 vh · — | ambient fades out (FAQ has none) → intensity drop |
| 8 | FAQ → Booking | FAQ `exit="recede"`; Booking `enter="grow"` + `MaskedMedia grow="y"` | 100 vh · 100 vh · once | booking stage `height="auto" pin="none"` (form must never be trapped in a pin) |
| 9 | Booking → Footer | Footer `SceneFrame as="footer" frame="column" enter="beneath"` | footer height · same · — | footer drifts −22 vh → 0 under the lifting booking |
| (+) | Treatments → Journey heading | services last row → journey `beneath` | — | counts with #4; no hard break, no fade-only |

## 5. Scene interiors (section agents)

Scroll lengths are the `--len-*` tokens (tokens.css): desktop · tablet · phone.

| Scene | Own scroll | Choreography (exact) | Tablet / phone | Reduced motion |
|---|---|---|---|---|
| Hero | 0 (+ tail) | **Load timeline** (not scroll): wait for `img.decode()` (max 900 ms). t0 inner image window 48 % of stage width × 21:9, centred, radius 12. 0.15 s → 1.25 s: window bounds interpolate to the full stage via clip-path inset on the full-size MaskedMedia (inset from measured rects, `round 12px → round 0`) + inner scale 1.08 → 1 (DURATION.expand, EASE.primary). Header fade+y −8 → 0 at 0.95 s; headline lines translateY 110 % → 0, stagger 60 ms at 1.0 s; sub + CTA at 1.25 s. No scroll lock longer than the timeline; any wheel/touch/key → `tl.progress(1)`. QA: `?qa-hero=0|0.5|1` freezes `tl.progress()` | tablet same; phone: image already full (76 svh), lines only | final state, opacity 300 ms |
| Intro | flow | `inkPhrases(statement, { start: 'top 80%', end: 'bottom 45%' })`; statement split into 5–7 semantic phrase `<span data-ink>`; thumb `data-reveal="clip"`; metrics fade (stagger) | same | fully inked |
| Benefits | 180 vh · 0 · 0 | `scenePin(root, { animation: tl, scrub: 0.6 })`, track x from `stageW·0.62 − c0` to `stageW·0.42 − c5` (centres measured on refresh); per-frame `--focus` 0…1 from rendered x (ticker only while active) → inactive `--glass`, active `--glass-active` + scale ≤ 1.035 + text primary. No autoplay | tablet/phone: native scroll-snap row (`tabindex=0`, region label), IO marks active | swipe row |
| Services | flow | accordion FLIP (existing `services.ts` logic): collapsed 88 → active 208 px, 650 ms EASE.primary; optional scroll→active mapping ≥ 640 with interaction lock (manual pick holds until 45 vh away) | tap only on phone | instant switch, opacity |
| Journey | 240 vh · 200 vh · 200 vh | `scenePin` scrubbed state machine, 5 states, 4 transitions each 1/4 of the range (transition occupies the middle 50 % of its quarter → still plateaus). Number: masked roll old yPercent 0 → −100, new 100 → 0. Model out: opacity 1→0, scale 1→.97, x 0→−8, rotateY 0→−2°; in: opacity 0→1, scale 1.025→1, x 8→0, rotateY 2°→0 (perspective 1200). Step list: translateY so active row sits at list top; active `--text-primary`, others `--text-faint`. Progress line scaleY = progress | tablet: single swapping label; phone: number + model + label | stacked list, all 5 visible |
| Doctors | 40 vh · 30 vh · 0 | click / keyboard (tablist, roving tabindex, ←/→/Home/End) → `maskWipe(out, in, { forward: newIndex > old })` 650 ms; name/specialty y 8 → 0 + opacity (320 ms, 80 ms delay); `ambientChanged()` with new doctor key | same; phone: portrait-first, wipe kept | opacity crossfade |
| Results | 30 vh · 0 · 0 | slider: pointer capture drag, `--pos` custom property only (no layout), keyboard role=slider; divider 1 px; no auto-sweep beyond one 600 ms hint | stacked | no hint |
| FAQ | flow | accordion height (measured) + opacity + y 6 → 0, 380 ms EASE.primary; one open | same | height instant, opacity |
| Booking | 0 | grow (hand-off 8); heading lines + field stagger 50 ms via reveals | image above form | static |
| Footer | 0 | hand-off 9 only | — | static |

### 5.1 As built — Hero → Services (phase 2A; no primitive/token changes)

- **Hero**: the window's inner image refits like `object-fit: cover` while the clip opens — inner scale starts at
  `max(windowW/stageW, windowH/stageH)·1.04` (≈ .50) → 1 instead of 1.08 → 1, so the whole operatory is visible in
  the small window (reference f001) and the growth reads as bounds + refit, never a uniform frame scale. CSS start
  state `html:not(.is-ready) .hero__media` (≥640 + motion) prevents a first-paint flash. The header's
  `[data-intro]` is removed after its fade so its own hide-on-scroll CSS works (no inline opacity left behind).
  QA: `?qa-hero=0 | 0.16 (≈ half-expanded) | 1`.
- **Intro → Benefits**: the intro root has `margin-bottom: calc(-1 * var(--stage-top))` (≥640 + motion) so the
  panel's lower edge meets the Benefits stage's upper edge — the photo grows inside a surface that continues the
  intro instead of after an ambient gap. `[data-recede]` = the statement column only (the panel stays).
- **Benefits**: during the grow range (`top bottom → top top`) the card row travels in from the right
  (viewport x .28·stageW → 0, opacity 0 → 1) and the heading settles in the last third (y 24 → 0) — interior
  choreography riding hand-off 2, not a separate reveal. Row top = `max(44 %, header band + 150 px)` so short
  stages (1024×768) never put cards under the heading. Native rows mark the leftmost fully visible card active.
- **Services**: scroll → active mapping band is `top 60% → bottom 60%` (the active row sits just under the
  heading, as in the reference); manual pick / keyboard focus lock = 45 vh. Active title line-masks in
  (yPercent 105 → 0, 650 ms); the media FLIP also interpolates its corner radius (round thumb → 12 px) in
  last-layout units so the scaled image never shows distorted corners.

### 5.1 Additions — Journey → Footer (phase 2B, additive; no primitive/token changed)

- **Journey heading lift**: the heading lives at the top of the journey stage and lifts out of it during the first
  14 % of `--len-journey` (`[data-journey-track]` y 0 → −head height, measured on refresh); the 4 transitions share
  the remaining 86 % (each in the middle 50 % of its quarter). The stage itself never moves.
- **Journey stays pinned under the doctors breath**: `.journey` `--scene-tail` = `--jd-overlap + --len-doctors` and
  `.doctors` `margin-top` = −(`--jd-overlap + --len-doctors`), with `--jd-overlap` = 100 svh on ≥ 640 + motion
  (= `--overlap-rise` otherwise, i.e. 0 on phones / reduced). Without it the covered journey slid into view above the
  inset doctors stage during `--len-doctors`, and on tablet (overlap 70 svh) it unpinned before being covered. The
  `rise` recipe itself is unchanged (trigger `top bottom → top top`). Declared in TreatmentJourney/DoctorsShowcase CSS.
- **Doctors layers**: each doctor = one `<MaskedMedia fill radius="none">` (low-res self-backdrop, blurred in CSS) with
  the real 4:5 portrait in its slot (feathered edges, centre-right). `maskWipe` swaps whole layers; the switch waits
  ≤ 350 ms for an undecoded portrait so a wipe never reveals an empty frame.
- **Results hint** triggers on the scene root (`top -45%` ≥ 640), not on the frame inside the CSS-sticky stage.
- **Booking**: `MaskedMedia fill grow="y"` inside a positioned `.booking__visual` (left 55 % ≥ 1280, 52 % 1024–1279;
  16:9 / 4:3 above the form below 1024) with a right-edge fade to `--surface` in the media slot.
- **Footer**: `footer.ts` module removed (texture gone); motion = `beneath` column counter-drift only.

## 6. Reduced motion (`prefers-reduced-motion: reduce`)

No Lenis, no pins (CSS: `.scene__pin` static, lengths/overlaps 0), no scrubs, no parallax, no grow clips (start
states only apply under `no-preference`), inking = fully inked, hero = final frame. Keep: opacity fades ≤ 300 ms,
all information, all interactions (accordions, slider, doctor tabs, treatment rows, menu), ambient crossfade
(opacity only, 320 ms). Every state must be complete and readable with animations off (static test).

## 7. Performance & correctness rules

1. One Lenis (`motion/smooth-scroll.ts`: lerp .1, `gsap.ticker` drives `lenis.raf`, `lenis.on('scroll', ScrollTrigger.update)`, `lagSmoothing(0)`). No second RAF loop; per-frame work via `gsap.ticker` only while the scene is active.
2. Never read layout (getBoundingClientRect/offset*) in scroll callbacks — measure in `onRefreshInit`/`onRefresh`/refresh-time closures; use `invalidateOnRefresh` for function values.
3. Stages are CSS sticky; **no `pin: true`** (no pin-spacer reflow, no jitter with Lenis).
4. Animate transform / opacity / clip-path / CSS custom properties consumed by those only. FLIP for size changes.
5. Every `ScrollTrigger`/tween inside `withMotion` (auto-revert on breakpoint change) and every module returns a cleanup.
6. Images: hero `priority`; everything else lazy with honest `sizes`; doctors 02–04 and results never full-res up front; ambient uses 96 px derivatives.
7. `will-change` only during an animation (GSAP adds/removes via `force3D`), except the ambient layers (static).
8. After async layout changes (fonts, lazy images, accordion) call `ScrollTrigger.refresh()` debounced — main.ts already refreshes on fonts/load/lazy images.
9. Z-order during hand-offs: base scene z 1, `rise` z 2, `beneath` z 0, dim overlay z 20 inside the stage, header z 50, menu z 60. Scene wrappers transparent (ambient must show), only stage/panel paints.
10. No horizontal overflow: stages are ≤ 100vw − 24 px; body `overflow-x: clip`.

## 8. Section-module contract (unchanged)

`<SceneFrame section="x">` → `src/scripts/sections/x.ts` exports `init(root): void | cleanup`, registered with one line in
`scripts/sections/registry.ts`, queries inside `root`, builds motion in `withMotion`, uses only kit tokens.
