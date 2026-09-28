import { prefersReducedMotion } from './reduced-motion';

/**
 * Marquees whose speed follows the page's scroll velocity (and flip with scroll direction).
 * Markup: [data-velocity] > [data-velocity-row data-speed="px/s" data-dir="1|-1"] holding two
 * identical tracks; data-speed="0" moves only while the page scrolls. One rAF loop runs only while a marquee is on screen; reduced motion leaves
 * them still. [data-marquee-toggle] inside a band pauses it (WCAG 2.2.2).
 */
export function initVelocity(): () => void {
  const bands = [...document.querySelectorAll<HTMLElement>('[data-velocity]')];
  if (!bands.length || prefersReducedMotion()) return () => undefined;

  type Row = { el: HTMLElement; speed: number; dir: number; x: number; width: number };
  const rows: Row[] = [];
  const visible = new Set<HTMLElement>();
  const paused = new Set<HTMLElement>();
  for (const band of bands) {
    for (const el of band.querySelectorAll<HTMLElement>('[data-velocity-row]')) {
      rows.push({ el, speed: Number(el.dataset['speed'] ?? 40), dir: Number(el.dataset['dir']) || 1, x: 0, width: 0 });
    }
  }
  // Enough copies of the track to cover the viewport plus one track of travel, so no gap opens.
  const measure = () =>
    rows.forEach((r) => {
      const first = r.el.firstElementChild as HTMLElement | null;
      r.width = first?.offsetWidth ?? 0;
      if (!first || !r.width) return;
      const need = Math.ceil(window.innerWidth / r.width) + 1;
      while (r.el.children.length < need) {
        const copy = first.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('aria-label');
        r.el.appendChild(copy);
      }
    });
  measure();

  let lastY = window.scrollY;
  let lastT = performance.now();
  let boost = 0;
  let flip = 1;
  let frame = 0;

  const tick = (now: number) => {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const y = window.scrollY;
    const v = (y - lastY) / Math.max(dt, 0.001);
    lastY = y;
    if (Math.abs(v) > 20) flip = v > 0 ? 1 : -1;
    // Ease the boost toward the current scroll speed so bursts feel springy, not jumpy.
    boost += (Math.min(Math.abs(v) / 180, 6) - boost) * Math.min(1, dt * 6);
    for (const r of rows) {
      const band = r.el.closest<HTMLElement>('[data-velocity]');
      if (!band || !visible.has(band) || paused.has(band) || !r.width) continue;
      // Base drift plus a scroll-driven push; a band with speed 0 only moves while the page scrolls.
      r.x -= r.dir * flip * (r.speed + boost * 90) * dt;
      r.x = ((r.x % r.width) - r.width) % r.width;
      r.el.style.transform = `translate3d(${r.x.toFixed(2)}px, 0, 0)`;
    }
    frame = visible.size ? requestAnimationFrame(tick) : 0;
  };
  const start = () => {
    if (!frame) {
      lastT = performance.now();
      lastY = window.scrollY;
      frame = requestAnimationFrame(tick);
    }
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const band = e.target as HTMLElement;
      if (e.isIntersecting) visible.add(band);
      else visible.delete(band);
    }
    if (visible.size) start();
  });
  bands.forEach((b) => io.observe(b));
  const ro = new ResizeObserver(measure);
  rows.forEach((r) => ro.observe(r.el));

  const onToggle = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-marquee-toggle]');
    const band = btn?.closest<HTMLElement>('[data-velocity]');
    if (!btn || !band) return;
    const now = !paused.has(band);
    if (now) paused.add(band);
    else paused.delete(band);
    btn.setAttribute('aria-pressed', String(now));
    band.querySelector('[data-marquee]')?.classList.toggle('is-paused', now);
    const label = btn.querySelector('[data-marquee-label]');
    if (label) label.textContent = (now ? btn.dataset['labelPlay'] : btn.dataset['labelPause']) ?? '';
  };
  document.addEventListener('click', onToggle);

  return () => {
    io.disconnect();
    ro.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener('click', onToggle);
  };
}
