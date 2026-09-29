import {
  siAstro,
  siClaude,
  siCloudflare,
  siCpanel,
  siElementor,
  siFigma,
  siGithub,
  siGoogleads,
  siGoogleanalytics,
  siGooglesearchconsole,
  siGoogletagmanager,
  siMailchimp,
  siMeta,
  siPaypal,
  siPlesk,
  siSanity,
  siShopify,
  siStripe,
  siWoocommerce,
  siWordpress,
  siMake,
  type SimpleIcon,
} from 'simple-icons';
import { svgPathBbox } from 'svg-path-bbox';

/** Brand marks for the "tools we work with" band, looked up by the CMS label (case-insensitive). */
const LOGOS: Record<string, SimpleIcon[]> = {
  wordpress: [siWordpress],
  woocommerce: [siWoocommerce],
  shopify: [siShopify],
  figma: [siFigma],
  cpanel: [siCpanel],
  plesk: [siPlesk],
  claude: [siClaude],
  cloudflare: [siCloudflare],
  github: [siGithub],
  'google search console': [siGooglesearchconsole],
  'google analytics': [siGoogleanalytics],
  'google tag manager': [siGoogletagmanager],
  'google ads': [siGoogleads],
  elementor: [siElementor],
  stripe: [siStripe],
  paypal: [siPaypal],
  meta: [siMeta],
  mailchimp: [siMailchimp],
  make: [siMake],
  sanity: [siSanity],
  astro: [siAstro],
};

// Band backgrounds in each theme (tokens.css: --c-band).
const BAND = { light: [233, 234, 235], dark: [31, 29, 26] } as const;

const lum = (rgb: readonly number[]) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: readonly number[], b: readonly number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
const hexToRgb = (hex: string) => [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb: number[]) => rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** The brand colour, nudged toward black or white until it reads (4:1) on the band background. */
function readable(hex: string, theme: keyof typeof BAND): string {
  const bg = BAND[theme];
  const target = theme === 'light' ? 0 : 255;
  const rgb = hexToRgb(hex);
  for (let t = 0; t <= 1; t += 0.05) {
    const mixed = rgb.map((v) => v + (target - v) * t);
    if (contrast(mixed, bg) >= 4) return rgbToHex(mixed);
  }
  return theme === 'light' ? '000000' : 'ffffff';
}

export interface ToolLogo {
  title: string;
  hex: string;
  /** Brand colour adjusted to stay legible on the light and dark band. */
  hexLight: string;
  hexDark: string;
  path: string;
  /** Tight viewBox around the artwork. */
  viewBox: string;
  /** Height relative to a square mark: wide wordmarks get shorter so every logo carries similar weight. */
  scale: number;
}

const cropped = (icon: SimpleIcon): ToolLogo => {
  const [x0, y0, x1, y1] = svgPathBbox(icon.path);
  const w = x1 - x0;
  const h = y1 - y0;
  return {
    title: icon.title,
    hex: icon.hex,
    hexLight: readable(icon.hex, 'light'),
    hexDark: readable(icon.hex, 'dark'),
    path: icon.path,
    viewBox: [x0, y0, w, h].map((n) => n.toFixed(2)).join(' '),
    scale: Math.round((w / h) ** -0.45 * 1000) / 1000,
  };
};

export const toolLogos = (label: string): ToolLogo[] => (LOGOS[label.trim().toLowerCase()] ?? []).map(cropped);
