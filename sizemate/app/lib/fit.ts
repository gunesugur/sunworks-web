/**
 * Fit Finder: recommends a size from a shopper's body measurements.
 *
 * Pure arithmetic on the chart, no AI and no data leaves the browser. Runs
 * both in the admin preview and on the storefront (bundled into
 * extensions/sizemate-theme/assets/sizemate.js).
 */

import { isBodyMeasure } from "./measure-kinds";
import { convertRange, convertValue, parseMeasurement, type Range, type Unit } from "./units";

export type FitPreference = "snug" | "regular" | "relaxed";

export interface FitColumn {
  id: string;
  kind: string;
  label: string;
  measure?: string;
}

export interface FitChart {
  unit: Unit;
  columns: FitColumn[];
  rows: { id: string; cells: Record<string, string> }[];
}

export type MeasureStatus = "good" | "tight" | "loose";

export interface FitResult {
  rowId: string;
  size: string;
  /** exact: fits every measurement. between: falls between two sizes. above/below: outside the chart. */
  status: "exact" | "between" | "above" | "below";
  /** The other candidate when status is "between". */
  alternative?: { rowId: string; size: string };
  details: { measure: string; label: string; status: MeasureStatus }[];
}

/** Body-measurement columns the Fit Finder can ask for. */
export function fitColumns(chart: FitChart): FitColumn[] {
  const seen = new Set<string>();
  return chart.columns.filter((column) => {
    if (column.kind !== "measure" || !column.measure || !isBodyMeasure(column.measure)) return false;
    if (seen.has(column.measure)) return false;
    seen.add(column.measure);
    // Only worth asking if at least two sizes have a usable value.
    return chart.rows.filter((row) => parseMeasurement(row.cells[column.id] ?? "")).length >= 2;
  });
}

interface Candidate {
  rowId: string;
  size: string;
  ranges: Map<string, Range>;
}

/**
 * Single values ("S: 88, M: 96") describe the middle of a size; the size
 * covers everything up to halfway to its neighbours.
 */
function widenPoints(values: { index: number; range: Range }[]): Map<number, Range> {
  const sorted = [...values].sort((a, b) => a.range.min + a.range.max - (b.range.min + b.range.max));
  const mid = (r: Range) => (r.min + r.max) / 2;
  const result = new Map<number, Range>();
  sorted.forEach((entry, i) => {
    if (entry.range.min !== entry.range.max) {
      result.set(entry.index, entry.range);
      return;
    }
    const prev = sorted[i - 1];
    const next = sorted[i + 1];
    const v = entry.range.min;
    const lowerGap = prev ? v - prev.range.max : next ? mid(next.range) - v : 0;
    const upperGap = next ? next.range.min - v : prev ? v - mid(prev.range) : 0;
    result.set(entry.index, { min: v - lowerGap / 2, max: v + upperGap / 2 });
  });
  return result;
}

function buildCandidates(chart: FitChart, columns: FitColumn[]): Candidate[] {
  const sizeColumn = chart.columns.find((c) => c.kind === "size") ?? chart.columns[0];
  const candidates: Candidate[] = chart.rows.map((row) => ({
    rowId: row.id,
    size: sizeColumn ? (row.cells[sizeColumn.id] ?? "") : "",
    ranges: new Map(),
  }));
  for (const column of columns) {
    const parsed = chart.rows.flatMap((row, index) => {
      const range = parseMeasurement(row.cells[column.id] ?? "");
      return range ? [{ index, range: convertRange(range, chart.unit, "cm") }] : [];
    });
    for (const [index, range] of widenPoints(parsed)) {
      candidates[index]!.ranges.set(column.measure!, range);
    }
  }
  return candidates;
}

function statusFor(value: number, range: Range): MeasureStatus {
  if (value > range.max) return "tight";
  if (value < range.min) return "loose";
  return "good";
}

/** How far from the centre of its range a value sits: 0 = centre, 1 = edge. */
function offCentre(value: number, range: Range): number {
  const half = (range.max - range.min) / 2;
  if (half === 0) return 0;
  return Math.abs(value - (range.min + range.max) / 2) / half;
}

export function recommendSize(
  chart: FitChart,
  measurements: Record<string, number>,
  inputUnit: Unit,
  preference: FitPreference = "regular",
): FitResult | null {
  const columns = fitColumns(chart).filter((c) => {
    const value = measurements[c.measure!];
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  });
  if (!columns.length) return null;

  const body = new Map(columns.map((c) => [c.measure!, convertValue(measurements[c.measure!]!, inputUnit, "cm")]));
  const labels = new Map(columns.map((c) => [c.measure!, c.label]));

  // A size is only comparable if it has a value for every measurement given.
  const candidates = buildCandidates(chart, columns)
    .filter((c) => c.size && columns.every((col) => c.ranges.has(col.measure!)))
    .sort((a, b) => {
      const total = (c: Candidate) => [...c.ranges.values()].reduce((sum, r) => sum + r.min + r.max, 0);
      return total(a) - total(b);
    });
  if (!candidates.length) return null;

  const evaluate = (candidate: Candidate) =>
    [...body].map(([measure, value]) => ({
      measure,
      label: labels.get(measure) ?? measure,
      status: statusFor(value, candidate.ranges.get(measure)!),
    }));
  const result = (candidate: Candidate, status: FitResult["status"], alternative?: Candidate): FitResult => ({
    rowId: candidate.rowId,
    size: candidate.size,
    status,
    ...(alternative ? { alternative: { rowId: alternative.rowId, size: alternative.size } } : {}),
    details: evaluate(candidate),
  });

  const fitting = candidates.filter((c) => evaluate(c).every((d) => d.status === "good"));
  if (fitting.length) {
    if (preference === "snug") return result(fitting[0]!, "exact");
    if (preference === "relaxed") {
      const largest = fitting[fitting.length - 1]!;
      const next = candidates[candidates.indexOf(largest) + 1];
      // Near the top of the range, a relaxed fit means going up a size.
      const nearTop = [...body].some(([measure, value]) => {
        const range = largest.ranges.get(measure)!;
        return range.max > range.min && (value - range.min) / (range.max - range.min) >= 0.75;
      });
      return nearTop && next ? result(next, "exact") : result(largest, "exact");
    }
    const score = (c: Candidate) => Math.max(...[...body].map(([measure, value]) => offCentre(value, c.ranges.get(measure)!)));
    const best = fitting.reduce((a, b) => (score(b) < score(a) ? b : a));
    return result(best, "exact");
  }

  // No size fits every measurement: pick the smallest one that is not tight anywhere.
  const roomy = candidates.findIndex((c) => evaluate(c).every((d) => d.status !== "tight"));
  if (roomy === -1) return result(candidates[candidates.length - 1]!, "above");
  if (roomy === 0) {
    const smallest = candidates[0]!;
    const allLoose = evaluate(smallest).every((d) => d.status === "loose");
    return result(smallest, allLoose ? "below" : "between");
  }
  const chosen = candidates[roomy]!;
  const smaller = candidates[roomy - 1]!;
  if (preference === "snug") return result(smaller, "between", chosen);
  return result(chosen, "between", smaller);
}
