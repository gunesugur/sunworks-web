/**
 * §11 ResultsSection.
 * Slider: pointer drag anywhere on the frame (pointer capture; vertical page scroll stays native via
 * touch-action: pan-y) + keyboard on the role="slider" handle. Position is one CSS custom property.
 * Motion: the comparison opens with clip inset(0 100% 0 0) → 0 (scrubbed on desktop so it follows the
 * Doctors exit wipe; time-based on mobile), then the quote arrives (opacity + x 24 → 0) and the handle
 * makes one small unprompted sweep to show it can move. Reduced motion: opacity only, no sweep.
 */
import { gsap, ScrollTrigger, EASE, DURATION } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

const CLIP_FROM = 'inset(0% 100% 0% 0%)';
const CLIP_TO = 'inset(0% 0% 0% 0%)';

export function init(root: HTMLElement): () => void {
  const fig = root.querySelector<HTMLElement>('[data-ba]');
  const frame = root.querySelector<HTMLElement>('[data-ba-frame]');
  const handle = root.querySelector<HTMLElement>('[data-ba-handle]');
  const reveal = root.querySelector<HTMLElement>('[data-ba-reveal]');
  const media = root.querySelector<HTMLElement>('[data-ba-media]');
  const depth = root.querySelector<HTMLElement>('[data-results-depth]');
  const story = root.querySelector<HTMLElement>('[data-testimonial]');
  if (!fig || !frame || !handle) return () => undefined;

  const template = fig.dataset.valueText ?? '{before}% before, {after}% after';
  let pos = 50;
  let touched = false;
  const render = (value: number): void => {
    pos = Math.min(100, Math.max(0, value));
    const rounded = Math.round(pos);
    frame.style.setProperty('--pos', pos.toFixed(2));
    handle.setAttribute('aria-valuenow', String(rounded));
    handle.setAttribute('aria-valuetext', template.replace('{before}', String(rounded)).replace('{after}', String(100 - rounded)));
  };
  let sweep: gsap.core.Tween | null = null;
  const interrupt = (): void => {
    touched = true;
    sweep?.kill();
    sweep = null;
  };

  // ---- pointer ----
  let rect: DOMRect | null = null;
  let dragging = false;
  const fromPointer = (e: PointerEvent): void => {
    if (!rect || rect.width === 0) return;
    render(((e.clientX - rect.left) / rect.width) * 100);
  };
  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    interrupt();
    rect = frame.getBoundingClientRect(); // measured once per drag, not per move
    dragging = true;
    frame.classList.add('is-dragging');
    frame.setPointerCapture(e.pointerId);
    // mouse/pen jump to the click; touch waits for a horizontal move (a vertical swipe is a page scroll → pointercancel)
    if (e.pointerType !== 'touch') {
      fromPointer(e);
      handle.focus({ preventScroll: true });
      e.preventDefault();
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (dragging) fromPointer(e);
  };
  const onUp = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    frame.classList.remove('is-dragging');
    if (frame.hasPointerCapture(e.pointerId)) frame.releasePointerCapture(e.pointerId);
  };

  // ---- keyboard ----
  const onKey = (e: KeyboardEvent): void => {
    const steps: Record<string, number> = {
      ArrowLeft: -2,
      ArrowDown: -2,
      ArrowRight: 2,
      ArrowUp: 2,
      PageDown: -10,
      PageUp: 10,
    };
    let next: number | null = null;
    if (e.key in steps) next = pos + (steps[e.key] ?? 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    if (next === null) return;
    e.preventDefault();
    interrupt();
    render(Math.round(next));
  };

  frame.addEventListener('pointerdown', onDown);
  frame.addEventListener('pointermove', onMove);
  frame.addEventListener('pointerup', onUp);
  frame.addEventListener('pointercancel', onUp);
  handle.addEventListener('keydown', onKey);
  render(pos);

  const hint = (): void => {
    if (touched) return;
    const state = { v: pos };
    sweep = gsap.to(state, {
      keyframes: [
        { v: 38, duration: 0.7, ease: EASE.soft },
        { v: 58, duration: 0.8, ease: EASE.soft },
        { v: 50, duration: 0.6, ease: EASE.soft },
      ],
      delay: 0.2,
      onUpdate: () => render(state.v),
      onComplete: () => {
        sweep = null;
      },
    });
  };

  const lead = story?.querySelector<HTMLElement>('[data-testimonial-lead]');
  const rest = story ? Array.from(story.querySelectorAll<HTMLElement>('[data-testimonial-body], [data-testimonial-meta]')) : [];

  const motion = withMotion(root, ({ desktop, reduce }) => {
    if (reduce) {
      if (story) {
        gsap.set(story, { opacity: 0 });
        ScrollTrigger.create({
          trigger: story,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(story, { opacity: 1, duration: DURATION.medium, ease: EASE.soft }),
        });
      }
      return;
    }

    // comparison opens left → right
    if (reveal) {
      if (desktop) {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'top 35%', scrub: 0.4 },
        });
        tl.fromTo(reveal, { clipPath: CLIP_FROM }, { clipPath: CLIP_TO }, 0);
        if (media) tl.fromTo(media, { scale: 1.08 }, { scale: 1 }, 0);
        ScrollTrigger.create({ trigger: frame, start: 'top 30%', once: true, onEnter: hint });
      } else {
        gsap.set(reveal, { clipPath: CLIP_FROM });
        ScrollTrigger.create({
          trigger: frame,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tl = gsap.timeline({ onComplete: hint });
            tl.to(reveal, { clipPath: CLIP_TO, duration: DURATION.large, ease: EASE.primary }, 0);
            if (media) tl.fromTo(media, { scale: 1.08 }, { scale: 1, duration: DURATION.expand, ease: EASE.primary }, 0);
          },
        });
      }
    }

    // quote arrives after the image
    if (lead) {
      gsap.set(lead, { opacity: 0, x: 24 });
      gsap.set(rest, { opacity: 0, y: 12 });
      ScrollTrigger.create({
        trigger: story,
        start: desktop ? 'top 70%' : 'top 85%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ delay: desktop ? 0.25 : 0.1, defaults: { ease: EASE.primary } });
          tl.to(lead, { opacity: 1, x: 0, duration: 0.9 }, 0);
          tl.to(rest, { opacity: 1, y: 0, duration: DURATION.medium, stagger: 0.08 }, 0.25);
        },
      });
    }

    if (desktop && depth) {
      gsap.fromTo(
        depth,
        { yPercent: 10 },
        { yPercent: -10, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }
  });

  return () => {
    motion();
    sweep?.kill();
    frame.removeEventListener('pointerdown', onDown);
    frame.removeEventListener('pointermove', onMove);
    frame.removeEventListener('pointerup', onUp);
    frame.removeEventListener('pointercancel', onUp);
    handle.removeEventListener('keydown', onKey);
  };
}
