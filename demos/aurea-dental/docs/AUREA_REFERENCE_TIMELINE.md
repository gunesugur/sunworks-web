# AUREA — Reference timeline (motion grammar source)

Source: 25.3 s, 1440×1080 @60 fps screen recording of a third-party dental site. Analysed from 4 fps frames, 2 fps
tiles, 6 fps tiles around every hand-off and edge scans on full-resolution frames. **Grammar only** — its
name, logo, doctors, photos, patients, copy and identity are never copied. All pixel values are measured in the
1440×1080 frame (±4 px) and are the targets the V3 kits translate into tokens.

## 0. Global geometry (constant for the whole video)

| Item | Measured | Notes |
|---|---|---|
| Stage (visible site window) | x 65→1374, y 234→842 → **1310 × 608**, centred (cx 720, cy 538) | = 91.0 vw, 56.3 % of 1080 |
| Side gutters | 65 px left / 66 px right | ambient spill only |
| Top / bottom gutters | 234 / 238 px | ambient spill only |
| Stage corner radius | ≈ 10–12 px (browser-window corners) | kit: `--stage-radius: 12px` |
| Content column inside stage | x 182→1258 → **1076 px**, gutter **116–117 px** (8.9 % of stage) | wordmark, headline, lists, form all align to it |
| Nav row | CTA pill y 245→284 (39 px tall) → 11 px below stage top; wordmark x 182; CTA x 1048→1258 (210 w) | nav sits inside stage top band |
| Nav capsule (links) | x ≈ 562→872 (**≈310 w**), ≈30–34 h, centred on 717 | 4 items: Services · Process · Our Team · FAQ; translucent warm-white, hairline border, no shadow |
| Ambient outside stage | blurred, enlarged copy of what is in the stage; near-neutral in white scenes, grey in clinic/doctor scenes, red/skin in results & booking | reference is much stronger (~.5); brief caps ours at opacity .12 |

The whole site scrolls **inside** the stage; the stage never moves. V3 translates this into: every major scene
centres a 91 vw × ~58 svh stage in a sticky 100 svh wrapper, the nav lives in the stage's top band, and the
fixed ambient layer paints the gutters.

## 1. Second-by-second

| t (s) | Scene | What is FIXED | What MOVES | How control passes / notes |
|---|---|---|---|---|
| 0.0 | Hero load | outer stage (white) + small wordmark above image | inner operatory image **636×370 @ (400,353)** = 48.5 % of stage width, radius ≈ 12, 119 px white top/bottom, 335 px sides | "LUMINO DENTAL"-style wordmark above image (ours: none/quiet) |
| 0.25 | Hero | stage | inner image **≈844×443** | growth is container bounds (not uniform scale): aspect goes 1.72 → 1.90 → 2.15 |
| 0.5 | Hero | stage | inner image **≈898×463** | |
| 0.75 | Hero | stage | inner image **≈1026×509** | ease-in-out; accelerating mid-way |
| 1.0 | Hero | — | image fills stage 1310×608 (radius → stage radius) | total expansion ≈ 1.0–1.1 s from load; no overshoot |
| 1.0–1.5 | Hero | full-bleed image | nav (wordmark, capsule, CTA) + headline 4 lines + sub + CTA appear (fade + small rise) | headline x 182, top y≈386, 4 lines × ~56 px pitch (≈60 px type, lh .94), text block 366 w; ONE dark CTA 204×40 at y≈714 |
| 1.5–2.0 | Hero | everything | nothing | **breath (≈0.5 s)** |
| 2.0–2.7 | Hero → Intro | nav stays (sticky, over image) | hero content scrolls up at page speed; a partner-logo strip then white intro area enter from below | reference = plain scroll; brief asks for sticky + scale .94 + rise (ours is richer) |
| 2.7–3.7 | Intro | thumb (154×102 @ 182,394), eyebrow (y 400), metrics row (y≈656; 4,800+ / 12 yrs / 98 %, ~30 px, 142 px pitch) | statement (x 706, 540 w, ~38 px / 48 px pitch) **inks word-group by word-group** from grey (≈ rgba(20,20,20,.3)) to near-black as it scrolls | LOW intensity; colour change only, no movement |
| 3.7–4.4 | Intro → Benefits | — | **the small intro thumbnail grows (container bounds) into the full-stage clinic image** while statement exits upward; image shown first at left 50 %, then ~75 %, then full | shared-element expansion = strongest hand-off idea in the video; ambient shifts from white to warm grey |
| 4.4–5.0 | Benefits | image (full stage), sign/light line | 4.5 translucent cards slide in from the right on a row; card **290×252**, gap 32, radius ≈ 20, top 260 px below stage top (row occupies 43–84 % of stage height) | cards: glass (white ~35 % + blur), title ~18 px, copy ~11 px at bottom |
| 5.0–7.5 | Benefits (pinned) | image + stage | track translates right→left with scroll (6 cards); the focused card is **solid white**, others glass | active = brighter surface + stronger text, no big scale |
| 7.5–8.2 | Benefits → Services | benefits image & cards stay | white **panel rises from bottom**, inset **17 px** per side (x 82→1358), top radius ≈ 20–22; covers cards; image still visible above | depth: panel over pinned stage, no fade |
| 8.2–8.6 | Services | — | panel settles; heading "All your dental needs, / under one roof." (≈46 px, 2 lines) left, 4-line intro right (x ≈868) | breath |
| 8.6–10.8 | Treatments | list column (1076 w) | list scrolls; **active row expands** (≈118 px collapsed pitch → ≈202 px active), grey surface radius ≈10, title 2 lines ≈36 px, round 70 px object thumb, short copy, dark "Book now" pill; hover/scroll changes active (Teeth Whitening → Braces & Aligners) | nav capsule re-appears on scroll-up; rows have thin rules, index, circle arrow 24 px |
| 10.8–11.5 | Treatments → Journey | — | list ends, cool-grey journey surface arrives; heading "From first call to perfect smile." (~46 px) | soft cut via surface colour change, no hard break |
| 11.5–12.3 | Journey entry | — | heading scrolls away; journey stage locks | |
| 12.3–16.2 | Journey (pinned) | **number** (x 182, ≈62 px, "/05" tiny), **model frame** (450×404 @ 332,308, radius ≈12), step list (x 832→1326, 78 px pitch, label "STEPS" y≈374) | number rolls 01→05; model crossfades with slight drift (a double exposure is visible mid-switch); step list **translates up** so the active step sits at the top; active near-black, inactive very pale; caption under model | 5 steps in ≈4 s of scroll → each step ≈0.8 s; the stage never moves |
| 16.2–17.0 | Journey → Doctors | journey stage (with model) | doctor stage **rises from the bottom over it**, inset 15–16 px (x 80→1360), top radius ≈20; journey visible above it until covered | depth rise, same recipe as Benefits → Services |
| 17.0–18.5 | Doctors | stage | claim (3 lines, ~28 px, white, x 124, y 312) upper-left; portrait centre (face cx ≈752); small bio upper-right (x 1078→1298); 4 avatar circles (≈40 px) bottom-left y≈750; name bottom-left y≈808, specialty centre, "Since 20xx" right | breath (HUMAN) |
| 18.5–19.0 | Doctor switch | text, selector | portrait swap (~0.4 s; reads as a quick mask/cross-dissolve); selected avatar gains ring + dot | brief upgrades to a directional clip-path wipe |
| 19.0–19.8 | Doctors → Results | — | doctor stage **moves up** (bottom radius visible) and the grey results surface is already underneath | lift-off |
| 19.8–21.0 | Results | — | "Real results, / real people." (≈46 px) + right copy; before/after square **476×476 @ (182,364)**, radius ≈16; testimonial card 572×476 white radius ≈16; tiny BEFORE/AFTER pills; 1 px divider + small round handle; arrows ← → on card | ambient turns red/skin (warm) |
| 21.0–21.6 | Results → FAQ | — | results scrolls up; white FAQ surface; intensity drops | recede |
| 21.6–22.6 | FAQ | — | "Common questions." (≈52 px) + copy + small dark pill left; accordion right (x 696→1258, 77 px rows, thin rules, circle icons 24 px); first item open | LOW; plain scroll; breath |
| 22.6–23.3 | FAQ → Booking | — | booking photo emerges from the bottom edge: first a thin horizontal band of face, widening as it scrolls in | image reveal tied to entrance |
| 23.3–24.0 | Booking | stage | photo full-bleed on left ~50 %, fading to white under the form; title (≈44 px, 2nd line grey) x 704; radio chips; pill inputs; 94 px dark round submit | ambient warm (skin) |
| 24.0–25.3 | Booking → Footer | — | booking scrolls up to expose footer: cool grey gradient panel, huge faint wordmark behind, nav/hours/address/contact/social, legal row | VERY LOW |

## 2. Hand-off catalogue (what the reference does → V3 recipe)

| # | Hand-off | Reference behaviour | V3 recipe (motion kit) |
|---|---|---|---|
| 1 | Hero → Intro | plain scroll after a 0.5 s breath | `rise` (short overlap): hero pinned, scale 1→.94, y 0→-6 vh, dim .06; intro panel rises over it |
| 2 | Intro → Benefits | thumb grows into the full stage | `grow` rect: benefits media clip inset(22% 32%) → 0 + scale 1.16→1; intro `recede` |
| 3 | Benefits → Services | panel rises (inset 17, radius 20) over pinned image | `rise` full: benefits stage scale .955, dim .10 |
| 4 | Services → Journey | surface-colour soft cut | `beneath`: journey stage settles .965→1 while services lifts |
| 5 | Journey → Doctors | doctor stage rises (inset 16) over pinned journey | `rise` full, doctors `inset` |
| 6 | Doctors → Results | doctor stage lifts, results already underneath | `beneath` (results pinned head) |
| 7 | Results → FAQ | scroll, intensity drop | results `recede`; FAQ flow |
| 8 | FAQ → Booking | photo band widens from bottom | `grow` y: clip inset(30% 0) → 0; FAQ `recede` |
| 9 | Booking → Footer | booking lifts to expose footer | footer `beneath` (column counter-drift) |

## 3. Active / inactive treatments (reference)

| Element | Active | Inactive |
|---|---|---|
| Benefit card | solid near-white surface, black text | translucent glass (≈35 % white + blur), grey text |
| Treatment row | grey surface (≈#F3F3F2), height ≈202, big title, image, copy, dark pill | 118 px pitch, thin rules, small index, small round thumb, name, circle arrow |
| Journey step | near-black label, at list top | very pale label (≈ #C9CCD0 on light grey), list scrolls up |
| Journey number | current number solid | — (rolls) |
| Doctor avatar | ring + small dot above | plain circle |
| Nav link | darker text (current section) | secondary grey |

## 4. Pacing — where it breathes

HIGH hero (0–1.5) → **breath** 1.5–2.0 → quiet intro inking 2.7–3.7 → HIGH benefits 3.7–7.5 → rise 7.5–8.2 →
**breath** services heading 8.2–8.6 → interactive list 8.6–10.8 → **breath** journey heading 11.0 → HIGH journey
12.3–16.2 → rise → **breath** doctor 17.0–18.5 (human) → switch → results 19.8–21.0 → **breath** FAQ 21.6–22.6 →
finale booking → quiet footer. Every HIGH block is followed by ≥0.4 s of stillness; nothing animates idly.

## 5. Things NOT to copy

Wordmark/name, "LUMIO DENTAL CLINIC" sign in the benefits photo, doctors' faces/names, patient quote/name, copy
lines, partner-logo strip (not in brief — do not add), phone/address, dark "Book free consultation" wording, pill
inputs (brief wants bottom-border inputs), footer gradient in cool blue-grey (ours warm neutral).
