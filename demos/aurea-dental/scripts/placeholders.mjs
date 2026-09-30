// Art-directed placeholder photography: "architectural light studies".
// Each key is a deterministic SVG composition (warm ivory/stone/grey, raking light, long soft
// shadows, sculptural volumes) rendered by sharp, then finished with seeded film grain.
// Existing files are kept (real photos land under the same names) unless run with --force.
//   node scripts/placeholders.mjs [--force] [--only=hero-clinic,journey-1]
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../src/assets/images/', import.meta.url));
const FORCE = process.argv.includes('--force');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');

/* ---------- utilities ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
const f = (n) => Number(n.toFixed(1));
const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

const CH = '#3a3834';
const LIGHT = '#fffdf8';
/** tone ramps: [highlight, mid, shadow, core] */
const T = {
  ivory: ['#fbfaf7', '#eeebe5', '#d8d3c9', '#c2bcb1'],
  stone: ['#efece5', '#dcd7ce', '#c3bdb2', '#a9a398'],
  grey: ['#e7e5e0', '#cfccc5', '#b3afa7', '#97938b'],
  char: ['#75716a', '#514e49', '#3b3935', '#2b2a27'],
  warm: ['#f4efe7', '#e3dace', '#cbc0b0', '#b3a795'],
  white: ['#fdfcfa', '#f4f2ee', '#e3dfd8', '#d1ccc3'],
};

class Scene {
  constructor(W, H, seed) {
    this.W = W;
    this.H = H;
    this.u = Math.min(W, H);
    /** @type {string[]} */ this.defs = [];
    /** @type {string[]} */ this.body = [];
    this.n = 0;
    /** @type {Map<string, string>} */ this.blurs = new Map();
    this.rand = mulberry32(seed);
  }
  id(p) {
    return `${p}${this.n++}`;
  }
  stops(st) {
    return st.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
  }
  lin(st, dir = 'v') {
    const v = { v: [0, 0, 0, 1], vr: [0, 1, 0, 0], h: [0, 0, 1, 0], hr: [1, 0, 0, 0] }[dir] ?? dir;
    const id = this.id('g');
    this.defs.push(`<linearGradient id="${id}" x1="${v[0]}" y1="${v[1]}" x2="${v[2]}" y2="${v[3]}">${this.stops(st)}</linearGradient>`);
    return `url(#${id})`;
  }
  rad(st, { cx = 0.5, cy = 0.5, r = 0.5, fx = cx, fy = cy } = {}) {
    const id = this.id('r');
    this.defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${this.stops(st)}</radialGradient>`);
    return `url(#${id})`;
  }
  /** blur amount is in thousandths of the short side → resolution independent */
  blur(k) {
    const sd = Math.max(0.4, (k * this.u) / 1000).toFixed(1);
    if (!this.blurs.has(sd)) {
      const id = this.id('b');
      this.blurs.set(sd, id);
      this.defs.push(`<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
    }
    return `filter="url(#${this.blurs.get(sd)})"`;
  }
  add(s) {
    this.body.push(s);
  }
  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.W}" height="${this.H}" viewBox="0 0 ${this.W} ${this.H}"><defs>${this.defs.join('')}</defs>${this.body.join('')}</svg>`;
  }
}

/* ---------- building blocks (pixel coords) ---------- */
const side = (light) => (light === 'left' ? 'h' : 'hr');
const cylStops = (t) => [[0, t[1]], [0.18, t[0]], [0.52, t[1]], [0.84, t[2]], [1, t[3]]];

function room(s, { horizon = 0.7, light = 'left', wall = ['#f1eee8', '#dfdad1'], floor = ['#e8e4dc', '#cfc9bf'], sheen = 0.4 } = {}) {
  const { W, H, u } = s;
  const hy = H * horizon;
  s.add(`<rect width="${W}" height="${f(hy)}" fill="${s.lin([[0, wall[0]], [1, wall[1]]])}"/>`);
  s.add(`<rect width="${W}" height="${f(hy)}" fill="${s.lin([[0, LIGHT, sheen], [0.55, LIGHT, 0], [1, CH, 0.12]], side(light))}"/>`);
  s.add(`<rect y="${f(hy)}" width="${W}" height="${f(H - hy)}" fill="${s.lin([[0, floor[0]], [1, floor[1]]])}"/>`);
  s.add(`<rect y="${f(hy)}" width="${W}" height="${f(H - hy)}" fill="${s.lin([[0, LIGHT, sheen * 0.55], [0.65, LIGHT, 0], [1, CH, 0.08]], side(light))}"/>`);
  s.add(`<rect y="${f(hy - u * 0.004)}" width="${W}" height="${f(u * 0.014)}" fill="${CH}" opacity="0.09" ${s.blur(5)}/>`);
  return hy;
}
function shaft(s, p, op = 0.45, b = 22) {
  s.add(`<polygon points="${pts(p)}" fill="${LIGHT}" opacity="${op}" ${s.blur(b)}/>`);
}
function shade(s, p, op = 0.14, b = 26) {
  s.add(`<polygon points="${pts(p)}" fill="${CH}" opacity="${op}" ${s.blur(b)}/>`);
}
function contact(s, cx, cy, rx, ry, op = 0.28, b = 8) {
  s.add(`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${CH}" opacity="${op}" ${s.blur(b)}/>`);
}
/** floor shadow cast away from the light */
function longShadow(s, x1, x2, baseY, len, light = 'left', op = 0.16) {
  const d = light === 'left' ? 1 : -1;
  const spread = len * 0.22;
  shade(s, [[x1, baseY], [x2, baseY], [x2 + d * len, baseY + spread], [x1 + d * len * 0.75, baseY + spread * 1.35]], op, 20);
}
function cylinder(s, cx, top, w, h, tone = 'stone', light = 'left') {
  const t = T[tone];
  const ry = w * 0.1;
  const l = cx - w / 2;
  const r = cx + w / 2;
  contact(s, cx, top + h, w * 0.56, ry * 1.3, 0.3, 10);
  s.add(`<path d="M${f(l)} ${f(top)} L${f(l)} ${f(top + h)} A${f(w / 2)} ${f(ry)} 0 0 0 ${f(r)} ${f(top + h)} L${f(r)} ${f(top)} Z" fill="${s.lin(cylStops(t), side(light))}"/>`);
  s.add(`<ellipse cx="${f(cx)}" cy="${f(top)}" rx="${f(w / 2)}" ry="${f(ry)}" fill="${s.lin([[0, T.white[0]], [1, t[1]]])}"/>`);
}
function box(s, x, top, w, h, d, tone = 'stone', light = 'left') {
  const t = T[tone];
  contact(s, x + w / 2, top + h, w * 0.55, d * 0.35, 0.26, 8);
  s.add(`<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" fill="${s.lin([[0, t[light === 'left' ? 1 : 2]], [1, t[light === 'left' ? 2 : 1]]], 'h')}"/>`);
  s.add(`<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" fill="${s.lin([[0, LIGHT, 0.25], [0.3, LIGHT, 0], [1, CH, 0.1]])}"/>`);
  s.add(`<polygon points="${pts([[x, top], [x + w, top], [x + w - d * 0.45, top - d], [x + d * 0.45, top - d]])}" fill="${s.lin([[0, t[0]], [1, T.white[0]]], 'vr')}"/>`);
}
function sphere(s, cx, cy, r, tone = 'ivory', light = 'left') {
  const t = T[tone];
  contact(s, cx + (light === 'left' ? r * 0.15 : -r * 0.15), cy + r * 0.98, r * 0.85, r * 0.13, 0.34, 8);
  const fx = light === 'left' ? 0.3 : 0.7;
  s.add(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${s.rad([[0, T.white[0]], [0.35, t[0]], [0.72, t[1]], [0.92, t[2]], [1, t[3]]], { fx, fy: 0.28 })}"/>`);
}
function capsule(s, cx, top, w, h, tone = 'grey', light = 'left') {
  const t = T[tone];
  contact(s, cx, top + h, w * 0.7, w * 0.12, 0.3, 6);
  s.add(`<rect x="${f(cx - w / 2)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" rx="${f(w / 2)}" fill="${s.lin(cylStops(t), side(light))}"/>`);
  s.add(`<rect x="${f(cx - w / 2)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" rx="${f(w / 2)}" fill="${s.lin([[0, LIGHT, 0.35], [0.25, LIGHT, 0], [1, CH, 0.12]])}"/>`);
}
function ring(s, cx, cy, R, r, tone = 'stone', light = 'left') {
  const t = T[tone];
  contact(s, cx, cy + R, R * 0.5, R * 0.07, 0.34, 6);
  const d = `M${f(cx - R)} ${f(cy)} a${f(R)} ${f(R)} 0 1 0 ${f(2 * R)} 0 a${f(R)} ${f(R)} 0 1 0 ${f(-2 * R)} 0 Z M${f(cx - r)} ${f(cy)} a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z`;
  s.add(`<path fill-rule="evenodd" d="${d}" fill="${s.lin(cylStops(t), side(light))}"/>`);
  s.add(`<path fill-rule="evenodd" d="${d}" fill="${s.lin([[0, LIGHT, 0.4], [0.4, LIGHT, 0], [1, CH, 0.16]])}"/>`);
}
function halfDisc(s, cx, base, r, tone = 'ivory', light = 'left') {
  const t = T[tone];
  contact(s, cx, base, r * 1.02, r * 0.06, 0.32, 6);
  s.add(`<path d="M${f(cx - r)} ${f(base)} A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(base)} Z" fill="${s.lin(cylStops(t), side(light))}"/>`);
  s.add(`<path d="M${f(cx - r)} ${f(base)} A${f(r)} ${f(r)} 0 0 1 ${f(cx + r)} ${f(base)} Z" fill="${s.lin([[0, LIGHT, 0.3], [0.5, LIGHT, 0], [1, CH, 0.1]])}"/>`);
}
function arch(s, x, top, w, h, fill) {
  const r = w / 2;
  s.add(`<path d="M${f(x)} ${f(top + h)} L${f(x)} ${f(top + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(top + r)} L${f(x + w)} ${f(top + h)} Z" fill="${fill}"/>`);
}
/** abstract figure: soft shoulders, neck, head volume — no features */
function figure(s, cx, sy, sc, tone = 'ivory', light = 'left', tilt = 0) {
  const t = T[tone];
  const H = s.H + 20;
  const torso = (ox) =>
    `M${f(cx + ox - 0.53 * sc)} ${f(H)} L${f(cx + ox - 0.5 * sc)} ${f(sy + 0.22 * sc)} C${f(cx + ox - 0.49 * sc)} ${f(sy + 0.05 * sc)} ${f(cx + ox - 0.34 * sc)} ${f(sy)} ${f(cx + ox - 0.15 * sc)} ${f(sy - 0.01 * sc)} L${f(cx + ox + 0.15 * sc)} ${f(sy - 0.01 * sc)} C${f(cx + ox + 0.34 * sc)} ${f(sy)} ${f(cx + ox + 0.49 * sc)} ${f(sy + 0.05 * sc)} ${f(cx + ox + 0.5 * sc)} ${f(sy + 0.22 * sc)} L${f(cx + ox + 0.53 * sc)} ${f(H)} Z`;
  const hy = sy - 0.33 * sc;
  const off = (light === 'left' ? 1 : -1) * sc * 0.16;
  // soft shadow on the wall behind
  s.add(`<g opacity="0.13" ${s.blur(34)}><path d="${torso(off)}" fill="${CH}"/><ellipse cx="${f(cx + off)}" cy="${f(hy)}" rx="${f(0.14 * sc)}" ry="${f(0.19 * sc)}" fill="${CH}"/></g>`);
  s.add(`<g transform="rotate(${tilt} ${f(cx)} ${f(s.H)})" ${s.blur(2.4)}>`);
  s.add(`<rect x="${f(cx - 0.085 * sc)}" y="${f(hy + 0.1 * sc)}" width="${f(0.17 * sc)}" height="${f(0.24 * sc)}" rx="${f(0.07 * sc)}" fill="${s.lin(cylStops(T.warm), side(light))}"/>`);
  s.add(`<ellipse cx="${f(cx)}" cy="${f(hy)}" rx="${f(0.135 * sc)}" ry="${f(0.185 * sc)}" fill="${s.rad([[0, T.warm[0]], [0.55, T.warm[1]], [0.9, T.warm[2]], [1, T.warm[3]]], { fx: light === 'left' ? 0.32 : 0.68, fy: 0.3 })}"/>`);
  s.add(`<path d="${torso(0)}" fill="${s.lin(cylStops(t), side(light))}"/>`);
  s.add(`<path d="${torso(0)}" fill="${s.lin([[0, LIGHT, 0.3], [0.35, LIGHT, 0], [1, CH, 0.14]])}"/>`);
  s.add(`<path d="M${f(cx - 0.13 * sc)} ${f(sy)} L${f(cx)} ${f(sy + 0.3 * sc)} L${f(cx + 0.13 * sc)} ${f(sy)}" fill="none" stroke="${t[2]}" stroke-width="${f(sc * 0.008)}" opacity="0.7"/>`);
  s.add('</g>');
}
function ribbon(s, x1, x2, y, sag, th, tone = 'ivory') {
  const t = T[tone];
  const mx = (x1 + x2) / 2;
  const d = `M${f(x1)} ${f(y)} Q${f(mx)} ${f(y + sag * 2)} ${f(x2)} ${f(y)} L${f(x2)} ${f(y + th)} Q${f(mx)} ${f(y + th + sag * 2)} ${f(x1)} ${f(y + th)} Z`;
  s.add(`<path d="M${f(x1)} ${f(y + th * 1.6)} Q${f(mx)} ${f(y + th * 1.6 + sag * 2)} ${f(x2)} ${f(y + th * 1.6)}" stroke="${CH}" stroke-width="${f(th * 0.9)}" fill="none" opacity="0.12" ${s.blur(14)}/>`);
  s.add(`<path d="${d}" fill="${s.lin([[0, T.white[0]], [0.45, t[0]], [1, t[2]]])}"/>`);
}
function vignette(s, k = 0.16) {
  s.add(`<rect width="${s.W}" height="${s.H}" fill="${s.rad([[0, CH, 0], [0.62, CH, 0], [1, CH, k]], { r: 0.75 })}"/>`);
}

/* ---------- compositions ---------- */
function journeyRoom(s) {
  const { W, H } = s;
  const hy = room(s, { horizon: 0.7, light: 'left' });
  shaft(s, [[W * 0.02, 0], [W * 0.3, 0], [W * 0.46, hy], [W * 0.12, hy]], 0.4, 26);
  shaft(s, [[W * 0.12, hy], [W * 0.46, hy], [W * 0.9, H], [W * 0.18, H]], 0.3, 34);
  return hy;
}
function plinth(s) {
  const { W, H } = s;
  const top = H * 0.64;
  longShadow(s, W * 0.36, W * 0.62, H * 0.8, W * 0.55, 'left', 0.14);
  cylinder(s, W * 0.5, top, W * 0.36, H * 0.16, 'stone');
  return top;
}

const C = {
  'hero-clinic': [2400, 1350, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.66 });
    shaft(s, [[W * 0.05, 0], [W * 0.21, 0], [W * 0.33, hy], [W * 0.15, hy]], 0.5, 18);
    shaft(s, [[W * 0.15, hy], [W * 0.33, hy], [W * 0.62, H], [W * 0.26, H]], 0.36, 30);
    // curved wall, right
    s.add(`<path d="M${W * 0.73} 0 L${W * 0.73} ${H * 0.7} Q${W * 0.86} ${H * 0.77} ${W} ${H * 0.72} L${W} 0 Z" fill="${s.lin([[0, T.stone[3]], [0.18, T.stone[1]], [0.55, T.ivory[0]], [1, T.stone[1]]], 'h')}"/>`);
    shade(s, [[W * 0.73, H * 0.69], [W * 0.86, H * 0.76], [W, H * 0.71], [W, H * 0.76], [W * 0.86, H * 0.8], [W * 0.73, H * 0.73]], 0.18, 10);
    // ledge left
    box(s, W * 0.02, H * 0.49, W * 0.17, H * 0.025, H * 0.02, 'ivory');
    // pendant lamp
    s.add(`<line x1="${W * 0.53}" y1="0" x2="${W * 0.53}" y2="${H * 0.23}" stroke="${T.char[1]}" stroke-width="2.4"/>`);
    s.add(`<ellipse cx="${W * 0.53}" cy="${H * 0.31}" rx="${W * 0.07}" ry="${H * 0.12}" fill="${LIGHT}" opacity="0.5" ${s.blur(40)}/>`);
    s.add(`<ellipse cx="${W * 0.53}" cy="${H * 0.235}" rx="${W * 0.032}" ry="${H * 0.012}" fill="${s.lin(cylStops(T.char), 'h')}"/>`);
    // pedestal + reclined sculptural form suggesting a chair
    longShadow(s, W * 0.47, W * 0.6, H * 0.77, W * 0.3, 'left', 0.17);
    cylinder(s, W * 0.525, H * 0.61, W * 0.06, H * 0.16, 'stone');
    const p = (x, y) => `${f(W * x)} ${f(H * y)}`;
    const chair = `M${p(0.37, 0.455)} C${p(0.4, 0.46)} ${p(0.43, 0.6)} ${p(0.48, 0.6)} L${p(0.6, 0.6)} C${p(0.64, 0.6)} ${p(0.665, 0.565)} ${p(0.69, 0.55)} L${p(0.697, 0.585)} C${p(0.672, 0.6)} ${p(0.645, 0.64)} ${p(0.6, 0.64)} L${p(0.48, 0.64)} C${p(0.42, 0.64)} ${p(0.39, 0.5)} ${p(0.36, 0.49)} Z`;
    s.add(`<path d="${chair}" transform="translate(${W * 0.012} ${H * 0.05})" fill="${CH}" opacity="0.12" ${s.blur(18)}/>`);
    s.add(`<path d="${chair}" fill="${s.lin([[0, T.white[0]], [0.35, T.ivory[1]], [1, T.stone[2]]])}"/>`);
    s.add(`<path d="${chair}" fill="${s.lin([[0, LIGHT, 0.4], [0.5, LIGHT, 0], [1, CH, 0.12]], 'h')}"/>`);
    vignette(s, 0.14);
  }],
  'detail-material': [1200, 1500, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.76, wall: ['#ece9e2', '#d9d4cb'] });
    shaft(s, [[W * 0.5, 0], [W * 0.9, 0], [W * 1.1, hy], [W * 0.7, hy]], 0.45, 20);
    s.add(`<rect x="${W * 0.06}" y="0" width="${W * 0.52}" height="${hy}" fill="${s.lin(cylStops(T.stone), 'h')}"/>`);
    for (let i = 1; i < 7; i++) {
      const x = W * 0.06 + (W * 0.52 * i) / 7;
      s.add(`<line x1="${f(x)}" y1="0" x2="${f(x)}" y2="${f(hy)}" stroke="${CH}" stroke-width="${W * 0.003}" opacity="${0.05 + 0.02 * Math.abs(3.5 - i)}"/>`);
    }
    box(s, -W * 0.05, H * 0.74, W * 1.1, H * 0.07, H * 0.03, 'ivory');
    shade(s, [[W * 0.62, H * 0.74], [W * 0.86, H * 0.74], [W * 1.2, H * 0.64], [W * 0.95, H * 0.6]], 0.12, 24);
    sphere(s, W * 0.74, H * 0.74 - W * 0.12, W * 0.12, 'ivory');
    vignette(s, 0.16);
  }],
  'clinic-wide': [2400, 1029, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.74, light: 'right', wall: ['#eeebe5', '#dcd7ce'] });
    [0.44, 0.61, 0.78].forEach((x, i) => {
      const w = W * 0.1;
      const top = H * (0.2 + i * 0.02);
      arch(s, W * x, top, w, hy - top, s.lin([[0, T.white[0]], [1, T.ivory[1]]]));
      s.add(`<rect x="${f(W * x)}" y="${f(top + w / 2)}" width="${f(w * 0.08)}" height="${f(hy - top - w / 2)}" fill="${T.stone[2]}" opacity="0.7"/>`);
      shaft(s, [[W * x, hy], [W * x + w, hy], [W * x + w * 0.3, H], [W * x - w * 1.7, H]], 0.42, 22);
    });
    box(s, W * 0.08, H * 0.66, W * 0.26, H * 0.08, H * 0.03, 'stone', 'right');
    longShadow(s, W * 0.08, W * 0.34, H * 0.74, W * 0.14, 'right', 0.12);
    vignette(s, 0.15);
  }],
  'svc-whitening': [1200, 900, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.62, wall: ['#f7f5f1', '#e9e6e0'], floor: ['#f1eee9', '#dfdbd3'], sheen: 0.5 });
    shaft(s, [[0, H * 0.1], [W * 0.4, 0], [W * 0.62, hy], [W * 0.1, hy]], 0.5, 24);
    longShadow(s, W * 0.3, W * 0.5, H * 0.78, W * 0.36, 'left', 0.11);
    sphere(s, W * 0.4, H * 0.78 - H * 0.2, H * 0.2, 'white');
    halfDisc(s, W * 0.7, H * 0.72, H * 0.17, 'ivory');
    vignette(s, 0.1);
  }],
  'svc-implants': [1200, 900, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.72, wall: ['#e9e8e4', '#d2d0ca'], floor: ['#dfddd8', '#c6c3bc'] });
    shaft(s, [[W * 0.05, 0], [W * 0.2, 0], [W * 0.36, hy], [W * 0.2, hy]], 0.35, 12);
    shade(s, [[W * 0.56, H * 0.22], [W * 0.63, H * 0.22], [W * 0.78, hy], [W * 0.7, hy]], 0.12, 12);
    box(s, W * 0.3, H * 0.7, W * 0.4, H * 0.12, H * 0.04, 'grey');
    box(s, W * 0.39, H * 0.6, W * 0.22, H * 0.1, H * 0.03, 'ivory');
    capsule(s, W * 0.5, H * 0.2, W * 0.05, H * 0.37, 'grey');
    vignette(s, 0.16);
  }],
  'svc-aligners': [1200, 900, (s) => {
    const { W, H } = s;
    room(s, { horizon: 0.28, wall: ['#e2ded6', '#d6d1c8'], floor: ['#ebe8e2', '#d6d1c7'] });
    shaft(s, [[0, H * 0.3], [W * 0.6, H * 0.28], [W, H], [W * 0.2, H]], 0.35, 40);
    const u = (cx, cy, rx, ry, rot, op) => {
      const d = `M${f(cx - rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy)}`;
      s.add(`<g transform="rotate(${rot} ${f(cx)} ${f(cy)})"><path d="${d}" transform="translate(${W * 0.012} ${H * 0.03})" stroke="${CH}" stroke-width="${W * 0.03}" fill="none" opacity="0.1" ${s.blur(12)}/><path d="${d}" stroke="${s.lin([[0, T.white[0]], [1, T.ivory[2]]], 'h')}" stroke-width="${W * 0.026}" stroke-linecap="round" fill="none" opacity="${op}"/><path d="${d}" stroke="${LIGHT}" stroke-width="${W * 0.006}" stroke-linecap="round" fill="none" opacity="0.8"/></g>`);
    };
    u(W * 0.42, H * 0.46, W * 0.2, H * 0.26, -8, 0.92);
    u(W * 0.62, H * 0.58, W * 0.18, H * 0.23, 14, 0.8);
    vignette(s, 0.14);
  }],
  'svc-cavity': [1200, 900, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.58, wall: ['#e6e2da', '#d4cfc5'] });
    shaft(s, [[W * 0.1, 0], [W * 0.35, 0], [W * 0.45, hy], [W * 0.2, hy]], 0.35, 20);
    longShadow(s, W * 0.2, W * 0.72, H * 0.86, W * 0.3, 'left', 0.14);
    box(s, W * 0.2, H * 0.5, W * 0.52, H * 0.36, H * 0.1, 'stone');
    s.add(`<ellipse cx="${W * 0.46}" cy="${H * 0.455}" rx="${W * 0.14}" ry="${H * 0.03}" fill="${s.rad([[0, T.stone[2]], [0.7, T.stone[1]], [1, T.stone[3]]], { fx: 0.62, fy: 0.72 })}"/>`);
    sphere(s, W * 0.82, H * 0.86 - H * 0.07, H * 0.07, 'ivory');
    vignette(s, 0.16);
  }],
  'svc-children': [1200, 900, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.66, wall: ['#f3eee6', '#e2dacd'], floor: ['#ece5da', '#d8cfc1'] });
    shaft(s, [[W * 0.55, 0], [W * 0.85, 0], [W * 0.95, hy], [W * 0.62, hy]], 0.4, 26);
    const pebble = (cx, cy, rx, ry, tone) => {
      contact(s, cx + rx * 0.1, cy + ry * 0.95, rx * 0.8, ry * 0.12, 0.3, 6);
      s.add(`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${s.rad([[0, T.white[0]], [0.4, T[tone][0]], [0.85, T[tone][2]], [1, T[tone][3]]], { fx: 0.32, fy: 0.25 })}"/>`);
    };
    longShadow(s, W * 0.3, W * 0.52, H * 0.84, W * 0.3, 'left', 0.12);
    pebble(W * 0.41, H * 0.74, W * 0.13, H * 0.1, 'warm');
    pebble(W * 0.42, H * 0.56, W * 0.09, H * 0.08, 'stone');
    pebble(W * 0.415, H * 0.425, W * 0.055, H * 0.055, 'ivory');
    sphere(s, W * 0.66, H * 0.84 - H * 0.045, H * 0.045, 'warm');
    vignette(s, 0.12);
  }],
  'svc-surgery': [1200, 900, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.5, wall: ['#dcdad5', '#c4c1ba'], floor: ['#d8d6d1', '#bfbcb5'], sheen: 0.3 });
    shaft(s, [[W * 0.2, hy], [W * 0.42, hy], [W * 1.1, H], [W * 0.55, H]], 0.45, 6);
    box(s, W * 0.18, H * 0.62, W * 0.62, H * 0.05, H * 0.12, 'grey');
    s.add(`<g transform="rotate(-9 ${W * 0.5} ${H * 0.55})"><rect x="${W * 0.26}" y="${H * 0.56}" width="${W * 0.46}" height="${H * 0.018}" rx="${H * 0.009}" fill="${CH}" opacity="0.2" ${s.blur(5)}/><rect x="${W * 0.25}" y="${H * 0.535}" width="${W * 0.46}" height="${H * 0.016}" rx="${H * 0.008}" fill="${s.lin([[0, T.white[0]], [1, T.grey[2]]])}"/></g>`);
    vignette(s, 0.2);
  }],
  'svc-perio': [1200, 900, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.74, wall: ['#ece8e1', '#d9d3c9'] });
    shaft(s, [[W * 0.05, 0], [W * 0.3, 0], [W * 0.5, hy], [W * 0.2, hy]], 0.38, 22);
    longShadow(s, W * 0.2, W * 0.8, H * 0.8, W * 0.2, 'left', 0.12);
    halfDisc(s, W * 0.5, H * 0.8, W * 0.3, 'stone');
    halfDisc(s, W * 0.5, H * 0.8, W * 0.22, 'warm');
    halfDisc(s, W * 0.5, H * 0.8, W * 0.14, 'ivory');
    vignette(s, 0.15);
  }],
  'svc-smile-design': [1200, 900, (s) => {
    const { W, H } = s;
    room(s, { horizon: 0.56, wall: ['#efebe4', '#ddd8ce'] });
    shaft(s, [[W * 0.3, 0], [W * 0.6, 0], [W * 0.7, H * 0.56], [W * 0.36, H * 0.56]], 0.35, 24);
    ribbon(s, W * 0.08, W * 0.92, H * 0.5, H * 0.12, H * 0.07, 'ivory');
    sphere(s, W * 0.5, H * 0.52 - H * 0.07, H * 0.07, 'stone');
    vignette(s, 0.15);
  }],
  'journey-1': [1200, 1500, (s) => {
    journeyRoom(s);
    const top = plinth(s);
    sphere(s, s.W * 0.5, top - s.W * 0.14, s.W * 0.14, 'ivory');
    vignette(s);
  }],
  'journey-2': [1200, 1500, (s) => {
    journeyRoom(s);
    const top = plinth(s);
    ring(s, s.W * 0.5, top - s.W * 0.16, s.W * 0.16, s.W * 0.1, 'ivory');
    vignette(s);
  }],
  'journey-3': [1200, 1500, (s) => {
    journeyRoom(s);
    const top = plinth(s);
    const { W, H } = s;
    box(s, W * 0.37, top - H * 0.1, W * 0.24, H * 0.1, H * 0.025, 'ivory');
    box(s, W * 0.44, top - H * 0.2, W * 0.16, H * 0.08, H * 0.02, 'stone');
    vignette(s);
  }],
  'journey-4': [1200, 1500, (s) => {
    journeyRoom(s);
    const top = plinth(s);
    capsule(s, s.W * 0.5, top - s.H * 0.3, s.W * 0.1, s.H * 0.3, 'ivory');
    vignette(s);
  }],
  'journey-5': [1200, 1500, (s) => {
    journeyRoom(s);
    const top = plinth(s);
    halfDisc(s, s.W * 0.5, top, s.W * 0.17, 'warm');
    vignette(s);
  }],
  'doctor-elif': [1800, 1200, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.8 });
    arch(s, W * 0.48, H * 0.08, W * 0.3, hy - H * 0.08, s.lin([[0, T.stone[2]], [1, T.stone[1]]]));
    shaft(s, [[0, 0], [W * 0.26, 0], [W * 0.4, hy], [W * 0.06, hy]], 0.42, 24);
    figure(s, W * 0.63, H * 0.6, H * 0.62, 'ivory', 'left', -1.5);
    vignette(s, 0.14);
  }],
  'doctor-emre': [1800, 1200, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.82, wall: ['#f1efea', '#e2ded6'] });
    [0.12, 0.24].forEach((x) => shaft(s, [[W * x, 0], [W * (x + 0.04), 0], [W * (x + 0.14), hy], [W * (x + 0.1), hy]], 0.5, 8));
    s.add(`<rect x="${W * 0.8}" y="0" width="${W * 0.2}" height="${hy}" fill="${s.lin(cylStops(T.stone), 'h')}"/>`);
    figure(s, W * 0.58, H * 0.62, H * 0.6, 'char', 'left', 1);
    vignette(s, 0.14);
  }],
  'doctor-selin': [1800, 1200, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.8, light: 'right', wall: ['#ece8e1', '#dad4ca'] });
    s.add(`<path d="M0 0 L${W * 0.3} 0 Q${W * 0.36} ${H * 0.4} ${W * 0.3} ${hy} L0 ${hy} Z" fill="${s.lin([[0, T.stone[3]], [0.5, T.stone[1]], [1, T.ivory[0]]], 'h')}"/>`);
    shaft(s, [[W * 0.62, 0], [W * 0.95, 0], [W * 0.88, hy], [W * 0.54, hy]], 0.4, 26);
    figure(s, W * 0.64, H * 0.6, H * 0.6, 'stone', 'right', 1.2);
    vignette(s, 0.14);
  }],
  'doctor-can': [1800, 1200, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.78, wall: ['#e7e4de', '#d3cfc7'] });
    s.add(`<rect x="0" y="${H * 0.46}" width="${W}" height="${hy - H * 0.46}" fill="${T.stone[1]}" opacity="0.5"/>`);
    arch(s, W * 0.1, H * 0.12, W * 0.18, hy - H * 0.12, s.lin([[0, T.white[0]], [1, T.ivory[1]]]));
    shaft(s, [[W * 0.1, hy], [W * 0.28, hy], [W * 0.5, H], [W * 0.14, H]], 0.4, 20);
    figure(s, W * 0.6, H * 0.61, H * 0.62, 'grey', 'left', -1);
    vignette(s, 0.15);
  }],
  'result-after': [1600, 1200, (s) => {
    const { W, H } = s;
    room(s, { horizon: 0.6, wall: ['#fbfaf7', '#efece6'], floor: ['#f6f4ef', '#e6e2da'], sheen: 0.5 });
    shaft(s, [[W * 0.1, 0], [W * 0.5, 0], [W * 0.62, H * 0.6], [W * 0.18, H * 0.6]], 0.5, 30);
    ribbon(s, W * 0.1, W * 0.9, H * 0.46, H * 0.13, H * 0.075, 'white');
    sphere(s, W * 0.5, H * 0.5 - H * 0.06, H * 0.06, 'white');
    vignette(s, 0.08);
  }],
  'booking-portrait': [1400, 1750, (s) => {
    const { W, H } = s;
    const hy = room(s, { horizon: 0.86, wall: ['#efebe4', '#dcd6cc'] });
    shaft(s, [[0, 0], [W * 0.34, 0], [W * 0.5, hy], [W * 0.08, hy]], 0.45, 26);
    s.add(`<rect x="${W * 0.78}" y="0" width="${W * 0.22}" height="${hy}" fill="${s.lin(cylStops(T.stone), 'h')}"/>`);
    figure(s, W * 0.54, H * 0.5, W * 0.95, 'ivory', 'left', -1);
    vignette(s, 0.15);
  }],
};

/* ---------- render ---------- */
async function grain(W, H, seed, amp = 22) {
  const rnd = mulberry32(seed ^ 0x9e3779b9);
  const buf = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    const v = 128 + Math.round((rnd() + rnd() - 1) * amp);
    buf[i * 3] = v;
    buf[i * 3 + 1] = v;
    buf[i * 3 + 2] = v;
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
}

mkdirSync(OUT, { recursive: true });
let made = 0;
for (const [key, [W, H, draw]] of Object.entries(C)) {
  if (ONLY && !ONLY.includes(key)) continue;
  const file = `${OUT}${key}.jpg`;
  if (existsSync(file) && !FORCE) {
    console.log(`skip  ${key}.jpg (exists)`);
    continue;
  }
  const seed = hash(key);
  const s = new Scene(W, H, seed);
  draw(s);
  const base = await sharp(Buffer.from(s.svg())).png().toBuffer();
  await sharp(base)
    .composite([{ input: await grain(W, H, seed), blend: 'overlay' }])
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(file);
  made++;
  console.log(`write ${key}.jpg ${W}×${H}`);
}
console.log(`${made} placeholder(s) written.`);
