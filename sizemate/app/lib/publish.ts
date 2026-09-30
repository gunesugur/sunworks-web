/**
 * Builds what the storefront reads.
 *
 * Charts live in the app database; the theme extension reads a compact copy
 * from app-data metafields on the app installation, so the storefront never
 * calls our server and keeps working even if it is down.
 *
 *   sizemate.config        rules, appearance and plan flags (small)
 *   sizemate.chart_<id>    one per published chart, loaded only when matched
 */

import { resolveDiagram, type SizeChart } from "./chart";
import { getMeasure } from "./measures";
import { hasFeature, PLANS, type PlanId } from "./plans";
import { numericId, type PublishedRule } from "./rules";
import { effectiveSettings, type AppearanceSettings } from "./settings";

export const METAFIELD_NAMESPACE = "sizemate";
export const CONFIG_KEY = "config";
export const CHART_KEY_PREFIX = "chart_";
/** Shopify caps JSON metafields at 128 KB; keep headroom. */
export const MAX_METAFIELD_BYTES = 120_000;

export interface PublishedColumn {
  id: string;
  /** Label */
  l: string;
  /** Kind: size | measure | text */
  k: string;
  /** Measure key, "" for non-measure columns. */
  m: string;
  /** "b" body, "g" garment, "" otherwise. */
  mk: string;
}

export interface PublishedChart {
  id: string;
  t: string;
  u: "cm" | "in";
  cols: PublishedColumn[];
  /** Cells aligned with cols. */
  rows: string[][];
  note: string;
  guide: { on: boolean; text: string; d: string };
  fit: boolean;
  tr: Record<string, { t?: string; note?: string; guide?: string; cols?: string[] }>;
}

export interface PublishedConfig {
  v: 1;
  plan: PlanId;
  rules: PublishedRule[];
  settings: AppearanceSettings;
  /** Show "Powered by Sizemate". */
  brand: boolean;
}

export interface PublishResult {
  config: PublishedConfig;
  charts: Record<string, PublishedChart>;
  /** Active charts left out because of the plan's chart limit. */
  paused: string[];
}

export function chartKey(chartId: string): string {
  return `${CHART_KEY_PREFIX}${chartId.replace(/[^a-z0-9_]/g, "")}`;
}

function toRule(chart: SizeChart): PublishedRule {
  const a = chart.assignment;
  if (a.mode === "all") return { c: chart.id, all: true, p: [], col: [], ty: [], ve: [], tg: [] };
  const lower = (values: string[]) => values.map((v) => v.toLowerCase());
  return {
    c: chart.id,
    all: false,
    p: a.products.map((r) => numericId(r.id)),
    col: a.collections.map((r) => numericId(r.id)),
    ty: lower(a.productTypes),
    ve: lower(a.vendors),
    tg: lower(a.tags),
  };
}

function toPublishedChart(chart: SizeChart, plan: PlanId): PublishedChart {
  const translations: PublishedChart["tr"] = {};
  if (hasFeature(plan, "translations")) {
    for (const [locale, t] of Object.entries(chart.translations)) {
      const entry: PublishedChart["tr"][string] = {};
      if (t.title) entry.t = t.title;
      if (t.note) entry.note = t.note;
      if (t.guide) entry.guide = t.guide;
      if (t.columns && Object.values(t.columns).some(Boolean)) {
        entry.cols = chart.columns.map((c) => t.columns?.[c.id] || c.label);
      }
      if (Object.keys(entry).length) translations[locale.toLowerCase()] = entry;
    }
  }
  return {
    id: chart.id,
    t: chart.title,
    u: chart.unit,
    cols: chart.columns.map((c) => {
      const measure = c.measure ? getMeasure(c.measure) : undefined;
      return {
        id: c.id,
        l: c.label,
        k: c.kind,
        m: c.measure ?? "",
        mk: measure ? (measure.kind === "body" ? "b" : "g") : "",
      };
    }),
    rows: chart.rows.map((row) => chart.columns.map((c) => row.cells[c.id] ?? "")),
    note: chart.note,
    guide: { on: chart.guide.enabled, text: chart.guide.text, d: resolveDiagram(chart) },
    fit: chart.fitFinder && hasFeature(plan, "fitFinder"),
    tr: translations,
  };
}

/**
 * @param charts All of the shop's charts in priority order (highest first).
 */
export function buildPublication(charts: readonly SizeChart[], settings: AppearanceSettings, plan: PlanId): PublishResult {
  const active = charts.filter((chart) => chart.status === "active");
  const limit = PLANS[plan].chartLimit;
  const published = active.slice(0, limit);
  const paused = active.slice(limit).map((chart) => chart.id);
  return {
    config: {
      v: 1,
      plan,
      rules: published.map(toRule),
      settings: effectiveSettings(settings, plan),
      brand: !hasFeature(plan, "removeBranding"),
    },
    charts: Object.fromEntries(published.map((chart) => [chartKey(chart.id), toPublishedChart(chart, plan)])),
    paused,
  };
}

export function byteSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/** Keys that are too large to store, so the save can be refused with a clear message. */
export function oversizedEntries(publication: PublishResult): string[] {
  const entries: [string, unknown][] = [[CONFIG_KEY, publication.config], ...Object.entries(publication.charts)];
  return entries.filter(([, value]) => byteSize(value) > MAX_METAFIELD_BYTES).map(([key]) => key);
}
