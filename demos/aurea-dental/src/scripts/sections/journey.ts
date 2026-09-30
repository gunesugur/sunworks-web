/**
 * §9 TreatmentJourney. CSS owns the sticky stage and all section lengths; this module scrubs.
 *
 * Desktop (≥1024, motion)
 *   1. Lift  [0, 100vh]: the section's first 100svh lies beneath the Services panel. As the panel
 *      lifts off, the stage comes forward (content 0.965 → 1 and 8vh → 0, shade 0.14 → 0) and the
 *      title mask-reveals.
 *   2. Steps [100vh, 350vh]: scrubbed step changes — model out (opacity 1→0, scale 1→.96,
 *      rotateY 0→-4°) / in (0→1, 1.04→1, 4°→0) with perspective, masked number roll
 *      (0→-100% / 100%→0), right-hand labels + caption in parallel, progress line.
 *   3. Cover [last --journey-cover px]: the next section's negative margin (read on every refresh)
 *      is appended to the section so the stage stays sticky and recedes while Doctors rises over it.
 * Mobile (<1024, motion): the same steps over 180vh, no lift; labels cross-fade in one slot.
 * Reduced motion: stacked list (CSS); title fades in, nothing is pinned.
 */
import { gsap, ScrollTrigger, EASE } from '../../motion/tokens';
import { withMotion } from '../../motion/media';
import { revealElement, prepareReveal } from '../../motion/reveal';

const STEPS_VH = { desktop: 2.5, mobile: 1.8 }; // keep in sync with --journey-steps
const EDGE_HOLD = 0.4; // timeline units held at the first/last step
const HOLD = 0.8; // held between transitions
const TRANS = 1; // one transition

export function init(root: HTMLElement): () => void {
  const q = (sel: string): HTMLElement | null => root.querySelector<HTMLElement>(sel);
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-jstep]'));
  const pick = (sel: string): HTMLElement[] => steps.map((s) => s.querySelector<HTMLElement>(sel)).filter((el): el is HTMLElement => el !== null);
  const models = pick('[data-jstep-model]');
  const nums = pick('[data-jstep-num]');
  const labels = pick('[data-jstep-label]');
  const captions = pick('[data-jstep-caption]');
  const title = q('#journey-title');
  const label = q('[data-journey-label]');
  const content = q('[data-journey-content]');
  const recede = q('[data-journey-recede]');
  const shadeIn = q('[data-journey-shade-in]');
  const shadeOut = q('[data-journey-shade-out]');
  const progress = q('[data-journey-progress]');
  const n = steps.length;
  if (n === 0 || models.length !== n || nums.length !== n || labels.length !== n || captions.length !== n) {
    return () => undefined;
  }

  let active = -1;
  const setActive = (i: number): void => {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => {
      if (k === i) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
  };

  const intro = [label, title].filter((el): el is HTMLElement => el !== null);
  let revealed = false;
  const playIntro = (): void => {
    if (revealed) return;
    revealed = true;
    intro.forEach((el, i) => revealElement(el, { delay: i * 0.12 }));
  };

  // Cover zone = the next section's negative top margin (0 when it does not overlap).
  let cover = 0;
  const measureCover = (): void => {
    const next = root.nextElementSibling;
    const mt = next ? parseFloat(getComputedStyle(next).marginTop) : 0;
    const value = Number.isFinite(mt) && mt < 0 ? Math.round(-mt) : 0;
    if (value !== cover) {
      cover = value;
      root.style.setProperty('--journey-cover', `${cover}px`);
    }
  };

  return withMotion(root, ({ desktop, reduce }) => {
    if (reduce) {
      root.style.removeProperty('--journey-cover');
      cover = 0;
      if (!revealed) {
        ScrollTrigger.create({ trigger: root, start: 'top 80%', once: true, onEnter: playIntro });
      }
      return;
    }

    measureCover();
    ScrollTrigger.addEventListener('refreshInit', measureCover);
    intro.forEach((el) => {
      if (!revealed) prepareReveal(el);
    });

    const vh = (): number => window.innerHeight;
    const lift = (): number => (desktop ? vh() : 0);
    const stepsLen = (): number => vh() * (desktop ? STEPS_VH.desktop : STEPS_VH.mobile);

    // ---- start states (CSS mirrors these to avoid a flash) ----
    gsap.set(models, { transformPerspective: 1200, transformOrigin: '50% 60%' });
    models.forEach((m, i) => gsap.set(m, i === 0 ? { opacity: 1, scale: 1, rotationY: 0 } : { opacity: 0, scale: 1.04, rotationY: 4 }));
    nums.forEach((el, i) => gsap.set(el, { y: 0, yPercent: i === 0 ? 0 : 100 }));
    captions.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0, y: 0 }));
    if (desktop) labels.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0.36, y: 0 }));
    else labels.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: 0 }));
    if (progress) gsap.set(progress, { scaleY: 0 });
    setActive(0);

    // ---- steps: one scrubbed timeline ----
    const tl = gsap.timeline({ defaults: { ease: EASE.soft } });
    const mids: number[] = [];
    for (let a = 0; a < n - 1; a++) {
      const b = a + 1;
      const t = EDGE_HOLD + a * (TRANS + HOLD);
      mids.push(t + TRANS / 2);
      tl.to(models[a]!, { opacity: 0, scale: 0.96, rotationY: -4, duration: 0.6 }, t)
        .fromTo(models[b]!, { opacity: 0, scale: 1.04, rotationY: 4 }, { opacity: 1, scale: 1, rotationY: 0, duration: 0.6 }, t + 0.4)
        .to(nums[a]!, { yPercent: -100, duration: 0.55, ease: EASE.primary }, t + 0.1)
        .fromTo(nums[b]!, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: EASE.primary }, t + 0.35)
        .to(captions[a]!, { opacity: 0, y: -10, duration: 0.4 }, t)
        .fromTo(captions[b]!, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, t + 0.45);
      if (desktop) {
        tl.to(labels[a]!, { opacity: 0.36, duration: 0.5 }, t + 0.25).to(labels[b]!, { opacity: 1, duration: 0.5 }, t + 0.25);
      } else {
        tl.to(labels[a]!, { autoAlpha: 0, y: -10, duration: 0.4 }, t).fromTo(
          labels[b]!,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          t + 0.45,
        );
      }
    }
    const total = EDGE_HOLD * 2 + (n - 1) * TRANS + (n - 2) * HOLD;
    if (progress) tl.fromTo(progress, { scaleY: 0 }, { scaleY: 1, duration: total, ease: 'none' }, 0);
    tl.set({}, {}, total); // exact length

    ScrollTrigger.create({
      trigger: root,
      start: () => `top+=${lift()} top`,
      end: () => `+=${stepsLen()}`,
      scrub: 0.6,
      animation: tl,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const time = self.progress * total;
        let i = 0;
        while (i < mids.length && time >= mids[i]!) i++;
        setActive(i);
      },
    });

    if (desktop) {
      // ---- lift: the Services panel slides off the stage beneath it ----
      const liftTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${lift()}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      if (content) liftTl.fromTo(content, { y: () => vh() * 0.08, scale: 0.965 }, { y: 0, scale: 1 }, 0);
      if (shadeIn) liftTl.fromTo(shadeIn, { opacity: 0.14 }, { opacity: 0 }, 0);
      ScrollTrigger.create({
        trigger: root,
        start: () => `top+=${vh() * 0.3} top`,
        once: true,
        onEnter: playIntro,
      });
    } else {
      ScrollTrigger.create({ trigger: root, start: 'top 70%', once: true, onEnter: playIntro });
    }

    // ---- cover: the stage recedes while the next panel rises over it ----
    const coverTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: () => `bottom-=${Math.max(cover, 1)} bottom`,
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    if (recede) coverTl.to(recede, { y: () => (cover > 0 ? -vh() * 0.1 : 0), scale: () => (cover > 0 ? 0.985 : 1) }, 0);
    if (shadeOut) coverTl.to(shadeOut, { opacity: () => (cover > 0 ? 0.16 : 0) }, 0);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measureCover);
      root.style.removeProperty('--journey-cover');
      cover = 0;
      gsap.set([...models, ...nums, ...labels, ...captions], { clearProps: 'all' });
      if (progress) gsap.set(progress, { clearProps: 'transform' });
    };
  });
}
