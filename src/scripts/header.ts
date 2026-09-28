import { prefersReducedMotion } from './reduced-motion';

const SCROLLED = 8;
const HIDE_AFTER = 160;
const DELTA = 6;

/** Sticky header: frosted once the page scrolls, hidden while scrolling down, back on scroll up. */
export function initHeader(): () => void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return () => undefined;
  const toggle = header.querySelector('[data-menu-toggle]');
  let lastY = window.scrollY;
  let frame = 0;

  const update = () => {
    frame = 0;
    const y = Math.max(0, window.scrollY);
    const menuOpen = toggle?.getAttribute('aria-expanded') === 'true';
    header.classList.toggle('is-scrolled', y > SCROLLED);
    const delta = y - lastY;
    if (menuOpen || y < HIDE_AFTER || delta < -DELTA || prefersReducedMotion()) header.classList.remove('is-hidden');
    else if (delta > DELTA && !header.contains(document.activeElement)) header.classList.add('is-hidden');
    if (Math.abs(delta) > DELTA) lastY = y;
  };
  const onScroll = () => {
    frame ||= requestAnimationFrame(update);
  };
  const reveal = () => header.classList.remove('is-hidden');

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  header.addEventListener('focusin', reveal);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    header.removeEventListener('focusin', reveal);
  };
}
