/**
 * Visitor display preferences (theme + accessibility), stored in localStorage under "sw-prefs".
 * The inline script in layouts/Base.astro applies the same attributes before first paint;
 * keep the two in sync.
 */
import { pixelSwap } from './pixel-swap';
import { prefersReducedMotion } from './reduced-motion';

export type ThemeChoice = 'light' | 'dark' | 'system';

export interface Prefs {
  theme?: 'light' | 'dark';
  text?: 1 | 2 | 3;
  contrast?: boolean;
  font?: boolean;
  spacing?: boolean;
  links?: boolean;
  motion?: boolean;
}

const KEY = 'sw-prefs';
export const PREFS_EVENT = 'sw:prefs';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const PAPER = '#f5f6f7';
const INK = '#12100d';
const THEME_COLOR = { light: PAPER, dark: INK } as const;

export function loadPrefs(): Prefs {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Prefs) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: Prefs) {
  try {
    if (Object.keys(prefs).length) localStorage.setItem(KEY, JSON.stringify(prefs));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: preferences last for this page only */
  }
}

export const resolvedTheme = (prefs: Prefs): 'light' | 'dark' =>
  prefs.theme ?? (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light');

const setFlag = (root: HTMLElement, name: string, value: string | undefined) => {
  if (value) root.setAttribute(`data-${name}`, value);
  else root.removeAttribute(`data-${name}`);
};

/** Writes the preference attributes onto an <html> element (the live one or an incoming page). */
export function applyPrefs(root: HTMLElement, prefs: Prefs = loadPrefs()) {
  const theme = resolvedTheme(prefs);
  root.dataset['theme'] = theme;
  setFlag(root, 'text', prefs.text ? String(prefs.text) : undefined);
  setFlag(root, 'contrast', prefs.contrast ? 'more' : undefined);
  setFlag(root, 'font', prefs.font ? 'readable' : undefined);
  setFlag(root, 'spacing', prefs.spacing ? 'wide' : undefined);
  setFlag(root, 'links', prefs.links ? 'underline' : undefined);
  setFlag(root, 'motion', prefs.motion ? 'reduce' : undefined);
  root.ownerDocument.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

/** Merges a patch into the saved prefs; `undefined` or `false` removes a key (back to default). */
export function updatePrefs(patch: Partial<Record<keyof Prefs, Prefs[keyof Prefs] | undefined>>) {
  const merged: Record<string, unknown> = { ...loadPrefs(), ...patch };
  const next = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== false)) as Prefs;
  savePrefs(next);
  applyPrefs(document.documentElement, next);
  document.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: next }));
  return next;
}

export function resetPrefs() {
  savePrefs({});
  applyPrefs(document.documentElement, {});
  document.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: {} }));
}

export const themeChoice = (prefs: Prefs = loadPrefs()): ThemeChoice => prefs.theme ?? 'system';

/**
 * Switches the theme. With an origin (the toggle) and motion allowed, the new theme arrives as a
 * pixel swap spreading from it (scripts/pixel-swap.ts); otherwise it switches at once.
 */
export function setTheme(choice: ThemeChoice, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const before = root.dataset['theme'];
  const commit = () => updatePrefs({ theme: choice === 'system' ? undefined : choice });
  const after = resolvedTheme(choice === 'system' ? {} : { theme: choice });
  if (before === after || prefersReducedMotion() || !origin) {
    commit();
    return;
  }
  const accent = getComputedStyle(root).getPropertyValue('--c-accent').trim() || '#1cdb9c';
  pixelSwap(origin, after === 'dark' ? INK : PAPER, accent, commit);
}

/** Follows the OS theme while the visitor has not picked one. */
export function watchSystemTheme(): () => void {
  const media = window.matchMedia(DARK_QUERY);
  const onChange = () => {
    if (!loadPrefs().theme) applyPrefs(document.documentElement);
    document.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: loadPrefs() }));
  };
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
