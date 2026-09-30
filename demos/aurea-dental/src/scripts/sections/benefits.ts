/**
 * Scene 3 — Benefits interior (motion kit §5). The grow entry and the Services rise are declared on the
 * SceneFrame (motion/scenes.ts); this module only drives the card track.
 *
 * Desktop + motion: scenePin(root, { animation, scrub: .6 }) — track x from stageW·.62 − c0 to stageW·.42 − c5
 * (card centres measured on refresh). While the photo grows in, the row travels in from the right (viewport
 * x .28·stageW → 0) so cards arrive with the stage, like the reference. Per frame (gsap.ticker, only while the
 * scene is on screen) --focus 0…1 is derived from the track's rendered x → CSS maps it to surface / text /
 * scale ≤ 1.035. No autoplay.
 * Tablet / phone / reduced motion: native scroll-snap row (tabindex 0, region label); IO marks the active card.
 */
import { gsap, ScrollTrigger } from '../../motion/tokens';
import { withMotion } from '../../motion/media';
import { scenePin } from '../../motion/scenes';

const START = 0.62;
const END = 0.42;
const FOCUS = 0.5;
const ENTRY = 0.28;

export function init(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-stage]');
  const track = root.querySelector<HTMLElement>('[data-benefits-track]');
  const viewport = root.querySelector<HTMLElement>('[data-benefits-viewport]');
  const current = root.querySelector<HTMLElement>('[data-benefits-current]');
  const head = root.querySelector<HTMLElement>('[data-benefits-head]');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-benefit-card]'));
  if (!stage || !track || !viewport || cards.length === 0) return () => undefined;

  const total = cards.length;
  let activeIndex = -1;
  const setActive = (i: number): void => {
    if (i === activeIndex) return;
    activeIndex = i;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    if (current) current.textContent = String(i + 1).padStart(2, '0');
  };

  return withMotion(root, ({ desktop }) => {
    if (desktop) {
      viewport.removeAttribute('tabindex');
      viewport.removeAttribute('role');
      viewport.removeAttribute('aria-label');
      cards.forEach((c) => c.classList.remove('is-active'));

      // refresh-time measurements only (offsets are untransformed layout values)
      let centers: number[] = [];
      let step = 1;
      let stageW = stage.offsetWidth;
      const measure = (): void => {
        stageW = stage.offsetWidth;
        centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
        step = (centers[1] ?? 0) - (centers[0] ?? 0) || cards[0]!.offsetWidth;
      };
      measure();

      const last = cards.map(() => -1);
      const paint = (): void => {
        const x = Number(gsap.getProperty(track, 'x')) + Number(gsap.getProperty(viewport, 'x'));
        const focus = stageW * FOCUS;
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

      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.fromTo(
        track,
        { x: () => stageW * START - (centers[0] ?? 0) },
        { x: () => stageW * END - (centers[total - 1] ?? 0) },
      );
      // `animation` is a valid ScrollTrigger.create() option missing from the Vars typing
      const pinVars = { animation: tl, scrub: 0.6, onRefreshInit: measure, onRefresh: paint } as Parameters<typeof scenePin>[1];
      scenePin(root, pinVars);

      // the stage's interior arrives with the growing photo (same range as the grow hand-off): the card row
      // travels in from the right, the heading settles in the second half (once there is photo behind it)
      const entry = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
      });
      entry.fromTo(viewport, { x: () => stageW * ENTRY, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, 0);
      if (head) entry.fromTo(head, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.66);

      const live = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? gsap.ticker.add(paint) : gsap.ticker.remove(paint)),
      });
      paint();

      return () => {
        gsap.ticker.remove(paint);
        live.kill();
        cards.forEach((c) => c.style.removeProperty('--focus'));
        activeIndex = -1;
      };
    }

    // native scroll-snap row (tablet / phone / reduced motion)
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', viewport.dataset.regionLabel ?? 'Benefits');
    activeIndex = -1;
    setActive(0);
    // active = the first card fully in view (leftmost), so a wide row still reads from its start
    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const i = cards.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) visible.add(i);
          else visible.delete(i);
        });
        if (visible.size) setActive(Math.min(...visible));
      },
      { root: viewport, threshold: 0.9 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  });
}
