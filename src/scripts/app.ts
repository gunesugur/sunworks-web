/**
 * Client entry. Everything is progressive enhancement: the site works without JS.
 * Re-runs on every ClientRouter navigation (astro:page-load).
 */
import { initA11y } from './a11y';
import { initConsent } from './consent';
import { initCount } from './count';
import { initFocus } from './focus';
import { initForms } from './forms';
import { initHeader } from './header';
import { initJourney } from './journey';
import { initMap } from './map';
import { initMenu } from './menu';
import { initMotion } from './motion';
import { initNotches } from './notch';
import { applyPrefs, watchSystemTheme } from './prefs';
import { initQuick } from './quick';
import { initSpark } from './spark';
import { initThemeToggle } from './theme-toggle';
import { initToc } from './toc';
import { initVelocity } from './velocity';

const cleanups: (() => void)[] = [];

/** Runs when the main thread is free (Safari has no requestIdleCallback). */
const idle = (fn: () => void) =>
  typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(fn, { timeout: 1200 }) : window.setTimeout(fn, 200);

let generation = 0;

function boot() {
  while (cleanups.length) cleanups.pop()?.();
  generation += 1;
  const current = generation;
  // What the visitor may touch right away (the marquee's pause button included).
  cleanups.push(initMenu(), initHeader(), initThemeToggle(), initA11y(), initConsent(), initNotches(), initMotion(), initVelocity(), initForms(), initMap());
  // Motion and extras: in small idle slices, so no single long task blocks the first input.
  const extras = [initJourney, initFocus, initCount, initToc, initQuick, initSpark];
  const next = () => {
    const init = extras.shift();
    if (!init || current !== generation) return;
    cleanups.push(init());
    idle(next);
  };
  idle(next);
}

// The incoming page replaces <html>'s attributes: carry the visitor's display preferences over.
document.addEventListener('astro:before-swap', (e) => applyPrefs(e.newDocument.documentElement));
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
document.addEventListener('astro:page-load', boot);
watchSystemTheme();
// First load: point the dark mode images at a theme picked on the site (the inline script cannot reach them).
applyPrefs(document.documentElement);
