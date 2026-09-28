import { prefersReducedMotion } from './reduced-motion';

const SHOW_AFTER = 600;

/** Back-to-top: shown once the page has scrolled; returns focus to the header when used. */
export function initQuick(): () => void {
  const btn = document.querySelector<HTMLButtonElement>('[data-to-top]');
  if (!btn) return () => undefined;
  let frame = 0;
  const update = () => {
    frame = 0;
    btn.classList.toggle('is-shown', window.scrollY > SHOW_AFTER);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onClick = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('header a')?.focus({ preventScroll: true });
  };
  // "Copy link" buttons (article facts).
  const onCopy = (e: MouseEvent) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-link]');
    const label = b?.querySelector<HTMLElement>('[data-copy-label]');
    if (!b || !label) return;
    const original = label.textContent ?? '';
    void navigator.clipboard?.writeText(b.dataset['copyLink'] ?? location.href).then(() => {
      label.textContent = b.dataset['copied'] ?? original;
      window.setTimeout(() => (label.textContent = original), 2000);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', onClick);
  document.addEventListener('click', onCopy);
  update();
  return () => {
    window.removeEventListener('scroll', onScroll);
    btn.removeEventListener('click', onClick);
    document.removeEventListener('click', onCopy);
    cancelAnimationFrame(frame);
  };
}
