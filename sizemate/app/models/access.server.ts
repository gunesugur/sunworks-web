import type { Shop } from "@prisma/client";

import type { Access } from "../lib/access";
import { whatChanges } from "../lib/downgrade";
import { listCharts } from "./charts.server";
import { settingsOf } from "./shop.server";

/** Everything the plan banners need, ready to send to the page. */
export interface AccessNotice {
  plan: Access["plan"];
  source: Access["source"];
  endsAt: string | null;
  daysLeft: number | null;
  next: Access["next"];
  /** What turns off when `plan` ends, in the merchant's own terms. */
  changes: string[];
  /** Shopify's trial on the active subscription, and its next renewal. */
  trialEndsAt: string | null;
  renewsAt: string | null;
  frozen: boolean;
}

export async function accessNotice(shop: string, access: Access, record: Shop, now = new Date()): Promise<AccessNotice> {
  const ending = access.endsAt !== null && access.next !== access.plan;
  const charts = ending ? (await listCharts(shop)).map((stored) => stored.chart) : [];
  return {
    plan: access.plan,
    source: access.source,
    endsAt: access.endsAt?.toISOString() ?? null,
    daysLeft: access.endsAt ? Math.max(0, Math.ceil((access.endsAt.getTime() - now.getTime()) / 86_400_000)) : null,
    next: access.next,
    changes: ending ? whatChanges(charts, settingsOf(record), access.plan, access.next) : [],
    trialEndsAt: record.trialEndsAt?.toISOString() ?? null,
    renewsAt: record.renewsAt?.toISOString() ?? null,
    frozen: record.frozen,
  };
}
