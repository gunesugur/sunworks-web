/**
 * §2 Intro sequence (load) + §4 hero → statement transition.
 * Intro: a small, light-framed crop at viewport centre opens into the final hero frame by
 * interpolating translate + clip-path (the crop window grows and shifts; the frame is never
 * uniformly scaled after its initial .92 → 1 settle). Then nav, headline lines, copy + CTAs.
 */
import { gsap, EASE, DURATION, STAGGER } from '../../motion/tokens';
import { isDesktop, prefersReducedMotion, withMotion } from '../../motion/media';
import { lockScroll } from '../../motion/smooth-scroll';
import { prepareReveal } from '../../motion/reveal';

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

export function init(root: HTMLElement): () => void {
  const q = <T extends Element = HTMLElement>(sel: string): T | null => root.querySelector<T>(sel);
  const stage = q('[data-hero-stage]');
  const frame = q('[data-hero-frame]');
  const media = q('[data-hero-media]');
  const parallax = q('[data-hero-parallax]');
  const img = q<HTMLImageElement>('[data-hero-frame] img');
  const titleWrap = q('[data-hero-title]');
  const title = q('[data-reveal="lines"]');
  const aside = q('[data-hero-aside]');
  const drift = q('[data-hero-drift]');
  const shade = q('[data-hero-shade]');
  const rule = q('[data-hero-rule]');
  const meta = q('[data-hero-meta]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const details = Array.from(root.querySelectorAll<HTMLElement>('[data-intro]:not([data-intro="frame"])'));
  if (!stage || !frame || !media || !title) return () => undefined;

  const lines = title.querySelectorAll('.mask-line__inner');
  const chrome = [header, ...details].filter((el): el is HTMLElement => el !== null);
  let intro: gsap.core.Timeline | null = null;
  let unlockTimer = 0;

  const showFinal = (): void => {
    gsap.set([frame, ...chrome], { opacity: 1, clearProps: 'transform' });
    gsap.set(lines, { yPercent: 0, y: 0 });
    if (rule) gsap.set(rule, { scaleX: 1 });
  };

  const atTop = window.scrollY < 40 && !window.location.hash;

  if (prefersReducedMotion()) {
    // opacity only, everything usable immediately
    gsap.set(lines, { clearProps: 'transform' });
    gsap.to([frame, title, ...chrome], { opacity: 1, duration: DURATION.medium, ease: EASE.soft, stagger: 0.04 });
  } else if (!atTop) {
    showFinal();
  } else {
    intro = playIntro();
  }

  function playIntro(): gsap.core.Timeline {
    if (!frame || !media || !title) throw new Error('hero: missing nodes');
    lockScroll(true);
    unlockTimer = window.setTimeout(() => lockScroll(false), 3200); // never trap the user

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const F = frame.getBoundingClientRect(); // one read, before any transforms
    const desk = isDesktop();
    const tw = Math.min(F.width, vw * (desk ? 0.42 : 0.72));
    const th = Math.min(F.height, vh * (desk ? 0.35 : 0.3));
    // crop window sits slightly right of centre, so the crop visibly shifts as it opens
    const l = clamp(F.width * (desk ? 0.58 : 0.5) - tw / 2, 0, F.width - tw);
    const t = clamp(F.height * 0.5 - th / 2, 0, F.height - th);
    const r = F.width - l - tw;
    const b = F.height - t - th;
    const dx = vw / 2 - (F.left + l + tw / 2);
    const dy = vh / 2 - (F.top + t + th / 2);
    const pad = clamp(Math.min(tw, th) * 0.045, 8, 16); // the light frame around the image
    const radius = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 18;

    gsap.set(frame, {
      opacity: 0,
      x: dx,
      y: dy,
      scale: 0.92,
      transformOrigin: `${l + tw / 2}px ${t + th / 2}px`,
      clipPath: `inset(${t}px ${r}px ${b}px ${l}px round 6px)`,
    });
    gsap.set(media, { clipPath: `inset(${t + pad}px ${r + pad}px ${b + pad}px ${l + pad}px round 3px)` });
    if (img) gsap.set(img, { scale: 1.1, transformOrigin: `${((l + tw / 2) / F.width) * 100}% 50%` });
    if (header) gsap.set(header, { y: -12 });
    gsap.set(details, { y: 16 });
    prepareReveal(title);
    if (rule) gsap.set(rule, { scaleX: 0 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: EASE.primary },
      onComplete: () => {
        gsap.set(frame, { clearProps: 'clipPath,transform,transformOrigin' });
        gsap.set(media, { clearProps: 'clipPath' });
        if (img) gsap.set(img, { clearProps: 'transform,transformOrigin' });
      },
    });
    const open = 0.9;
    tl.to(frame, { opacity: 1, scale: 1, duration: DURATION.medium, ease: EASE.soft }, 0.15)
      .to(frame, { x: 0, y: 0, clipPath: `inset(0px 0px 0px 0px round ${radius}px)`, duration: DURATION.expand }, open)
      .to(media, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: DURATION.expand * 0.9 }, open + 0.05)
      .to(img ?? [], { scale: 1, duration: DURATION.expand + 0.3 }, open);
    if (rule) tl.to(rule, { scaleX: 1, duration: DURATION.large }, open + 0.75);
    // clear the transform afterwards: a transformed header would trap the fixed menu overlay
    if (header) tl.to(header, { opacity: 1, y: 0, duration: DURATION.medium, clearProps: 'transform' }, open + 0.85);
    tl.to(lines, { yPercent: 0, y: 0, duration: 0.95, stagger: STAGGER.lines }, open + 0.9)
      .to(details, { opacity: 1, y: 0, duration: DURATION.medium, stagger: 0.07 }, open + 1.15)
      .add(() => {
        window.clearTimeout(unlockTimer);
        lockScroll(false);
      }, open + 1.0);

    // start once the hero image is decoded (or after 900ms at most) so the frame never opens empty
    let started = false;
    const start = (): void => {
      if (started) return;
      started = true;
      tl.play();
    };
    window.setTimeout(start, 900);
    if (img) img.decode().then(start, start);
    else start();
    return tl;
  }

  /* ---- hero → statement: sticky stage compresses while the next section slides over ---- */
  const revertMotion = withMotion(root, ({ desktop, mobile }) => {
    if (desktop) {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true },
      });
      tl.fromTo(stage, { scale: 1, clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { scale: 0.965, clipPath: 'inset(0px 0px 0px 0px round 28px)' }, 0);
      if (drift) tl.to(drift, { yPercent: -5 }, 0); // image travels up slower than the document
      if (parallax) tl.to(parallax, { yPercent: 5 }, 0); // depth inside the frame
      if (titleWrap) tl.to(titleWrap, { y: () => -window.innerHeight * 0.1, opacity: 0.25 }, 0); // headline faster
      if (meta) tl.to(meta, { opacity: 0, duration: 0.35 }, 0);
      if (aside) tl.to(aside, { y: () => -window.innerHeight * 0.08 }, 0);
      if (shade) tl.to(shade, { opacity: 0.08 }, 0);
    }
    if (mobile && parallax) {
      gsap.to(parallax, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  });

  return () => {
    intro?.kill();
    window.clearTimeout(unlockTimer);
    lockScroll(false);
    revertMotion();
  };
}
