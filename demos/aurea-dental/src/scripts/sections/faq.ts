/**
 * §12 FAQSection.
 * Accordion: one panel open at a time (first by default). Open = height 0 → auto + body opacity/translate,
 * close = reverse, 380–420ms; `hidden` is applied after closing so closed answers leave the a11y tree.
 * Reduced motion: instant height, opacity fade only. ScrollTrigger is refreshed after each change.
 * Connected transition (desktop + motion): the section recedes (drifts up, dims, scales .97) while
 * the Booking portrait rises over the viewport.
 */
import { gsap, ScrollTrigger, EASE } from '../../motion/tokens';
import { withMotion, prefersReducedMotion } from '../../motion/media';

const OPEN_S = 0.42;
const CLOSE_S = 0.36;

export function init(root: HTMLElement): () => void {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-faq-item]'))
    .map((el) => ({
      trigger: el.querySelector<HTMLButtonElement>('[data-faq-trigger]'),
      panel: el.querySelector<HTMLElement>('[data-faq-panel]'),
      body: el.querySelector<HTMLElement>('[data-faq-body]'),
    }))
    .filter((it): it is { trigger: HTMLButtonElement; panel: HTMLElement; body: HTMLElement } =>
      Boolean(it.trigger && it.panel && it.body),
    );
  if (items.length === 0) return () => undefined;

  let refreshTimer = 0;
  const refresh = (): void => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 60);
  };

  type Item = (typeof items)[number];
  const setState = (it: Item, open: boolean): void => {
    it.trigger.setAttribute('aria-expanded', String(open));
    it.panel.hidden = !open;
  };

  const open = (it: Item): void => {
    it.trigger.setAttribute('aria-expanded', 'true');
    it.panel.hidden = false;
    gsap.killTweensOf([it.panel, it.body]);
    if (prefersReducedMotion()) {
      gsap.set(it.panel, { height: 'auto' });
      gsap.fromTo(it.body, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: EASE.soft, onComplete: refresh });
      return;
    }
    gsap.fromTo(
      it.panel,
      { height: it.panel.offsetHeight ? it.panel.offsetHeight : 0 },
      { height: 'auto', duration: OPEN_S, ease: EASE.primary, onComplete: refresh },
    );
    gsap.fromTo(it.body, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: OPEN_S, delay: 0.05, ease: EASE.primary });
  };

  const close = (it: Item): void => {
    it.trigger.setAttribute('aria-expanded', 'false');
    gsap.killTweensOf([it.panel, it.body]);
    const done = (): void => {
      it.panel.hidden = true;
      gsap.set(it.panel, { clearProps: 'height' });
      gsap.set(it.body, { clearProps: 'opacity,transform' });
      refresh();
    };
    if (prefersReducedMotion()) {
      done();
      return;
    }
    gsap.to(it.body, { opacity: 0, y: -6, duration: 0.24, ease: EASE.soft });
    gsap.fromTo(it.panel, { height: it.panel.offsetHeight }, { height: 0, duration: CLOSE_S, ease: EASE.primary, onComplete: done });
  };

  // progressive enhancement: server renders everything open; collapse all but the first
  items.forEach((it, i) => setState(it, i === 0));

  const onClick = (e: Event): void => {
    const trigger = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-faq-trigger]');
    const it = items.find((x) => x.trigger === trigger);
    if (!it) return;
    const isOpen = it.trigger.getAttribute('aria-expanded') === 'true';
    items.forEach((other) => {
      if (other !== it && other.trigger.getAttribute('aria-expanded') === 'true') close(other);
    });
    if (isOpen) close(it);
    else open(it);
  };
  root.addEventListener('click', onClick);

  // recede under the rising Booking portrait
  const recede = root.querySelector<HTMLElement>('[data-faq-recede]');
  const next = root.nextElementSibling instanceof HTMLElement ? root.nextElementSibling : null;
  const motion = withMotion(root, ({ desktop }) => {
    if (!desktop || !recede || !next) return;
    gsap.to(recede, {
      y: () => -window.innerHeight * 0.08,
      scale: 0.97,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: next,
        start: 'top bottom',
        end: 'top 25%',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });

  return () => {
    motion();
    window.clearTimeout(refreshTimer);
    root.removeEventListener('click', onClick);
  };
}
