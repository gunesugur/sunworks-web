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

  it("applies the Free plan: two charts, branding, no fit finder, no translations, default styling", () => {
    const settings = { ...DEFAULT_SETTINGS, accentColor: "#123456" };
    const all = [...charts(), chartFromTemplate(getTemplate("hats")!)];
    const result = buildPublication(all, settings, "free");
    expect(result.config.rules).toHaveLength(2);
    expect(result.paused).toEqual([all[3]!.id]);
    expect(result.config.brand).toBe(true);
    expect(result.config.settings.accentColor).toBe("");
    const only = Object.values(result.charts)[0]!;
    expect(only.fit).toBe(false);
  });

  it("includes translations on Plus only, the Fit Finder from Pro", () => {
    const all = charts();
    const plus = buildPublication(all, DEFAULT_SETTINGS, "plus").charts[chartKey(all[2]!.id)]!;
    expect(plus.tr.de).toEqual({ t: "Schuhgrößen", cols: ["EU", "US", "UK", "Fußlänge"] });
    expect(plus.fit).toBe(true);
    const pro = buildPublication(all, DEFAULT_SETTINGS, "pro").charts[chartKey(all[2]!.id)]!;
    expect(pro.tr).toEqual({});
    expect(pro.fit).toBe(true);
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

describe("buildPublication v2", () => {
  it("publishes units, the figure, the fit scale and the photo per plan", () => {
    const chart = chartFromTemplate(getTemplate("kids-height-weight")!);
    chart.fitScale = 1;
    chart.image = { url: "https://cdn.shopify.com/s/files/kid.jpg", alt: "Kid" };
    const pro = Object.values(buildPublication([chart], DEFAULT_SETTINGS, "pro").charts)[0]!;
    expect(pro).toMatchObject({ u: "cm", wu: "kg", fs: 1, img: { url: "https://cdn.shopify.com/s/files/kid.jpg", alt: "Kid" } });
    expect(pro.guide.d).toBe("body-m");
    const free = Object.values(buildPublication([chart], DEFAULT_SETTINGS, "free").charts)[0]!;
    expect(free).toMatchObject({ fs: null, img: null });
  });

  it("offers the Fit Finder on every chart from Pro up", () => {
    const shoes = chartFromTemplate(getTemplate("womens-shoes")!);
    const tops = chartFromTemplate(getTemplate("womens-tops")!);
    const fit = (plan: "free" | "pro" | "plus") => Object.values(buildPublication([tops, shoes], DEFAULT_SETTINGS, plan).charts).map((c) => c.fit);
    expect(fit("free")).toEqual([false, false]);
    expect(fit("pro")).toEqual([true, true]);
    expect(fit("plus")).toEqual([true, true]);
  });

  it("turns Insights counting and size memory on for Plus only", () => {
    expect(buildPublication(charts(), DEFAULT_SETTINGS, "plus").config).toMatchObject({ ins: true, mem: true });
    expect(buildPublication(charts(), DEFAULT_SETTINGS, "pro").config).toMatchObject({ ins: false, mem: false });
    expect(buildPublication(charts(), DEFAULT_SETTINGS, "free").config).toMatchObject({ ins: false, mem: false });
    expect(buildPublication(charts(), DEFAULT_SETTINGS, "plus").config.v).toBe(2);
  });

  it("falls back to free styling on Free", () => {
    const settings = { ...DEFAULT_SETTINGS, preset: "bold" as const, container: "drawer" as const, headerStyle: "solid" as const };
    const free = buildPublication(charts(), settings, "free").config.settings;
    expect(free).toMatchObject({ preset: "theme", container: "modal", headerStyle: "tinted" });
    expect(buildPublication(charts(), settings, "pro").config.settings).toEqual(settings);
  });

  it("keeps the largest template comfortably under the metafield limit", () => {
    const sizes = buildPublication([chartFromTemplate(getTemplate("bras-band")!)], DEFAULT_SETTINGS, "plus");
    for (const chart of Object.values(sizes.charts)) expect(byteSize(chart)).toBeLessThan(20_000);
  });
});
