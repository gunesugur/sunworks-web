/**
 * Client entry. Everything is progressive enhancement: the site works without JS.
 * Re-runs on every ClientRouter navigation (astro:page-load).
 */
import { initA11y } from './a11y';
import { initConsent } from './consent';
import { initForms } from './forms';
import { initHeader } from './header';
import { initMap } from './map';
import { initMenu } from './menu';
import { initMotion } from './motion';
import { initNotches } from './notch';
import { applyPrefs, watchSystemTheme } from './prefs';
import { initThemeToggle } from './theme-toggle';

const cleanups: (() => void)[] = [];

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
    initForms(),
    initMap(),
  );
}

// The incoming page replaces <html>'s attributes: carry the visitor's display preferences over.
document.addEventListener('astro:before-swap', (e) => applyPrefs(e.newDocument.documentElement));
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
document.addEventListener('astro:page-load', boot);
watchSystemTheme();
