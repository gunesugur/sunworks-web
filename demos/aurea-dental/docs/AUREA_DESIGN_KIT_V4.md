# AUREA — Design kit V4

This is the current implementation contract. It replaces V3 and the reference-copying remediation brief following the owner's 2026-10-01 review. Borrow the calm, editorial character of the reference, not its composition or scroll choreography.

## Palette and typography

| Role | Value |
|---|---|
| Page | `#F5F2EB` cream |
| Soft section | `#EBECE5` |
| Surface | `#FFFDF8` |
| Muted section | `#E6EBE5` |
| Primary / CTA | `#203E38` forest green |
| Secondary text | `#54645E` |
| Display | Georgia, 400, line-height 1.03–1.12 |
| Reading / controls | Locally bundled Manrope Variable |
| Hero | 44–88px, responsive |
| Section heading | 36–60px, responsive |
| Body | 18px; supporting descriptions 16–17px |
| Controls | 15px; labels 12px |

Secondary text must pass 4.5:1 on every reading surface. Faint colors are decorative only. No oversized glass cards, decorative glow, fake ratings or patient metrics. Real text is never transparent for a scroll reveal.

## Layout

- Full-bleed hero, minimum 100svh. Desktop: cream copy column and a full-height photograph. Mobile/tablet: one full-height photograph with a protective cream gradient and readable copy. The primary CTA remains visible at 390×844.
- Desktop sections occupy at least one viewport, growing with content. Sections remain in normal flow without negative margins, sticky scene wrappers or overlapping layers.
- Shared content width: 91% up to 1320px desktop; 24px phone / 48px tablet outer gutters. Interior gutters: 20px phone, 40px tablet, 48–116px desktop.
- Clinic: generous image and plain explanation; three stages of care replace fabricated metrics.
- Approach: a photo and six ruled text rows, rather than a pinned glass-card carousel.
- Treatments: accessible accordion, one expanded item; selection belongs to the visitor.
- Journey: five simultaneously readable steps; desktop columns, stacked rows below 1024px.
- Team: portrait beside a biography and named tabs, never text scattered across a full-width photo.
- Comparison: registered before/after images and a clearly illustrative explanation. Placeholder patient stories must never appear as real testimony.
- Tablet results stack. FAQ and booking retain explicit labels and readable controls.

Content is visible on first paint, including when JavaScript is unavailable. New breakpoints or content must grow the layout, not clip it into the old cinematic stage height.
