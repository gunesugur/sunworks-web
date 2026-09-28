import { prefersReducedMotion } from './reduced-motion';

const STEP_MS = 1100;

/**
 * True focus: while the heading is on screen, focus walks across its words (the others blur back),
 * framed by accent corner marks, and starts over. Off screen it stops. Reduced motion: plain text.
 */
export function initFocus(): () => void {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-true-focus]')];
  if (!roots.length || prefersReducedMotion()) return () => undefined;
  const timers = new Map<HTMLElement, number>();

  const place = (root: HTMLElement, word: HTMLElement) => {
    const frame = root.querySelector<HTMLElement>('.focus__frame');
    if (!frame) return;
    const r = root.getBoundingClientRect();
    const w = word.getBoundingClientRect();
    frame.style.transform = `translate3d(${w.left - r.left}px, ${w.top - r.top}px, 0)`;
    frame.style.width = `${w.width}px`;
    frame.style.height = `${w.height}px`;
  };

  // Loops while on screen; a short rest on the last word before starting over.
  const play = (root: HTMLElement) => {
    const words = [...root.querySelectorAll<HTMLElement>('.focus__word')];
    root.classList.add('is-focusing', 'has-frame');
    let i = 0;
    const step = () => {
      const word = words[i % words.length];
      if (word) {
        words.forEach((w) => w.classList.toggle('is-focus', w === word));
        place(root, word);
      }
      i += 1;
      timers.set(root, window.setTimeout(step, i % words.length === 0 ? STEP_MS * 1.8 : STEP_MS));
    };
    step();
  };
  const stop = (root: HTMLElement) => {
    window.clearTimeout(timers.get(root));
    timers.delete(root);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const root = e.target as HTMLElement;
        if (e.isIntersecting && !timers.has(root)) play(root);
        else if (!e.isIntersecting) stop(root);
      }
    },
    { threshold: 0.6 },
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
    roots.forEach(stop);
    window.removeEventListener('resize', onResize);
  };
}
