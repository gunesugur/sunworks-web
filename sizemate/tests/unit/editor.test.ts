import { describe, expect, it } from "vitest";

import { LIMITS, validateChart } from "~/lib/chart";
import {
  addColumn,
  addRow,
  changeUnit,
  changeWeightUnit,
  clipboardGrid,
  hasWeightColumns,
  moveColumn,
  moveRow,
  pasteGrid,
  removeColumn,
  removeRow,
  renameColumn,
  setCell,
  setColumnType,
  unreadableCells,
} from "~/lib/editor";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

const base = () => chartFromTemplate(getTemplate("womens-tops")!);

describe("table edits", () => {
  it("sets cells without touching other rows", () => {
    const chart = base();
    const next = setCell(chart, chart.rows[0]!.id, chart.columns[1]!.id, "81–85");
    expect(next.rows[0]!.cells[chart.columns[1]!.id]).toBe("81–85");
    expect(next.rows[1]).toBe(chart.rows[1]);
    expect(chart.rows[0]!.cells[chart.columns[1]!.id]).toBe("80–84");
  });

  it("adds, moves and removes rows", () => {
    let chart = addRow(base());
    expect(chart.rows).toHaveLength(7);
    const last = chart.rows[6]!.id;
    chart = moveRow(chart, last, -1);
    expect(chart.rows[5]!.id).toBe(last);
    expect(moveRow(chart, chart.rows[0]!.id, -1)).toBe(chart);
    expect(removeRow(chart, last).rows).toHaveLength(6);
  });

  it("respects the row and column limits", () => {
    let chart = base();
    for (let i = 0; i < 100; i++) chart = addRow(chart);
    expect(chart.rows).toHaveLength(LIMITS.rows);
    for (let i = 0; i < 20; i++) chart = addColumn(chart);
    expect(chart.columns).toHaveLength(LIMITS.columns);
  });

  it("never removes or moves the size column", () => {
    const chart = base();
    expect(removeColumn(chart, chart.columns[0]!.id)).toBe(chart);
    expect(moveColumn(chart, chart.columns[0]!.id, 1)).toBe(chart);
    expect(moveColumn(chart, chart.columns[1]!.id, -1)).toBe(chart);
    expect(moveColumn(chart, chart.columns[1]!.id, 1).columns[2]!.id).toBe(chart.columns[1]!.id);
  });

  it("removes a column and its cells", () => {
    const chart = base();
    const id = chart.columns[2]!.id;
    const next = removeColumn(chart, id);
    expect(next.columns.map((c) => c.id)).not.toContain(id);
    expect(next.rows.every((r) => !(id in r.cells))).toBe(true);
  });

  it("labels new and retyped columns after the measurement unless renamed", () => {
    let chart = addColumn(base(), "measure", "inseam");
    const added = chart.columns.at(-1)!;
    expect(added).toMatchObject({ label: "Inseam", kind: "measure", measure: "inseam" });
    chart = setColumnType(chart, added.id, "thigh");
    expect(chart.columns.at(-1)).toMatchObject({ label: "Thigh", measure: "thigh" });
    chart = renameColumn(chart, added.id, "Leg");
    chart = setColumnType(chart, added.id, "hips");
    expect(chart.columns.at(-1)).toMatchObject({ label: "Leg", measure: "hips" });
    chart = setColumnType(chart, added.id, "text");
    expect(chart.columns.at(-1)).toEqual({ id: added.id, label: "Leg", kind: "text" });
    expect(validateChart(chart).ok).toBe(true);
  });

  it("converts measurement cells when changing unit, and only those", () => {
    const shoes = chartFromTemplate(getTemplate("womens-shoes")!);
    const inches = changeUnit(shoes, "in", true);
    expect(inches.unit).toBe("in");
    expect(inches.rows[0]!.cells[shoes.columns[3]!.id]).toBe("8.7");
    expect(inches.rows[0]!.cells[shoes.columns[1]!.id]).toBe("5");
    const relabelled = changeUnit(shoes, "in", false);
    expect(relabelled.rows[0]!.cells[shoes.columns[3]!.id]).toBe("22");
  });

  it("pastes a spreadsheet block and grows the table", () => {
    const chart = base();
    const grid = clipboardGrid("XL\t98\t80\t104\nXXL\t104\t86\t110\n3XL\t110\t92\t116\n")!;
    const next = pasteGrid(chart, 4, 0, grid);
    expect(next.rows).toHaveLength(7);
    expect(Object.values(next.rows[6]!.cells)).toEqual(["3XL", "110", "92", "116"]);
    expect(clipboardGrid("just one value")).toBeNull();
  });

  it("ignores pasted cells beyond the last column", () => {
    const chart = base();
    const next = pasteGrid(chart, 0, 3, [["1", "2", "3"]]);
    expect(next.rows[0]!.cells[chart.columns[3]!.id]).toBe("1");
    expect(Object.keys(next.rows[0]!.cells)).toHaveLength(4);
  });

  it("finds measurement cells that are not numbers", () => {
    let chart = base();
    chart = setCell(chart, chart.rows[1]!.id, chart.columns[2]!.id, "about 70");
    expect(unreadableCells(chart)).toEqual([
      { rowId: chart.rows[1]!.id, columnId: chart.columns[2]!.id, column: "Waist", size: "S" },
    ]);
  });
});

describe("weight columns", () => {
  it("switches the weight unit without touching lengths", () => {
    const kids = chartFromTemplate(getTemplate("kids-height-weight")!);
    expect(hasWeightColumns(kids)).toBe(true);
    const pounds = changeWeightUnit(kids, "lb", true);
    const height = kids.columns.find((c) => c.measure === "height")!.id;
    const weight = kids.columns.find((c) => c.measure === "weight")!.id;
    expect(pounds.weightUnit).toBe("lb");
    expect(pounds.rows[0]!.cells[weight]).toBe("30.9–35.3");
    expect(pounds.rows[0]!.cells[height]).toBe(kids.rows[0]!.cells[height]);
    const inches = changeUnit(kids, "in", true);
    expect(inches.rows[0]!.cells[weight]).toBe(kids.rows[0]!.cells[weight]);
    expect(inches.rows[0]!.cells[height]).toBe("36.6–38.6");
    expect(changeWeightUnit(kids, "lb", false).rows).toBe(kids.rows);
  });

  it("formats millimetres without decimals", () => {
    const shoes = chartFromTemplate(getTemplate("womens-shoes")!);
    const mm = changeUnit(shoes, "mm", true);
    const foot = shoes.columns.find((c) => c.measure === "foot_length")!.id;
    expect(mm.rows[0]!.cells[foot]).toMatch(/^\d+(–\d+)?$/);
    expect(hasWeightColumns(shoes)).toBe(false);
  });
});
