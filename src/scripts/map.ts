import { CONSENT_EVENT, hasConsent } from './consent';

const ORIGIN = 'https://www.openstreetmap.org/';

function load(btn: HTMLButtonElement, focus: boolean) {
  const src = btn.dataset['src'];
  const holder = btn.closest<HTMLElement>('[data-map]');
  if (!src || !holder || !src.startsWith(ORIGIN)) return;
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.title = btn.dataset['title'] ?? 'Map';
  frame.loading = 'lazy';
  frame.referrerPolicy = 'no-referrer';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  holder.replaceChildren(frame);
  if (focus) frame.focus();
}

/**
 * The OpenStreetMap embed is a "functional" third party: it loads by itself only with consent,
 * otherwise a click on the button loads it once (an explicit, per-visit choice).
 */
export function initMap(): () => void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-map-load]')];
  const autoload = () => {
    if (hasConsent('functional')) buttons.forEach((btn) => btn.isConnected && load(btn, false));
  };
  const handlers = buttons.map((btn) => {
    const onClick = () => load(btn, true);
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  });
  autoload();
  document.addEventListener(CONSENT_EVENT, autoload);
  return () => {
    handlers.forEach((off) => off());
    document.removeEventListener(CONSENT_EVENT, autoload);
  };
}
