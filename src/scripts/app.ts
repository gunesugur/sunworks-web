/**
 * Client entry. Everything is progressive enhancement: the site works without JS.
 * Re-runs on every ClientRouter navigation (astro:page-load).
 */
import { initForms } from './forms';
import { initMap } from './map';
import { initMenu } from './menu';
import { initMotion } from './motion';
import { initNotches } from './notch';

const cleanups: (() => void)[] = [];

function boot() {
  while (cleanups.length) cleanups.pop()?.();
  cleanups.push(initMenu(), initNotches(), initMotion(), initForms(), initMap());
}

document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
document.addEventListener('astro:page-load', boot);
