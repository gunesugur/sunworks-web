import { prefersReducedMotion } from './reduced-motion';

const ARMS = 6;
const DURATION = 420;
const RADIUS = 22;
const LENGTH = 9;

/**
 * Click spark: every click throws six short accent strokes outwards, the brand asterisk
 * breaking into light. Mouse / pen only, one shared canvas created on first click.
 */
export function initSpark(): () => void {
  if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return () => undefined;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  const sparks: { x: number; y: number; t0: number }[] = [];
  let frame = 0;

  const ensure = () => {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '9998', pointerEvents: 'none' });
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  };
  const size = () => {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const tick = (now: number) => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#1cdb9c';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (!s) continue;
      const k = (now - s.t0) / DURATION;
      if (k >= 1) {
        sparks.splice(i, 1);
        continue;
      }
      const e = 1 - (1 - k) ** 3;
      const len = LENGTH * (1 - e);
      for (let a = 0; a < ARMS; a++) {
        const ang = (Math.PI * 2 * a) / ARMS - Math.PI / 2;
        const d = RADIUS * e;
        ctx.beginPath();
        ctx.moveTo(s.x + Math.cos(ang) * d, s.y + Math.sin(ang) * d);
        ctx.lineTo(s.x + Math.cos(ang) * (d + len), s.y + Math.sin(ang) * (d + len));
        ctx.stroke();
      }
    }
    frame = sparks.length ? requestAnimationFrame(tick) : 0;
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    const fresh = !canvas;
    ensure();
    if (fresh) size();
    sparks.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    if (!frame) frame = requestAnimationFrame(tick);
  };
  document.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('resize', size);
  return () => {
    document.removeEventListener('pointerdown', onDown);
    window.removeEventListener('resize', size);
    cancelAnimationFrame(frame);
    canvas?.remove();
  };
}
