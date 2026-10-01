# AUREA — design and motion kit V5

Current implementation contract. V3/V4 documents are historical. The supplied 25-second reference video informs pacing, masks and scroll-linked storytelling, rather than providing a composition to reproduce.

## Visual system

- Page `#f3f1ec`; soft canvas `#ebede8`; surface `#fffefb`; muted surface `#e8ece6`.
- Primary text `#222c27`; secondary text `#5d665f`; action `#243e33`.
- Locally bundled Manrope for body and display. Display weight 500, restrained tracking and no decorative serif mixture. Headings scale with the viewport; body text stays readable.
- Full-viewport hero; normal-flow content between bounded cinematic canvases. No negative section hand-offs or adjacent scene overlap.
- Use existing clinic photography and dental models. Do not add fabricated statistics, testimonials or unlabeled outcome claims.

## Motion system

- Lenis shares the GSAP ticker and ScrollTrigger update cycle; reduced motion uses native scrolling.
- Hero opens a vertical aperture, eases the photograph and reveals masked headline lines. User input finishes the entrance; deep links bypass it.
- Desktop benefits use a 260svh scroll range and one 100svh sticky canvas. Six readable cards travel horizontally over clinic photography, with progress indication.
- Desktop journey uses a 320svh range and one 100svh treatment desk. Five models and captions crossfade; chapter buttons and Arrow/Home/End keys provide direct control.
- Desktop cinematic scenes require at least 1024px width and unrestricted motion. Mobile/tablet/reduced-motion layouts retain native horizontal commitments and all five treatment stories in normal flow.
- Breakpoint and motion-preference cleanup must clear visibility and inline transforms. No content may remain hidden after leaving a cinematic layout.
- Menu navigation changes destination directly with keyboard focus; it must not race through the entire page. Chapter controls use a short Lenis transition within their own scene.
- Treatment accordions, doctors, comparison, FAQ and booking retain their explicit controls and accessibility behavior. Scroll and hover do not choose treatments.
