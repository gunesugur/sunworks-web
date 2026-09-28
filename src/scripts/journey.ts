import { prefersReducedMotion } from './reduced-motion';

/**
 * "How we work": as the steps scroll past a reading line, the one under it becomes active, the
 * counter follows it and the sticky sun (--p, 0..1) climbs with overall progress. Without JS or
 * with reduced motion every step stays fully visible and the sun sits at the top.
 */
export function initJourney(): () => void {
  const root = document.querySelector<HTMLElement>('[data-journey]');
  if (!root) return () => undefined;
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  const now = root.querySelector<HTMLElement>('[data-journey-now]');
  const dial = root.querySelector<HTMLElement>('.dial');
  if (!steps.length) return () => undefined;

  if (prefersReducedMotion()) {
    dial?.style.setProperty('--p', '1');
    return () => undefined;
  }
  root.classList.add('is-tracking');

  let frame = 0;
  const update = () => {
    frame = 0;
    const line = window.innerHeight * 0.5;
    const first = steps[0]?.getBoundingClientRect();
    const last = steps[steps.length - 1]?.getBoundingClientRect();
    if (!first || !last) return;
    let active = 0;
    steps.forEach((s, i) => {
      if (s.getBoundingClientRect().top < line) active = i;
    });
    // Full sunrise once the last step reaches the reading line.
    const span = Math.max(1, last.top - first.top);
    const progress = Math.min(1, Math.max(0, (line - first.top) / span));
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
    if (now) now.textContent = String(active + 1).padStart(2, '0');
    dial?.style.setProperty('--p', progress.toFixed(3));
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    cancelAnimationFrame(frame);
    root.classList.remove('is-tracking');
  };
}
