/**
 * Insights (Plus): anonymous daily counts of chart views and Fit Finder
 * results, and what they suggest about a chart. No shopper data is stored:
 * the storefront sends only the chart, the recommended size and whether the
 * shopper's measurements fell outside the chart.
 */

export type InsightEvent =
  | { type: "open"; chartId: string }
  | { type: "fit"; chartId: string; size: string; status: "exact" | "between" | "above" | "below" };

const CHART_ID = /^c_[a-z0-9]{4,16}$/;
const STATUSES = new Set(["exact", "between", "above", "below"]);

/** Validates what the storefront sent; anything unexpected is ignored. */
export function parseEvent(body: string): InsightEvent | null {
  if (body.length > 500) return null;
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const { e, c, s, st } = data as Record<string, unknown>;
  if (typeof c !== "string" || !CHART_ID.test(c)) return null;
  if (e === "open") return { type: "open", chartId: c };
  if (e === "fit" && typeof s === "string" && s.trim() && s.length <= 40 && typeof st === "string" && STATUSES.has(st)) {
    return { type: "fit", chartId: c, size: s.trim(), status: st as "exact" | "between" | "above" | "below" };
  }
  return null;
}

export function dayOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface DayRow {
  chartId: string;
  day: string;
  opens: number;
  fits: number;
  above: number;
  below: number;
  sizes: string;
}

export interface ChartInsight {
  chartId: string;
  opens: number;
  fits: number;
  above: number;
  below: number;
  /** Recommended sizes, most frequent first. */
  sizes: { size: string; count: number }[];
  /** Plain-language hints for the merchant. */
  hints: string[];
}

/** Share of results outside the chart that is worth a hint. */
const OUTSIDE_HINT = 0.15;
/** Minimum Fit Finder uses before hints mean anything. */
const MIN_FOR_HINTS = 20;

export function summarize(rows: readonly DayRow[]): { totals: { opens: number; fits: number }; charts: ChartInsight[] } {
  const byChart = new Map<string, ChartInsight & { sizeMap: Map<string, number> }>();
  for (const row of rows) {
    let entry = byChart.get(row.chartId);
    if (!entry) {
      entry = { chartId: row.chartId, opens: 0, fits: 0, above: 0, below: 0, sizes: [], hints: [], sizeMap: new Map() };
      byChart.set(row.chartId, entry);
    }
    entry.opens += row.opens;
    entry.fits += row.fits;
    entry.above += row.above;
    entry.below += row.below;
    let sizes: Record<string, number> = {};
    try {
      sizes = JSON.parse(row.sizes) as Record<string, number>;
    } catch {
      // ignore a damaged row
    }
    for (const [size, count] of Object.entries(sizes)) {
      if (typeof count === "number") entry.sizeMap.set(size, (entry.sizeMap.get(size) ?? 0) + count);
    }
  }
  const charts = [...byChart.values()].map(({ sizeMap, ...entry }) => {
    const sizes = [...sizeMap.entries()].map(([size, count]) => ({ size, count })).sort((a, b) => b.count - a.count);
    const hints: string[] = [];
    if (entry.fits >= MIN_FOR_HINTS) {
      const above = entry.above / entry.fits;
      const below = entry.below / entry.fits;
      if (above >= OUTSIDE_HINT) {
        hints.push(`${Math.round(above * 100)}% of shoppers measured above your largest size. A bigger size could win sales.`);
      }
      if (below >= OUTSIDE_HINT) {
        hints.push(`${Math.round(below * 100)}% of shoppers measured below your smallest size. Consider a smaller size.`);
      }
    }
    if (entry.opens >= 50 && entry.fits / entry.opens < 0.05) {
      hints.push("Few shoppers use the Fit Finder on this chart. Make sure it's switched on and the tab is visible.");
    }
    return { ...entry, sizes, hints };
  });
  charts.sort((a, b) => b.opens - a.opens);
  return {
    totals: { opens: charts.reduce((sum, c) => sum + c.opens, 0), fits: charts.reduce((sum, c) => sum + c.fits, 0) },
    charts,
  };
}
