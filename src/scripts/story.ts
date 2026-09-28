import { SCENES } from '@/lib/story-scenes';
import { prefersReducedMotion } from './reduced-motion';

const W = 360;
const H = 240;
const POINTS = 32;
const HOLD = 2300;
const MORPH = 1300;
const DRAW_IN = 1100;
const SCATTER = 28;

type Pt = [number, number];

/** Samples each stroke into POINTS points; missing strokes collapse onto a point of the scene. */
function sample(host: SVGSVGElement) {
  const count = Math.max(...SCENES.map((s) => s.length));
  return SCENES.map((scene) => {
    const strokes: { pts: Pt[]; accent: boolean; len: number }[] = scene.map((st) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', st.d);
      host.appendChild(path);
      const len = path.getTotalLength();
      const pts: Pt[] = Array.from({ length: POINTS }, (_, i) => {
        const p = path.getPointAtLength((len * i) / (POINTS - 1));
        return [p.x, p.y];
      });
      path.remove();
      return { pts, accent: Boolean(st.a), len };
    });
    while (strokes.length < count) {
      const src = strokes[strokes.length % scene.length];
      const at = src?.pts[Math.floor(POINTS / 2)] ?? [W / 2, H / 2];
      strokes.push({ pts: Array.from({ length: POINTS }, () => [at[0], at[1]] as Pt), accent: false, len: 0 });
    }
    return strokes;
  });
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const rgb = (css: string) => (css.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(v + ((b[i] ?? 0) - v) * k)).join(',')})`;
// Stable pseudo-random scatter direction per stroke point.
const noise = (n: number) => {
  const v = Math.sin(n * 91.7 + 17.3) * 43758.5453;
  return v - Math.floor(v);
};

/** Starts the hero line story. The same strokes scatter and regroup into each scene. */
export function startStory(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-story-canvas]');
  const host = root.querySelector<SVGSVGElement>('[data-story-host]');
  const labels = [...root.querySelectorAll<HTMLElement>('[data-story-label]')];
  const ctx = canvas?.getContext('2d');
  if (!canvas || !host || !ctx) return () => undefined;
  const scenes = sample(host);
  const still = prefersReducedMotion();

  let fg = [245, 246, 247];
  let accent = [28, 219, 156];
  const readColours = () => {
    fg = rgb(getComputedStyle(root).color);
    accent = rgb(getComputedStyle(root.querySelector<HTMLElement>('[data-story-accent]') ?? root).color);
  };

  let scale = 1;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(root.clientWidth * dpr);
    canvas.height = Math.round(root.clientHeight * dpr);
    scale = canvas.width / W;
    if (!running) render(last);
  };

  const draw = (from: number, to: number, k: number, reveal: number) => {
    const a = scenes[from];
    const b = scenes[to];
    if (!a || !b) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, (canvas.height - H * scale) / 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    const e = ease(k);
    const spread = Math.sin(Math.PI * k) * SCATTER;
    a.forEach((sa, s) => {
      const sb = b[s];
      if (!sb) return;
      const len = sa.len + (sb.len - sa.len) * e;
      if (len < 1.5) return;
      const n = Math.max(2, Math.round(POINTS * reveal));
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const pa = sa.pts[i];
        const pb = sb.pts[i];
        if (!pa || !pb) continue;
        // Each stroke drifts off as a whole and bends a little, then settles into its new place.
        const ang = noise(s + 1) * Math.PI * 2;
        const bend = Math.sin(i * 0.35 + s) * spread * 0.18;
        const x = pa[0] + (pb[0] - pa[0]) * e + Math.cos(ang) * spread + bend;
        const y = pa[1] + (pb[1] - pa[1]) * e + Math.sin(ang) * spread - bend;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const ca = sa.accent ? accent : fg;
      const cb = sb.accent ? accent : fg;
      ctx.strokeStyle = mix(ca, cb, e);
      ctx.globalAlpha = 1 - Math.sin(Math.PI * k) * 0.45;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  };

  const cycle = HOLD + MORPH;
  const t0 = performance.now();
  let last = 0;
  let running = false;
  let visible = false;
  let frame = 0;
  let shown = -1;

  const render = (elapsed: number) => {
    if (still) {
      draw(scenes.length - 1, scenes.length - 1, 1, 1);
      return;
    }
    const reveal = Math.min(1, elapsed / DRAW_IN);
    const step = Math.floor(elapsed / cycle);
    const within = elapsed % cycle;
    const from = step % scenes.length;
    const to = (step + 1) % scenes.length;
    const k = within < HOLD ? 0 : (within - HOLD) / MORPH;
    draw(from, to, k, reveal);
    const current = k < 0.5 ? from : to;
    if (current !== shown) {
      shown = current;
      labels.forEach((l, i) => l.classList.toggle('is-on', i === current));
    }
  };
  const loop = (now: number) => {
    last = now - t0;
    render(last);
    frame = running ? requestAnimationFrame(loop) : 0;
  };
  const setRunning = () => {
    running = !still && visible && !document.hidden;
    if (running && !frame) frame = requestAnimationFrame(loop);
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    setRunning();
  });
  const ro = new ResizeObserver(resize);
  const mo = new MutationObserver(() => {
    readColours();
    if (!running) render(last);
  });
  const onVis = () => setRunning();

  readColours();
  resize();
  if (still) labels.forEach((l, i) => l.classList.toggle('is-on', i === labels.length - 1));
  render(0);
  root.classList.add('is-live');
  io.observe(root);
  ro.observe(root);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', onVis);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    document.removeEventListener('visibilitychange', onVis);
  };
}
