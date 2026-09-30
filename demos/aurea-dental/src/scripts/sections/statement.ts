/** §5 ClinicStatement — quiet: reveals come from data attributes; only a slow image drift here. */
import { gsap } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

export function init(root: HTMLElement): () => void {
  const inner = root.querySelector<HTMLElement>('[data-statement-parallax]');
  return withMotion(root, ({ desktop }) => {
    if (!desktop || !inner) return;
    gsap.fromTo(
      inner,
      { yPercent: -4 },
      { yPercent: 4, ease: 'none', scrollTrigger: { trigger: inner.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}
