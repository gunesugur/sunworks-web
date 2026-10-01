import { describe, expect, it } from "vitest";

import { chooseFigure, FIGURE_IDS, FIGURES, figureLiquid, figureSvg, markSvg, smoothClosed } from "~/lib/figures";
import { MEASURES } from "~/lib/measures";
import { buildPublication } from "~/lib/publish";
import { DEFAULT_SETTINGS } from "~/lib/settings";
import { chartFromTemplate, getTemplate, TEMPLATES } from "~/lib/templates";

const measuresOf = (key: string) => getTemplate(key)!.columns.flatMap((c) => (c.measure ? [c.measure] : []));

describe("figures", () => {
  it.each([
    ["womens-tops", "body-f"],
    ["mens-tops", "body-m"],
    ["womens-bottoms", "body-f"],
    ["mens-bottoms", "body-m"],
    ["tshirt-flat", "garment"],
    ["jeans-flat", "pants"],
    ["mens-shoes", "foot"],
    ["hats", "head"],
    ["gloves", "hand"],
    ["watch-straps", "hand"],
    ["rings", "ring"],
    ["pets", "pet"],
    ["dog-harness", "pet"],
  ])("%s → %s", (key, figure) => {
    expect(chooseFigure(measuresOf(key), key)).toBe(figure);
  });

  it("respects an explicit choice and the older picture names", () => {
    expect(chooseFigure(["chest"], "", "none")).toBeNull();
    expect(chooseFigure(["chest"], "", "foot")).toBe("foot");
    expect(chooseFigure(["chest"], "", "torso")).toBe("body-m");
    expect(chooseFigure(["bust"], "", "legs")).toBe("body-f");
    expect(chooseFigure([], "", "wrist")).toBe("hand");
    expect(chooseFigure(["other"], "custom")).toBeNull();
  });

  it("draws every body measurement on the body figures", () => {
    const body = ["chest", "bust", "underbust", "waist", "hips", "neck", "shoulder", "arm", "inseam", "thigh", "height", "calf"];
    for (const measure of body) {
      expect(FIGURES["body-f"].marks[measure as keyof (typeof FIGURES)["body-f"]["marks"]], measure).toBeDefined();
      expect(FIGURES["body-m"].marks[measure as keyof (typeof FIGURES)["body-m"]["marks"]], measure).toBeDefined();
    }
  });

  it("can illustrate the first measurement of almost every template", () => {
    const missing = TEMPLATES.filter((template) => {
      const measures = template.columns.flatMap((c) => (c.measure && c.measure !== "other" && c.measure !== "weight" && c.measure !== "pet_weight" ? [c.measure] : []));
      if (!measures.length) return false;
      const figure = chooseFigure(measures, template.key);
      return !figure || !measures.some((m) => FIGURES[figure].marks[m as never]);
    }).map((t) => t.key);
    expect(missing).toEqual([]);
  });

  it("only uses known measurement keys", () => {
    const keys = new Set(MEASURES.map((m) => m.key));
    for (const id of FIGURE_IDS) for (const measure of Object.keys(FIGURES[id].marks)) expect(keys.has(measure as never), `${id} ${measure}`).toBe(true);
  });

  it("renders numbered, theme-coloured SVG without fixed colours", () => {
    const svg = figureSvg("body-f", [
      { measure: "bust", n: 1 },
      { measure: "waist", n: 2 },
      { measure: "unknown", n: 3 },
    ]);
    expect(svg).toMatch(/^<svg class="sizemate-figure sizemate-figure--body-f" viewBox="0 0 240 470"/);
    expect(svg.match(/sizemate-fig-badge/g)).toHaveLength(2);
    expect(svg).toContain(">1</text>");
    expect(svg).toContain(">2</text>");
    expect(svg).not.toMatch(/fill="#|stroke="#/);
  });

  it("builds smooth closed paths and every kind of mark", () => {
    expect(smoothClosed([[0, 0], [10, 0], [10, 10]])).toMatch(/^M0 0C.*Z$/);
    expect(markSvg({ type: "girth", from: [0, 0], to: [10, 0] })).toContain("sizemate-fig-back");
    expect(markSvg({ type: "line", from: [0, 0], to: [10, 0] })).toContain("sizemate-fig-tape");
    expect(markSvg({ type: "path", points: [[0, 0], [5, 5], [10, 0]] })).toContain("L5 5");
    expect(markSvg({ type: "circle", center: [5, 5], r: 3 })).toContain("<circle");
  });

  it("generates a Liquid branch for every figure and mark", () => {
    const liquid = figureLiquid();
    for (const id of FIGURE_IDS) expect(liquid).toContain(`{%- when '${id}' -%}`);
    expect(liquid).toContain("{%- when 'bust' -%}");
    expect(liquid).toContain("{{ col.n }}");
  });

  it("numbers the drawn measurements in column order when publishing", () => {
    const chart = chartFromTemplate(getTemplate("womens-activewear")!);
    const published = Object.values(buildPublication([chart], DEFAULT_SETTINGS, "plus").charts)[0]!;
    expect(published.guide.d).toBe("body-f");
    expect(published.cols.map((c) => c.n)).toEqual([0, 1, 2, 3, 4]);
    const weights = Object.values(buildPublication([chartFromTemplate(getTemplate("kids-height-weight")!)], DEFAULT_SETTINGS, "plus").charts)[0]!;
    expect(weights.cols.map((c) => [c.m, c.d, c.n])).toEqual([
      ["", "", 0],
      ["", "", 0],
      ["height", "l", 1],
      ["weight", "w", 0],
    ]);
  });
});
