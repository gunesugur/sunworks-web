/**
 * Boot: smooth scroll → section modules (DOM order) → generic reveals → ScrollTrigger refresh.
 */
import { ScrollTrigger } from '../motion/tokens';
import { initSmoothScroll, bindAnchorLinks, getLenis, scrollToTarget } from '../motion/smooth-scroll';
import { initReveals } from '../motion/reveal';
import { initScenes } from '../motion/scenes';
import { registry } from './sections/registry';

const root = document.documentElement;
root.classList.add('motion-enabled');

function debounce(fn: () => void, ms: number): () => void {
  let t = 0;
  return () => {
    window.clearTimeout(t);
    t = window.setTimeout(fn, ms);
  };
}

async function boot(): Promise<void> {
  initSmoothScroll();
  bindAnchorLinks();

  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  // Fetch all modules in parallel, then init strictly in DOM order (pins must be created top → bottom).
  const modules = await Promise.all(
    sections.map(async (el) => {
      const loader = registry[el.dataset.section ?? ''];
      if (!loader) return null;
      try {
        return await loader();
      } catch (error) {
        console.error(`[aurea] failed to load section "${el.dataset.section}"`, error);
        el.classList.add('motion-fallback');
        return null;
      }
    }),
  );
  sections.forEach((el, i) => {
    const mod = modules[i];
    if (!mod) return;
    try {
      mod.init(el);
    } catch (error) {
      console.error(`[aurea] section "${el.dataset.section}" failed to init`, error);
      el.classList.add('motion-fallback');
    }
  });

  // declared scene hand-offs (<SceneFrame enter/exit/ambient>) + ambient layer — after sections, before reveals
  initScenes(document);
  initReveals(document);
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // Layout can shift after fonts/images settle — refresh (debounced), never measure in scroll loops.
  const refresh = debounce(() => ScrollTrigger.refresh(), 150);
  void document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    if (!img.complete) img.addEventListener('load', refresh, { once: true });
  });
  keepScrollAcrossBreakpoints();
  root.classList.add('is-ready');
  const target = document.getElementById(window.location.hash.slice(1));
  if (target) scrollToTarget(target, { immediate: true });
}

/**
 * GSAP quirk: ScrollTriggers created while gsap.matchMedia() re-runs (desktop ↔ mobile resize) refresh
 * immediately and clear ScrollTrigger's recorded scroll position, so the full refresh that follows
 * leaves the page at 0. Remember the last user position (scroll events are async, so the value is
 * still the pre-change one when the synchronous matchMedia refresh ends) and put it back.
 */
function keepScrollAcrossBreakpoints(): void {
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => void (lastY = window.scrollY), { passive: true });
  ScrollTrigger.addEventListener('matchMedia', () => {
    if (Math.abs(window.scrollY - lastY) < 2) return;
    // native, not lenis.scrollTo: Lenis still holds lastY as its target and would treat it as a no-op
    window.scrollTo(0, lastY);
    getLenis()?.resize();
    ScrollTrigger.update();
  });
}

boot().catch((error: unknown) => {
  console.error('[aurea] motion boot failed', error);
  root.classList.add('motion-fallback');
  root.classList.remove('motion-enabled');
});
