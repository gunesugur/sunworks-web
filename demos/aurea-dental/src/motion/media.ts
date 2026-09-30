import { gsap } from './tokens';

export const BREAKPOINT = { tablet: 640, desktop: 1024, large: 1600 } as const;

export const MQ = {
  reduce: '(prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: `(min-width: ${BREAKPOINT.desktop}px)`,
  mobile: `(max-width: ${BREAKPOINT.desktop - 0.02}px)`,
} as const;

export const prefersReducedMotion = (): boolean => window.matchMedia(MQ.reduce).matches;
export const isDesktop = (): boolean => window.matchMedia(MQ.desktop).matches;

export interface MotionConditions {
  /** ≥1024px and motion allowed — pinned/scrubbed choreography */
  desktop: boolean;
  /** <1024px and motion allowed — lighter, native-scroll variants */
  mobile: boolean;
  /** prefers-reduced-motion — opacity only, no pinning/parallax */
  reduce: boolean;
}

/**
 * Scoped gsap.matchMedia wrapper. `setup` runs whenever the active condition set changes;
 * every tween/ScrollTrigger created inside is reverted automatically. Returns a cleanup.
 */
export function withMotion(
  scope: Element,
  setup: (c: MotionConditions, ctx: gsap.Context) => void | (() => void),
): () => void {
  const mm = gsap.matchMedia(scope);
  mm.add(
    {
      desktop: `${MQ.desktop} and ${MQ.motion}`,
      mobile: `${MQ.mobile} and ${MQ.motion}`,
      reduce: MQ.reduce,
    },
    (ctx) => setup(ctx.conditions as unknown as MotionConditions, ctx),
  );
  return () => mm.revert();
}
