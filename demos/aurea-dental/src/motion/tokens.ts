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
  large: 1.1,
  /** image expansions 0.9–1.4 */
  expand: 1.2,
} as const;

export const STAGGER = {
  lines: 0.06,
  items: 0.05,
} as const;

/** the reveal distance for fades (px) */
export const FADE_Y = 16;

export { gsap, ScrollTrigger };
