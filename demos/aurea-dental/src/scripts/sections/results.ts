/**
 * §8 ResultsSection — interior only (beneath / recede hand-offs come from scenes.ts).
 * Slider: pointer drag anywhere on the frame (pointer capture; rect measured once per drag; vertical page
 * scroll stays native via touch-action: pan-y) + keyboard on the role="slider" handle (←/→/↑/↓ 2 %,
 * Shift+arrow or PageUp/PageDown 10 %, Home/End). Only `--pos` changes → no layout, no drift.
 * One 600 ms hint (50 → 44 → 50) the first time the frame is well in view; never after any interaction,
 * never under reduced motion.
 */
import { gsap, ScrollTrigger, EASE } from '../../motion/tokens';
import { withMotion } from '../../motion/media';

export function init(root: HTMLElement): () => void {
  const fig = root.querySelector<HTMLElement>('[data-ba]');
  const frame = root.querySelector<HTMLElement>('[data-ba-frame]');
  const handle = root.querySelector<HTMLElement>('[data-ba-handle]');
  if (!fig || !frame || !handle) return () => undefined;

  const template = fig.dataset.valueText ?? '{before}% before, {after}% after';
  let pos = 50;
  let touched = false;
  let hint: gsap.core.Tween | null = null;
  const render = (value: number): void => {
    pos = Math.min(100, Math.max(0, value));
    const r = Math.round(pos);
    frame.style.setProperty('--pos', pos.toFixed(2));
    handle.setAttribute('aria-valuenow', String(r));
    handle.setAttribute('aria-valuetext', template.replace('{before}', String(r)).replace('{after}', String(100 - r)));
  };
  const interrupt = (): void => {
    touched = true;
    hint?.kill();
    hint = null;
  };

  let rect: DOMRect | null = null;
  let dragging = false;
  const fromPointer = (e: PointerEvent): void => {
    if (rect && rect.width > 0) render(((e.clientX - rect.left) / rect.width) * 100);
  };
  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    interrupt();
    rect = frame.getBoundingClientRect();
    dragging = true;
    frame.classList.add('is-dragging');
    frame.setPointerCapture(e.pointerId);
    if (e.pointerType !== 'touch') {
      fromPointer(e);
      handle.focus({ preventScroll: true });
      e.preventDefault();
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (dragging) fromPointer(e);
  };
  const onUp = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    frame.classList.remove('is-dragging');
    if (frame.hasPointerCapture(e.pointerId)) frame.releasePointerCapture(e.pointerId);
  };
  const onKey = (e: KeyboardEvent): void => {
    const big = e.shiftKey ? 10 : 2;
    const steps: Record<string, number> = { ArrowLeft: -big, ArrowDown: -big, ArrowRight: big, ArrowUp: big, PageDown: -10, PageUp: 10 };
    let next: number | null = null;
    if (e.key in steps) next = pos + (steps[e.key] ?? 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    if (next === null) return;
    e.preventDefault();
    interrupt();
    render(Math.round(next));
  };

  frame.addEventListener('pointerdown', onDown);
  frame.addEventListener('pointermove', onMove);
  frame.addEventListener('pointerup', onUp);
  frame.addEventListener('pointercancel', onUp);
  handle.addEventListener('keydown', onKey);
  render(pos);

  const motion = withMotion(root, ({ reduce, phone }) => {
    if (reduce) return;
    // the stage is CSS-sticky on ≥640 (its first --scene-head is the Doctors lift-off) → trigger on the scene root
    ScrollTrigger.create({
      trigger: phone ? frame : root,
      start: phone ? 'top 65%' : 'top -45%',
      once: true,
      onEnter: () => {
        if (touched) return;
        const state = { v: pos };
        hint = gsap.to(state, {
          keyframes: [
            { v: 44, duration: 0.3, ease: EASE.soft },
            { v: 50, duration: 0.3, ease: EASE.soft },
          ],
          delay: 0.3,
          onUpdate: () => render(state.v),
          onComplete: () => void (hint = null),
        });
      },
    });
  });

  return () => {
    motion();
    hint?.kill();
    frame.removeEventListener('pointerdown', onDown);
    frame.removeEventListener('pointermove', onMove);
    frame.removeEventListener('pointerup', onUp);
    frame.removeEventListener('pointercancel', onUp);
    handle.removeEventListener('keydown', onKey);
  };
}
