/**
 * Builds an SVG path for a rounded rectangle with an "inverted-radius" notch cut out of one
 * corner (the Figma "notched image" shape). Used as `clip-path: path(...)`.
 */
export type Corner = 'tl' | 'tr' | 'bl' | 'br';

type Seg = { t: 'M' | 'L'; x: number; y: number } | { t: 'A'; x: number; y: number; sweep: 0 | 1 };

const round = (n: number) => Math.round(n * 100) / 100;

function roundedRect(w: number, h: number, r: number): Seg[] {
  return [
    { t: 'M', x: r, y: 0 },
    { t: 'L', x: w - r, y: 0 },
    { t: 'A', x: w, y: r, sweep: 1 },
    { t: 'L', x: w, y: h - r },
    { t: 'A', x: w - r, y: h, sweep: 1 },
    { t: 'L', x: r, y: h },
    { t: 'A', x: 0, y: h - r, sweep: 1 },
    { t: 'L', x: 0, y: r },
    { t: 'A', x: r, y: 0, sweep: 1 },
  ];
}

/** Segments for a notch in the top-right corner; other corners are mirrored from this. */
function topRightNotch(w: number, h: number, nw: number, nh: number, r: number): Seg[] {
  return [
    { t: 'M', x: r, y: 0 },
    { t: 'L', x: w - nw - r, y: 0 },
    { t: 'A', x: w - nw, y: r, sweep: 1 },
    { t: 'L', x: w - nw, y: nh - r },
    { t: 'A', x: w - nw + r, y: nh, sweep: 0 },
    { t: 'L', x: w - r, y: nh },
    { t: 'A', x: w, y: nh + r, sweep: 1 },
    { t: 'L', x: w, y: h - r },
    { t: 'A', x: w - r, y: h, sweep: 1 },
    { t: 'L', x: r, y: h },
    { t: 'A', x: 0, y: h - r, sweep: 1 },
    { t: 'L', x: 0, y: r },
    { t: 'A', x: r, y: 0, sweep: 1 },
  ];
}

function serialize(segs: Seg[], r: number): string {
  const out = segs.map((s) =>
    s.t === 'A' ? `A${round(r)} ${round(r)} 0 0 ${s.sweep} ${round(s.x)} ${round(s.y)}` : `${s.t}${round(s.x)} ${round(s.y)}`,
  );
  return `${out.join(' ')} Z`;
}

export function notchPath(w: number, h: number, nw: number, nh: number, radius: number, corner: Corner): string {
  if (w <= 0 || h <= 0) return '';
  const hasNotch = nw > 0 && nh > 0 && nw < w && nh < h;
  const limit = hasNotch ? Math.min(nw / 2, nh / 2, (w - nw) / 2, (h - nh) / 2) : Math.min(w, h) / 2;
  const r = Math.max(0, Math.min(radius, limit));
  if (!hasNotch) return serialize(roundedRect(w, h, r), r);

  const flipX = corner === 'tl' || corner === 'bl';
  const flipY = corner === 'bl' || corner === 'br';
  const flipSweep = flipX !== flipY;
  const segs = topRightNotch(w, h, nw, nh, r).map((s): Seg => {
    const x = flipX ? w - s.x : s.x;
    const y = flipY ? h - s.y : s.y;
    if (s.t !== 'A') return { t: s.t, x, y };
    const flipped: 0 | 1 = s.sweep === 1 ? 0 : 1;
    const sweep = flipSweep ? flipped : s.sweep;
    return { t: 'A', x, y, sweep };
  });
  return serialize(segs, r);
}
