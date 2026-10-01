import { describe, expect, it } from "vitest";

import {
  blankChart,
  createColumn,
  describeAssignment,
  duplicateChart,
  emptyAssignment,
  validateChart,
  type SizeChart,
} from "~/lib/chart";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

function valid(chart: SizeChart): SizeChart {
  const result = validateChart(chart);
  if (!result.ok) throw new Error(result.errors.join("; "));
  return result.chart;
}

describe("validateChart", () => {
  it("accepts a blank chart", () => {
    expect(validateChart(blankChart()).ok).toBe(true);
  });

  it("requires the first column to be the size column", () => {
    const chart = blankChart();
    chart.columns.reverse();
    const result = validateChart(chart);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("The first column must be the size column");
  });

  it("requires every row to have a size name", () => {
    const chart = blankChart();
    chart.rows[1]!.cells = {};
    const result = validateChart(chart);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain("Row 2 needs a size name");
  });

  it("requires a name", () => {
    const result = validateChart({ ...blankChart(), name: "   " });
    expect(result.ok).toBe(false);
  });

  it("rejects unknown measurements and malformed ids", () => {
    const chart = blankChart();
    expect(validateChart({ ...chart, columns: [...chart.columns, { ...createColumn("measure", "X"), measure: "nope" }] }).ok).toBe(false);
    expect(validateChart({ ...chart, id: "<script>" }).ok).toBe(false);
  });

  it("rejects resource ids that are not Shopify product or collection gids", () => {
    const chart = blankChart();
    chart.assignment = { ...emptyAssignment("conditions"), products: [{ id: "gid://shopify/Customer/1", title: "x" }] };
    expect(validateChart(chart).ok).toBe(false);
  });

  it("trims text, drops cells of deleted columns and de-duplicates lists", () => {
    const chart = blankChart();
    chart.name = "  Tops  ";
    chart.rows[0]!.cells["k_deleted1"] = "99";
    chart.assignment = { ...emptyAssignment("conditions"), tags: ["Summer", "summer", "SALE"] };
    const clean = valid(chart);
    expect(clean.name).toBe("Tops");
    expect(clean.rows[0]!.cells).not.toHaveProperty("k_deleted1");
    expect(clean.assignment.tags).toEqual(["summer", "SALE"]);
  });

  it("enforces size limits", () => {
    const chart = blankChart();
    chart.rows = Array.from({ length: 61 }, (_, i) => ({ id: `r_row${i}xx`, cells: { [chart.columns[0]!.id]: `S${i}` } }));
    expect(validateChart(chart).ok).toBe(false);
  });
});

describe("duplicateChart", () => {
  it("copies content with fresh ids and remaps cells and translations", () => {
    const original = chartFromTemplate(getTemplate("womens-tops")!);
    original.translations = { de: { title: "Größen", columns: { [original.columns[1]!.id]: "Brust" } } };
    const copy = duplicateChart(original);
    expect(copy.id).not.toBe(original.id);
    expect(copy.status).toBe("draft");
    expect(copy.name).toBe("Women's tops & dresses (copy)");
    expect(copy.columns.map((c) => c.id)).not.toEqual(original.columns.map((c) => c.id));
    expect(copy.rows[0]!.cells[copy.columns[1]!.id]).toBe("80–84");
    expect(copy.translations.de!.columns![copy.columns[1]!.id]).toBe("Brust");
    expect(validateChart(copy).ok).toBe(true);
  });
});

describe("describeAssignment", () => {
  it("summarises", () => {
    expect(describeAssignment(emptyAssignment("all"))).toBe("All products");
    expect(describeAssignment(emptyAssignment("conditions"))).toBe("Not assigned");
    expect(
      describeAssignment({
        ...emptyAssignment("conditions"),
        collections: [{ id: "gid://shopify/Collection/1", title: "A" }, { id: "gid://shopify/Collection/2", title: "B" }],
        tags: ["x"],
      }),
    ).toBe("2 collections, 1 tag");
  });
});
