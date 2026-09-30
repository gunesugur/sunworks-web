/**
 * §6 TreatmentJourney — the scene's OWN choreography inside its pinned range (motion kit §5 Journey).
 * The hand-off in (beneath: stage .965 → 1 while Services lifts off) and out (Doctors rises over it) are built
 * by motion/scenes.ts from the SceneFrame declaration; nothing here touches them.
 *
 * One scrubbed timeline (ease none) over --len-journey via scenePin():
 *   [0, HEAD]            heading lifts out of the stage top (track y 0 → −head height, measured on refresh)
 *   4 × quarter of rest  transition in the middle 50 % of each quarter (still plateaus between):
 *     number   masked roll: old yPercent 0 → −100, new 100 → 0
 *     model    out opacity 1→0, scale 1→.97, x 0→−8, rotateY 0→−2° · in opacity 0→1, scale 1.025→1, x 8→0,
 *              rotateY 2°→0 (perspective 1200; overlapping → brief double exposure, never spin/float)
 *     list     translateY so the active row sits at the list top (desktop) / in the single row (mobile);
 *              active row opacity 1, others .2 (= --text-faint)
 *     caption  cross-fade (+6 px)
 *   progress line scaleY 0 → 1 over the whole range.
 * Reduced motion: nothing (CSS renders the stacked list).
 */
import { gsap } from '../../motion/tokens';
import { withMotion } from '../../motion/media';
import { scenePin } from '../../motion/scenes';

const HEAD = 0.14;
const FAINT = 0.2;

export function init(root: HTMLElement): () => void {
  const all = (sel: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(sel));
  const track = root.querySelector<HTMLElement>('[data-journey-track]');
  const head = root.querySelector<HTMLElement>('[data-journey-head]');
  const list = root.querySelector<HTMLElement>('[data-jsteps]');
  const progress = root.querySelector<HTMLElement>('[data-jprogress]');
  const steps = all('[data-jstep]');
  const nums = all('[data-jnum]');
  const models = all('[data-jmodel]');
  const caps = all('[data-jcap]');
  const rows = all('[data-jrow]');
  const n = steps.length;
  if (!track || !head || !list || n < 2 || [nums, models, caps, rows].some((a) => a.length !== n)) return () => undefined;

  let active = 0;
  const setActive = (i: number): void => {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => (k === i ? s.setAttribute('aria-current', 'step') : s.removeAttribute('aria-current')));
  };

  return withMotion(root, ({ reduce }) => {
    if (reduce) return;
    gsap.set(models, { transformPerspective: 1200, transformOrigin: '50% 50%' });
    // the CSS start state (translate 100 %) must become yPercent, or GSAP reads it as px and adds to it
    gsap.set(nums, { y: 0, yPercent: (i: number) => (i === 0 ? 0 : 100) });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    // heading lift: its own fromTo (explicit from → safe to invalidate on refresh for the measured height)
    const lift = gsap.fromTo(track, { y: 0 }, { y: () => -head.offsetHeight, ease: 'none', paused: true });

    const quarter = (1 - HEAD) / (n - 1);
    const d = quarter * 0.5;
    const mids: number[] = [];
    for (let a = 0; a < n - 1; a++) {
      const b = a + 1;
      const t = HEAD + a * quarter + quarter * 0.25;
      mids.push(t + d / 2);
      tl.to(models[a]!, { opacity: 0, scale: 0.97, x: -8, rotationY: -2, duration: d * 0.7 }, t)
        .fromTo(models[b]!, { opacity: 0, scale: 1.025, x: 8, rotationY: 2 }, { opacity: 1, scale: 1, x: 0, rotationY: 0, duration: d * 0.7 }, t + d * 0.3)
        .to(nums[a]!, { yPercent: -100, duration: d * 0.6 }, t + d * 0.1)
        .fromTo(nums[b]!, { yPercent: 100 }, { yPercent: 0, duration: d * 0.6 }, t + d * 0.3)
        .to(caps[a]!, { opacity: 0, y: -6, duration: d * 0.45 }, t)
        .fromTo(caps[b]!, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: d * 0.5 }, t + d * 0.5)
        .to(list, { yPercent: (-100 / n) * b, duration: d }, t)
        .to(rows[a]!, { opacity: FAINT, duration: d * 0.6 }, t + d * 0.2)
        .fromTo(rows[b]!, { opacity: FAINT }, { opacity: 1, duration: d * 0.6 }, t + d * 0.2);
    }
    if (progress) tl.fromTo(progress, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
    else tl.set({}, {}, 1);

    // driven through onUpdate (= scrub: true; ScrollTrigger.Vars has no typed `animation`)
    scenePin(root, {
      onRefresh: (self) => {
        lift.invalidate().progress(Math.min(1, self.progress / HEAD));
        tl.progress(self.progress);
      },
      onUpdate: (self) => {
        lift.progress(Math.min(1, self.progress / HEAD));
        tl.progress(self.progress);
        const time = self.progress;
        let i = 0;
        while (i < mids.length && time >= mids[i]!) i++;
        setActive(i);
      },
    });

    return () => setActive(0);
  });
}
