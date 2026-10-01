import { describe, expect, it } from "vitest";

import { chartToCsv, importCsv, parseCsv } from "~/lib/csv";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes, CRLF and BOM", () => {
    expect(parseCsv('﻿Size,"Note, long"\r\nS,"He said ""hi"""\r\n')).toEqual([
      ["Size", "Note, long"],
      ["S", 'He said "hi"'],
    ]);
  });

  it("detects semicolons and tabs", () => {
    expect(parseCsv("Size;Chest\nS;86,5")).toEqual([["Size", "Chest"], ["S", "86,5"]]);
    expect(parseCsv("Size\tChest\nS\t86")).toEqual([["Size", "Chest"], ["S", "86"]]);
  });

  it("skips blank lines", () => {
    expect(parseCsv("a,b\n\n,\nc,d\n")).toEqual([["a", "b"], ["c", "d"]]);
  });
});

describe("importCsv", () => {
  it("infers column kinds, measurements and unit", () => {
    const result = importCsv("Size,Chest (in),Waist (in),US\nS,34-36,28-30,4\nM,37-39,31-33,6\n");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.unit).toBe("in");
    expect(result.columns.map((c) => [c.label, c.kind, c.measure])).toEqual([
      ["Size", "size", undefined],
      ["Chest", "measure", "chest"],
      ["Waist", "measure", "waist"],
      ["US", "measure", "other"],
    ]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[1]!.cells[result.columns[1]!.id]).toBe("37-39");
  });

  it("treats mostly-text columns as text", () => {
    const result = importCsv("EU;UK;Fit\n38;5;Regular\n39;6;Regular\n");
    expect(result.ok && result.columns.map((c) => c.kind)).toEqual(["size", "measure", "text"]);
  });

  it("recognises common non-English headers", () => {
    const result = importCsv("Größe;Brust;Hüfte;Fußlänge\nS;86;90;24\nM;90;94;25\n");
    expect(result.ok && result.columns.map((c) => c.measure)).toEqual([undefined, "bust", "hips", "foot_length"]);
  });

  it("rejects files without sizes", () => {
    expect(importCsv("Size,Chest\n")).toMatchObject({ ok: false });
    expect(importCsv("Size,Chest\n,86\n")).toMatchObject({ ok: false });
  });

  it("truncates oversized files with a warning", () => {
    const header = Array.from({ length: 15 }, (_, i) => `C${i}`).join(",");
    const result = importCsv(`${header}\nS${",1".repeat(14)}\n`);
    expect(result.ok && result.columns).toHaveLength(12);
    expect(result.ok && result.warnings[0]).toMatch(/first 12 columns/);
  });
});

describe("chartToCsv", () => {
  it("round-trips a template", () => {
    const chart = chartFromTemplate(getTemplate("womens-tops")!);
    const csv = chartToCsv(chart);
    expect(csv.split("\r\n")[0]).toBe("Size,Bust (cm),Waist (cm),Hips (cm)");
    const back = importCsv(csv);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.unit).toBe("cm");
    expect(back.columns.map((c) => c.measure)).toEqual([undefined, "bust", "waist", "hips"]);
    expect(back.rows.map((r) => Object.values(r.cells))).toEqual(chart.rows.map((r) => chart.columns.map((c) => r.cells[c.id])));
  });

  it("neutralises spreadsheet formulas", () => {
    const chart = chartFromTemplate(getTemplate("blank")!);
    chart.rows[0]!.cells[chart.columns[0]!.id] = "=HYPERLINK(\"x\")";
    expect(chartToCsv(chart)).toContain(`"'=HYPERLINK(""x"")"`);
  });
});

describe("CSV with millimetres and weights", () => {
  it("reads mm, kg and lb from the headers", () => {
    const result = importCsv("Size,Inside diameter (mm),Weight (kg)\nS,16,10-12\nM,17,12-14\n");
    if (!result.ok) throw new Error(result.error);
    expect(result.unit).toBe("mm");
    expect(result.weightUnit).toBe("kg");
    expect(result.columns.map((c) => c.measure)).toEqual([undefined, "ring_diameter", "weight"]);
    const pounds = importCsv("Size,Height (in),Weight (lbs)\n2T,33-35,28-30\n3T,35-38,31-33\n");
    if (!pounds.ok) throw new Error(pounds.error);
    expect(pounds.unit).toBe("in");
    expect(pounds.weightUnit).toBe("lb");
  });

  it("exports weight columns in the weight unit", () => {
    const csv = chartToCsv(chartFromTemplate(getTemplate("kids-height-weight")!));
    expect(csv.split("\r\n")[0]).toBe("EU size,Age,Height (cm),Weight (kg)");
  });
});
