import { prefersReducedMotion } from './reduced-motion';

const STEP_MS = 1100;

/**
 * True focus: when the heading scrolls into view, focus walks across its words once (the others
 * blur back), framed by accent corner marks; it ends on the last word with everything sharp again.
 * One pass only, so nothing keeps moving. Reduced motion: plain text.
 */
export function initFocus(): () => void {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-true-focus]')];
  if (!roots.length || prefersReducedMotion()) return () => undefined;
  const timers: number[] = [];

  const place = (root: HTMLElement, word: HTMLElement) => {
    const frame = root.querySelector<HTMLElement>('.focus__frame');
    if (!frame) return;
    const r = root.getBoundingClientRect();
    const w = word.getBoundingClientRect();
    frame.style.transform = `translate3d(${w.left - r.left}px, ${w.top - r.top}px, 0)`;
    frame.style.width = `${w.width}px`;
    frame.style.height = `${w.height}px`;
  };

  const play = (root: HTMLElement) => {
    const words = [...root.querySelectorAll<HTMLElement>('.focus__word')];
    root.classList.add('is-focusing', 'has-frame');
    words.forEach((word, i) => {
      timers.push(
        window.setTimeout(() => {
          words.forEach((w) => w.classList.toggle('is-focus', w === word));
          place(root, word);
        }, i * STEP_MS),
      );
    });
    timers.push(window.setTimeout(() => root.classList.remove('is-focusing'), words.length * STEP_MS));
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        // Let the heading's own reveal finish first.
        timers.push(window.setTimeout(() => play(e.target as HTMLElement), 700));
      }
    },
    { threshold: 0.8 },
  );
  roots.forEach((r) => io.observe(r));
  const onResize = () =>
    roots.forEach((root) => {
      const word = root.querySelector<HTMLElement>('.focus__word.is-focus');
      if (word) place(root, word);
    });
  window.addEventListener('resize', onResize);

  return () => {
    io.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener('resize', onResize);
  };
}
