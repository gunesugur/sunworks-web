/**
 * Reads the store theme's look in the browser so the size chart matches it
 * with no setup: body and heading fonts, text and background colours, the
 * primary button's colour and corner radius, and the base text size.
 *
 * The values are written as --sm-theme-* custom properties on the chart's
 * root element; sizemate.css uses them unless the merchant chose otherwise.
 */

export type Rgba = [number, number, number, number];

let probe: CanvasRenderingContext2D | null | undefined;

/** Any CSS colour (rgb, hex, oklch, named…) as RGBA 0–255, or null. */
export function parseColor(value: string): Rgba | null {
  const text = value.trim();
  if (!text || text === "transparent" || text.startsWith("var(")) return text === "transparent" ? [0, 0, 0, 0] : null;
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(text);
  if (rgb) {
    const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith("%") ? Number.parseFloat(rgb[4]) / 100 : Number(rgb[4]);
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Math.round(alpha * 255)];
  }
  // Modern colour syntaxes: let the browser rasterise one pixel.
  if (probe === undefined) {
    try {
      probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    } catch {
      probe = null;
    }
  }
  if (!probe) return null;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = text;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r!, g!, b!, a!];
}

export function toCss([r, g, b, a]: Rgba): string {
  return a >= 255 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${Math.round((a / 255) * 100) / 100})`;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance([r, g, b]: Rgba): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, 1–21. */
export function contrast(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** The first opaque background behind an element (sections often set their own colour scheme). */
export function backgroundBehind(element: Element | null): Rgba {
  for (let node = element; node; node = node.parentElement) {
    const colour = parseColor(getComputedStyle(node).backgroundColor);
    if (colour && colour[3] > 200) return colour;
  }
  return [255, 255, 255, 255];
}

const BUTTON_SELECTORS = [
  "form[action*='/cart/add'] [type='submit']",
  "form[action*='/cart/add'] button[name='add']",
  ".product-form__submit",
  ".button--primary",
  ".btn--primary",
  "button.button",
  ".btn",
];

/** Where to look for the theme's own elements: the admin preview stage, else the page's main content. */
function themeScope(root: Element): ParentNode {
  return root.closest("[data-sizemate-stage]") ?? root.closest("main, [role='main']") ?? document;
}

function primaryButton(root: Element): HTMLElement | null {
  const scope = themeScope(root);
  for (const selector of BUTTON_SELECTORS) {
    const button = Array.from(scope.querySelectorAll<HTMLElement>(selector)).find((el) => !el.closest("[data-sizemate]"));
    if (button) return button;
  }
  return null;
}

function headingFont(root: Element): string | null {
  const heading = themeScope(root).querySelector("h1, .h1, h2, .h2");
  return heading ? getComputedStyle(heading).fontFamily : null;
}

export interface ThemeLook {
  bg: Rgba;
  fg: Rgba;
  accent: Rgba | null;
  accentFg: Rgba | null;
  font: string;
  headingFont: string | null;
  size: number;
  radius: number | null;
}

export function readTheme(root: HTMLElement): ThemeLook {
  const style = getComputedStyle(root);
  const bg = backgroundBehind(root.parentElement ?? root);
  const fg = parseColor(style.color) ?? [26, 26, 26, 255];
  const button = primaryButton(root);
  let accent: Rgba | null = null;
  let accentFg: Rgba | null = null;
  let radius: number | null = null;
  if (button) {
    const buttonStyle = getComputedStyle(button);
    const fill = parseColor(buttonStyle.backgroundColor);
    // Outline-only buttons tell us nothing; a filled one is the brand colour.
    if (fill && fill[3] > 200 && contrast(fill, bg) > 1.3) {
      accent = fill;
      accentFg = parseColor(buttonStyle.color);
    }
    const r = Number.parseFloat(buttonStyle.borderTopLeftRadius);
    if (Number.isFinite(r)) radius = Math.min(Math.max(r, 0), 18);
  }
  const stage = root.closest<HTMLElement>("[data-sizemate-stage]");
  const bodyStyle = getComputedStyle(stage ?? document.body);
  const bodySize = Number.parseFloat(bodyStyle.fontSize);
  return {
    bg,
    fg,
    accent,
    accentFg,
    font: bodyStyle.fontFamily || style.fontFamily,
    headingFont: headingFont(root),
    size: Number.isFinite(bodySize) ? bodySize : 16,
    radius,
  };
}

/** Writes the theme's look onto the chart root. */
export function applyTheme(root: HTMLElement, look: ThemeLook = readTheme(root)): void {
  const set = (name: string, value: string | null) => {
    if (value) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  };
  set("--sm-theme-bg", toCss(look.bg));
  set("--sm-theme-fg", toCss(look.fg));
  set("--sm-theme-accent", look.accent ? toCss(look.accent) : null);
  set("--sm-theme-accent-fg", look.accentFg ? toCss(look.accentFg) : null);
  set("--sm-theme-font", look.font);
  set("--sm-theme-heading-font", look.headingFont);
  set("--sm-theme-size", `${look.size}px`);
  set("--sm-theme-radius", look.radius === null ? null : `${look.radius}px`);
  root.dataset.scheme = luminance(look.bg) < 0.25 ? "dark" : "light";
}

/**
 * After the final colours are known (theme, mode and merchant choices),
 * makes sure the accent stays readable: a dark brand colour on a dark
 * chart falls back to the text colour.
 */
export function ensureReadableAccent(root: HTMLElement): void {
  root.style.removeProperty("--sm-auto-accent");
  root.style.removeProperty("--sm-auto-accent-fg");
  const style = getComputedStyle(root);
  const bg = parseColor(style.getPropertyValue("--_bg"));
  const fg = parseColor(style.getPropertyValue("--_fg"));
  const accent = parseColor(style.getPropertyValue("--_accent"));
  const accentFg = parseColor(style.getPropertyValue("--_accent-fg"));
  if (!bg || !fg || !accent) return;
  let finalAccent = accent;
  if (contrast(accent, bg) < 2.2) {
    root.style.setProperty("--sm-auto-accent", toCss(fg));
    finalAccent = fg;
  }
  if (!accentFg || contrast(finalAccent, accentFg) < 3.5) {
    const white: Rgba = [255, 255, 255, 255];
    const black: Rgba = [17, 17, 17, 255];
    root.style.setProperty("--sm-auto-accent-fg", toCss(contrast(finalAccent, white) >= contrast(finalAccent, black) ? white : black));
  }
}
