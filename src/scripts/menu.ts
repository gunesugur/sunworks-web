const DESKTOP = '(min-width: 901px)';

export function initMenu(): () => void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const label = toggle?.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !nav) return () => undefined;
  const outside = [document.querySelector('main'), document.querySelector('footer')].filter((el): el is HTMLElement => el !== null);
  const media = window.matchMedia(DESKTOP);

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    outside.forEach((el) => el.toggleAttribute('inert', open));
    if (label) label.textContent = (open ? toggle.dataset['labelClose'] : toggle.dataset['labelOpen']) ?? '';
    if (open) nav.querySelector<HTMLElement>('a')?.focus();
  };
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const onToggle = () => setOpen(!isOpen());
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  };
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  };
  const onMedia = () => {
    if (media.matches && isOpen()) setOpen(false);
  };

  toggle.addEventListener('click', onToggle);
  document.addEventListener('keydown', onKey);
  nav.addEventListener('click', onClick);
  media.addEventListener('change', onMedia);
  return () => {
    if (isOpen()) setOpen(false);
    toggle.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKey);
    nav.removeEventListener('click', onClick);
    media.removeEventListener('change', onMedia);
  };
}
