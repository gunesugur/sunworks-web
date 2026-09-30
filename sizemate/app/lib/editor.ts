/**
 * Immutable edits on a chart's table, used by the admin editor.
 * Every function returns a new chart and never breaks the invariants that
 * validateChart checks (size column first, limits respected).
 */

import { createColumn, createRow, LIMITS, type ChartColumn, type ColumnKind, type SizeChart } from "./chart";
import { getMeasure, type MeasureKey } from "./measures";
import { convertRange, formatRange, parseMeasurement, type Unit } from "./units";

export function setCell(chart: SizeChart, rowId: string, columnId: string, value: string): SizeChart {
  return {
    ...chart,
    rows: chart.rows.map((row) =>
      row.id === rowId ? { ...row, cells: { ...row.cells, [columnId]: value.slice(0, LIMITS.cell) } } : row,
    ),
  };
}

export function addRow(chart: SizeChart): SizeChart {
  if (chart.rows.length >= LIMITS.rows) return chart;
  return { ...chart, rows: [...chart.rows, createRow()] };
}

export function removeRow(chart: SizeChart, rowId: string): SizeChart {
  return { ...chart, rows: chart.rows.filter((row) => row.id !== rowId) };
}

function move<T>(items: T[], index: number, direction: -1 | 1, min = 0): T[] {
  const target = index + direction;
  if (index < min || target < min || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}

export function moveRow(chart: SizeChart, rowId: string, direction: -1 | 1): SizeChart {
  const rows = move(chart.rows, chart.rows.findIndex((row) => row.id === rowId), direction);
  return rows === chart.rows ? chart : { ...chart, rows };
}

export function addColumn(chart: SizeChart, kind: Exclude<ColumnKind, "size"> = "measure", measure?: MeasureKey): SizeChart {
  if (chart.columns.length >= LIMITS.columns) return chart;
  const label = kind === "measure" ? (getMeasure(measure ?? "other")?.label ?? "Measurement") : "Text";
  return { ...chart, columns: [...chart.columns, createColumn(kind, measure === "other" ? "Measurement" : label, measure)] };
}

export function removeColumn(chart: SizeChart, columnId: string): SizeChart {
  if (chart.columns[0]?.id === columnId) return chart;
  return {
    ...chart,
    columns: chart.columns.filter((c) => c.id !== columnId),
    rows: chart.rows.map((row) => {
      const { [columnId]: _removed, ...cells } = row.cells;
      return { ...row, cells };
    }),
  };
}

export function moveColumn(chart: SizeChart, columnId: string, direction: -1 | 1): SizeChart {
  // min = 1: the size column stays first.
  const columns = move(chart.columns, chart.columns.findIndex((c) => c.id === columnId), direction, 1);
  return columns === chart.columns ? chart : { ...chart, columns };
}

export function renameColumn(chart: SizeChart, columnId: string, label: string): SizeChart {
  return {
    ...chart,
    columns: chart.columns.map((c) => (c.id === columnId ? { ...c, label: label.slice(0, LIMITS.label) } : c)),
  };
}

/**
 * Changes what a column holds: "text" or a measurement key.
 * The label follows the measurement unless the merchant renamed it.
 */
export function setColumnType(chart: SizeChart, columnId: string, type: "text" | MeasureKey): SizeChart {
  return {
    ...chart,
    columns: chart.columns.map((c): ChartColumn => {
      if (c.id !== columnId || c.kind === "size") return c;
      const currentDefault = c.kind === "measure" ? getMeasure(c.measure ?? "other")?.label : "Text";
      const keepLabel = c.label.trim() !== "" && c.label !== currentDefault && c.label !== "Measurement";
      if (type === "text") return { id: c.id, kind: "text", label: keepLabel ? c.label : "Text" };
      const label = keepLabel ? c.label : type === "other" ? "Measurement" : (getMeasure(type)?.label ?? c.label);
      return { id: c.id, kind: "measure", measure: type, label };
    }),
  };
}

/** Switches the chart's unit, optionally converting every measurement cell. */
export function changeUnit(chart: SizeChart, unit: Unit, convert: boolean): SizeChart {
  if (chart.unit === unit) return chart;
  if (!convert) return { ...chart, unit };
  const measureIds = new Set(chart.columns.filter((c) => c.kind === "measure").map((c) => c.id));
  return {
    ...chart,
    unit,
    rows: chart.rows.map((row) => ({
      ...row,
      cells: Object.fromEntries(
        Object.entries(row.cells).map(([key, value]) => {
          const range = measureIds.has(key) ? parseMeasurement(value) : null;
          return [key, range ? formatRange(convertRange(range, chart.unit, unit)) : value];
        }),
      ),
    })),
  };
}

/** Pastes a block of cells (e.g. copied from a spreadsheet) starting at a cell. */
export function pasteGrid(chart: SizeChart, rowIndex: number, columnIndex: number, grid: string[][]): SizeChart {
  let next = chart;
  const neededRows = Math.min(rowIndex + grid.length, LIMITS.rows);
  while (next.rows.length < neededRows) next = addRow(next);
  const rows = next.rows.map((row, r) => {
    const line = grid[r - rowIndex];
    if (r < rowIndex || !line) return row;
    const cells = { ...row.cells };
    line.forEach((value, offset) => {
      const column = next.columns[columnIndex + offset];
      if (column) cells[column.id] = value.trim().slice(0, LIMITS.cell);
    });
    return { ...row, cells };
  });
  return { ...next, rows };
}

/** Splits clipboard text into cells; null when it is a single value. */
export function clipboardGrid(text: string): string[][] | null {
  if (!/[\t\n]/.test(text.trim())) return null;
  return text
    .replace(/\r/g, "")
    .replace(/\n$/, "")
    .split("\n")
    .map((line) => line.split("\t"));
}

export interface CellProblem {
  rowId: string;
  columnId: string;
  column: string;
  size: string;
}

/** Measurement cells that are filled in but not numbers, so they can't convert or feed the Fit Finder. */
export function unreadableCells(chart: SizeChart): CellProblem[] {
  const sizeId = chart.columns[0]?.id ?? "";
  return chart.rows.flatMap((row) =>
    chart.columns
      .filter((c) => c.kind === "measure")
      .filter((c) => (row.cells[c.id] ?? "").trim() !== "" && !parseMeasurement(row.cells[c.id]!))
      .map((c) => ({ rowId: row.id, columnId: c.id, column: c.label, size: row.cells[sizeId] ?? "" })),
  );
}
