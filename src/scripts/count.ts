import { prefersReducedMotion } from './reduced-motion';

const DURATION = 1600;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Count-up figures: [data-count] holds its final value in the HTML (read by crawlers and
 * without JS); in view, it counts up from zero once. Reduced motion: the final value as is.
 */
export function initCount(): () => void {
  const stopOdometers = initOdometers();
  const nums = [...document.querySelectorAll<HTMLElement>('[data-count]')];
  if (!nums.length || prefersReducedMotion()) return stopOdometers;
  const fmt = new Intl.NumberFormat(document.documentElement.lang || undefined);
  const frames = new Set<number>();

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset['count']) || 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = easeOutExpo(Math.min(1, (now - start) / DURATION));
      el.textContent = fmt.format(Math.round(target * k));
      if (k < 1) frames.add(requestAnimationFrame(tick));
    };
    el.textContent = '0';
    frames.add(requestAnimationFrame(tick));
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        run(e.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  nums.forEach((n) => io.observe(n));
  return () => {
    stopOdometers();
    io.disconnect();
    frames.forEach((f) => cancelAnimationFrame(f));
  };
}

/**
 * Odometer figures ([data-odometer]): the digits sit on their final value in the HTML; CSS holds
 * them at zero until `.is-in` is added here, then each strip rolls onto its digit.
 */
function initOdometers(): () => void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-odometer]')];
  if (!els.length) return () => undefined;
  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add('is-in'));
    return () => undefined;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        e.target.classList.add('is-in');
      }
    },
    { threshold: 0.5 },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
