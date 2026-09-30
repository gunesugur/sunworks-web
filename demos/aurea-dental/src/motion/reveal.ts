/**
 * Generic, site-wide reveals driven by data attributes (initial states live in base.css):
 *   [data-reveal="lines"]   .mask-line__inner children: translateY(110%) → 0, 60ms stagger
 *   [data-reveal="fade"]    opacity 0 → 1, y 16px → 0
 *   [data-reveal="clip"]    clip-path reveal; data-reveal-from="left|right|center-y" (default left);
 *                           a nested <img> settles from scale 1.08 → 1
 *   [data-reveal="stagger"] direct children fade up with 50ms stagger
 * Options: data-reveal-delay="0.2" (seconds), data-reveal-start="top 80%" (ScrollTrigger start),
 *          data-reveal-trigger="manual" → skipped here; call revealElement() yourself.
 * Reduced motion: opacity only.
 */
import { gsap, ScrollTrigger, EASE, DURATION, STAGGER, FADE_Y } from './tokens';
import { prefersReducedMotion } from './media';

type RevealKind = 'lines' | 'fade' | 'clip' | 'stagger';

const CLIP_FROM: Record<string, string> = {
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  'center-y': 'inset(50% 0% 50% 0%)',
};
const CLIP_TO = 'inset(0% 0% 0% 0%)';

export interface RevealOptions {
  delay?: number;
}

/** Plays the reveal for one element immediately. Returns the tween/timeline. */
export function revealElement(el: HTMLElement, opts: RevealOptions = {}): gsap.core.Animation {
  const kind = (el.dataset.reveal ?? 'fade') as RevealKind;
  const delay = opts.delay ?? Number(el.dataset.revealDelay ?? 0);

  if (prefersReducedMotion()) {
    const targets = kind === 'stagger' ? [el, ...Array.from(el.children)] : el;
    return gsap.to(targets, { opacity: 1, duration: DURATION.medium, delay, ease: EASE.soft, overwrite: 'auto' });
  }

  switch (kind) {
    case 'lines': {
      const lines = el.querySelectorAll('.mask-line__inner');
      return gsap.to(lines, { yPercent: 0, y: 0, duration: 0.9, delay, ease: EASE.primary, stagger: STAGGER.lines, overwrite: 'auto' });
    }
    case 'clip': {
      const tl = gsap.timeline({ delay });
      tl.fromTo(
        el,
        { clipPath: CLIP_FROM[el.dataset.revealFrom ?? 'left'] ?? CLIP_FROM.left },
        { clipPath: CLIP_TO, duration: DURATION.large, ease: EASE.primary },
      );
      const img = el.querySelector('img');
      if (img) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: DURATION.large * 1.2, ease: EASE.primary }, 0);
      return tl;
    }
    case 'stagger': {
      gsap.set(el, { opacity: 1, y: 0 });
      return gsap.fromTo(
        el.children,
        { opacity: 0, y: FADE_Y },
        { opacity: 1, y: 0, duration: DURATION.medium, delay, ease: EASE.primary, stagger: STAGGER.items },
      );
    }
    default:
      return gsap.to(el, { opacity: 1, y: 0, duration: 0.8, delay, ease: EASE.primary, overwrite: 'auto' });
  }
}

/** Wires every non-manual [data-reveal] inside `root` to a one-shot ScrollTrigger. */
export function initReveals(root: ParentNode = document): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
    (el) => el.dataset.revealTrigger !== 'manual' && el.dataset.revealDone === undefined,
  );
  // Normalise the CSS starting transforms into GSAP's cache so tweens start from the same place.
  if (!prefersReducedMotion()) {
    els.forEach((el) => {
      if (el.dataset.reveal === 'fade') gsap.set(el, { opacity: 0, y: FADE_Y });
      if (el.dataset.reveal === 'lines') gsap.set(el.querySelectorAll('.mask-line__inner'), { y: 0, yPercent: 110 });
      if (el.dataset.reveal === 'stagger') gsap.set(el.children, { opacity: 0, y: FADE_Y });
    });
  }
  const triggers = els.map((el) =>
    ScrollTrigger.create({
      trigger: el,
      start: el.dataset.revealStart ?? 'top 88%',
      once: true,
      onEnter: () => {
        el.dataset.revealDone = '';
        revealElement(el);
      },
    }),
  );
  return () => triggers.forEach((t) => t.kill());
}

/** Sets a manual reveal element to its hidden start (for timelines that play it later). */
export function prepareReveal(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  if (el.dataset.reveal === 'lines') gsap.set(el.querySelectorAll('.mask-line__inner'), { y: 0, yPercent: 110 });
  if (el.dataset.reveal === 'fade') gsap.set(el, { opacity: 0, y: FADE_Y });
}
