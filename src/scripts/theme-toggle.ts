import { PREFS_EVENT, loadPrefs, resolvedTheme, setTheme } from './prefs';

export function initThemeToggle(): () => void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];
  const sync = () => {
    const dark = resolvedTheme(loadPrefs()) === 'dark';
    for (const btn of buttons) {
      const label = btn.querySelector<HTMLElement>('[data-theme-label]');
      if (label) label.textContent = (dark ? btn.dataset['labelLight'] : btn.dataset['labelDark']) ?? '';
    }
  };
  const handlers = buttons.map((btn) => {
    const onClick = () => {
      const rect = btn.getBoundingClientRect();
      const next = resolvedTheme(loadPrefs()) === 'dark' ? 'light' : 'dark';
      setTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    };
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  });
  sync();
  document.addEventListener(PREFS_EVENT, sync);
  return () => {
    handlers.forEach((off) => off());
    document.removeEventListener(PREFS_EVENT, sync);
  };
}
