import { prefersReducedMotion } from './reduced-motion';

/** Scroll reveals: adds .is-in once an element enters the viewport. */
function initReveal(): () => void {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-word]')];
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return () => undefined;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  targets.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/** Subtle parallax: translates [data-parallax] children by a fraction of their scroll offset. */
function initParallax(): () => void {
  const items = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  if (!items.length || prefersReducedMotion()) return () => undefined;
  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    for (const el of items) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) continue;
      const speed = Number(el.dataset['parallax']) || 0.08;
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.setProperty('--py', `${offset.toFixed(1)}px`);
    }
  };
  const onScroll = () => {
    frame ||= requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

/** A soft accent glow that follows the pointer inside the footer. */
function initGlow(): () => void {
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  const glow = footer?.querySelector<HTMLElement>('[data-glow]');
  if (!footer || !glow || prefersReducedMotion() || !matchMedia('(pointer: fine)').matches) return () => undefined;
  let frame = 0;
  let x = 0;
  let y = 0;
  const onMove = (e: PointerEvent) => {
    const r = footer.getBoundingClientRect();
    x = e.clientX - r.left;
    y = e.clientY - r.top;
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      glow.style.setProperty('--gx', `${x}px`);
      glow.style.setProperty('--gy', `${y}px`);
    });
  };
  footer.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    footer.removeEventListener('pointermove', onMove);
  };
}

/** Easter egg: click the hero asterisk and it spins a little faster each time. */
function initSpin(): () => void {
  const star = document.querySelector<HTMLElement>('[data-spin]');
  if (!star || prefersReducedMotion()) return () => undefined;
  let turns = 0;
  const onClick = () => {
    turns += 1;
    star.style.setProperty('--turns', String(turns));
  };
  star.addEventListener('click', onClick);
  return () => star.removeEventListener('click', onClick);
}

/** The intro overlay hides the page for ~2.4s: keep the page inert meanwhile, and let any key skip it. */
function initIntro(): () => void {
  const root = document.documentElement;
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  if (!intro || !root.classList.contains('intro')) return () => undefined;
  const blocked = [...document.body.children].filter((el): el is HTMLElement => el instanceof HTMLElement && el !== intro);
  blocked.forEach((el) => (el.inert = true));
  const finish = () => {
    root.classList.remove('intro');
    blocked.forEach((el) => (el.inert = false));
    window.removeEventListener('keydown', finish);
    intro.removeEventListener('animationend', onEnd);
  };
  const onEnd = (e: AnimationEvent) => {
    if (e.target === intro) finish();
  };
  window.addEventListener('keydown', finish);
  intro.addEventListener('animationend', onEnd);
  return finish;
}

export function initMotion(): () => void {
  const offs = [initIntro(), initReveal(), initParallax(), initGlow(), initSpin()];
  return () => offs.forEach((off) => off());
}
