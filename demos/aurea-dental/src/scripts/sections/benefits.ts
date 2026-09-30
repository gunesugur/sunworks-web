/**
 * §6 HorizontalBenefitsScene.
 * Desktop + motion: stage is CSS-sticky; the track is scrubbed right → left over 130vh, holds
 * for 20vh, then the Services `.panel-rise` slides over while the stage recedes.
 * Active card = nearest to the focus line; scale/opacity are interpolated continuously from
 * positions measured once per refresh (no layout reads while scrolling).
 * Mobile / reduced motion: native horizontal scroll-snap; IntersectionObserver marks the active card.
 */
import { gsap, ScrollTrigger } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

const TRACK_VH = 1.3; // scrubbed distance, in viewport heights (CSS --benefits-scroll = 150vh incl. hold)
const FOCUS = 0.5; // focus line (fraction of viewport width)

export function init(root: HTMLElement): () => void {
  const q = (sel: string): HTMLElement | null => root.querySelector<HTMLElement>(sel);
  const track = q('[data-benefits-track]');
  const viewport = q('[data-benefits-viewport]');
  const bg = q('[data-benefits-bg]');
  const depth = q('[data-benefits-depth]');
  const content = q('[data-benefits-content]');
  const shade = q('[data-benefits-shade]');
  const current = q('[data-benefits-current]');
  const progressBar = q('[data-benefits-progress]');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-benefit-card]'));
  if (!track || !viewport || cards.length === 0) return () => undefined;

  const total = cards.length;
  let activeIndex = -1;
  const setActive = (i: number): void => {
    if (i === activeIndex) return;
    activeIndex = i;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    if (current) current.textContent = String(i + 1).padStart(2, '0');
    if (progressBar) gsap.set(progressBar, { scaleX: (i + 1) / total });
  };

  return withMotion(root, ({ desktop }) => {
    if (desktop) {
      viewport.removeAttribute('tabindex');
      viewport.removeAttribute('role');
      viewport.removeAttribute('aria-label');

      // measured on refresh only
      let centers: number[] = [];
      let step = 1;
      let vw = window.innerWidth;
      const measure = (): void => {
        vw = window.innerWidth;
        centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
        step = (centers[1] ?? 0) - (centers[0] ?? 0) || cards[0]!.offsetWidth;
      };
      measure();
      const xStart = (): number => vw * 0.62 - (centers[0] ?? 0);
      const xEnd = (): number => vw * 0.42 - (centers[total - 1] ?? 0);

      // Emphasis is one custom property per card (--focus 0…1); CSS maps it to scale/opacity.
      const last = cards.map(() => -1);
      const paint = (): void => {
        const x = Number(gsap.getProperty(track, 'x'));
        const focus = vw * FOCUS;
        let best = 0;
        let bestT = -1;
        for (let i = 0; i < total; i++) {
          const t = Math.max(0, 1 - Math.abs((centers[i] ?? 0) + x - focus) / step);
          if (Math.abs(t - (last[i] ?? -1)) > 0.002) {
            last[i] = t;
            cards[i]?.style.setProperty('--focus', t.toFixed(3));
          }
          if (t > bestT) {
            bestT = t;
            best = i;
          }
        }
        setActive(best);
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * TRACK_VH}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
        },
      });
      tl.fromTo(track, { x: xStart }, { x: xEnd }, 0);
      if (bg) tl.fromTo(bg, { scale: 1.12, xPercent: 1.5 }, { scale: 1.02, xPercent: -1.5 }, 0);
      if (depth) tl.fromTo(depth, { xPercent: -4 }, { xPercent: 4 }, 0);
      // Card emphasis follows the track's *rendered* x (after scrub smoothing) every frame,
      // but only while the section is on screen.
      const live = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? gsap.ticker.add(paint) : gsap.ticker.remove(paint)),
        onRefresh: paint,
      });
      paint();

      // Services panel rises over the stage: the scene recedes underneath it
      const recede = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: () => `top+=${window.innerHeight * 1.5} top`,
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      if (content) recede.to(content, { y: () => -window.innerHeight * 0.12, opacity: 0.4 }, 0);
      if (bg) recede.to(bg, { yPercent: -6 }, 0);
      if (shade) recede.to(shade, { opacity: 0.16 }, 0);

      const onResize = (): void => ScrollTrigger.refresh();
      window.addEventListener('orientationchange', onResize);
      return () => {
        window.removeEventListener('orientationchange', onResize);
        gsap.ticker.remove(paint);
        live.kill();
        cards.forEach((c) => {
          c.style.removeProperty('--focus');
        });
      };
    }

    // native scroll-snap row (mobile / tablet / reduced motion)
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', viewport.dataset.regionLabel ?? 'Benefits');
    setActive(0);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(cards.indexOf(entry.target as HTMLElement));
        });
      },
      { root: viewport, threshold: 0.75 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  });
}
