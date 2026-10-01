> Historical contract. Current implementation: [V5 design and motion kit](AUREA_DESIGN_MOTION_KIT_V5.md).

> Archived V3 reference. Superseded on 2026-10-01 by [Design kit V4](AUREA_DESIGN_KIT_V4.md) and [Motion rule kit V4](AUREA_MOTION_RULE_KIT_V4.md). Do not use this file as the current implementation contract.

# AUREA — Design kit V3 (implementation source of truth)

Tone: quiet, precise, architectural, editorial, warm-neutral, human, clinical, modern, controlled. Premium comes
from whitespace, position, rhythm and crop — never size, glow or decoration. Colour comes from photography.
Tokens live in `src/styles/tokens.css` (CSS) and `src/motion/tokens.ts` (GSAP). Values below are what the files
contain; if you need a value that is not here, derive it from these — do not invent.

## 1. Colour

| Token | Value | Use |
|---|---|---|
| `--bg-main` | #F4F4F1 | page / ambient base, column scenes (FAQ) |
| `--bg-soft` | #F8F8F5 | menu overlay, soft panels |
| `--surface` | #FCFCFA | stages, rising panels (Intro, Services), cards on white, form |
| `--surface-muted` | #ECECE7 | Journey stage, Results stage, active treatment row, image placeholders |
| `--text-primary` | #151515 | headings, active states |
| `--text-secondary` | #696965 | body, nav links, inactive labels (AA on all surfaces) |
| `--text-faint` | rgba(20,20,20,.20) | inactive journey steps, decorative numerals only (not for reading text) |
| `--text-ink-start` | rgba(20,20,20,.14) | intro statement inking start |
| `--border-soft` | rgba(20,20,20,.10) | rules, input underlines, capsule border |
| `--border-hair` | rgba(20,20,20,.06) | very quiet separators |
| `--black` | #111 | the one dark CTA, submit, before/after handle |
| `--white` | #FFF | text on photos, CTA text |
| `--glass` / `--glass-active` | rgba(248,248,245,.42) / rgba(252,252,250,.94) | benefit cards inactive / active (with `backdrop-filter: blur(14px) saturate(1.1)`) |
| `--capsule` | rgba(252,252,250,.72) | nav capsule |
| `--scrim-dark` | rgba(17,17,17,.36) | text protection over doctor portraits (gradient, never a flat box) |
| `--dim` | #111 | receding-scene dim layer (opacity .06–.10 by motion) |

V2 names (`--color-bg, -bg-alt, -white, -panel, -surface, -footer, -border, -border-soft, -border-strong, -text,
-text-2, -text-3, -cta, -cta-hover, -cta-text, -accent, -card, -header, -scrim`) remain as **aliases** — existing
code keeps working; new code uses V3 names. Renames: `--color-card` → `--glass`, `--color-header` → `--capsule`.
Forbidden: cyan/neon/purple/blue, gradient text, coloured cards, glow, big shadows (max `0 1px 0 var(--border-hair)`).

## 2. Type (Inter Tight Variable, one family)

| Token | Value | px @1440 · 1024 · 390 | Use (weight / lh / ls) |
|---|---|---|---|
| `--fs-hero` | clamp(52px, 4.4vw, 64px); phones 44px | 64 · 52 · 44 | hero H1 — `--fw-hero` 500 / .94 / -.045em, 2 lines max on desktop |
| `--fs-h2` | clamp(2.125rem, 1.2rem + 2.6vw, 3.5rem) | 56 · 46 · 34 | section headings — 460 / 1.04 / -.032em |
| `--fs-statement` | clamp(1.625rem, 1rem + 1.6vw, 2.5rem) | 39 · 32 · 26 | intro statement — 440 / 1.22 / -.02em |
| `--fs-h3` | clamp(1.75rem, 1rem + 1.8vw, 2.625rem) | 42 · 34 · 28 | active treatment title, doctor claim — 460 / 1.06 |
| `--fs-num` | clamp(2.75rem, 1.75rem + 2.4vw, 4rem) | 62 · 52 · 44 | journey current number — 400, tabular-nums |
| `--fs-h4` | clamp(1.0625rem, 1rem + .25vw, 1.25rem) | 20 · 18 · 17 | card titles, row names — 480 / 1.2 |
| `--fs-stat` | clamp(1.5rem, 1.1rem + 1vw, 2rem) | 32 · 26 · 24 | intro metrics — 440 |
| `--fs-body-lg` | clamp(1rem, .95rem + .2vw, 1.125rem) | 18 · 17 · 16 | lead copy — 400 / 1.5 |
| `--fs-body` / `--fs-body-sm` | 1rem / .9375rem | 16 / 15 | body — lh 1.5–1.6 |
| `--fs-small` / `--fs-button` | .8125rem | 13 | captions, buttons, nav (nav = 12.5) |
| `--fs-label` | .6875rem | 11 | labels — 500, uppercase, ls .12em |

No weights ≥ 600 anywhere. Max 2 type sizes per component besides labels. `text-wrap: balance` on headings.

## 3. Cinematic stage geometry

| Token | Phone < 640 | Tablet 640–1023 | Desktop ≥ 1024 | @1440×1080 |
|---|---|---|---|---|
| `--stage-w` | 100vw − 24px | 100vw − 48px | min(91vw, `--stage-max` 1320px) | 1310 |
| `--stage-h` | 76svh (hero only; other stages auto) | clamp(480px, 56svh, 720px) | clamp(440px, 58svh, 680px) | 626 (ref 608) |
| `--stage-top` | derived: (100svh − stage-h)/2 | | | 227 |
| `--stage-radius` | 10px | 12px | 12px | |
| `--stage-inset` (rising stages/panels narrower per side) | 6px | 10px | 16px | panel 1278 |
| `--panel-w` | stage-w − 2·inset | | | 1278 |
| `--panel-radius` | 16px | 18px | 22px | |
| `--stage-pad-x` (content gutter inside stage/panel) | 20px | 40px | clamp(48px, 8vw, 116px) | 115 (ref 116) |
| `--stage-pad-y` | 20px | 32px | clamp(24px, 4.4svh, 48px) | 48 |
| `--media-radius` | 10px | 12px | 12px | |
| `--card-radius` | 18px | 20px | 20px | |
| `--header-top` / `--header-h` | 10 / 56 | 14 / 60 | max(16px, stage-top + 16px) / 40 | 243 / 40 |

At 1440×1080 the content column inside a stage is 1310 − 2·115 = **1080 px** (reference 1076). 1024×768:
stage 932×445, pad 82. 834×1194: stage 786×669, pad 40. 390×844: stage 366 wide, hero 641 tall.
Stages are **not** forced identical: `height="auto"` stages (Booking, Results on small heights) grow with content
(min `--stage-h`) and are never pinned when taller than the viewport.

## 4. Radii & spacing

Radii: `--radius-xs` 6 · `-sm` 10 · `-md` 12 · `-lg` 18 · `-xl` 22 · `-round` 999 (buttons, capsule, avatars only).
(V2 values md 18 / lg 24 / xl 30 were reduced; the brief forbids 48 px and "rounded-3xl everywhere".)
Spacing scale `--space-1…10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. `--section-pad` clamp(72px…160px),
`--section-pad-sm` clamp(48px…96px). Inside stages use `--stage-pad-*`, never section pads.

## 5. Surfaces (per scene)

| Scene | Frame | Surface | Ambient |
|---|---|---|---|
| Hero | stage (pinned) | `--surface` then full-bleed photo | hero-operatory |
| Intro | rising **panel** (short overlap) | `--surface` | — |
| Benefits | stage (pinned, grow) | `--surface` → photo | benefits-clinic |
| Services + Treatments | rising **panel** (inset) | `--surface` | — |
| Journey | stage (pinned, beneath) | `--surface-muted` | — |
| Doctors | stage, **inset**, rising | photo (+ blurred self-backdrop) | doctor-0N (follows selection) |
| Results | stage, beneath, `height="auto"` | `--surface-muted`, card `--surface` | result-after (warm) |
| FAQ | column | none (`--bg-main`) | — |
| Booking | stage (grow y), `height="auto"` | `--surface` | booking-patient |
| Footer | column, beneath | `--bg-soft` block, radius top `--panel-radius` | — |

## 6. Ambient layer recipe (AmbientBackdrop)

One fixed layer behind `<main>`/`<footer>` (z 0; content z 1). Per registered image: 96 px WebP, `inset:0`,
`transform: scale(1.25)`, `filter: blur(60px) saturate(.65)`, opacity 0 → **.12** (warm **.16**) when its scene is
active; `transition: opacity 1050ms var(--ease-soft)`. A radial overlay `radial-gradient(130% 110% at 50% 50%,
transparent 45%, var(--bg-main) 100%)` dissolves the edges into warm white. Only Hero, Benefits, Doctors, Results,
Booking register; all other scenes → no layer (plain `--bg-main`). Hidden < 640 px. Scene wrappers must stay
**transparent** — only the stage/panel paints a surface — or the spill disappears.

## 7. Component language

- **Nav capsule** (implemented, `Header.astro`): wordmark left (12 px, ls .22em, 500), capsule centred (36 px tall,
  6 px inner pad, items 28 px tall · 12 px h-pad · 12.5 px · `--text-secondary`, current = `--text-primary` +
  rgba(20,20,20,.05) fill), `--capsule` + blur 14 + 1 px `--border-soft`, no shadow; CTA right = small dark pill
  "Book a consultation". Header row aligned to the stage content column, top = stage top + 16 px. Hides on scroll
  down (after 60 vh), returns on scroll up / focus. < 1024: bar capsule (wordmark · CTA ≥ 640 · Menu) → editorial
  overlay listing all 7 destinations (+ About, Technology, Results).
- **Buttons**: exactly ONE dark primary per viewport (`Button variant="primary"`, #111, 13 px, circular arrow).
  Secondary actions = `variant="link"` quiet text with growing underline. Never twin pills.
- **Labels**: 11 px uppercase ls .12em `--text-secondary`, optional 5 px dot. Index numbers "001"/"01" in labels.
- **Benefit card**: 300×236 (desktop; tablet 272×224; phone 78vw×216), radius 20, padding 22, index label top,
  title `--fs-h4` + 2-line copy 13 px bottom; inactive `--glass` + blur 14, text secondary; active `--glass-active`,
  text primary, scale ≤ 1.035. No icons, no shadows.
- **Treatment row**: collapsed 88 px (desktop; tablet 80; phone 72): index label · 56 px round thumb · name
  `--fs-h4` · 28 px circle arrow; 1 px `--border-soft` rules, no cards. Active 208 px: `--surface-muted` fill,
  radius `--radius-md`, title `--fs-h3` (2 lines), 176 px image (radius 12), 2-line copy, link action
  "Book this treatment". Height interpolates (FLIP), never jumps.
- **Journey**: number `--fs-num` + "/ 05" label; model frame radius 12 on `--surface-muted`; step list rules
  `--border-soft`, 72 px pitch, active `--text-primary`, inactive `--text-faint`; 1 px × 96 px progress line at the
  stage's right edge (fill `--text-primary`).
- **Doctor selector**: 40 px avatar circles, 12 px gap, bottom-left; active = 1 px white ring + 4 px dot above;
  name 13 px white, specialty 11 px label. No arrows, no carousel dots.
- **Before/after**: 1 px white divider, 36 px `--black` circular handle with ⟷ glyph, BEFORE/AFTER 10 px labels
  on rgba(17,17,17,.45) pills in the top corners. Keyboard: ←/→ 2 %, Shift 10 %, Home/End.
- **Accordion (FAQ)**: 1 px rules, 76 px rows, 16 px question, 22 px circle +/– icon, answer 15 px secondary.
- **Form**: real `<label>`s (11 px labels), inputs with bottom border only (1 px → 1.5 px `--text-primary` on
  focus), interest chips = 32 px pills with 1 px border (selected: `--black` fill), submit = 56 px dark circle with
  arrow + visible text label for a11y.
- **Footer**: `--bg-soft`, 4 columns (identity, nav, services, hours/contact), legal row 12 px, extremely faint
  wordmark (opacity .04, `--fs-h2`×3 max). No photo, marquee, glow, gradient.
- **Focus**: 2 px `--text-primary` outline, 3 px offset (white on photos).

## 8. Per-scene composition (desktop 1440×1080 · tablet 834×1194 · phone 390×844)

| Scene | Desktop | Tablet | Phone |
|---|---|---|---|
| Hero | stage 1310×626; inner 21:9 image starts at 48 % of stage width (≈630×270) centred on white, then fills the stage; headline at x = pad-x in the lower-left third, 2 lines (≈ 22–26 ch each), sub 15 px ≤ 2 lines, one dark CTA + quiet text link | stage 786×669, image fills after intro, headline bottom-left over a bottom scrim | 76svh stage, image fills, headline under image (outside stage) — no overlay text on phone |
| Intro | panel: 4-col grid inside pad-x: col 1 = clinic-detail 1:1 (184 px) at top, metrics row at bottom (3 × 142 px); cols 2–4 = label + statement (max 22 ch/line, ~600 px) starting at 50 % | image 160 left, statement right 60 % | stacked: label, statement, image 128 + metrics row |
| Benefits | stage photo full; heading top-left inside pad (h2 2 lines), counter "03 / 06" + intro top-right; card row top at 44 % of stage height | stage photo, native horizontal swipe row (scroll-snap), no pin | photo band 16:10, then swipe row on `--surface` |
| Services | panel: heading left (h2 2 lines), intro right 32 ch; list full column | same, intro under heading | stacked, rows tap |
| Journey | stage: number col 2/12 left, model frame 440×400 at 3/12→7/12, caption under, steps list 8/12→12/12, progress far right | number top-left, model centre, steps as a single swapping label below | shorter pin (225 vh): number + model + label stacked |
| Doctors | inset stage: claim h3 upper-left (3 lines, white), bio upper-right 32 ch, portrait centre-right, selector bottom-left, name/specialty/since bottom row | portrait cover, text top, selector bottom | 4:5 card, text + selector below |
| Results | stage auto: h2 left + copy right on top row; slider 500² left, testimonial panel right (same height, `--surface`, radius 16) | slider full width, testimonial below | stacked |
| FAQ | column: left 4/12 h2 + copy + link; right 7/12 accordion | same ratios 5/7 | stacked |
| Booking | stage auto: image left 55 % (fades to surface), form right 45 % inside pad | image 16:9 above form | image 4:3 above form |
| Footer | column block radius top 22 | 2 cols | 1 col |
