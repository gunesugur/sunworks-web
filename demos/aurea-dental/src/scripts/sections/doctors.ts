/**
 * §10 DoctorsShowcase.
 * Selector: ARIA tablist (roving tabindex, ←/→/↑/↓/Home/End, automatic activation). Switching wipes
 * the current portrait out (inset → 100% right) while the next wipes in from the right edge
 * (mirrored when going back), name/specialty crossfade with a small rise. ~700ms; interruptible.
 * Scroll (desktop + motion): the veil dims the Journey stage as this panel rises over it, the card
 * image drifts, and on exit the card is wiped left — the same cut that opens the Results comparison.
 * Reduced motion: opacity crossfades only, no scroll-linked motion.
 */
import { gsap, EASE, DURATION } from '../../motion/tokens';
import { withMotion, prefersReducedMotion } from '../../motion/media';

const SHOW = 'inset(0% 0% 0% 0%)';
const OFF_LEFT = 'inset(0% 100% 0% 0%)'; // visible edge collapsed to the left
const OFF_RIGHT = 'inset(0% 0% 0% 100%)'; // visible edge collapsed to the right
const WIPE = 0.7; // s — within the 550–750ms spec

export function init(root: HTMLElement): () => void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-doctor-tab]'));
  const portraits = Array.from(root.querySelectorAll<HTMLElement>('[data-doctor-portrait]'));
  const infos = Array.from(root.querySelectorAll<HTMLElement>('[data-doctor-info]'));
  const depths = Array.from(root.querySelectorAll<HTMLElement>('[data-doctors-depth-layer]'));
  const panel = root.querySelector<HTMLElement>('[data-doctors-panel]');
  const current = root.querySelector<HTMLElement>('[data-doctors-current]');
  const tablist = root.querySelector<HTMLElement>('[data-doctors-tabs]');
  if (tabs.length === 0 || portraits.length !== tabs.length || !panel || !tablist) return () => undefined;

  const count = tabs.length;
  let active = 0;
  let switchTl: gsap.core.Timeline | null = null;
  const imgOf = (el: HTMLElement | undefined): HTMLElement | null => el?.querySelector<HTMLElement>('img') ?? null;

  const settle = (): void => {
    portraits.forEach((p, i) => {
      p.classList.toggle('is-active', i === active);
      gsap.set(p, { clipPath: i === active ? SHOW : OFF_RIGHT, opacity: 1, zIndex: i === active ? 1 : 0 });
      const img = imgOf(p);
      if (img) gsap.set(img, { clearProps: 'transform' });
    });
    infos.forEach((el, i) => {
      el.hidden = i !== active;
      gsap.set(el, { clearProps: 'opacity,transform' });
    });
    depths.forEach((el, i) => gsap.set(el, { opacity: i === active ? 1 : 0 }));
  };

  const select = (next: number, moveFocus = false): void => {
    if (next < 0 || next >= count) return;
    const tab = tabs[next]!;
    if (moveFocus) tab.focus();
    if (next === active) return;
    // finish any running switch first so states never interleave
    const running = switchTl;
    switchTl = null;
    if (running) {
      running.progress(1); // fires onComplete → settle() for the previous state
      running.kill();
    }
    const prev = active;
    active = next;

    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === next));
      t.tabIndex = i === next ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    if (current) current.textContent = String(next + 1).padStart(2, '0');
    portraits.forEach((p, i) => {
      if (i === next) p.removeAttribute('aria-hidden');
      else p.setAttribute('aria-hidden', 'true');
    });
    if (!moveFocus || window.innerWidth < 1024) {
      // keep the chosen chip in view in the scrollable mobile row
      const left = tab.offsetLeft - tablist.offsetLeft - 24;
      if (tablist.scrollWidth > tablist.clientWidth) tablist.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    const out = portraits[prev]!;
    const inn = portraits[next]!;
    const infoOut = infos[prev];
    const infoIn = infos[next];
    if (infoIn) infoIn.hidden = false;
    gsap.set(inn, { zIndex: 2 });
    gsap.set(out, { zIndex: 1 });
    inn.classList.add('is-active');

    const tl = gsap.timeline({
      defaults: { ease: EASE.primary },
      onComplete: () => {
        switchTl = null;
        settle();
      },
    });
    switchTl = tl;

    if (prefersReducedMotion()) {
      tl.fromTo(inn, { clipPath: SHOW, opacity: 0 }, { opacity: 1, duration: DURATION.ui }, 0);
      if (infoOut) tl.to(infoOut, { opacity: 0, duration: DURATION.fast }, 0);
      if (infoIn) tl.fromTo(infoIn, { opacity: 0 }, { opacity: 1, duration: DURATION.ui }, 0.1);
    } else {
      const forward = next > prev;
      const outImg = imgOf(out);
      const inImg = imgOf(inn);
      tl.fromTo(out, { clipPath: SHOW }, { clipPath: forward ? OFF_LEFT : OFF_RIGHT, duration: WIPE }, 0);
      tl.fromTo(inn, { clipPath: forward ? OFF_RIGHT : OFF_LEFT, opacity: 1 }, { clipPath: SHOW, duration: WIPE }, 0);
      if (outImg) tl.to(outImg, { xPercent: forward ? -4 : 4, duration: WIPE }, 0);
      if (inImg) tl.fromTo(inImg, { xPercent: forward ? 5 : -5, scale: 1.05 }, { xPercent: 0, scale: 1, duration: DURATION.large }, 0);
      if (infoOut) tl.to(infoOut, { opacity: 0, y: -8, duration: DURATION.ui, ease: EASE.soft }, 0);
      if (infoIn) tl.fromTo(infoIn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: DURATION.medium }, 0.16);
    }
    depths.forEach((el, i) => {
      if (i === prev || i === next) tl.to(el, { opacity: i === next ? 1 : 0, duration: DURATION.medium, ease: EASE.soft }, 0);
    });
  };

  const onClick = (e: Event): void => {
    const tab = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-doctor-tab]');
    if (tab) select(tabs.indexOf(tab));
  };
  const onKey = (e: KeyboardEvent): void => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    let next = -1;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (i + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (i - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    select(next, true);
  };
  tablist.addEventListener('click', onClick);
  tablist.addEventListener('keydown', onKey);

  // Fully clipped lazy images never load (the browser treats them as hidden), so fetch every
  // portrait once the section is about a screen away — a switch must never wipe to an empty card.
  const warm = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      portraits.forEach((p) => {
        const img = imgOf(p) as HTMLImageElement | null;
        if (img) img.loading = 'eager';
      });
      warm.disconnect();
    },
    { rootMargin: '100% 0px' },
  );
  warm.observe(panel);

  const card = root.querySelector<HTMLElement>('[data-doctors-card]');
  const parallax = root.querySelector<HTMLElement>('[data-doctors-parallax]');
  const veil = root.querySelector<HTMLElement>('[data-doctors-veil]');
  const depth = root.querySelector<HTMLElement>('[data-doctors-depth]');

  const motion = withMotion(root, ({ desktop }) => {
    if (!desktop) return;
    // the panel rises over the Journey's still-sticky stage: dim what it covers
    if (veil) {
      gsap.fromTo(
        veil,
        { opacity: 0 },
        {
          opacity: 0.14,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true },
        },
      );
    }
    // card image settles as it comes up
    if (parallax) {
      gsap.fromTo(
        parallax,
        { yPercent: -6, scale: 1.08 },
        {
          yPercent: 4,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: card ?? root, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
    if (depth) {
      gsap.fromTo(
        depth,
        { yPercent: 8 },
        { yPercent: -8, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }
    // exit hand-off: the portrait is cut away to the left as the Results comparison opens beneath
    if (card) {
      gsap.fromTo(
        card,
        { clipPath: 'inset(0% 0% 0% 0% round 24px)' },
        {
          clipPath: 'inset(0% 42% 0% 0% round 24px)',
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'bottom 45%', end: 'bottom top', scrub: true },
        },
      );
    }
  });

  return () => {
    motion();
    warm.disconnect();
    switchTl?.kill();
    tablist.removeEventListener('click', onClick);
    tablist.removeEventListener('keydown', onKey);
  };
}
