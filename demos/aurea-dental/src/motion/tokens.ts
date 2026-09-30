/**
 * GSAP mirror of the CSS motion tokens (src/styles/tokens.css). Use ONLY these values.
 * Importing this module registers ScrollTrigger + CustomEase and the named eases
 * 'aurea.primary' / 'aurea.soft', so `ease: EASE.primary` works anywhere.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('aurea.primary', '0.22,1,0.36,1');
CustomEase.create('aurea.soft', '0.33,1,0.68,1');

export const EASE = {
  primary: 'aurea.primary',
  soft: 'aurea.soft',
  /** for scrubbed timelines: progress already follows the scroll */
  linear: 'none',
} as const;

/** seconds */
export const DURATION = {
  fast: 0.22,
  ui: 0.32,
  medium: 0.65,
  large: 1.05,
  /** image expansions (hero inner image, masked media) */
  expand: 1.1,
  /** doctor portrait mask wipe (550–750ms) */
  wipe: 0.65,
} as const;

export const STAGGER = {
  lines: 0.06,
  items: 0.05,
} as const;

/** the reveal distance for fades (px) */
export const FADE_Y = 16;

/**
 * Scene hand-off constants (docs/AUREA_MOTION_RULE_KIT_V3.md §Hand-offs). motion/scenes.ts reads these;
 * sections must not invent their own values.
 */
export const HANDOFF = {
  /** outgoing pinned stage while the next scene rises over it */
  riseOver: { scale: 0.955, yPercent: -2, dim: 0.1 },
  /** incoming scene lying beneath: starts lowered/smaller, settles as the previous scene lifts off */
  liftOff: { scale: 0.965, yPercent: 6, dim: 0.1 },
  /** masked media growing into its stage */
  grow: { clipRect: 'inset(22% 32% 22% 32% round 14px)', clipY: 'inset(30% 0% 30% 0% round 0px)', clipX: 'inset(0% 30% 0% 30% round 14px)', mediaScale: 1.16 },
  /** a quiet scene handing over: drifts up and softens */
  recede: { yVh: -8, opacity: 0.4 },
  /** hero stage while the intro panel rises beneath/over it */
  hero: { scale: 0.94, yVh: -6, dim: 0.06 },
} as const;

/** Intensity map (brief): drives how much of the vocabulary a scene may use. */
export const INTENSITY = {
  hero: 'high',
  intro: 'low-med',
  benefits: 'high',
  services: 'med-high',
  journey: 'high',
  doctors: 'med',
  results: 'med',
  faq: 'low',
  booking: 'med',
  footer: 'very-low',
} as const;

export { gsap, ScrollTrigger };
