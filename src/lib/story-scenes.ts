/**
 * Line drawings for the hero story, in a 360 × 240 box. The same set of strokes is re-arranged
 * scene by scene (scripts/story.ts), so every drawing is plain SVG path data. `a: true` marks an
 * accent stroke.
 */
export interface Stroke {
  d: string;
  a?: boolean;
}

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`;

/** 1 — we meet: two figures shaking hands. */
const meet: Stroke[] = [
  { d: 'M36 200H324' },
  { d: circle(112, 70, 15) },
  { d: 'M112 85V148' },
  { d: 'M112 148L96 196' },
  { d: 'M112 148L128 196' },
  { d: 'M112 102L90 132' },
  { d: 'M112 102L152 120L176 116' },
  { d: circle(248, 70, 15) },
  { d: 'M248 85V148' },
  { d: 'M248 148L232 196' },
  { d: 'M248 148L264 196' },
  { d: 'M248 102L270 132' },
  { d: 'M248 102L208 120L184 116' },
  { d: 'M180 96V82', a: true },
  { d: 'M168 100L158 92', a: true },
  { d: 'M192 100L202 92', a: true },
];

/** 2 — we design: a laptop with a wireframe taking shape. */
const design: Stroke[] = [
  { d: 'M36 200H324' },
  { d: 'M98 60H262V168H98Z' },
  { d: 'M78 176H282L268 192H92Z' },
  { d: 'M114 78H246' },
  { d: 'M114 96H176V150H114Z' },
  { d: 'M190 100H246' },
  { d: 'M190 114H234' },
  { d: 'M190 128H242' },
  { d: 'M190 144H220', a: true },
];

/** 3 — we build: a browser window with code. */
const build: Stroke[] = [
  { d: 'M36 200H324' },
  { d: 'M82 54H278V184H82Z' },
  { d: 'M82 74H278' },
  { d: circle(96, 64, 3) },
  { d: circle(108, 64, 3) },
  { d: 'M152 104L130 124L152 144' },
  { d: 'M208 104L230 124L208 144' },
  { d: 'M190 98L170 150', a: true },
  { d: 'M110 168H170' },
];

/** 4 — we launch: the logo's sun rising over the horizon. */
const launch: Stroke[] = [
  { d: 'M36 160H324' },
  { d: 'M126 160A54 54 0 0 1 234 160', a: true },
  { d: 'M180 88V70', a: true },
  { d: 'M142 100L132 86', a: true },
  { d: 'M218 100L228 86', a: true },
  { d: 'M118 128L102 120', a: true },
  { d: 'M242 128L258 120', a: true },
  { d: 'M96 180H264' },
  { d: 'M130 196H230' },
];

export const SCENES: Stroke[][] = [meet, design, build, launch];
