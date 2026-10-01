import db from "../db.server";
import { dayOf, summarize, type InsightEvent } from "../lib/insights";

export async function recordEvent(shop: string, event: InsightEvent, now = new Date()): Promise<void> {
  const key = { shop, chartId: event.chartId, day: dayOf(now) };
  if (event.type === "open") {
    await db.insightDay.upsert({ where: { shop_chartId_day: key }, create: { ...key, opens: 1 }, update: { opens: { increment: 1 } } });
    return;
  }
  // Size counts live in a JSON column; a transaction keeps concurrent updates from losing counts.
  await db.$transaction(async (tx) => {
    const row = await tx.insightDay.findUnique({ where: { shop_chartId_day: key } });
    const sizes = row ? (JSON.parse(row.sizes) as Record<string, number>) : {};
    if (!(event.size in sizes) && Object.keys(sizes).length >= 60) return;
    sizes[event.size] = (sizes[event.size] ?? 0) + 1;
    const outside = { above: event.status === "above" ? 1 : 0, below: event.status === "below" ? 1 : 0 };
    await tx.insightDay.upsert({
      where: { shop_chartId_day: key },
      create: { ...key, fits: 1, ...outside, sizes: JSON.stringify(sizes) },
      update: {
        fits: { increment: 1 },
        above: { increment: outside.above },
        below: { increment: outside.below },
        sizes: JSON.stringify(sizes),
      },
    });
  });
}

export async function loadInsights(shop: string, days = 30, now = new Date()) {
  const since = dayOf(new Date(now.getTime() - (days - 1) * 86_400_000));
  const rows = await db.insightDay.findMany({ where: { shop, day: { gte: since } } });
  return summarize(rows);
}
