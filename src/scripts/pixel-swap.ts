/**
 * Pixel swap for the theme switch: rounded pixels in the incoming theme's paper colour pop in,
 * spreading from the toggle, the theme changes under full cover, then the pixels pop out in the
 * same order. A few accent pixels flicker through, like the logo's sun.
 */
const CELL = 56;
const MAX_CELLS = 420;
const PHASE_MS = 430;
const SPREAD = 0.62;

/** Deterministic per-cell jitter (0..1): looks random, no RNG needed. */
const jitter = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export function pixelSwap(origin: { x: number; y: number }, colour: string, accent: string, commit: () => void) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cell = Math.max(CELL, Math.ceil(Math.sqrt((w * h) / MAX_CELLS)));
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const far = Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y));
  const cells: { x: number; y: number; delay: number; fill: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cell;
      const y = r * cell;
      const d = Math.hypot(x + cell / 2 - origin.x, y + cell / 2 - origin.y) / far;
      const i = r * cols + c;
      cells.push({ x, y, delay: d * SPREAD + jitter(i + 1) * (1 - SPREAD), fill: jitter(i + 7.3) < 0.06 ? accent : colour });
    }
  }

  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '9999', pointerEvents: 'none' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    commit();
    return;
  }
  ctx.scale(dpr, dpr);

  // Each cell runs over the first 45% of a phase after its own delay share.
  const scaleAt = (t: number, delay: number) => Math.min(1, Math.max(0, (t - delay * 0.55) / 0.45));
  const draw = (t: number, growing: boolean) => {
    ctx.clearRect(0, 0, w, h);
    for (const p of cells) {
      const k = scaleAt(t, p.delay);
      const s = growing ? k : 1 - k;
      if (s <= 0) continue;
      const size = (cell + 1) * (s < 1 ? 1 - (1 - s) ** 3 : 1);
      const off = (cell - size) / 2;
      ctx.fillStyle = s >= 1 ? colour : p.fill;
      ctx.beginPath();
      ctx.roundRect(p.x + off, p.y + off, size, size, s >= 1 ? 0 : size * 0.22);
      ctx.fill();
    }
  };

  let start = performance.now();
  let growing = true;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / PHASE_MS);
    draw(t, growing);
    if (t < 1) {
      requestAnimationFrame(tick);
    } else if (growing) {
      commit();
      growing = false;
      start = performance.now();
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(tick);
}
