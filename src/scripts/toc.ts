import { prefersReducedMotion } from './reduced-motion';

const RADIUS = 90;
const smooth = (p: number) => p * p * (3 - 2 * p);

/** Line sidebar TOC: tracks the section being read and lets nearby lines swell toward the pointer. */
export function initToc(): () => void {
  const nav = document.querySelector<HTMLElement>('[data-toc]');
  if (!nav) return () => undefined;
  const items = [...nav.querySelectorAll<HTMLElement>('[data-toc-item]')];
  const targets = items.map((i) => document.getElementById(i.querySelector('a')?.hash.slice(1) ?? ''));
  const still = prefersReducedMotion();
  const want = items.map(() => 0);
  const cur = items.map(() => 0);
  let frame = 0;
  let last = 0;

  const loop = (now: number) => {
    const k = 1 - Math.exp(-Math.min((now - last) / 1000, 0.05) / 0.09);
    last = now;
    let moving = false;
    items.forEach((el, i) => {
      const next = still ? (want[i] ?? 0) : (cur[i] ?? 0) + ((want[i] ?? 0) - (cur[i] ?? 0)) * k;
      const done = Math.abs((want[i] ?? 0) - next) < 0.002;
      cur[i] = done ? (want[i] ?? 0) : next;
      el.style.setProperty('--effect', (cur[i] ?? 0).toFixed(3));
      if (!done) moving = true;
    });
    frame = moving ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };
  const onMove = (e: PointerEvent) => {
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      want[i] = smooth(Math.max(0, 1 - Math.abs(e.clientY - (r.top + r.height / 2)) / RADIUS));
    });
    kick();
  };
  const onLeave = () => {
    want.fill(0);
    kick();
  };

  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const line = window.innerHeight * 0.3;
      let active = -1;
      targets.forEach((t, i) => {
        if (t && t.getBoundingClientRect().top < line) active = i;
      });
      items.forEach((el, i) => {
        el.classList.toggle('is-active', i === active);
        el.querySelector('a')?.toggleAttribute('aria-current', i === active);
      });
    });
  };

  nav.addEventListener('pointermove', onMove);
  nav.addEventListener('pointerleave', onLeave);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => {
    nav.removeEventListener('pointermove', onMove);
    nav.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(frame);
    cancelAnimationFrame(scrollFrame);
  };
}
