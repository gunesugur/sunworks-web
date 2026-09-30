# AUREA — Asset map (V3)

Pack: `AUREA_asset_pack_v1` (23 WebP files). **Location deviation:** the brief's `/public/aurea-assets/` is replaced
by `src/assets/aurea/` (same sub-structure) so Astro's `<Picture>` (via `src/components/ui/Img.astro`) emits
responsive **AVIF `<source>` + WebP `<img>`** with width/height at build time (no CLS, no oversized downloads).
Keys live in `src/lib/images.ts`. Old abstract placeholders (`src/assets/images/*.jpg`) and their generator
scripts were deleted.

**Pre-processing (done once, masters in repo):** several masters had edge artefacts (a white 5–20 px band and/or a
dark 1–5 px line from the generator's canvas). They were trimmed and re-cropped **to the original ratio**
(WebP q92). `results/before` + `results/after` received the **identical** crop (0,15,1170,1170) so they stay
registered. Nothing else was altered (no grading, no retouch).

**No-label test** = "without any text, does this read instantly as premium dental?" ✅ pass · ⚠️ pass with caveat · ❌ fail.

Breakpoints: phone < 640 · tablet 640–1023 (834×1194 reference) · desktop ≥ 1024 (1440×1080 reference).
`positions` = `Img`/`MaskedMedia` prop `{ mobile, tablet, desktop }` → object-position.

## Wide / hero images

| Key (file) | Master (after trim) | Slot | Display box (desktop · tablet · phone) | object-position (desktop · tablet · phone) | Verdict / notes |
|---|---|---|---|---|---|
| `hero-operatory` (hero-operatory.webp) | 1659×711 (21:9) · trimmed R21 B5 | Hero inner image (grows into the stage); OG image | start 21:9 window ≈ 48 % stage width → full stage 1320×626 (2.1:1) · stage 786×668 (1.18) · 366×76svh (≈0.57) | `55% 55%` · `44% 62%` · `40% 62%` | ✅ Bright operatory, chair + light + garden window. Keep chair (x 35–68 %) and lamp (x 55–62 %, y 8–25 %) in frame; never crop chair back. `priority` (eager, fetchpriority high), widths 768–2400. |
| `benefits-clinic` (benefits-clinic.webp) | 1671×716 (21:9) · trimmed B4 | Benefits stage background (grows from intro thumb); ambient layer | stage 2.1:1 · stage 786×668 · 16:10 band above native-swipe cards | `50% 58%` · `64% 50%` · `66% 50%` | ✅ Reception + glass-walled operatory. Cards occupy the lower 45 % of the stage → keep the operatory (x 60–95 %) visible above/between cards. Tablet/phone crop toward the operatory (chair = dental cue). |
| `clinic-detail` (clinic-detail.webp) | 1182×1182 (1:1) · trimmed L18 | Intro small visual (lower-left of statement) | 1:1, 168–200 px · 1:1 160 px · 1:1 128 px | `50% 50%` all | ✅ Handpieces on the unit — unmistakably dental, calm. Radius `--media-radius`. |
| `booking-patient` (booking-patient.webp) | 1590×894 (16:9) · trimmed R10 | Booking image (grows from inset(30% 0)); ambient layer | left ≈55 % of stage, ≈720×626 (1.15), right edge fades to `--surface` under the form · 16:9 above form · 4:3 above form | `36% 38%` · `42% 36%` · `40% 34%` | ✅ Authentic, natural smile in a treatment room. Keep the full smile + eyes; never crop teeth. Lazy, widths 768–1600. |

## Services (1:1, 8)

Row thumbnail (collapsed): round, 56 px desktop / 52 tablet / 44 phone. Active row visual: 160–200 px square,
radius `--media-radius` (phone: 120 px). All `object-position: 50% 52%` (objects sit centred, slightly high).
`widths={[128, 256, 480]}`, lazy. Backgrounds are warm greige (#CEC5BF–#D3CBC7) → sit well on `--surface`.

| Key | Master | Treatment | Verdict |
|---|---|---|---|
| `service-whitening` | 1016² · trim T8 R6 | 01 Teeth Whitening | ✅ Glossy single tooth. |
| `service-implant` | 1016² · trim T8 R7 | 02 Dental Implants | ✅ Implant post + crown. |
| `service-aligners` | 1012² · trim T8 R12 | 03 Braces & Aligners | ✅ Clear aligner tray. |
| `service-cavity` | 1010² · trim T14 R14 | 04 Cavity Treatment | ⚠️ Reads "tooth/crown", not specifically "cavity". Acceptable; copy carries meaning. |
| `service-children` | 1018² · trim R6 | 05 Children's Dentistry | ⚠️ Generic small molar, nearly identical to whitening — no child cue. Passes "dental" but weak "distinct". Use; flag for replacement (e.g. smaller primary-tooth model). |
| `service-surgery` | 1024² | 06 Oral Surgery | ✅ Extracted tooth with roots (clinical but clean). |
| `service-periodontal` | 1024² | 07 Periodontal Care | ✅ Tooth in gum + bone section — clearest image of the set. |
| `service-smile-design` | 1004² · trim R20 | 08 Smile Design | ⚠️ Single porcelain veneer — abstract without context but dental. Acceptable. |

## Journey (1:1, 5)

Model frame: desktop ≈ 440×400 (1.1:1, radius 12) → `object-position: 50% 58%` (arch sits low-centre);
tablet 1:1 → `50% 55%`; phone 4:3 → `50% 60%`. Masters trimmed T14 B41 (white band + dark line at bottom)
→ 969². Only the active + next model are eager-decoded; others `loading="lazy"`, `widths={[480, 768, 969]}`.

| Key | Step | Verdict |
|---|---|---|
| `journey-01` | 01 Book consultation | ✅ Plain arch model. |
| `journey-02` | 02 Digital diagnosis | ✅ Scan overlay on the arch — best "digital" cue. |
| `journey-03` | 03 Treatment planning | ✅ One tooth marked (blue). |
| `journey-04` | 04 Treatment | ✅ Aligner on the arch. |
| `journey-05` | 05 Aftercare | ⚠️ Near-identical to 01 (finished arch). Reads fine in sequence; caption must carry "aftercare". |

## Doctors (4:5, 4) — composed into a wide landscape stage

Recipe (desktop, inset stage ≈1288×626): the portrait is a **MaskedMedia** at full stage height (4:5 → ≈500×626)
anchored so the face centre sits at ≈58 % of stage width (centre-right); behind it, the same image `cover`s the
whole stage at `scale(1.12)`, `filter: blur(28px) saturate(.8)` and a soft left-to-right `--scrim-dark` gradient
for the white claim text (upper-left). The portrait's left edge is feathered with a mask gradient (0→100 % over
18 % of its width) so it melts into its own blurred backdrop — no visible rectangle. Tablet: portrait `cover`s
the stage (1.15:1) at the face focus; phone: portrait-first 4:5 card, text below.
Avatars: 40 px circles, `widths={[96]}`, positions = face focus. Only doctor 01 portrait is eager-ish (lazy but
first in DOM); 02–04 `loading="lazy"` with widths `[480, 768, 1080]` so they are fetched on demand.

| Key | Master | Clinician (site.ts) | Face focus (object-position) | Verdict |
|---|---|---|---|---|
| `doctor-01` | 1196×1495 · trim B5 | Dr. Elif Kaya — Orthodontics | `50% 36%` | ✅ Natural, white coat, clinic blur. |
| `doctor-02` | 1150×1438 · trim T58 B4 | Dr. Emre Arslan — Implantology | `52% 38%` | ✅ Dark scrubs, operatory light behind. |
| `doctor-03` | 1195×1494 · trim B6 | Dr. Selin Aydın — Restorative | `47% 40%` | ✅ White coat. |
| `doctor-04` | 1171×1464 · trim T26 B10 | Dr. Can Demir — Oral Surgery | `56% 36%` | ✅ Loupes around neck, looking off-camera (authentic). |

Doctor 04 looks off-camera → place his selector state last (default active = 01).

## Results (1:1, registered pair)

| Key | Master | Slot | Display | Verdict / notes |
|---|---|---|---|---|
| `result-before` | 1170² (crop 0,15) | Before layer (clipped by divider) | desktop ≈ 480–520 px square, radius 16 · tablet 1:1 ≈ 60 % width · phone full-width square; `50% 50%` | ✅ Registration checked by split test: lip line continuous at 50 %, residual offset ≤ ~1 % (a few px). ⚠️ Skin grade differs slightly (after = cooler/lighter) → a faint colour step on skin at the divider; acceptable, do not "fix" by filters. |
| `result-after` | 1170² (crop 0,15) · master had a 29 px right strip | After layer; warm ambient layer | same box, same position | Both layers `position:absolute; inset:0` in one box; identical `sizes`/`widths` so both decode to the same pixels. Lazy. |

## Ambient layers (AmbientBackdrop)

96 px WebP derivatives (≈1–2 kB each), generated at build via `getImage`: hero-operatory, benefits-clinic,
doctor-01…04, result-after (tone warm), booking-patient. Scaled ×1.25, blur 60 px, saturate .65, opacity .12
(.16 warm). Hidden < 640 px.

## Unused / removed

`src/assets/images/*.jpg` (23 abstract "light study" placeholders) — removed. `scripts/placeholders.mjs`,
`scripts/derive-before.mjs` — removed with their npm scripts. `footer.texture` in site.ts temporarily points to
`benefits-clinic` only to keep the current Footer building; the V3 footer uses **no photo** (see design kit) —
footer agent: drop the texture and the key. **Done (phase 2B): texture and key removed.**
