import type { Illustration } from '@/content/schema';
import type { Stroke } from './story-scenes';

/** Article illustrations in the hero story's line style: 360 × 200, strokes only, `a` = accent. */
const c = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`;
const base: Stroke = { d: 'M40 176H320' };

export const ILLUSTRATION_ART: Record<Illustration['name'], Stroke[]> = {
  // Server → safe copy elsewhere, with a way back.
  backup: [
    base,
    { d: 'M70 60H150V150H70Z' },
    { d: 'M70 90H150M70 120H150' },
    { d: c(84, 75, 3) + c(84, 105, 3) + c(84, 135, 3) },
    { d: 'M214 104a26 26 0 0 1 50-10a20 20 0 0 1 16 36H214a18 18 0 0 1 0-26Z' },
    { d: 'M164 96C182 80 196 84 206 98', a: true },
    { d: 'M198 92l8 6l-9 4', a: true },
    { d: 'M206 150C188 164 174 162 164 146', a: true },
    { d: 'M172 152l-8-6l9-4', a: true },
  ],
  // Plugin blocks, one swapped out.
  updates: [
    base,
    { d: 'M86 70H146V130H86Z' },
    { d: 'M158 70H218V130H158Z' },
    { d: 'M230 58H290V118H230Z', a: true },
    { d: 'M116 70V58M188 130V142' },
    { d: 'M260 100V76M250 86l10-10l10 10', a: true },
    { d: 'M86 150H290' },
  ],
  // Old address → new address with a 301 arc.
  redirects: [
    base,
    { d: 'M52 84H148V120H52Z' },
    { d: 'M212 84H308V120H212Z' },
    { d: 'M66 102H130M226 102H290' },
    { d: 'M100 84C120 34 240 34 260 84', a: true },
    { d: 'M250 76l10 8l3-12', a: true },
    { d: 'M150 150H210' },
  ],
  // A page under a magnifying glass.
  search: [
    base,
    { d: 'M96 44H196V168H96Z' },
    { d: 'M112 66H180M112 84H172M112 102H164' },
    { d: c(214, 114, 34), a: true },
    { d: 'M238 138L276 172', a: true },
    { d: 'M198 108H230M198 122H222' },
  ],
  // Form → envelope on its way.
  forms: [
    base,
    { d: 'M64 50H164V160H64Z' },
    { d: 'M80 72H148V90H80ZM80 104H148V122H80Z' },
    { d: 'M80 138H122', a: true },
    { d: 'M210 86H300V146H210Z' },
    { d: 'M210 86L255 120L300 86' },
    { d: 'M172 116H198M188 108l10 8l-10 8', a: true },
  ],
  // A lightning bolt over a stack of pages.
  cache: [
    base,
    { d: 'M110 70H210V160H110Z' },
    { d: 'M124 56H224V146' },
    { d: 'M138 42H238V132' },
    { d: 'M186 88L164 124H184L172 152L204 110H184L196 88Z', a: true },
  ],
  // Laptop and phone side by side.
  devices: [
    base,
    { d: 'M70 60H230V150H70Z' },
    { d: 'M50 158H250L240 170H60Z' },
    { d: 'M254 80H300V160H254Z' },
    { d: 'M270 150H284' },
    { d: 'M90 80H210M90 98H170', a: true },
  ],
  // A gauge with the needle in the fast zone.
  speed: [
    base,
    { d: 'M100 150A80 80 0 0 1 260 150' },
    { d: 'M180 150L236 104', a: true },
    { d: c(180, 150, 6) },
    { d: 'M124 116l10 6M180 82v12M236 116l-10 6' },
    { d: 'M214 84A80 80 0 0 1 252 118', a: true },
  ],
  // A heavy image frame shrinking to a light one.
  images: [
    base,
    { d: 'M60 50H170V150H60Z' },
    { d: 'M60 130L96 96L126 124L146 108L170 128' },
    { d: c(142, 76, 9) },
    { d: 'M232 90H292V144H232Z', a: true },
    { d: 'M232 132L252 112L270 128L292 114', a: true },
    { d: 'M182 100H218M208 92l10 8l-10 8' },
  ],
  // A stack of server boxes with a heartbeat.
  hosting: [
    base,
    { d: 'M120 44H240V84H120ZM120 94H240V134H120Z' },
    { d: c(138, 64, 4) + c(138, 114, 4) },
    { d: 'M160 64H222M160 114H222' },
    { d: 'M60 156H140L152 140L166 168L178 150H300', a: true },
  ],
  // A storefront with an awning.
  store: [
    base,
    { d: 'M90 90H270V176' },
    { d: 'M90 90V176' },
    { d: 'M80 90L96 50H264L280 90', a: true },
    { d: 'M80 90Q98 108 116 90Q134 108 152 90Q170 108 188 90Q206 108 224 90Q242 108 260 90Q270 100 280 90', a: true },
    { d: 'M112 118H160V176M196 118H246V150H196Z' },
  ],
  // A card with a check mark.
  payments: [
    base,
    { d: 'M86 64H244V150H86Z' },
    { d: 'M86 86H244' },
    { d: 'M102 126H150' },
    { d: c(252, 138, 26), a: true },
    { d: 'M240 138l9 9l17-18', a: true },
  ],
  // A parcel with motion lines.
  shipping: [
    base,
    { d: 'M150 70H270V160H150Z' },
    { d: 'M150 70L178 48H298L270 70M298 48V138L270 160' },
    { d: 'M196 70V100H224V70' },
    { d: 'M64 96H124M84 118H130M72 140H120', a: true },
  ],
};
