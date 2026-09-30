/**
 * Scene hand-offs — ONE place where every transition between scenes is built (docs/AUREA_MOTION_RULE_KIT_V3.md).
 * Scenes declare their hand-off in markup via <SceneFrame enter="…" exit="…" ambient="…">; initScenes() reads
 * those attributes and builds scrubbed timelines. Sections never improvise transitions of their own.
 *
 *   enter="rise"     prev pinned stage: scale 1 → .955, yPercent 0 → -2, dim 0 → .10   (hero: .94 / -6vh / .06)
 *                    trigger: incoming scene, 'top bottom' → 'top top'
 *   enter="beneath"  incoming stage: scale .965 → 1, yPercent 6 → 0, dim .10 → 0
 *                    stage: trigger incoming, 'top top' → +head (prev lifts off while this one is pinned)
 *                    column: content y -22vh → 0, 'top bottom' → 'bottom bottom' (footer)
 *   enter="grow"     [data-grow] MaskedMedia: clip window → inset(0) + media scale 1.16 → 1
 *                    trigger incoming, 'top bottom' → 'top top'
 *   exit="recede"    stage/content: y 0 → -8vh, opacity 1 → .4; trigger outgoing, 'bottom bottom' → 'bottom top'
 *
 * All scrubbed (scrub: true, ease none), transform/opacity/clip-path only, measured on refresh only.
 * Desktop + tablet (≥640, motion). Phones: flow only (no overlaps), grow plays once. Reduced motion: nothing
 * here runs; CSS shows every scene in its final state.
 */
import { gsap, ScrollTrigger, EASE, DURATION, HANDOFF } from './tokens';
import { withMotion, MQ } from './media';

const CLIP_FULL = 'inset(0% 0% 0% 0% round 0px)';

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string): T | null => root.querySelector<T>(sel);
const stageOf = (scene: Element): HTMLElement | null => q(scene, ':scope > .scene__pin > [data-stage], :scope > [data-stage]');
const dimOf = (scene: Element): HTMLElement | null => q(scene, '[data-scene-dim]');

const prevScene = (scene: Element): HTMLElement | null => {
  let el = scene.previousElementSibling;
  while (el && !(el as HTMLElement).dataset?.scene) el = el.previousElementSibling;
  if (el) return el as HTMLElement;
  // footer (outside <main>) → last scene inside main
  const main = scene.parentElement?.querySelector?.('main') ?? document.querySelector('main');
  const scenes = main ? main.querySelectorAll<HTMLElement>(':scope > [data-scene]') : null;
  return scenes && scene.parentElement !== main ? (scenes[scenes.length - 1] ?? null) : null;
};

/** Resolve a CSS length custom property (e.g. --scene-head: 100svh) to px. Call on refresh only. */
export function lengthPx(el: HTMLElement, prop: string): number {
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(${prop});`;
  el.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h;
}

/** Clip-path start for a grow mode. */
const growFrom = (mode: string | undefined): string =>
  mode === 'y' ? HANDOFF.grow.clipY : mode === 'x' ? HANDOFF.grow.clipX : HANDOFF.grow.clipRect;

function buildRise(to: HTMLElement): void {
  const from = prevScene(to);
  const stage = from ? stageOf(from) : null;
  if (!from || !stage) return;
  const hero = from.dataset.scene === 'hero';
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: to, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
  });
  if (hero) tl.fromTo(stage, { scale: 1, y: 0 }, { scale: HANDOFF.hero.scale, y: () => (window.innerHeight * HANDOFF.hero.yVh) / 100 }, 0);
  else tl.fromTo(stage, { scale: 1, yPercent: 0 }, { scale: HANDOFF.riseOver.scale, yPercent: HANDOFF.riseOver.yPercent }, 0);
  const dim = dimOf(from);
  if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: hero ? HANDOFF.hero.dim : HANDOFF.riseOver.dim }, 0);
}

function buildBeneath(to: HTMLElement): void {
  const stage = stageOf(to);
  if (!stage) return;
  if (to.classList.contains('scene--stage')) {
    let head = 0;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: to,
        start: 'top top',
        end: () => `+=${Math.max(1, head)}`,
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: () => void (head = lengthPx(to, '--scene-head')),
      },
    });
    tl.fromTo(stage, { scale: HANDOFF.liftOff.scale, yPercent: HANDOFF.liftOff.yPercent }, { scale: 1, yPercent: 0 }, 0);
    const dim = dimOf(to);
    if (dim) tl.fromTo(dim, { opacity: HANDOFF.liftOff.dim }, { opacity: 0 }, 0);
    return;
  }
  // column (footer): content drifts up from behind the lifting scene
  gsap.fromTo(
    stage,
    { y: () => -window.innerHeight * 0.22 },
    { y: 0, ease: 'none', scrollTrigger: { trigger: to, start: 'top bottom', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } },
  );
}

function buildGrow(to: HTMLElement, scrubbed: boolean): void {
  to.querySelectorAll<HTMLElement>('[data-masked-media][data-grow]').forEach((mm) => {
    const inner = q(mm, '[data-mm-inner]');
    const from = growFrom(mm.dataset.grow);
    if (scrubbed) {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: to, start: 'top bottom', end: 'top top', scrub: true },
      });
      tl.fromTo(mm, { clipPath: from }, { clipPath: CLIP_FULL }, 0);
      if (inner) tl.fromTo(inner, { scale: HANDOFF.grow.mediaScale }, { scale: 1 }, 0);
      return;
    }
    // phones: one time-based reveal (CSS start state only applies ≥640, so set it here)
    gsap.set(mm, { clipPath: from });
    if (inner) gsap.set(inner, { scale: HANDOFF.grow.mediaScale });
    ScrollTrigger.create({
      trigger: mm,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(mm, { clipPath: CLIP_FULL, duration: DURATION.large, ease: EASE.primary });
        if (inner) gsap.to(inner, { scale: 1, duration: DURATION.large * 1.2, ease: EASE.primary });
      },
    });
  });
}

function buildRecede(from: HTMLElement): void {
  const targets = from.querySelectorAll<HTMLElement>('[data-recede]');
  const target = targets.length ? Array.from(targets) : stageOf(from);
  if (!target) return;
  gsap.fromTo(
    target,
    { y: 0, opacity: 1 },
    {
      y: () => (window.innerHeight * HANDOFF.recede.yVh) / 100,
      opacity: HANDOFF.recede.opacity,
      ease: 'none',
      scrollTrigger: { trigger: from, start: 'bottom bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    },
  );
}

let reapplyAmbient: () => void = () => undefined;
/**
 * Call after changing a scene's data-ambient (e.g. Doctors switching portrait: scene.dataset.ambient = 'doctor-02')
 * so the backdrop crossfades to the new layer.
 */
export const ambientChanged = (): void => reapplyAmbient();

/** Ambient controller: the latest (DOM order) active [data-ambient] scene lights its layer. No scroll reads. */
export function initAmbient(root: ParentNode = document): () => void {
  const backdrop = document.querySelector<HTMLElement>('[data-ambient-root]');
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-ambient]'));
  if (!backdrop || scenes.length === 0) return () => undefined;
  const layers = new Map<string, HTMLElement>();
  backdrop.querySelectorAll<HTMLElement>('[data-ambient-layer]').forEach((l) => layers.set(l.dataset.ambientLayer ?? '', l));
  const active = new Set<HTMLElement>();
  let current: HTMLElement | null = null;
  const apply = (): void => {
    const winner = scenes.filter((s) => active.has(s)).pop() ?? null;
    const layer = winner ? (layers.get(winner.dataset.ambient ?? '') ?? null) : null;
    if (layer === current) return;
    current?.removeAttribute('data-active');
    layer?.setAttribute('data-active', '');
    current = layer;
  };
  reapplyAmbient = () => {
    current?.removeAttribute('data-active');
    current = null;
    apply();
  };
  const triggers = scenes.map((scene) =>
    ScrollTrigger.create({
      trigger: scene,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => {
        if (self.isActive) active.add(scene);
        else active.delete(scene);
        apply();
      },
    }),
  );
  return () => {
    triggers.forEach((t) => t.kill());
    current?.removeAttribute('data-active');
  };
}

/**
 * Wires every declared hand-off. Call once from main.ts after section modules (order-independent: all
 * stages are CSS-sticky, nothing here pins).
 */
export function initScenes(root: ParentNode = document): () => void {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
  const revertMotion = withMotion(document.body, ({ desktop, tablet, phone }) => {
    const wide = desktop || tablet;
    scenes.forEach((scene) => {
      const enter = scene.dataset.enter;
      if (wide && enter === 'rise') buildRise(scene);
      if (wide && enter === 'beneath') buildBeneath(scene);
      if (enter === 'grow' && (wide || phone)) buildGrow(scene, wide);
      if (wide && scene.dataset.exit === 'recede') buildRecede(scene);
    });
  });
  const revertAmbient = window.matchMedia(MQ.phone).matches ? () => undefined : initAmbient(root);
  return () => {
    revertMotion();
    revertAmbient();
  };
}

/**
 * Scrub helper for a scene's own choreography inside its pinned range (after --scene-head, over --scene-len).
 * Use inside withMotion(); returns the ScrollTrigger (reverted with the matchMedia context).
 */
export function scenePin(scene: HTMLElement, vars: Omit<ScrollTrigger.Vars, 'trigger' | 'start' | 'end'> = {}): ScrollTrigger {
  let head = 0;
  let len = 0;
  const userInit = vars.onRefreshInit;
  return ScrollTrigger.create({
    scrub: true,
    invalidateOnRefresh: true,
    ...vars,
    trigger: scene,
    start: () => `top+=${head} top`,
    end: () => `+=${Math.max(1, len)}`,
    onRefreshInit: (self) => {
      head = lengthPx(scene, '--scene-head');
      len = lengthPx(scene, '--scene-len');
      userInit?.(self);
    },
  });
}

/**
 * Directional clip-path mask swap (doctors): out inset(0) → inset(0 100% 0 0), in inset(0 0 0 100%) → inset(0).
 * `forward: false` mirrors it. Interruptible: pass the previous timeline's targets again; overwrite handles it.
 */
export function maskWipe(
  out: HTMLElement | null,
  next: HTMLElement,
  opts: { forward?: boolean; duration?: number; reduce?: boolean } = {},
): gsap.core.Timeline {
  const forward = opts.forward ?? true;
  const duration = opts.duration ?? DURATION.wipe;
  const tl = gsap.timeline({ defaults: { ease: EASE.primary, overwrite: 'auto' } });
  if (opts.reduce) {
    if (out) tl.to(out, { opacity: 0, duration: DURATION.ui }, 0);
    tl.fromTo(next, { opacity: 0, clipPath: CLIP_FULL }, { opacity: 1, duration: DURATION.ui }, 0);
    return tl;
  }
  gsap.set(next, { zIndex: 2, opacity: 1 });
  if (out) gsap.set(out, { zIndex: 1 });
  if (out) tl.fromTo(out, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: forward ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)', duration }, 0);
  tl.fromTo(next, { clipPath: forward ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration }, 0);
  return tl;
}

/**
 * Scroll-driven phrase inking (intro statement): each [data-ink] phrase goes --ink 0 → 1 in sequence
 * (soft overlap) as the container travels from `start` to `end`. Colour only; reduced motion = fully inked (CSS).
 */
export function inkPhrases(container: HTMLElement, opts: { start?: string; end?: string } = {}): ScrollTrigger | null {
  const phrases = Array.from(container.querySelectorAll<HTMLElement>('[data-ink]'));
  if (phrases.length === 0) return null;
  const n = phrases.length;
  const last = phrases.map(() => -1);
  return ScrollTrigger.create({
    trigger: container,
    start: opts.start ?? 'top 75%',
    end: opts.end ?? 'bottom 45%',
    onUpdate: (self) => {
      const p = self.progress * (n + 1.2); // ~1.2 phrase of softness
      phrases.forEach((el, i) => {
        const v = Math.min(1, Math.max(0, p - i) / 1.2);
        if (Math.abs(v - (last[i] ?? -1)) > 0.01) {
          last[i] = v;
          el.style.setProperty('--ink', v.toFixed(3));
        }
      });
    },
  });
}
