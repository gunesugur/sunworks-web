import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './tokens';
import { prefersReducedMotion } from './media';

let lenis: Lenis | null = null;
const tick = (time: number): void => { lenis?.raf(time * 1000); };
let watchingMotion = false;

/** Lenis synced to gsap.ticker + ScrollTrigger. Disabled under reduced motion (native scroll). */
export function initSmoothScroll(): Lenis | null {
  if (!watchingMotion) {
    watchingMotion = true;
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      if (prefersReducedMotion()) {
        lenis?.destroy();
        lenis = null;
        gsap.ticker.remove(tick);
      } else {
        initSmoothScroll();
        if (document.documentElement.classList.contains('is-locked')) lenis?.stop();
      }
      ScrollTrigger.refresh();
    });
  }
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = (): Lenis | null => lenis;

/** Pause/resume user scrolling (menu overlay, intro). Works with and without Lenis. */
export function lockScroll(locked: boolean): void {
  document.documentElement.classList.toggle('is-locked', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}


/** Scroll to an element/selector/y with the fixed header taken into account. */
export function scrollToTarget(target: HTMLElement | string | number, opts: { immediate?: boolean } = {}): void {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (el === null) return;
  const pin = typeof el === 'number' ? null : el.querySelector<HTMLElement>(':scope > .scene__pin');
  const immersive = pin !== null && getComputedStyle(pin).position === 'sticky';
  const padding = immersive ? 0 : parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const y = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY - padding;
  if (lenis) {
    lenis.scrollTo(y, { immediate: opts.immediate ?? false, duration: 0.65 });
  } else {
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  if (typeof el !== 'number') {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
}

/** Delegated in-page anchor handling (href="#id"). */
export function bindAnchorLinks(root: Document | HTMLElement = document): () => void {
  const hashTarget = (hash: string): HTMLElement | null => {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  };
  const onHashChange = (): void => {
    const target = hashTarget(window.location.hash);
    if (target) scrollToTarget(target, { immediate: true });
  };
  const onClick = (event: Event): void => {
    const e = event as MouseEvent;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href') ?? '';
    if (hash.length < 2) return;
    const target = hashTarget(hash);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target, { immediate: true });
    history.pushState(null, '', hash);
  };
  root.addEventListener('click', onClick);
  window.addEventListener('hashchange', onHashChange);
  return () => {
    root.removeEventListener('click', onClick);
    window.removeEventListener('hashchange', onHashChange);
  };
}
