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
import { initSpark } from './spark';
import { initThemeToggle } from './theme-toggle';
import { initToc } from './toc';
import { initVelocity } from './velocity';

const cleanups: (() => void)[] = [];

/** The hero's WebGL sun loads as its own chunk once the browser is idle, so it never delays first paint. */
function initSun(): () => void {
  const root = document.querySelector<HTMLElement>('[data-sun]');
  if (!root) return () => undefined;
  let off: () => void = () => undefined;
  let cancelled = false;
  const go = () =>
    void import('./sun').then((m) => {
      if (!cancelled) off = m.startSun(root);
    });
  // Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(go, { timeout: 1500 });
  else setTimeout(go, 300);
  return () => {
    cancelled = true;
    off();
  };
}

function boot() {
  while (cleanups.length) cleanups.pop()?.();
  cleanups.push(
    initMenu(),
    initHeader(),
    initThemeToggle(),
    initA11y(),
    initConsent(),
    initNotches(),
    initMotion(),
    initJourney(),
    initVelocity(),
    initSun(),
    initFocus(),
    initCount(),
    initSpark(),
    initToc(),
    initForms(),
    initMap(),
  );
}

// The incoming page replaces <html>'s attributes: carry the visitor's display preferences over.
document.addEventListener('astro:before-swap', (e) => applyPrefs(e.newDocument.documentElement));
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
document.addEventListener('astro:page-load', boot);
watchSystemTheme();
