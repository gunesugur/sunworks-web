export function initMenu(): () => void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const label = toggle?.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !nav) return () => undefined;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (label) label.textContent = (open ? toggle.dataset['labelClose'] : toggle.dataset['labelOpen']) ?? '';
  };
  const onToggle = () => setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  };
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  };

  toggle.addEventListener('click', onToggle);
  document.addEventListener('keydown', onKey);
  nav.addEventListener('click', onClick);
  return () => {
    setOpen(false);
    toggle.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKey);
    nav.removeEventListener('click', onClick);
  };
}
