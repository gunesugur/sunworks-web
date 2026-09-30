/**
 * Scene 1 — Hero load timeline (docs/AUREA_MOTION_RULE_KIT_V3.md §5). Hand-off to the intro is declared on the
 * SceneFrame and built by motion/scenes.ts — nothing scroll-driven lives here.
 *
 * t0: a 21:9 window at 48 % of the stage width, centred on the white stage (radius 12). 0.15 s → 1.25 s: the
 * window's bounds interpolate to the full stage (clip-path inset from measured rects, round 12 → 0) while the
 * image inside refits like object-fit: cover (inner scale = window width / stage width → 1). The aspect ratio
 * of the window changes 2.33 → stage (≈2.1) — spatial growth, not a uniform scale of the frame.
 * Then header (0.95 s), headline lines (1.0 s, 60 ms stagger), copy + CTA (1.25 s).
 * Any wheel / touch / key completes it. QA: ?qa-hero=0|0.5|1 freezes the timeline at that progress.
 * Tablet: same. Phone: image already full, lines only. Reduced motion: final state, opacity 300 ms.
 */
import { gsap, EASE, DURATION, STAGGER } from '../../motion/tokens';
import { MQ, prefersReducedMotion } from '../../motion/media';

const WINDOW_W = 0.48; // start window width / stage width
const WINDOW_RATIO = 9 / 21;
const RADIUS = 12;

export function init(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-stage]');
  const media = root.querySelector<HTMLElement>('[data-hero-media]');
  const inner = media?.querySelector<HTMLElement>('[data-mm-inner]') ?? null;
  const img = media?.querySelector<HTMLImageElement>('img') ?? null;
  const scrim = root.querySelector<HTMLElement>('[data-hero-scrim]');
  const lines = Array.from(root.querySelectorAll<HTMLElement>('#hero-title .mask-line__inner'));
  const details = Array.from(root.querySelectorAll<HTMLElement>('[data-intro]'));
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  // the header starts hidden via [data-intro]; once shown, hand it back to its own CSS (hide-on-scroll)
  const releaseHeader = (): void => {
    if (!header) return;
    header.removeAttribute('data-intro');
    gsap.set(header, { clearProps: 'opacity,transform' });
  };
  if (!stage || !media || !inner) return () => undefined;

  const qa = new URLSearchParams(window.location.search).get('qa-hero');
  const atTop = window.scrollY < 40 && !window.location.hash;

  if (prefersReducedMotion()) {
    gsap.set(lines, { clearProps: 'transform' });
    gsap.to([root.querySelector('#hero-title'), ...details], { opacity: 1, duration: DURATION.ui, ease: EASE.soft });
    if (header) gsap.fromTo(header, { opacity: 0 }, { opacity: 1, duration: DURATION.ui, ease: EASE.soft, onComplete: releaseHeader });
    return () => undefined;
  }

  const showFinal = (): void => {
    gsap.set(details, { opacity: 1, y: 0 });
    releaseHeader();
    gsap.set(lines, { yPercent: 0, y: 0 });
  };
  if (!atTop && qa === null) {
    showFinal();
    return () => undefined;
  }

  const phone = window.matchMedia(MQ.phone).matches;
  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.primary } });

  if (!phone) {
    // one measurement before any transform: the stage box (inner image fills it)
    const w = stage.offsetWidth;
    const h = stage.offsetHeight;
    const ww = w * WINDOW_W;
    const wh = Math.min(h * 0.72, ww * WINDOW_RATIO);
    const x = (w - ww) / 2;
    const y = (h - wh) / 2;
    const s0 = Math.max(ww / w, wh / h); // cover-fit of the full image inside the window
    // explicit from/to strings with the same token count (the browser would normalise a set() value to the
    // 2-value shorthand, which GSAP cannot pair with the 4-value end state)
    const from = `inset(${y}px ${x}px ${y}px ${x}px round ${RADIUS}px)`;
    gsap.set(media, { clipPath: from });
    gsap.set(inner, { scale: s0 * 1.04 });
    if (scrim) gsap.set(scrim, { opacity: 0 });
    tl.fromTo(media, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: DURATION.expand, ease: EASE.primary, immediateRender: false }, 0.15)
      .fromTo(inner, { scale: s0 * 1.04 }, { scale: 1, duration: DURATION.expand, ease: EASE.primary, immediateRender: false }, 0.15);
    if (scrim) tl.to(scrim, { opacity: 1, duration: DURATION.medium, ease: EASE.soft }, 0.9);
  }

  const t = phone ? -0.8 : 0; // phones: no expansion → the text starts right away
  gsap.set(lines, { yPercent: 110, y: 0 });
  gsap.set(details, { opacity: 0, y: 12 });
  if (header) gsap.set(header, { opacity: 0, y: -8 });
  // clear the transform afterwards: a transformed header would trap the fixed menu overlay
  if (header) tl.to(header, { opacity: 1, y: 0, duration: DURATION.medium, onComplete: releaseHeader }, 0.95 + t);
  tl.to(lines, { yPercent: 0, duration: 0.9, stagger: STAGGER.lines }, 1.0 + t).to(
    details,
    { opacity: 1, y: 0, duration: DURATION.medium, stagger: 0.07 },
    1.25 + t,
  );
  tl.eventCallback('onComplete', () => {
    gsap.set(media, { clearProps: 'clipPath' });
    gsap.set(inner, { clearProps: 'transform' });
  });

  if (qa !== null) {
    tl.progress(Math.min(1, Math.max(0, Number(qa) || 0))).pause();
    return () => tl.kill();
  }

  // never hold the user: any intent to move completes the timeline
  const finish = (): void => {
    if (tl.progress() < 1) tl.progress(1);
    off();
  };
  const events: (keyof WindowEventMap)[] = ['wheel', 'touchstart', 'keydown'];
  const off = (): void => events.forEach((e) => window.removeEventListener(e, finish));
  events.forEach((e) => window.addEventListener(e, finish, { passive: true, once: true }));
  tl.eventCallback('onComplete', () => {
    off();
    gsap.set(media, { clearProps: 'clipPath' });
    gsap.set(inner, { clearProps: 'transform' });
  });

  // start once the hero image is decoded (or after 900 ms at most) so the window never opens empty
  let started = false;
  const start = (): void => {
    if (started) return;
    started = true;
    tl.play();
  };
  const timer = window.setTimeout(start, 900);
  if (img) img.decode().then(start, start);
  else start();

  return () => {
    window.clearTimeout(timer);
    off();
    tl.kill();
  };
}
