import { describe, expect, it } from "vitest";

import { fitColumns, recommendSize, type FitChart } from "~/lib/fit";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

const womens = chartFromTemplate(getTemplate("womens-tops")!);
const shoes = chartFromTemplate(getTemplate("womens-shoes")!);
const tshirt = chartFromTemplate(getTemplate("tshirt-flat")!);

function chart(rows: [string, string][], unit: "cm" | "in" = "cm"): FitChart {
  return {
    unit,
    columns: [
      { id: "s", kind: "size", label: "Size" },
      { id: "c", kind: "measure", label: "Chest", measure: "chest" },
    ],
    rows: rows.map(([size, chest], i) => ({ id: `r${i}`, cells: { s: size, c: chest } })),
  };
}

describe("fitColumns", () => {
  it("offers body measurements only", () => {
    expect(fitColumns(womens).map((c) => c.measure)).toEqual(["bust", "waist", "hips"]);
    expect(fitColumns(tshirt)).toEqual([]);
    expect(fitColumns(shoes).map((c) => c.measure)).toEqual(["foot_length"]);
  });

  it("skips columns with fewer than two usable values", () => {
    expect(fitColumns(chart([["S", "88"], ["M", "n/a"]]))).toEqual([]);
  });
});

describe("recommendSize", () => {
  it("returns null without usable measurements", () => {
    expect(recommendSize(womens, {}, "cm")).toBeNull();
    expect(recommendSize(womens, { bust: Number.NaN }, "cm")).toBeNull();
    expect(recommendSize(womens, { bust: -3 }, "cm")).toBeNull();
    expect(recommendSize(tshirt, { chest: 90 }, "cm")).toBeNull();
  });

  it("finds the size that fits every measurement", () => {
    const result = recommendSize(womens, { bust: 90, waist: 72, hips: 96 }, "cm");
    expect(result).toMatchObject({ size: "M", status: "exact" });
    expect(result!.details.every((d) => d.status === "good")).toBe(true);
  });

  it("accepts inches for a centimetre chart", () => {
    // 35.4 in ≈ 90 cm, 28.3 in ≈ 72 cm, 37.8 in ≈ 96 cm
    expect(recommendSize(womens, { bust: 35.4, waist: 28.3, hips: 37.8 }, "in")?.size).toBe("M");
  });

  it("sizes up when measurements point to different sizes", () => {
    // Bust says S, hips say L: the size that isn't tight anywhere is L.
    const result = recommendSize(womens, { bust: 86, hips: 100 }, "cm")!;
    expect(result.size).toBe("L");
    expect(result.status).toBe("between");
    expect(result.alternative?.size).toBe("M");
    expect(result.details.find((d) => d.measure === "bust")?.status).toBe("loose");
  });

  it("suggests the smaller size for a snug preference when between sizes", () => {
    const result = recommendSize(womens, { bust: 86, hips: 100 }, "cm", "snug")!;
    expect(result.size).toBe("M");
    expect(result.alternative?.size).toBe("L");
  });

  it("flags measurements above the largest size", () => {
    expect(recommendSize(womens, { bust: 130 }, "cm")).toMatchObject({ size: "XXL", status: "above" });
  });

  it("flags measurements below the smallest size", () => {
    expect(recommendSize(womens, { bust: 70, waist: 55 }, "cm")).toMatchObject({ size: "XS", status: "below" });
  });

  it("handles single values by covering halfway to the neighbouring sizes", () => {
    const points = chart([["S", "88"], ["M", "96"], ["L", "104"]]);
    expect(recommendSize(points, { chest: 91 }, "cm")?.size).toBe("S");
    expect(recommendSize(points, { chest: 93 }, "cm")?.size).toBe("M");
    expect(recommendSize(points, { chest: 107 }, "cm")).toMatchObject({ size: "L", status: "exact" });
  });

  it("uses foot length for shoes", () => {
    expect(recommendSize(shoes, { foot_length: 24.1 }, "cm")?.size).toBe("38");
  });

  it("picks the best-centred size on overlapping ranges, snug the smallest, relaxed the largest", () => {
    const overlap = chart([["S", "84–92"], ["M", "88–96"], ["L", "92–100"]]);
    expect(recommendSize(overlap, { chest: 91 }, "cm", "regular")?.size).toBe("M");
    expect(recommendSize(overlap, { chest: 91 }, "cm", "snug")?.size).toBe("S");
    expect(recommendSize(overlap, { chest: 91 }, "cm", "relaxed")?.size).toBe("M");
  });

  it("goes up a size for a relaxed fit near the top of a range", () => {
    expect(recommendSize(womens, { bust: 91.5 }, "cm", "relaxed")?.size).toBe("L");
    expect(recommendSize(womens, { bust: 89 }, "cm", "relaxed")?.size).toBe("M");
  });

  it("does not depend on row order", () => {
    const reversed = { ...womens, rows: [...womens.rows].reverse() };
    expect(recommendSize(reversed, { bust: 90, waist: 72, hips: 96 }, "cm")?.size).toBe("M");
  });

  it("works on inch charts", () => {
    const inches = chart([["S", "34–36"], ["M", "37–39"], ["L", "40–42"]], "in");
    expect(recommendSize(inches, { chest: 96 }, "cm")?.size).toBe("M");
  });
});
