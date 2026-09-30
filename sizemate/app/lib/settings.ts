import { z } from "zod";

import { hasFeature, type PlanId } from "./plans";

/** How the size chart looks and behaves on the storefront. */
export interface AppearanceSettings {
  /** Empty means "use the translated default" ("Size chart", "Größentabelle", …). */
  buttonLabel: string;
  buttonStyle: "link" | "outline" | "filled";
  icon: "ruler" | "hanger" | "tape" | "none";
  alignment: "start" | "center" | "end";
  /** Hex colour, or empty to inherit the theme's text colour. */
  accentColor: string;
  layout: "modal" | "drawer";
  /** "auto" picks inches for US, UK, Liberia and Myanmar shoppers, centimetres elsewhere. */
  defaultUnit: "auto" | "cm" | "in";
  /** Where the app embed puts the button when no app block is placed. */
  autoPlacement: "before_buy_buttons" | "after_variant_picker" | "after_price" | "off";
}

export const DEFAULT_SETTINGS: AppearanceSettings = {
  buttonLabel: "",
  buttonStyle: "link",
  icon: "ruler",
  alignment: "start",
  accentColor: "",
  layout: "modal",
  defaultUnit: "auto",
  autoPlacement: "before_buy_buttons",
};

export const settingsSchema = z.object({
  buttonLabel: z.string().trim().max(40),
  buttonStyle: z.enum(["link", "outline", "filled"]),
  icon: z.enum(["ruler", "hanger", "tape", "none"]),
  alignment: z.enum(["start", "center", "end"]),
  accentColor: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/)]),
  layout: z.enum(["modal", "drawer"]),
  defaultUnit: z.enum(["auto", "cm", "in"]),
  autoPlacement: z.enum(["before_buy_buttons", "after_variant_picker", "after_price", "off"]),
}) satisfies z.ZodType<AppearanceSettings>;

/** Reads stored settings, falling back to defaults for anything missing or invalid. */
export function parseSettings(raw: unknown): AppearanceSettings {
  const input = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppearanceSettings)[]) {
    const candidate = settingsSchema.shape[key].safeParse(input[key]);
    if (candidate.success) merged[key] = candidate.data;
  }
  return merged as unknown as AppearanceSettings;
}

/** Paid styling options fall back to defaults on plans that don't include them. */
export function effectiveSettings(settings: AppearanceSettings, plan: PlanId): AppearanceSettings {
  if (hasFeature(plan, "customStyle")) return settings;
  return {
    ...settings,
    accentColor: DEFAULT_SETTINGS.accentColor,
    icon: DEFAULT_SETTINGS.icon,
    layout: DEFAULT_SETTINGS.layout,
  };
}

/** Settings that need a paid plan and differ from the defaults. */
export function lockedSettingsInUse(settings: AppearanceSettings, plan: PlanId): (keyof AppearanceSettings)[] {
  if (hasFeature(plan, "customStyle")) return [];
  return (["accentColor", "icon", "layout"] as const).filter((key) => settings[key] !== DEFAULT_SETTINGS[key]);
}
