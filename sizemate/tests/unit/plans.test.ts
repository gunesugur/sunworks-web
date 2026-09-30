import { describe, expect, it } from "vitest";

import { canCreateChart, hasFeature, planFor, planFromSubscriptions, PLANS } from "~/lib/plans";
import { DEFAULT_SETTINGS, effectiveSettings, lockedSettingsInUse, parseSettings } from "~/lib/settings";

describe("plans", () => {
  it("limits Free to one chart", () => {
    expect(canCreateChart("free", 0)).toBe(true);
    expect(canCreateChart("free", 1)).toBe(false);
    expect(canCreateChart("pro", 500)).toBe(true);
  });

  it("puts each feature on the cheapest sensible plan", () => {
    expect(planFor("csv").id).toBe("pro");
    expect(planFor("fitFinder").id).toBe("plus");
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
    expect(parseSettings({ buttonStyle: "filled", accentColor: "red", layout: "drawer" })).toEqual({
      ...DEFAULT_SETTINGS,
      buttonStyle: "filled",
      layout: "drawer",
    });
  });

  it("resets paid styling on Free but keeps it stored", () => {
    const custom = { ...DEFAULT_SETTINGS, accentColor: "#ff0000", layout: "drawer" as const, buttonLabel: "Sizes" };
    expect(effectiveSettings(custom, "free")).toEqual({ ...DEFAULT_SETTINGS, buttonLabel: "Sizes" });
    expect(effectiveSettings(custom, "pro")).toEqual(custom);
    expect(lockedSettingsInUse(custom, "free")).toEqual(["accentColor", "layout"]);
    expect(lockedSettingsInUse(custom, "pro")).toEqual([]);
  });
});
