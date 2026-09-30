import type { Chart } from "@prisma/client";

import db from "../db.server";
import { duplicateChart, validateChart, type SizeChart } from "../lib/chart";
import { canCreateChart, PLANS, type PlanId } from "../lib/plans";
import { getShop } from "./shop.server";

export interface StoredChart {
  chart: SizeChart;
  position: number;
  updatedAt: Date;
}

function fromRecord(record: Chart): StoredChart | null {
  try {
    const result = validateChart(JSON.parse(record.data));
    if (!result.ok) return null;
    // The row is the source of truth for fields that are also columns.
    return {
      chart: { ...result.chart, id: record.id, name: record.name, status: record.status === "draft" ? "draft" : "active" },
      position: record.position,
      updatedAt: record.updatedAt,
    };
  } catch {
    return null;
  }
}

/** All charts in priority order. */
export async function listCharts(shop: string): Promise<StoredChart[]> {
  const records = await db.chart.findMany({ where: { shop }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  return records.flatMap((record) => {
    const stored = fromRecord(record);
    return stored ? [stored] : [];
  });
}

export async function getChart(shop: string, id: string): Promise<StoredChart | null> {
  const record = await db.chart.findFirst({ where: { shop, id } });
  return record ? fromRecord(record) : null;
}

export async function countCharts(shop: string): Promise<number> {
  return db.chart.count({ where: { shop } });
}

export class PlanLimitError extends Error {
  constructor(readonly plan: PlanId) {
    super(`The ${PLANS[plan].name} plan includes ${PLANS[plan].chartLimit} size chart. Upgrade to add more.`);
    this.name = "PlanLimitError";
  }
}

export class ValidationError extends Error {
  constructor(readonly errors: string[]) {
    super(errors.join("\n"));
    this.name = "ValidationError";
  }
}

/** Creates or updates a chart. New charts go to the end of the list. */
export async function saveChart(shop: string, input: unknown, plan: PlanId): Promise<SizeChart> {
  const result = validateChart(input);
  if (!result.ok) throw new ValidationError(result.errors);
  const chart = result.chart;
  await getShop(shop);

  const existing = await db.chart.findFirst({ where: { shop, id: chart.id } });
  if (existing) {
    await db.chart.update({
      where: { id: chart.id },
      data: { name: chart.name, status: chart.status, data: JSON.stringify(chart) },
    });
    return chart;
  }

  // Ids are client-generated; refuse to take over another shop's chart.
  if (await db.chart.findUnique({ where: { id: chart.id } })) throw new ValidationError(["This chart id is already in use"]);
  const count = await countCharts(shop);
  if (!canCreateChart(plan, count)) throw new PlanLimitError(plan);
  const last = await db.chart.aggregate({ where: { shop }, _max: { position: true } });
  await db.chart.create({
    data: {
      id: chart.id,
      shop,
      name: chart.name,
      status: chart.status,
      position: (last._max.position ?? -1) + 1,
      data: JSON.stringify(chart),
    },
  });
  return chart;
}

export async function duplicate(shop: string, id: string, plan: PlanId): Promise<SizeChart | null> {
  const stored = await getChart(shop, id);
  if (!stored) return null;
  return saveChart(shop, duplicateChart(stored.chart), plan);
}

export async function deleteChart(shop: string, id: string): Promise<boolean> {
  const { count } = await db.chart.deleteMany({ where: { shop, id } });
  return count > 0;
}

export async function setStatus(shop: string, id: string, status: SizeChart["status"]): Promise<boolean> {
  const stored = await getChart(shop, id);
  if (!stored) return false;
  const chart = { ...stored.chart, status };
  await db.chart.update({ where: { id }, data: { status, data: JSON.stringify(chart) } });
  return true;
}

/** Moves a chart one place up or down in the priority list. */
export async function move(shop: string, id: string, direction: "up" | "down"): Promise<boolean> {
  const records = await db.chart.findMany({ where: { shop }, orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const index = records.findIndex((r) => r.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= records.length) return false;
  const order = records.map((r) => r.id);
  [order[index], order[target]] = [order[target]!, order[index]!];
  await db.$transaction(order.map((chartId, position) => db.chart.update({ where: { id: chartId }, data: { position } })));
  return true;
}
