import { z } from "zod";

import { createId } from "./ids";
import { isMeasureKey, type Diagram, type MeasureKey } from "./measures";
import type { LengthUnit, WeightUnit } from "./units";

export const LIMITS = {
  columns: 12,
  rows: 60,
  cell: 40,
  label: 40,
  name: 80,
  title: 120,
  note: 1000,
  guide: 2000,
  listValues: 100,
  listValue: 255,
  resources: 250,
} as const;

export const COLUMN_KINDS = ["size", "measure", "text"] as const;
export type ColumnKind = (typeof COLUMN_KINDS)[number];

export const DIAGRAMS = ["auto", "torso", "legs", "foot", "head", "hand", "wrist", "ring", "garment", "pants", "pet", "none"] as const;
export type GuideDiagram = "auto" | Diagram;

export interface ChartColumn {
  id: string;
  label: string;
  kind: ColumnKind;
  /** Set when kind is "measure". */
  measure?: MeasureKey;
}

export interface ChartRow {
  id: string;
  cells: Record<string, string>;
}

export interface ResourceRef {
  /** Admin GraphQL id, e.g. gid://shopify/Collection/123. */
  id: string;
  title: string;
}

export interface Assignment {
  /** "all": every product. "conditions": products matching any of the lists below. */
  mode: "all" | "conditions";
  products: ResourceRef[];
  collections: ResourceRef[];
  productTypes: string[];
  vendors: string[];
  tags: string[];
}

export interface ChartTranslation {
  title?: string;
  note?: string;
  guide?: string;
  columns?: Record<string, string>;
}

export interface SizeChart {
  id: string;
  name: string;
  title: string;
  status: "active" | "draft";
  category: string;
  /** Unit of the length columns. */
  unit: LengthUnit;
  /** Unit of the weight columns (kids by weight, pets). */
  weightUnit: WeightUnit;
  columns: ChartColumn[];
  rows: ChartRow[];
  note: string;
  guide: { enabled: boolean; text: string; diagram: GuideDiagram };
  fitFinder: boolean;
  /** How the product fits compared with its size: -2 runs small … 0 true to size … 2 runs large. null hides it. */
  fitScale: number | null;
  /** Optional photo for the split layout (model shot, flat lay). Uploaded to Shopify Files. */
  image: { url: string; alt: string } | null;
  assignment: Assignment;
  translations: Record<string, ChartTranslation>;
}

const trimmed = (max: number) => z.string().trim().max(max);
const idString = z.string().regex(/^[a-z]_[a-z0-9]{4,16}$/);
const gid = z.string().regex(/^gid:\/\/shopify\/(Product|Collection)\/\d+$/);
const resource = z.object({ id: gid, title: trimmed(255) });
const list = z.array(trimmed(LIMITS.listValue).min(1)).max(LIMITS.listValues);

const columnSchema = z
  .object({
    id: idString,
    label: trimmed(LIMITS.label),
    kind: z.enum(COLUMN_KINDS),
    measure: z.string().optional(),
  })
  .transform((column, ctx): ChartColumn => {
    if (column.kind !== "measure") return { id: column.id, label: column.label, kind: column.kind };
    const measure = column.measure ?? "other";
    if (!isMeasureKey(measure)) {
      ctx.addIssue({ code: "custom", message: `Unknown measurement "${measure}"` });
      return z.NEVER;
    }
    return { id: column.id, label: column.label, kind: "measure", measure };
  });

const translationSchema = z.object({
  title: trimmed(LIMITS.title).optional(),
  note: trimmed(LIMITS.note).optional(),
  guide: trimmed(LIMITS.guide).optional(),
  columns: z.record(idString, trimmed(LIMITS.label)).optional(),
});

export const chartSchema = z
  .object({
    id: idString,
    name: trimmed(LIMITS.name).min(1, "Give the chart a name"),
    title: trimmed(LIMITS.title),
    status: z.enum(["active", "draft"]),
    category: trimmed(40),
    unit: z.enum(["cm", "mm", "in"]),
    weightUnit: z.enum(["kg", "lb"]).default("kg"),
    columns: z.array(columnSchema).min(1).max(LIMITS.columns),
    rows: z
      .array(z.object({ id: idString, cells: z.record(z.string(), trimmed(LIMITS.cell)) }))
      .max(LIMITS.rows),
    note: trimmed(LIMITS.note),
    guide: z.object({
      enabled: z.boolean(),
      text: trimmed(LIMITS.guide),
      diagram: z.enum(DIAGRAMS),
    }),
    fitFinder: z.boolean(),
    fitScale: z.number().int().min(-2).max(2).nullable().default(null),
    image: z
      .object({
        url: z.string().url().regex(/^https:\/\/cdn\.shopify\.com\//, "Images must be uploaded to Shopify"),
        alt: trimmed(200),
      })
      .nullable()
      .default(null),
    assignment: z.object({
      mode: z.enum(["all", "conditions"]),
      products: z.array(resource).max(LIMITS.resources),
      collections: z.array(resource).max(LIMITS.resources),
      productTypes: list,
      vendors: list,
      tags: list,
    }),
    translations: z.record(z.string().regex(/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/), translationSchema),
  })
  .superRefine((chart, ctx) => {
    const sizeColumns = chart.columns.filter((c) => c.kind === "size");
    if (sizeColumns.length !== 1 || chart.columns[0]?.kind !== "size") {
      ctx.addIssue({ code: "custom", path: ["columns"], message: "The first column must be the size column" });
    }
    const ids = new Set<string>();
    for (const column of chart.columns) {
      if (ids.has(column.id)) ctx.addIssue({ code: "custom", path: ["columns"], message: "Duplicate column" });
      ids.add(column.id);
    }
    const sizeId = chart.columns[0]?.id;
    chart.rows.forEach((row, index) => {
      if (sizeId && !row.cells[sizeId]) {
        ctx.addIssue({ code: "custom", path: ["rows", index], message: `Row ${index + 1} needs a size name` });
      }
    });
  })
  .transform((chart): SizeChart => {
    const columnIds = new Set(chart.columns.map((c) => c.id));
    // Drop cells that belong to deleted columns so stale data never reaches the storefront.
    const rows = chart.rows.map((row) => ({
      id: row.id,
      cells: Object.fromEntries(Object.entries(row.cells).filter(([key]) => columnIds.has(key))),
    }));
    const dedupe = (values: string[]) => [...new Map(values.map((v) => [v.toLowerCase(), v])).values()];
    return {
      ...chart,
      rows,
      assignment: {
        ...chart.assignment,
        productTypes: dedupe(chart.assignment.productTypes),
        vendors: dedupe(chart.assignment.vendors),
        tags: dedupe(chart.assignment.tags),
      },
    };
  });

export type ChartValidation =
  | { ok: true; chart: SizeChart }
  | { ok: false; errors: string[] };

export function validateChart(input: unknown): ChartValidation {
  const result = chartSchema.safeParse(input);
  if (result.success) return { ok: true, chart: result.data };
  const errors = result.error.issues.map((issue) => issue.message);
  return { ok: false, errors: [...new Set(errors)] };
}

export function createColumn(kind: ColumnKind, label: string, measure?: MeasureKey): ChartColumn {
  const column: ChartColumn = { id: createId("k"), label, kind };
  if (kind === "measure") column.measure = measure ?? "other";
  return column;
}

export function createRow(cells: Record<string, string> = {}): ChartRow {
  return { id: createId("r"), cells };
}

export function emptyAssignment(mode: Assignment["mode"] = "all"): Assignment {
  return { mode, products: [], collections: [], productTypes: [], vendors: [], tags: [] };
}

export function assignmentIsEmpty(assignment: Assignment): boolean {
  return (
    assignment.mode === "conditions" &&
    assignment.products.length === 0 &&
    assignment.collections.length === 0 &&
    assignment.productTypes.length === 0 &&
    assignment.vendors.length === 0 &&
    assignment.tags.length === 0
  );
}

export function blankChart(): SizeChart {
  const size = createColumn("size", "Size");
  const chest = createColumn("measure", "Chest", "chest");
  const waist = createColumn("measure", "Waist", "waist");
  return {
    id: createId("c"),
    name: "Untitled size chart",
    title: "Size chart",
    status: "active",
    category: "custom",
    unit: "cm",
    weightUnit: "kg",
    columns: [size, chest, waist],
    rows: ["S", "M", "L"].map((label) => createRow({ [size.id]: label })),
    note: "",
    guide: { enabled: true, text: "", diagram: "auto" },
    fitFinder: true,
    fitScale: null,
    image: null,
    assignment: emptyAssignment("all"),
    translations: {},
  };
}

/** Deep copy with fresh ids, used for "Duplicate". */
export function duplicateChart(chart: SizeChart): SizeChart {
  const idMap = new Map(chart.columns.map((c) => [c.id, createId("k")]));
  const remap = (record: Record<string, string>) =>
    Object.fromEntries(Object.entries(record).map(([key, value]) => [idMap.get(key) ?? key, value]));
  return {
    ...structuredClone(chart),
    id: createId("c"),
    name: `${chart.name} (copy)`.slice(0, LIMITS.name),
    status: "draft",
    columns: chart.columns.map((c) => ({ ...c, id: idMap.get(c.id)! })),
    rows: chart.rows.map((r) => ({ id: createId("r"), cells: remap(r.cells) })),
    translations: Object.fromEntries(
      Object.entries(chart.translations).map(([locale, t]) => [
        locale,
        { ...t, ...(t.columns ? { columns: remap(t.columns) } : {}) },
      ]),
    ),
  };
}

/** Human summary for lists, e.g. "All products" or "2 collections, 1 tag". */
export function describeAssignment(assignment: Assignment): string {
  if (assignment.mode === "all") return "All products";
  const parts: string[] = [];
  const add = (count: number, one: string, many: string) => {
    if (count) parts.push(`${count} ${count === 1 ? one : many}`);
  };
  add(assignment.products.length, "product", "products");
  add(assignment.collections.length, "collection", "collections");
  add(assignment.productTypes.length, "product type", "product types");
  add(assignment.vendors.length, "vendor", "vendors");
  add(assignment.tags.length, "tag", "tags");
  return parts.length ? parts.join(", ") : "Not assigned";
}
