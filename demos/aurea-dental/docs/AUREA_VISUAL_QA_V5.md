# AUREA — V5 verification

The owner's local reference video was inspected across all 25 seconds using one frame per second. Reference frames remain outside the repository.

- Astro check: 47 files, zero errors, warnings or hints. Production build: five static routes.
- Desktop: full-viewport hero, Lenis initialization, horizontal benefits movement and all five journey chapters verified in the browser. Chapter images loaded and active captions remained visible.
- At 1024 × 768 the journey canvas starts at viewport top; heading, model, copy and all chapter controls fit without horizontal overflow.
- At 390 × 844 the hero, CTA and mobile menu fit. Selecting Process closes the menu and exposes five static treatment stories without horizontal overflow.
- Switching from an active desktop chapter to mobile cleared inline visibility and aria-hidden from all five stories.
- Dynamically enabling reduced motion removed Lenis, released the sticky treatment desk and exposed all five stories at full opacity. The emulation was subsequently restored.
- Previous functional fixes remain: demo-only form, explicit service selection, stable doctor transitions, FAQ, comparison keyboard control and static policy routes.

Visual evidence is stored in the task outputs. These checks cover the tested viewports and flows; no claim of exhaustive device coverage is made.
