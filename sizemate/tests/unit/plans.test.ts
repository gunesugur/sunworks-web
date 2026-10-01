import { describe, expect, it } from "vitest";

import { canCreateChart, hasFeature, planFor, planFromSubscriptions, PLANS } from "~/lib/plans";
import { applyPreset, DEFAULT_SETTINGS, effectiveSettings, isProChoice, lockedSettingsInUse, parseSettings, PRESETS } from "~/lib/settings";

describe("plans", () => {
  it("limits Free to one chart", () => {
    expect(canCreateChart("free", 0)).toBe(true);
    expect(canCreateChart("free", 1)).toBe(false);
    expect(canCreateChart("pro", 500)).toBe(true);
  });

  it("puts each feature on the cheapest sensible plan", () => {
    expect(planFor("csv").id).toBe("pro");
    expect(planFor("allTemplates").id).toBe("pro");
    expect(planFor("fitFinder").id).toBe("pro");
    expect(planFor("fitFinderAll").id).toBe("plus");
    expect(planFor("insights").id).toBe("plus");
    expect(hasFeature("plus", "csv")).toBe(true);
    expect(hasFeature("free", "removeBranding")).toBe(false);
  });

  it("higher plans include everything lower plans have", () => {
    for (const feature of PLANS.pro.features) expect(PLANS.plus.features).toContain(feature);
  });

  it("maps subscriptions to plans", () => {
    expect(planFromSubscriptions([])).toBe("free");
    expect(planFromSubscriptions([{ name: "Pro", status: "ACTIVE" }])).toBe("pro");
    expect(planFromSubscriptions([{ name: "plus", status: "active" }])).toBe("plus");
    expect(planFromSubscriptions([{ name: "Plus (yearly)", status: "ACTIVE" }])).toBe("plus");
    expect(planFromSubscriptions([{ name: "Plus", status: "CANCELLED" }])).toBe("free");
    expect(planFromSubscriptions([{ name: "Producer", status: "ACTIVE" }])).toBe("free");
    expect(planFromSubscriptions([{ name: "Pro", status: "ACTIVE" }, { name: "Plus", status: "ACTIVE" }])).toBe("plus");
  });
});

describe("settings", () => {
  it("falls back to defaults per field", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings({ buttonStyle: "filled", accentColor: "red", container: "drawer", textScale: 500 })).toEqual({
      ...DEFAULT_SETTINGS,
      buttonStyle: "filled",
      container: "drawer",
    });
  });

  it("reads settings saved before v2", () => {
    const old = parseSettings({ layout: "drawer", defaultUnit: "in", accentColor: "#112233" });
    expect(old.container).toBe("drawer");
    expect(old.defaultUnit).toBe("imperial");
    expect(old.accentColor).toBe("#112233");
    expect(parseSettings({ defaultUnit: "cm" }).defaultUnit).toBe("metric");
  });

  it("applies a preset's look and keeps the rest", () => {
    const next = applyPreset({ ...DEFAULT_SETTINGS, buttonLabel: "Sizes", accentColor: "#ff0000" }, "bold");
    expect(next.preset).toBe("bold");
    expect(next.headerStyle).toBe("solid");
    expect(next.buttonLabel).toBe("Sizes");
    expect(next.accentColor).toBe("#ff0000");
  });

  it("offers free presets, including high contrast, on every plan", () => {
    const free = PRESETS.filter((p) => p.free).map((p) => p.id);
    expect(free).toEqual(["theme", "clean", "contrast"]);
    const contrast = effectiveSettings(applyPreset(DEFAULT_SETTINGS, "contrast"), "free");
    expect(contrast.preset).toBe("contrast");
    expect(contrast.tableStyle).toBe("grid");
    expect(contrast.textScale).toBe(115);
  });

  it("resets the design studio on Free but keeps it stored", () => {
    const custom = {
      ...applyPreset(DEFAULT_SETTINGS, "soft"),
      accentColor: "#ff0000",
      container: "drawer" as const,
      arrangement: "split" as const,
      buttonLabel: "Sizes",
      textScale: 125,
      colorMode: "dark" as const,
    };
    const free = effectiveSettings(custom, "free");
    expect(free).toEqual({ ...DEFAULT_SETTINGS, buttonLabel: "Sizes", textScale: 125, colorMode: "dark" });
    expect(effectiveSettings(custom, "pro")).toEqual(custom);
    expect(lockedSettingsInUse(custom, "free")).toEqual(
      expect.arrayContaining(["preset", "accentColor", "container", "arrangement", "font", "tableStyle", "buttonStyle"]),
    );
    expect(lockedSettingsInUse(custom, "free")).not.toContain("textScale");
    expect(lockedSettingsInUse(custom, "pro")).toEqual([]);
  });

  it("never paywalls readability", () => {
    for (const key of ["textScale", "colorMode", "textSizeToggle", "defaultUnit", "stickyColumn", "crosshair"] as const) {
      expect(isProChoice(key, DEFAULT_SETTINGS[key]), key).toBe(false);
    }
    expect(isProChoice("container", "drawer")).toBe(true);
    expect(isProChoice("container", "modal")).toBe(false);
    expect(isProChoice("preset", "contrast")).toBe(false);
    expect(isProChoice("preset", "boutique")).toBe(true);
  });
});
