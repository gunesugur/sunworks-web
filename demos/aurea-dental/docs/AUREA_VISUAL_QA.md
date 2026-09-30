> Archived V3 reference. Superseded on 2026-10-01 by [Design kit V4](AUREA_DESIGN_KIT_V4.md) and [Motion rule kit V4](AUREA_MOTION_RULE_KIT_V4.md). Do not use this file as the current implementation contract.

# AUREA — Visual QA (V3)

Capture at **1440×1080, DPR 1**, Chromium (Playwright), `npm run build && npx astro preview`. Scroll to each state
with `window.scrollTo` + wait 600 ms (Lenis settle) — or use the QA hooks (`?qa-hero=0|0.5|1`). Save to
`docs/qa/v3/NN-name.png` (not committed if > 400 kB each; keep a contact sheet). Fill every empty cell; "✅ / ⚠️ /
❌ + note". Reference column = the matching reference second (`AUREA_REFERENCE_TIMELINE.md`).

## 1. Semantic states (31)

| # | State | How to reach | Ref t (s) | Pass criteria | Result | Notes |
|---|---|---|---|---|---|---|
| 01 | Hero initial inner image | load, `?qa-hero=0` | 0.0 | 21:9 inner image ≈48 % stage width, white room, nav restrained, headline hidden | | |
| 02 | Hero half-expanded | `?qa-hero=0.5` | 0.5 | bounds (not scale) mid-way, aspect widening, no distortion | | |
| 03 | Hero final | load + 2 s | 1.5 | image fills stage, 2-line 64 px headline lower-left, ONE dark CTA + text link | | |
| 04 | Hero → Intro overlap | intro top at 50 % viewport | 2.3 | hero pinned, scaled ≈.97, dimmed; intro panel over it; both visible | | |
| 05 | Intro 25 % inked | statement progress .25 | 3.0 | first phrases dark, rest ≈.14 | | |
| 06 | Intro 65 % inked | progress .65 | 3.3 | phrase-level, soft edge, no letters/fade-up | | |
| 07 | Intro final | statement fully inked | 3.6 | asymmetric: 1:1 visual left, metrics lower-left, statement right | | |
| 08 | Benefits entry | benefits top at 40 % viewport | 4.0 | image growing out of a window in the white stage | | |
| 09 | Card 2 centred | track progress ≈ .2 | 5.0 | card 002 active (bright surface, dark text), others glass | | |
| 10 | Card 4 centred | track progress ≈ .6 | 6.0 | card 004 active; stage image stable | | |
| 11 | Benefits → Services overlap | services top at 50 % | 8.0 | inset panel (16 px) radius 22 rising over pinned, dimmed stage | | |
| 12 | Treatment 1 active | services list in view | 8.5 | row 01 expanded 208 px, others 88 px, thin rules | | |
| 13 | Treatment transition | click row 3, capture at 300 ms | 9.5 | rows interpolate (no jump), image + text move together | | |
| 14 | Treatment 3 active | after 13 | 10.0 | row 03 expanded, 01 collapsed | | |
| 15 | Journey step 01 | pinned range 0 | 12.5 | "01 / 05", model 01, step list 01 active at top, progress line | | |
| 16 | Journey step 02 | range .25 | 13.3 | number rolled, model 02, list shifted | | |
| 17 | Journey step 03 | range .5 | 14.0 | | | |
| 18 | Journey step 04 | range .75 | 14.8 | | | |
| 19 | Journey step 05 | range 1 | 15.6 | | | |
| 20 | Journey → Doctors overlap | doctors top at 50 % | 16.6 | inset doctor stage rising; journey visible behind edges | | |
| 21 | Doctor 1 | doctors pinned | 17.5 | claim upper-left, portrait centre-right, avatars bottom-left | | |
| 22 | Doctor transition midpoint | click avatar 2, capture 320 ms | 18.7 | directional mask mid-wipe, no flicker | | |
| 23 | Doctor 2 | after 22 | 19.0 | name/specialty updated, ambient follows | | |
| 24 | Doctors → Results overlap | results head .5 | 19.5 | doctor stage lifting, results settling underneath | | |
| 25 | Results final | results pinned | 20.5 | registered pair, 1 px divider, small handle, testimonial, warm spill | | |
| 26 | Slider intermediate | ArrowLeft ×10 | 20.5 | layers aligned, no layout shift, labels readable | | |
| 27 | FAQ | faq in view | 21.8 | quiet column, first item open, thin rules | | |
| 28 | FAQ open | open item 3 | 22.2 | height+opacity+tiny y, one open | | |
| 29 | Booking entry | booking top at 50 % | 23.0 | image emerging from inset(30 % 0) band | | |
| 30 | Booking final | booking in view | 23.5 | image left (authentic smile), form right, bottom-border inputs, dark submit | | |
| 31 | Footer | page end | 24.8 | warm quiet footer exposed by lifting booking, faint wordmark | | |

## 2. Recording

| Test | Method | Result | Notes |
|---|---|---|---|
| Slow full-page desktop scroll | Playwright `recordVideo` 1440×1080, wheel 60 px / 16 ms, → mp4 (ffmpeg) | | |

## 3. Bug audit

| Check | Where to look | Result | Notes |
|---|---|---|---|
| Text / link jitter | nav capsule, sticky stages during Lenis scroll | | |
| Sticky snapping | every pin start/end (hero, benefits, journey, doctors, results) | | |
| Reflow after image load | hero, services thumbs, doctors | | |
| Font CLS | first paint vs fonts ready | | |
| Clip-path flicker | grow (benefits, booking), doctor wipe, hero expansion | | |
| Z-index during hand-off | all 9 hand-offs (dim above content, header above all) | | |
| Horizontal scrollbar | 1440, 1024, 834, 390 | | |
| White flashes | scene boundaries, ambient crossfades | | |
| Duplicate RAF loops | Performance panel: only gsap.ticker (+ Lenis inside it) | | |
| Treatment fighting scroll | scroll after a manual pick (lock 45 vh) | | |
| Before/after drift | drag to 0 / 100 %, resize | | |

## 4. Responsive compositions

| Viewport | Checks | Result | Notes |
|---|---|---|---|
| 1024×768 | stage 932×445 fits; benefits track; journey pin; booking not pinned | | |
| 834×1194 | tablet stage 786×669; benefits native swipe; journey single label | | |
| 390×844 | hero 76svh; no scroll-jack; journey short pin; doctors portrait-first; results stacked; booking image above form; menu overlay | | |

## 5. Global tests

| Test | Question | Result | Notes |
|---|---|---|---|
| Static (animations off / reduced motion) | Is every state complete, readable and excellent without motion? | | |
| Dental identity | Would a stranger say "premium dental clinic" within 3 s on each scene? | | |
| Template | Any bento, glow, icon cards, twin CTAs, giant numbers, 48 px radii, marquee, particles? | | |
| Reference fidelity — how space changes | | | |
| Reference fidelity — how the next scene takes control | | | |
| Reference fidelity — what stays fixed | | | |
| Reference fidelity — where pacing breathes | | | |
| Reference fidelity — active vs inactive | | | |
| a11y | keyboard through nav, rows, journey, doctor tabs, slider, FAQ, form; visible focus; labels | | |

## 6. Second polish pass log

| Area | Change | Before → after |
|---|---|---|
| spacing / crop / stage dims / timing / easing / contrast / active states / wrapping / image scale / overlap length / scroll distance / restraint | | |

## 7. Remaining differences vs reference (honest)

| Difference | Reason |
|---|---|
| | |
