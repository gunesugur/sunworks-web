import {
  siClaude,
  siCloudflare,
  siCpanel,
  siFigma,
  siGithub,
  siGoogleanalytics,
  siGooglesearchconsole,
  siPlesk,
  siShopify,
  siWoocommerce,
  siWordpress,
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
};

export interface ToolLogo {
  title: string;
  hex: string;
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
    path: icon.path,
    viewBox: [x0, y0, w, h].map((n) => n.toFixed(2)).join(' '),
    scale: Math.round((w / h) ** -0.45 * 1000) / 1000,
  };
};

export const toolLogos = (label: string): ToolLogo[] => (LOGOS[label.trim().toLowerCase()] ?? []).map(cropped);
