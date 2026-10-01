> Historical contract. Current implementation: [V5 design and motion kit](AUREA_DESIGN_MOTION_KIT_V5.md).

# AUREA — Motion rule kit V4

Current behavior contract; supersedes V3's cinematic choreography.

- Scrolling is native. No Lenis initialization, pinned scene sequences, ambient spill, scroll-driven model swapping or section hand-off transforms.
- Navigation changes the destination immediately, respecting the fixed header and moving keyboard focus to the destination. It never accelerates through all intervening sections. Hash deep links and browser history use the same destination behavior.
- The header remains available. Mobile menu opens/closes with a short fade, traps focus, closes on Escape or selection and restores focus when dismissed.
- Services change only on click, tap, Enter or Space. Arrow keys move header focus. Hovering and page scrolling never select a different treatment.
- Keep the service FLIP transition, doctor portrait wipe, FAQ height transition and direct manipulation of the comparison divider. These explain an explicit action and do not move surrounding sections.
- Doctor switching must preserve exactly one current biography, including rapid changes. Tabs use roving focus and arrow/Home/End navigation.
- Reduced motion removes geometry transitions where implemented; all content and controls remain accessible without scroll choreography.
- Images and headings do not wait for a reveal animation. No fake load screen, miniature expanding hero window, staggered page entrance or automatic carousel.

Validation must cover desktop, tablet and phone widths, all five journey steps, rapid doctor switching, retained treatment selection, menu dismissal and keyboard comparison. Do not restore V3 motion based on archived reference screenshots.
