/** True when the OS asks for less motion or the visitor turned motion off in the accessibility panel. */
export const prefersReducedMotion = (): boolean =>
  document.documentElement.dataset['motion'] === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
