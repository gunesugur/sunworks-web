/** §14 Footer — very low motion: the texture drifts a few percent as the footer enters. */
import { gsap } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

export function init(root: HTMLElement): () => void {
  const texture = root.querySelector<HTMLElement>('[data-footer-texture]');
  return withMotion(root, ({ desktop }) => {
    if (!desktop || !texture) return;
    gsap.fromTo(
      texture,
      { yPercent: -8 },
      { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: true } },
    );
  });
}
