/**
 * Scene 2 — Intro interior: scroll-driven phrase inking of the statement (motion kit §5). Colour only, no
 * movement. Hand-offs (rise over the hero, recede into Benefits) are declared on the RisingPanel and built by
 * motion/scenes.ts. Reduced motion / fallback: fully inked (CSS in scene.css).
 */
import { inkPhrases } from '../../motion/scenes';
import { withMotion } from '../../motion/media';

export function init(root: HTMLElement): () => void {
  const statement = root.querySelector<HTMLElement>('[data-ink-root]');
  if (!statement) return () => undefined;
  return withMotion(root, ({ reduce }) => {
    if (reduce) return;
    const st = inkPhrases(statement, { start: 'top 80%', end: 'bottom 45%' });
    return () => {
      st?.kill();
      statement.querySelectorAll<HTMLElement>('[data-ink]').forEach((el) => el.style.removeProperty('--ink'));
    };
  });
}
