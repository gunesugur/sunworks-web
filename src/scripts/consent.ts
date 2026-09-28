/**
 * Cookie consent, stored as "sw-consent" in localStorage for 12 months. Optional features read
 * hasConsent() and listen for CONSENT_EVENT; nothing optional runs before a choice is made.
 */

export type ConsentGroup = 'functional';
export interface Consent {
  v: number;
  at: string;
  functional: boolean;
}

const KEY = 'sw-consent';
const VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const CONSENT_EVENT = 'sw:consent';

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Consent | null;
    if (!c || c.v !== VERSION || Date.now() - Date.parse(c.at) > MAX_AGE_MS) return null;
    return c;
  } catch {
    return null;
  }
}

export const hasConsent = (group: ConsentGroup): boolean => readConsent()?.[group] === true;

export function saveConsent(choice: Omit<Consent, 'v' | 'at'>): Consent {
  const record: Consent = { v: VERSION, at: new Date().toISOString(), ...choice };
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* storage unavailable: the choice applies to this page view */
  }
  document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
  return record;
}

/** Banner + settings panel. Opens on first visit (after the intro) and from [data-consent-open]. */
export function initConsent(): () => void {
  const box = document.querySelector<HTMLElement>('[data-consent]');
  if (!box) return () => undefined;
  const html = document.documentElement;
  const views = [...box.querySelectorAll<HTMLElement>('[data-consent-view]')];
  const functional = box.querySelector<HTMLButtonElement>('[data-consent-switch="functional"]');
  const status = box.querySelector<HTMLElement>('[data-consent-status]');
  let hideTimer = 0;
  let introObserver: MutationObserver | null = null;

  const show = (view: 'summary' | 'details', focus: boolean) => {
    window.clearTimeout(hideTimer);
    views.forEach((v) => (v.hidden = v.dataset['consentView'] !== view));
    functional?.setAttribute('aria-checked', String(hasConsent('functional')));
    box.hidden = false;
    html.dataset['consentVisible'] = '';
    requestAnimationFrame(() => {
      box.dataset['state'] = 'open';
      if (focus) box.querySelector<HTMLElement>(`[data-consent-view="${view}"] button`)?.focus({ preventScroll: true });
    });
  };
  const hide = () => {
    delete box.dataset['state'];
    delete html.dataset['consentVisible'];
    hideTimer = window.setTimeout(() => (box.hidden = true), 700);
  };
  const decide = (choice: Omit<Consent, 'v' | 'at'>) => {
    saveConsent(choice);
    if (status) status.textContent = status.dataset['saved'] ?? '';
    hide();
  };

  const onClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!btn) return;
    const action = btn.dataset['consentAction'];
    if (action === 'accept') decide({ functional: true });
    else if (action === 'reject') decide({ functional: false });
    else if (action === 'manage') show('details', true);
    else if (action === 'back') show('summary', true);
    else if (action === 'save') decide({ functional: functional?.getAttribute('aria-checked') === 'true' });
    else if (btn.dataset['consentSwitch']) btn.setAttribute('aria-checked', String(btn.getAttribute('aria-checked') !== 'true'));
  };
  const onOpen = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-consent-open]')) return;
    e.preventDefault();
    show('details', true);
  };
  const onKey = (e: KeyboardEvent) => {
    // Escape only closes the panel when a choice already exists; the first choice must be explicit.
    if (e.key === 'Escape' && box.dataset['state'] === 'open' && readConsent()) hide();
  };

  box.addEventListener('click', onClick);
  document.addEventListener('click', onOpen);
  document.addEventListener('keydown', onKey);

  if (!readConsent()) {
    if (html.classList.contains('intro')) {
      introObserver = new MutationObserver(() => {
        if (html.classList.contains('intro')) return;
        introObserver?.disconnect();
        show('summary', false);
      });
      introObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
    } else {
      show('summary', false);
    }
  }

  return () => {
    introObserver?.disconnect();
    box.removeEventListener('click', onClick);
    document.removeEventListener('click', onOpen);
    document.removeEventListener('keydown', onKey);
    delete html.dataset['consentVisible'];
  };
}
