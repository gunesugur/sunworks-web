import { PREFS_EVENT, loadPrefs, resetPrefs, setTheme, themeChoice, updatePrefs, type Prefs, type ThemeChoice } from './prefs';

type ToggleKey = 'contrast' | 'font' | 'spacing' | 'links' | 'motion';
const THEMES: ThemeChoice[] = ['light', 'dark', 'system'];
const MAX_TEXT = 3;

/** Accessibility panel: open/close with focus handling, and two-way binding to the saved prefs. */
export function initA11y(): () => void {
  const root = document.querySelector<HTMLElement>('[data-a11y]');
  const launcher = root?.querySelector<HTMLButtonElement>('[data-a11y-launcher]');
  const panel = root?.querySelector<HTMLElement>('[data-a11y-panel]');
  if (!root || !launcher || !panel) return () => undefined;

  const seg = panel.querySelector<HTMLElement>('[data-a11y-theme]');
  const radios = [...panel.querySelectorAll<HTMLInputElement>('input[name="a11y-theme"]')];
  const steps = [...panel.querySelectorAll<HTMLButtonElement>('[data-a11y-text]')];
  const dots = [...panel.querySelectorAll<HTMLElement>('[data-step]')];
  const value = panel.querySelector<HTMLOutputElement>('[data-a11y-text-value]');
  const switches = [...panel.querySelectorAll<HTMLButtonElement>('[data-a11y-toggle]')];
  let closeTimer = 0;

  const render = (prefs: Prefs = loadPrefs()) => {
    const choice = themeChoice(prefs);
    radios.forEach((r) => (r.checked = r.value === choice));
    seg?.style.setProperty('--seg', String(THEMES.indexOf(choice)));
    const level = prefs.text ?? 0;
    dots.forEach((d) => d.classList.toggle('is-on', Number(d.dataset['step']) <= level));
    if (value) value.textContent = `${100 + level * 12.5}%`;
    steps.forEach((b) => (b.disabled = Number(b.dataset['a11yText']) < 0 ? level === 0 : level === MAX_TEXT));
    switches.forEach((sw) => sw.setAttribute('aria-checked', String(Boolean(prefs[sw.dataset['a11yToggle'] as ToggleKey]))));
  };

  const isOpen = () => launcher.getAttribute('aria-expanded') === 'true';
  const open = () => {
    window.clearTimeout(closeTimer);
    render();
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      panel.dataset['state'] = 'open';
      panel.querySelector<HTMLElement>('input:checked, button')?.focus({ preventScroll: true });
    });
  };
  const close = (returnFocus = true) => {
    if (!isOpen()) return;
    launcher.setAttribute('aria-expanded', 'false');
    delete panel.dataset['state'];
    closeTimer = window.setTimeout(() => (panel.hidden = true), 450);
    if (returnFocus) launcher.focus({ preventScroll: true });
  };

  const onLauncher = () => (isOpen() ? close() : open());
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen()) close();
  };
  const onDocClick = (e: MouseEvent) => {
    if (isOpen() && !root.contains(e.target as Node)) close(false);
  };
  const onPanelClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('button');
    if (!target) return;
    if (target.matches('[data-a11y-close]')) close();
    else if (target.matches('[data-a11y-reset]')) resetPrefs();
    else if (target.dataset['a11yText']) {
      const next = Math.min(MAX_TEXT, Math.max(0, (loadPrefs().text ?? 0) + Number(target.dataset['a11yText'])));
      updatePrefs({ text: next ? (next as Prefs['text']) : undefined });
    } else if (target.dataset['a11yToggle']) {
      const key = target.dataset['a11yToggle'] as ToggleKey;
      updatePrefs({ [key]: !loadPrefs()[key] });
    }
  };
  const onThemeChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.name !== 'a11y-theme') return;
    const rect = input.closest('label')?.getBoundingClientRect();
    setTheme(input.value as ThemeChoice, rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined);
  };
  const onPrefs = () => render();

  launcher.addEventListener('click', onLauncher);
  panel.addEventListener('click', onPanelClick);
  panel.addEventListener('change', onThemeChange);
  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onDocClick);
  document.addEventListener(PREFS_EVENT, onPrefs);
  render();

  return () => {
    close(false);
    panel.hidden = true;
    launcher.removeEventListener('click', onLauncher);
    panel.removeEventListener('click', onPanelClick);
    panel.removeEventListener('change', onThemeChange);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onDocClick);
    document.removeEventListener(PREFS_EVENT, onPrefs);
  };
}
