import { describe, expect, it } from "vitest";

import { blankChart, emptyAssignment, type SizeChart } from "~/lib/chart";
import { buildPublication, byteSize, chartKey, oversizedEntries } from "~/lib/publish";
import { DEFAULT_SETTINGS } from "~/lib/settings";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

function charts(): SizeChart[] {
  const tops = chartFromTemplate(getTemplate("womens-tops")!);
  tops.assignment = {
    ...emptyAssignment("conditions"),
    collections: [{ id: "gid://shopify/Collection/11", title: "Tops" }],
    tags: ["Summer"],
    vendors: ["ACME"],
  };
  const shoes = chartFromTemplate(getTemplate("womens-shoes")!);
  shoes.translations = { de: { title: "Schuhgrößen", columns: { [shoes.columns[3]!.id]: "Fußlänge" } } };
  const draft = { ...blankChart(), status: "draft" as const };
  return [tops, draft, shoes];
}

describe("buildPublication", () => {
  it("publishes only active charts, in order, with lowercase rule values and numeric ids", () => {
    const all = charts();
    const result = buildPublication(all, DEFAULT_SETTINGS, "plus");
    expect(result.config.rules.map((r) => r.c)).toEqual([all[0]!.id, all[2]!.id]);
    expect(result.config.rules[0]).toMatchObject({ all: false, col: ["11"], tg: ["summer"], ve: ["acme"] });
    expect(result.config.rules[1]).toMatchObject({ all: true, p: [] });
    expect(Object.keys(result.charts)).toHaveLength(2);
    expect(result.paused).toEqual([]);
  });

  it("aligns rows with columns", () => {
    const result = buildPublication(charts(), DEFAULT_SETTINGS, "plus");
    const published = Object.values(result.charts)[0]!;
    expect(published.cols.map((c) => c.l)).toEqual(["Size", "Bust", "Waist", "Hips"]);
    expect(published.rows[0]).toEqual(["XS", "80–84", "62–66", "86–90"]);
    expect(published.cols[1]).toMatchObject({ k: "measure", m: "bust", mk: "b" });
  });

  it("applies the Free plan: one chart, branding, no fit finder, no translations, default styling", () => {
    const settings = { ...DEFAULT_SETTINGS, accentColor: "#123456" };
    const all = charts();
    const result = buildPublication(all, settings, "free");
    expect(result.config.rules).toHaveLength(1);
    expect(result.paused).toEqual([all[2]!.id]);
    expect(result.config.brand).toBe(true);
    expect(result.config.settings.accentColor).toBe("");
    const only = Object.values(result.charts)[0]!;
    expect(only.fit).toBe(false);
  });

  it("includes translations and the fit finder on Plus only", () => {
    const all = charts();
    const plus = buildPublication(all, DEFAULT_SETTINGS, "plus").charts[chartKey(all[2]!.id)]!;
    expect(plus.tr.de).toEqual({ t: "Schuhgrößen", cols: ["EU", "US", "UK", "Fußlänge"] });
    expect(plus.fit).toBe(true);
    const pro = buildPublication(all, DEFAULT_SETTINGS, "pro").charts[chartKey(all[2]!.id)]!;
    expect(pro.tr).toEqual({});
    expect(pro.fit).toBe(false);
  });

  it("keeps a typical chart well under the metafield limit", () => {
    const result = buildPublication(charts(), DEFAULT_SETTINGS, "plus");
    expect(oversizedEntries(result)).toEqual([]);
    for (const chart of Object.values(result.charts)) expect(byteSize(chart)).toBeLessThan(5_000);
  });

  it("reports oversized entries", () => {
    const chart = blankChart();
    chart.assignment = {
      ...emptyAssignment("conditions"),
      tags: Array.from({ length: 100 }, (_, i) => `${"x".repeat(250)}${i}`),
      vendors: Array.from({ length: 100 }, (_, i) => `${"y".repeat(250)}${i}`),
      productTypes: Array.from({ length: 100 }, (_, i) => `${"z".repeat(250)}${i}`),
    };
    const many = Array.from({ length: 3 }, () => ({ ...chart, id: `c_${Math.random().toString(36).slice(2, 10)}` }));
    expect(oversizedEntries(buildPublication(many, DEFAULT_SETTINGS, "pro"))).toEqual(["config"]);
  });

  it("builds metafield-safe keys", () => {
    expect(chartKey("c_ab12cd34")).toBe("chart_c_ab12cd34");
  });
});
