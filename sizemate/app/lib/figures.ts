/**
 * Measuring illustrations.
 *
 * One source for every figure: scripts/build-storefront.mjs turns these into
 * extensions/sizemate-theme/snippets/sizemate-figure.liquid, and the admin
 * preview renders that same snippet. Figures are inline SVG coloured with the
 * chart's CSS variables, so they follow the theme, dark mode and high
 * contrast, and only the measurements a chart uses are drawn and numbered.
 *
 * Shapes are drawn twice: once with a thick stroke (the outline) and once
 * filled on top, so overlapping parts read as one clean silhouette.
 */

import type { MeasureKey } from "./measures";

export type FigureId = "body-f" | "body-m" | "foot" | "hand" | "head" | "garment" | "pants" | "pet" | "ring";
export const FIGURE_IDS: readonly FigureId[] = ["body-f", "body-m", "foot", "hand", "head", "garment", "pants", "pet", "ring"];

type Point = readonly [number, number];

/** How a measurement is drawn. */
export type Mark =
  /** A tape wrapped around the body: front arc solid, back arc dashed. */
  | { type: "girth"; from: Point; to: Point; bulge?: number; badge?: Point }
  /** A straight measurement with end ticks. */
  | { type: "line"; from: Point; to: Point; badge?: Point }
  /** A measurement following a path, with end ticks. */
  | { type: "path"; points: Point[]; badge?: Point }
  /** A dashed circle (inside circumference). */
  | { type: "circle"; center: Point; r: number; badge?: Point };

export interface Figure {
  id: FigureId;
  width: number;
  height: number;
  /** SVG elements without presentation attributes. */
  shapes: string[];
  /** Fine detail lines drawn over the fill (seams, knee hints). */
  details?: string[];
  marks: Partial<Record<MeasureKey, Mark>>;
}

/* Geometry helpers ------------------------------------------------------- */

const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Point) => `${r1(p[0])} ${r1(p[1])}`;

/** A smooth closed curve through the points (Catmull-Rom as cubic Béziers). */
export function smoothClosed(points: readonly Point[], tension = 1): string {
  const n = points.length;
  const at = (i: number) => points[(i + n) % n]!;
  let d = `M${pt(at(0))}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: Point = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return `${d}Z`;
}

/** Right half of a symmetric outline (top to bottom), mirrored around x = axis. */
function mirrored(rightHalf: readonly Point[], axis: number): Point[] {
  const left = [...rightHalf].reverse().map(([x, y]): Point => [2 * axis - x, y]);
  return [...rightHalf, ...left];
}

const mirrorPoints = (points: readonly Point[], axis: number): Point[] => points.map(([x, y]): Point => [2 * axis - x, y]);

const path = (d: string) => `<path d="${d}"/>`;
const ellipse = (cx: number, cy: number, rx: number, ry: number, rotate = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : ""}/>`;
const rect = (x: number, y: number, w: number, h: number, r: number, rotate?: [number, number, number]) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"${rotate ? ` transform="rotate(${rotate.join(" ")})"` : ""}/>`;

/* Human body ---------------------------------------------------------------- */

interface BodyShape {
  torso: Point[];
  arm: Point[];
  head: [number, number, number, number];
  neck: [number, number, number, number];
  foot: [number, number, number, number];
}

const AXIS = 120;

const FEMALE: BodyShape = {
  head: [120, 46, 19, 24],
  neck: [111, 60, 18, 32],
  // Right side of the torso and leg, from the neck down the outside, back up the inside to the crotch.
  torso: [
    [129, 80],
    [140, 88],
    [151, 96],
    [151, 112],
    [146, 128],
    [149, 146],
    [144, 165],
    [136, 194],
    [142, 220],
    [153, 248],
    [152, 282],
    [143, 330],
    [140, 352],
    [143, 384],
    [134, 440],
    [125, 441],
    [124, 388],
    [123, 352],
    [124, 318],
    [122, 290],
  ],
  arm: [
    [141, 89],
    [153, 96],
    [158, 118],
    [161, 158],
    [166, 196],
    [173, 234],
    [178, 262],
    [183, 282],
    [180, 299],
    [172, 296],
    [168, 268],
    [163, 238],
    [155, 200],
    [150, 162],
    [147, 130],
    [145, 108],
  ],
  foot: [130, 449, 9, 9],
};

const MALE: BodyShape = {
  head: [120, 44, 19, 24],
  neck: [109, 58, 22, 34],
  torso: [
    [131, 80],
    [144, 86],
    [158, 94],
    [158, 112],
    [154, 130],
    [153, 150],
    [148, 172],
    [143, 198],
    [145, 222],
    [149, 248],
    [148, 282],
    [142, 330],
    [140, 352],
    [143, 384],
    [135, 440],
    [125, 441],
    [124, 388],
    [123, 352],
    [124, 318],
    [122, 290],
  ],
  arm: [
    [146, 87],
    [160, 94],
    [166, 118],
    [169, 158],
    [173, 196],
    [179, 234],
    [183, 262],
    [188, 282],
    [185, 300],
    [177, 297],
    [173, 268],
    [168, 238],
    [161, 200],
    [157, 162],
    [153, 132],
    [151, 108],
  ],
  foot: [131, 449, 10, 9],
};

function bodyShapes(body: BodyShape): string[] {
  const [hx, hy, hrx, hry] = body.head;
  const [nx, ny, nw, nh] = body.neck;
  const [fx, fy, frx, fry] = body.foot;
  return [
    rect(nx, ny, nw, nh, 6),
    path(smoothClosed(body.arm, 0.9)),
    path(smoothClosed(mirrorPoints(body.arm, AXIS), 0.9)),
    path(smoothClosed(mirrored(body.torso, AXIS), 0.9)),
    ellipse(fx, fy, frx, fry),
    ellipse(2 * AXIS - fx, fy, frx, fry),
    ellipse(hx, hy, hrx, hry),
  ];
}

function bodyMarks(female: boolean) {
  const w = (y: number, half: number): Mark => ({ type: "girth", from: [AXIS - half, y], to: [AXIS + half, y] });
  const marks: Figure["marks"] = {
    neck: { type: "girth", from: [AXIS - 9, 76], to: [AXIS + 9, 76], bulge: 4, badge: [AXIS - 20, 70] },
    shoulder: { type: "line", from: [female ? 89 : 82, 90], to: [female ? 151 : 158, 90], badge: [female ? 80 : 73, 90] },
    chest: w(female ? 140 : 140, female ? 28 : 34),
    bust: w(146, 29),
    underbust: w(165, 24),
    waist: w(female ? 194 : 196, female ? 16 : 23),
    hips: w(248, female ? 33 : 29),
    arm: {
      type: "path",
      points: female
        ? [
            [158, 92],
            [166, 118],
            [170, 158],
            [175, 196],
            [182, 234],
            [188, 266],
          ]
        : [
            [165, 90],
            [174, 118],
            [177, 158],
            [181, 196],
            [187, 234],
            [193, 266],
          ],
    },
    thigh: { type: "girth", from: [123, 282], to: [female ? 152 : 148, 282], bulge: 4 },
    calf: { type: "girth", from: [124, 384], to: [143, 384], bulge: 3 },
    inseam: { type: "line", from: [112, 296], to: [112, 438] },
    height: { type: "line", from: [214, 21], to: [214, 458] },
  };
  return marks;
}

/* Other figures --------------------------------------------------------- */

const foot: Figure = {
  id: "foot",
  width: 200,
  height: 300,
  shapes: [
    path(
      smoothClosed([
        [100, 284],
        [121, 278],
        [128, 250],
        [129, 208],
        [136, 164],
        [145, 124],
        [147, 96],
        [132, 84],
        [110, 79],
        [84, 75],
        [65, 84],
        [61, 112],
        [65, 152],
        [74, 192],
        [75, 232],
        [79, 266],
      ]),
    ),
    ellipse(75, 56, 13, 18, -6),
    ellipse(99, 50, 9, 12),
    ellipse(116, 55, 8, 11, 6),
    ellipse(131, 63, 7, 10, 12),
    ellipse(143, 76, 6, 8, 18),
  ],
  marks: {
    foot_length: { type: "line", from: [176, 38], to: [176, 284] },
    foot_width: { type: "line", from: [61, 118], to: [146, 118] },
  },
};

const hand: Figure = {
  id: "hand",
  width: 200,
  height: 300,
  shapes: [
    rect(80, 188, 44, 100, 12),
    path(
      smoothClosed([
        [72, 132],
        [102, 126],
        [132, 132],
        [136, 168],
        [128, 200],
        [102, 206],
        [76, 200],
        [68, 168],
      ]),
    ),
    rect(71, 62, 15, 80, 7.5),
    rect(88, 50, 15, 90, 7.5),
    rect(105, 56, 15, 84, 7.5),
    rect(121, 78, 13, 64, 6.5),
    path(
      smoothClosed([
        [74, 200],
        [60, 182],
        [48, 162],
        [42, 146],
        [47, 136],
        [57, 140],
        [70, 158],
        [80, 172],
      ]),
    ),
  ],
  marks: {
    hand: { type: "girth", from: [69, 158], to: [135, 158], bulge: 6 },
    wrist: { type: "girth", from: [80, 222], to: [124, 222], bulge: 5 },
    finger: { type: "girth", from: [105, 118], to: [120, 118], bulge: 3 },
  },
};

const head: Figure = {
  id: "head",
  width: 200,
  height: 240,
  shapes: [
    path("M26 240C30 206 50 196 80 192L120 192C150 196 170 206 174 240Z"),
    rect(79, 150, 42, 50, 10),
    ellipse(50, 118, 8, 15),
    ellipse(150, 118, 8, 15),
    ellipse(100, 104, 50, 62),
  ],
  details: [path("M86 116q6-4 12 0M102 116q6-4 12 0"), path("M93 152q7 5 14 0")],
  marks: {
    head: { type: "girth", from: [50, 88], to: [150, 88], bulge: 9 },
  },
};

const garment: Figure = {
  id: "garment",
  width: 240,
  height: 240,
  shapes: [
    path("M96 30Q120 52 144 30L190 46L228 92L204 114L182 96L182 218L58 218L58 96L36 114L12 92L50 46Z"),
  ],
  details: [path("M96 30Q120 40 144 30"), path("M182 96L182 104M58 96L58 104")],
  marks: {
    garment_shoulder: { type: "line", from: [50, 40], to: [190, 40] },
    garment_chest: { type: "line", from: [58, 106], to: [182, 106] },
    garment_waist: { type: "line", from: [58, 204], to: [182, 204] },
    garment_length: { type: "line", from: [154, 36], to: [154, 218] },
    sleeve: { type: "line", from: [196, 40], to: [234, 86] },
  },
};

const pants: Figure = {
  id: "pants",
  width: 240,
  height: 280,
  shapes: [path("M60 18L180 18L186 118L192 266L134 266L120 132L106 266L48 266L54 118Z")],
  details: [path("M58 36L182 36"), path("M120 36L120 104"), path("M120 104Q126 112 124 124")],
  marks: {
    garment_waist: { type: "line", from: [60, 27], to: [180, 27] },
    waist: { type: "line", from: [60, 27], to: [180, 27] },
    garment_hips: { type: "line", from: [55, 110], to: [185, 110] },
    hips: { type: "line", from: [55, 110], to: [185, 110] },
    rise: { type: "line", from: [112, 18], to: [112, 128] },
    garment_inseam: { type: "line", from: [128, 140], to: [140, 264] },
    inseam: { type: "line", from: [128, 140], to: [140, 264] },
    garment_length: { type: "line", from: [202, 18], to: [208, 266] },
  },
};

const pet: Figure = {
  id: "pet",
  width: 240,
  height: 200,
  shapes: [
    rect(80, 112, 15, 70, 7.5),
    rect(98, 116, 15, 66, 7.5),
    rect(158, 112, 15, 70, 7.5),
    rect(176, 108, 15, 74, 7.5),
    path(
      smoothClosed([
        [92, 82],
        [130, 76],
        [170, 78],
        [196, 90],
        [200, 112],
        [184, 128],
        [140, 132],
        [102, 128],
        [80, 116],
        [76, 98],
      ]),
    ),
    path(
      smoothClosed([
        [44, 64],
        [66, 44],
        [96, 82],
        [86, 110],
        [70, 100],
      ]),
    ),
    ellipse(56, 58, 23, 21),
    ellipse(32, 70, 17, 10, 8),
    ellipse(66, 52, 8, 17, 24),
  ],
  details: [`<path class="sizemate-fig-tail" d="M196 94C210 86 218 72 224 56"/>`, ellipse(50, 54, 2.2, 2.2)],
  marks: {
    pet_neck: { type: "girth", from: [70, 60], to: [86, 92], bulge: 6 },
    pet_chest: { type: "girth", from: [112, 78], to: [112, 130], bulge: 8 },
    pet_back: {
      type: "path",
      points: [
        [90, 68],
        [130, 63],
        [170, 65],
        [198, 78],
      ],
    },
  },
};

const ring: Figure = {
  id: "ring",
  width: 200,
  height: 200,
  shapes: [`<path fill-rule="evenodd" d="M100 30a70 70 0 1 0 0.1 0ZM100 46a54 54 0 1 1 -0.1 0Z"/>`],
  marks: {
    ring_diameter: { type: "line", from: [48, 100], to: [152, 100] },
    ring_circumference: { type: "circle", center: [100, 100], r: 47 },
    finger: { type: "circle", center: [100, 100], r: 47 },
  },
};

export const FIGURES: Record<FigureId, Figure> = {
  "body-f": { id: "body-f", width: 240, height: 470, shapes: bodyShapes(FEMALE), marks: bodyMarks(true) },
  "body-m": { id: "body-m", width: 240, height: 470, shapes: bodyShapes(MALE), marks: bodyMarks(false) },
  foot,
  hand,
  head,
  garment,
  pants,
  pet,
  ring,
};

/* Rendering ----------------------------------------------------------------- */

function ticks(from: Point, to: Point, size = 5): string {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = (-dy / length) * size;
  const ny = (dx / length) * size;
  return [from, to].map((p) => `M${pt([p[0] - nx, p[1] - ny])}L${pt([p[0] + nx, p[1] + ny])}`).join("");
}

/** Where the number badge sits for a mark. */
export function badgePosition(mark: Mark): Point {
  if (mark.badge) return mark.badge;
  switch (mark.type) {
    case "girth":
    case "line": {
      const bulge = mark.type === "girth" ? (mark.bulge ?? 6) : 0;
      return [(mark.from[0] + mark.to[0]) / 2, (mark.from[1] + mark.to[1]) / 2 + bulge * 0.75];
    }
    case "path":
      return mark.points[Math.floor(mark.points.length / 2)]!;
    case "circle":
      return [mark.center[0], mark.center[1] - mark.r];
  }
}

/** SVG for one measurement's line (without the badge). */
export function markSvg(mark: Mark): string {
  switch (mark.type) {
    case "girth": {
      const bulge = mark.bulge ?? 6;
      const dx = mark.to[0] - mark.from[0];
      const dy = mark.to[1] - mark.from[1];
      const length = Math.hypot(dx, dy) || 1;
      // Normal pointing "down" the figure (towards the viewer for horizontal tapes).
      const nx = (-dy / length) * bulge;
      const ny = (dx / length) * bulge;
      const mid: Point = [(mark.from[0] + mark.to[0]) / 2, (mark.from[1] + mark.to[1]) / 2];
      const front = `M${pt(mark.from)}Q${pt([mid[0] + nx, mid[1] + ny])} ${pt(mark.to)}`;
      const back = `M${pt(mark.from)}Q${pt([mid[0] - nx, mid[1] - ny])} ${pt(mark.to)}`;
      return `<path class="sizemate-fig-back" d="${back}"/><path class="sizemate-fig-tape" d="${front}"/>`;
    }
    case "line":
      return `<path class="sizemate-fig-tape" d="M${pt(mark.from)}L${pt(mark.to)}${ticks(mark.from, mark.to)}"/>`;
    case "path": {
      const points = mark.points;
      const d = points.map((p, i) => `${i ? "L" : "M"}${pt(p)}`).join("");
      return `<path class="sizemate-fig-tape" d="${d}${ticks(points[0]!, points[1]!)}${ticks(points[points.length - 2]!, points[points.length - 1]!)}"/>`;
    }
    case "circle":
      return `<circle class="sizemate-fig-tape sizemate-fig-dashed" cx="${mark.center[0]}" cy="${mark.center[1]}" r="${mark.r}"/>`;
  }
}

export function badgeSvg(mark: Mark, label: string): string {
  const [x, y] = badgePosition(mark);
  return `<g class="sizemate-fig-badge" transform="translate(${r1(x)} ${r1(y)})"><circle r="8.5"/><text dy="0.35em">${label}</text></g>`;
}

export function baseSvg(figure: Figure): string {
  const shapes = figure.shapes.join("");
  const details = figure.details ? `<g class="sizemate-fig-detail">${figure.details.join("")}</g>` : "";
  return `<g class="sizemate-fig-outline">${shapes}</g><g class="sizemate-fig-fill">${shapes}</g>${details}`;
}

export function svgOpen(figure: Figure): string {
  return `<svg class="sizemate-figure sizemate-figure--${figure.id}" viewBox="0 0 ${figure.width} ${figure.height}" width="${figure.width}" height="${figure.height}" aria-hidden="true" focusable="false">`;
}

/** A complete figure with numbered measurements, e.g. for the admin. */
export function figureSvg(id: FigureId, measures: readonly { measure: string; n: number }[]): string {
  const figure = FIGURES[id];
  const marks = measures.flatMap(({ measure, n }) => {
    const mark = figure.marks[measure as MeasureKey];
    return mark ? [`<g class="sizemate-fig-mark">${markSvg(mark)}${badgeSvg(mark, String(n))}</g>`] : [];
  });
  return `${svgOpen(figure)}${baseSvg(figure)}${marks.join("")}</svg>`;
}

/* Choosing a figure ----------------------------------------------------------- */

const FEMALE_HINTS = /women|womens|maternity|bra|lingerie|swim|dress|skirt|ladies/;

/**
 * The figure for a chart's measurements, or null when none fits.
 * @param category The template key the chart was made from (hints at the body shape).
 */
export function chooseFigure(measures: readonly string[], category = "", forced?: string): FigureId | null {
  const has = (...keys: string[]) => measures.some((m) => keys.includes(m));
  const body = (): FigureId => (has("bust", "underbust") || FEMALE_HINTS.test(category) ? "body-f" : "body-m");
  switch (forced) {
    case "none":
      return null;
    case "torso":
    case "legs":
      return body();
    case "foot":
    case "hand":
    case "head":
    case "garment":
    case "pants":
    case "pet":
    case "ring":
      return forced;
    case "wrist":
      return "hand";
  }
  if (measures.some((m) => m.startsWith("pet_"))) return "pet";
  if (has("ring_diameter", "ring_circumference", "finger")) return "ring";
  if (has("garment_hips", "garment_inseam", "rise")) return "pants";
  if (measures.some((m) => m.startsWith("garment_") || m === "sleeve")) return "garment";
  if (has("foot_length", "foot_width")) return "foot";
  if (has("hand", "wrist")) return "hand";
  if (has("head")) return "head";
  if (has("chest", "bust", "underbust", "waist", "hips", "neck", "shoulder", "arm", "inseam", "thigh", "calf", "height")) return body();
  return null;
}

/* Liquid ---------------------------------------------------------------------- */

/**
 * The storefront snippet (snippets/sizemate-figure.liquid). It draws the
 * figure named by chart.guide.d and, for each column numbered by publish.ts
 * (col.n), that measurement's line and badge.
 */
export function figureLiquid(): string {
  const lines = [
    "{%- comment -%}",
    "  Measuring illustration for a published chart. Generated from app/lib/figures.ts",
    "  by scripts/build-storefront.mjs: edit the source, not this file.",
    "  Params: chart",
    "{%- endcomment -%}",
    "{%- case chart.guide.d -%}",
  ];
  for (const id of FIGURE_IDS) {
    const figure = FIGURES[id];
    lines.push(`  {%- when '${id}' -%}`);
    lines.push(`    ${svgOpen(figure)}${baseSvg(figure)}`);
    lines.push("    {%- for col in chart.cols -%}{%- if col.n > 0 -%}{%- case col.m -%}");
    for (const [measure, mark] of Object.entries(figure.marks)) {
      lines.push(`      {%- when '${measure}' -%}<g class="sizemate-fig-mark">${markSvg(mark)}${badgeSvg(mark, "{{ col.n }}")}</g>`);
    }
    lines.push("    {%- endcase -%}{%- endif -%}{%- endfor -%}");
    lines.push("    </svg>");
  }
  lines.push("{%- endcase -%}", "");
  return lines.join("\n");
}
