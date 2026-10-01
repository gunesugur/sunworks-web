import { z } from "zod";

import { hasFeature, type PlanId } from "./plans";

/**
 * How the size chart looks and behaves on the storefront.
 *
 * Everything defaults to "follow the theme": fonts, text and background
 * colours, button colour and corner radius are read from the store's theme
 * in the browser (see app/storefront/theme.ts). Each field below only
 * overrides that when the merchant sets it.
 */
export interface AppearanceSettings {
  /** The look the merchant started from; fields below can fine-tune it. */
  preset: PresetId;

  /* Button */
  /** Empty means "use the translated default" ("Size chart", "Größentabelle", …). */
  buttonLabel: string;
  buttonStyle: "link" | "outline" | "filled" | "pill";
  icon: "ruler" | "hanger" | "tape" | "shirt" | "none";
  alignment: "start" | "center" | "end";
  /** Where the app embed puts the button when no app block is placed. */
  autoPlacement: "before_buy_buttons" | "after_variant_picker" | "after_price" | "off";

  /* Window */
  /** modal: centred pop-up (a sheet on phones). drawer: slides in from the side. inline: opens in place on the page. */
  container: "modal" | "drawer" | "inline";
  drawerSide: "right" | "left";
  width: "narrow" | "regular" | "wide";
  /** tabs: chart, guide and Fit Finder as tabs. stacked: one scrolling page. split: picture card beside the chart. */
  arrangement: "tabs" | "stacked" | "split";

  /* Colours ("" = from the theme) */
  colorMode: "theme" | "light" | "dark" | "system";
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headerBackground: string;
  headerTextColor: string;
  borderColor: string;

  /* Typography */
  font: FontChoice;
  headingFont: FontChoice;
  headingCase: "normal" | "uppercase";
  /** Percentage of the theme's body text size. */
  textScale: number;

  /* Table */
  tableStyle: "lines" | "striped" | "grid" | "minimal";
  headerStyle: "tinted" | "solid" | "plain";
  density: "compact" | "regular" | "relaxed";
  radius: "theme" | "none" | "small" | "medium" | "large";
  /** Keeps the size column and header visible while scrolling wide charts. */
  stickyColumn: boolean;
  /** Highlights the row and column under the pointer. */
  crosshair: boolean;

  /* Shoppers */
  /** "auto" picks imperial for US, Liberia and Myanmar shoppers, metric elsewhere. */
  defaultUnit: "auto" | "metric" | "imperial";
  /** Shows a button that makes the chart text larger. */
  textSizeToggle: boolean;
}

export type FontChoice = "theme" | "heading" | "system" | "serif" | "rounded" | "geometric" | "humanist" | "mono";
export type PresetId = "theme" | "clean" | "contrast" | "boutique" | "bold" | "soft" | "editorial";

export const FONT_CHOICES: readonly FontChoice[] = ["theme", "heading", "system", "serif", "rounded", "geometric", "humanist", "mono"];

const COLOUR = z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/)]);

export const settingsSchema = z.object({
  preset: z.enum(["theme", "clean", "contrast", "boutique", "bold", "soft", "editorial"]),
  buttonLabel: z.string().trim().max(40),
  buttonStyle: z.enum(["link", "outline", "filled", "pill"]),
  icon: z.enum(["ruler", "hanger", "tape", "shirt", "none"]),
  alignment: z.enum(["start", "center", "end"]),
  autoPlacement: z.enum(["before_buy_buttons", "after_variant_picker", "after_price", "off"]),
  container: z.enum(["modal", "drawer", "inline"]),
  drawerSide: z.enum(["right", "left"]),
  width: z.enum(["narrow", "regular", "wide"]),
  arrangement: z.enum(["tabs", "stacked", "split"]),
  colorMode: z.enum(["theme", "light", "dark", "system"]),
  accentColor: COLOUR,
  backgroundColor: COLOUR,
  textColor: COLOUR,
  headerBackground: COLOUR,
  headerTextColor: COLOUR,
  borderColor: COLOUR,
  font: z.enum(FONT_CHOICES as [FontChoice, ...FontChoice[]]),
  headingFont: z.enum(FONT_CHOICES as [FontChoice, ...FontChoice[]]),
  headingCase: z.enum(["normal", "uppercase"]),
  textScale: z.number().int().min(85).max(150),
  tableStyle: z.enum(["lines", "striped", "grid", "minimal"]),
  headerStyle: z.enum(["tinted", "solid", "plain"]),
  density: z.enum(["compact", "regular", "relaxed"]),
  radius: z.enum(["theme", "none", "small", "medium", "large"]),
  stickyColumn: z.boolean(),
  crosshair: z.boolean(),
  defaultUnit: z.enum(["auto", "metric", "imperial"]),
  textSizeToggle: z.boolean(),
}) satisfies z.ZodType<AppearanceSettings>;

/** The parts of the look a preset decides. */
type StyleFields = Pick<
  AppearanceSettings,
  "font" | "headingFont" | "headingCase" | "tableStyle" | "headerStyle" | "density" | "radius" | "textScale" | "buttonStyle"
>;

export interface Preset {
  id: PresetId;
  name: string;
  description: string;
  /** Free presets are on every plan; the others are part of the design studio. */
  free: boolean;
  values: StyleFields;
}

export const PRESETS: readonly Preset[] = [
  {
    id: "theme",
    name: "Match my theme",
    description: "Your theme's fonts, colours and corners. Looks built in.",
    free: true,
    values: { font: "theme", headingFont: "heading", headingCase: "normal", tableStyle: "lines", headerStyle: "tinted", density: "regular", radius: "theme", textScale: 100, buttonStyle: "link" },
  },
  {
    id: "clean",
    name: "Clean",
    description: "Airy rows and hairlines. Lets the numbers breathe.",
    free: true,
    values: { font: "theme", headingFont: "heading", headingCase: "normal", tableStyle: "minimal", headerStyle: "plain", density: "relaxed", radius: "small", textScale: 100, buttonStyle: "link" },
  },
  {
    id: "contrast",
    name: "High contrast",
    description: "Larger text, strong lines and a solid header. Easiest to read.",
    free: true,
    values: { font: "theme", headingFont: "heading", headingCase: "normal", tableStyle: "grid", headerStyle: "solid", density: "relaxed", radius: "small", textScale: 115, buttonStyle: "outline" },
  },
  {
    id: "boutique",
    name: "Boutique",
    description: "Serif title, small caps headers and generous space.",
    free: false,
    values: { font: "theme", headingFont: "serif", headingCase: "uppercase", tableStyle: "minimal", headerStyle: "plain", density: "relaxed", radius: "none", textScale: 100, buttonStyle: "link" },
  },
  {
    id: "bold",
    name: "Bold",
    description: "A solid header in your brand colour and a strong grid.",
    free: false,
    values: { font: "theme", headingFont: "heading", headingCase: "uppercase", tableStyle: "grid", headerStyle: "solid", density: "regular", radius: "medium", textScale: 100, buttonStyle: "filled" },
  },
  {
    id: "soft",
    name: "Soft",
    description: "Rounded corners, striped rows and a friendly typeface.",
    free: false,
    values: { font: "rounded", headingFont: "rounded", headingCase: "normal", tableStyle: "striped", headerStyle: "tinted", density: "regular", radius: "large", textScale: 100, buttonStyle: "pill" },
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-style serif headings over crisp sans-serif figures.",
    free: false,
    values: { font: "humanist", headingFont: "serif", headingCase: "normal", tableStyle: "lines", headerStyle: "plain", density: "regular", radius: "none", textScale: 105, buttonStyle: "link" },
  },
];

export function getPreset(id: PresetId): Preset {
  return PRESETS.find((preset) => preset.id === id) ?? PRESETS[0]!;
}

export const DEFAULT_SETTINGS: AppearanceSettings = {
  preset: "theme",
  ...PRESETS[0]!.values,
  buttonLabel: "",
  icon: "ruler",
  alignment: "start",
  autoPlacement: "before_buy_buttons",
  container: "modal",
  drawerSide: "right",
  width: "regular",
  arrangement: "tabs",
  colorMode: "theme",
  accentColor: "",
  backgroundColor: "",
  textColor: "",
  headerBackground: "",
  headerTextColor: "",
  borderColor: "",
  stickyColumn: true,
  crosshair: true,
  defaultUnit: "auto",
  textSizeToggle: true,
};

/** Applies a preset's look, keeping the merchant's content and behaviour choices. */
export function applyPreset(settings: AppearanceSettings, id: PresetId): AppearanceSettings {
  return { ...settings, ...getPreset(id).values, preset: id };
}

/** Values from before v2 that map onto the new fields. */
function migrate(input: Record<string, unknown>): Record<string, unknown> {
  const next = { ...input };
  if (next.container === undefined && (input.layout === "modal" || input.layout === "drawer")) next.container = input.layout;
  if (input.defaultUnit === "cm") next.defaultUnit = "metric";
  if (input.defaultUnit === "in") next.defaultUnit = "imperial";
  return next;
}

/** Reads stored settings, falling back to defaults for anything missing or invalid. */
export function parseSettings(raw: unknown): AppearanceSettings {
  const input = migrate(typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {});
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppearanceSettings)[]) {
    const candidate = settingsSchema.shape[key].safeParse(input[key]);
    if (candidate.success) merged[key] = candidate.data;
  }
  return merged as unknown as AppearanceSettings;
}

/**
 * Settings that belong to the design studio (Pro). On Free they fall back to
 * the chosen free preset. Accessibility and units are never paywalled.
 */
export const STUDIO_FIELDS = [
  "icon",
  "accentColor",
  "backgroundColor",
  "textColor",
  "headerBackground",
  "headerTextColor",
  "borderColor",
  "font",
  "headingFont",
  "headingCase",
  "tableStyle",
  "headerStyle",
  "density",
  "radius",
  "drawerSide",
  "width",
] as const satisfies readonly (keyof AppearanceSettings)[];

type StudioField = (typeof STUDIO_FIELDS)[number];

/** Choices that are free for some values and Pro for others. */
const PRO_VALUES: Partial<Record<keyof AppearanceSettings, readonly string[]>> = {
  container: ["drawer", "inline"],
  arrangement: ["split"],
  buttonStyle: ["pill"],
};

/** The look a Free store gets for these settings. */
function freeBase(settings: AppearanceSettings): AppearanceSettings {
  const preset = getPreset(settings.preset);
  const base = preset.free ? preset : getPreset("theme");
  return { ...DEFAULT_SETTINGS, ...base.values, preset: base.id };
}

/** Paid options fall back to free equivalents on plans that don't include them. */
export function effectiveSettings(settings: AppearanceSettings, plan: PlanId): AppearanceSettings {
  if (hasFeature(plan, "customStyle")) return settings;
  const base = freeBase(settings);
  const result: AppearanceSettings = { ...settings, preset: base.preset };
  for (const key of STUDIO_FIELDS) (result as unknown as Record<StudioField, unknown>)[key] = base[key];
  // A free preset's own text size and button style stay adjustable.
  result.textScale = settings.textScale;
  for (const [key, values] of Object.entries(PRO_VALUES) as [keyof AppearanceSettings, readonly string[]][]) {
    if (values.includes(String(settings[key]))) (result as unknown as Record<string, unknown>)[key] = DEFAULT_SETTINGS[key];
  }
  return result;
}

/** Settings that need a paid plan and differ from what Free would show. */
export function lockedSettingsInUse(settings: AppearanceSettings, plan: PlanId): (keyof AppearanceSettings)[] {
  if (hasFeature(plan, "customStyle")) return [];
  const effective = effectiveSettings(settings, plan);
  return (Object.keys(settings) as (keyof AppearanceSettings)[]).filter((key) => settings[key] !== effective[key]);
}

/** True when a field or one of its values needs the design studio. */
export function isProChoice<K extends keyof AppearanceSettings>(key: K, value?: AppearanceSettings[K]): boolean {
  if ((STUDIO_FIELDS as readonly string[]).includes(key)) return true;
  if (key === "preset") return value !== undefined && !getPreset(value as PresetId).free;
  return value !== undefined && (PRO_VALUES[key]?.includes(String(value)) ?? false);
}
