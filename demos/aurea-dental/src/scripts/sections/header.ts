import { gsap, ScrollTrigger, EASE, DURATION } from '../../motion/tokens';
import { MQ, prefersReducedMotion } from '../../motion/media';
import { lockScroll } from '../../motion/smooth-scroll';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function init(root: HTMLElement): () => void {
  const cleanups: (() => void)[] = [];

  /* ---- transparent over the hero → solid once the next section reaches the bar ---- */
  const solidFrom = root.dataset.solidFrom ? document.querySelector<HTMLElement>(root.dataset.solidFrom) : null;
  const solid = ScrollTrigger.create({
    trigger: solidFrom ?? document.body,
    start: solidFrom ? () => `top top+=${root.offsetHeight}` : 'top+=80 top',
    invalidateOnRefresh: true,
    // no end: once past the start the bar stays solid until the user scrolls back above it
    onEnter: () => root.classList.add('is-solid'),
    onLeaveBack: () => root.classList.remove('is-solid'),
  });
  cleanups.push(() => solid.kill());

  /* ---- current section → aria-current on nav links ---- */
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  links.forEach((link) => {
    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target) return;
    const st = ScrollTrigger.create({
      trigger: target,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) links.forEach((l) => l.setAttribute('aria-current', String(l === link)));
        else link.removeAttribute('aria-current');
      },
    });
    cleanups.push(() => st.kill());
  });

  /* ---- mobile menu ---- */
  const toggle = root.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const toggleLabel = root.querySelector<HTMLElement>('[data-menu-toggle-label]');
  const menu = root.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return () => cleanups.forEach((fn) => fn());

  const lines = menu.querySelectorAll<HTMLElement>('[data-menu-line]');
  const foot = menu.querySelector<HTMLElement>('[data-menu-foot]');
  const siblings = (): HTMLElement[] =>
    Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== root && !el.contains(root) && el.tagName !== 'SCRIPT',
    );
  let open = false;
  let anim: gsap.core.Timeline | null = null;

  const setOpen = (next: boolean, { restoreFocus = true } = {}): void => {
    if (next === open) return;
    open = next;
    toggle.setAttribute('aria-expanded', String(next));
    if (toggleLabel) toggleLabel.textContent = (next ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '';
    root.classList.toggle('is-menu-open', next);
    siblings().forEach((el) => (next ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
    lockScroll(next);
    anim?.kill();
    const reduce = prefersReducedMotion();

    if (next) {
      menu.hidden = false;
      anim = gsap.timeline();
      anim.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: DURATION.ui, ease: EASE.soft });
      if (!reduce) {
        anim.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: DURATION.medium, ease: EASE.primary, stagger: 0.05 }, 0.05);
        if (foot) anim.fromTo(foot, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DURATION.medium, ease: EASE.primary }, 0.25);
      }
      menu.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    } else {
      anim = gsap.timeline({ onComplete: () => void (menu.hidden = true) });
      anim.to(menu, { opacity: 0, duration: DURATION.fast, ease: EASE.soft });
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
  };

  const onToggle = (): void => setOpen(!open);
  const onKey = (e: KeyboardEvent): void => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key !== 'Tab') return;
    // focus trap across toggle + menu
    const items = [toggle, ...Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE))];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };
  // Close before the delegated anchor handler scrolls (it runs later, on document).
  const onMenuClick = (e: Event): void => {
    if ((e.target as Element).closest('a')) setOpen(false, { restoreFocus: false });
  };
  const desktop = window.matchMedia(MQ.desktop);
  const onBreakpoint = (): void => {
    if (desktop.matches) setOpen(false, { restoreFocus: false });
  };

  toggle.addEventListener('click', onToggle);
  menu.addEventListener('click', onMenuClick);
  document.addEventListener('keydown', onKey);
  desktop.addEventListener('change', onBreakpoint);
  cleanups.push(() => {
    toggle.removeEventListener('click', onToggle);
    menu.removeEventListener('click', onMenuClick);
    document.removeEventListener('keydown', onKey);
    desktop.removeEventListener('change', onBreakpoint);
  });

  return () => cleanups.forEach((fn) => fn());
}
