/**
 * Hourly check of every shop that has, or recently had, paid features on.
 *
 * Plans change in Shopify's admin (managed pricing), and a paid period or the
 * welcome period can end while nobody has the app open. Without this job, a
 * store whose merchant cancelled and never came back would keep paid features
 * on its storefront. The job asks Shopify for the subscription, recomputes
 * the plan and republishes the storefront when it changed.
 */
import db from "../db.server";
import { syncPlan } from "./billing.server";
import type { AdminGraphql } from "./graphql.server";
import { publish } from "./publisher.server";

export const RECONCILE_INTERVAL_MS = 60 * 60 * 1000;

export interface ReconcileResult {
  checked: number;
  changed: string[];
  failed: string[];
}

/**
 * @param adminFor Returns an Admin API client for a shop (its offline session), or null when the app is uninstalled.
 */
export async function reconcileShops(
  adminFor: (shop: string) => Promise<AdminGraphql | null>,
  now = new Date(),
): Promise<ReconcileResult> {
  const shops = await db.shop.findMany({
    where: {
      OR: [
        { plan: { not: "free" } },
        { subscribedPlan: { not: "free" } },
        { paidUntil: { not: null } },
        { welcomeUntil: { gt: new Date(now.getTime() - 86_400_000) } },
        // A publish that failed (e.g. right after a plan change) is retried.
        { publishError: { not: null } },
      ],
    },
    select: { shop: true, publishError: true },
  });
  const result: ReconcileResult = { checked: 0, changed: [], failed: [] };
  for (const { shop, publishError } of shops) {
    try {
      const admin = await adminFor(shop);
      if (!admin) continue;
      result.checked++;
      const { changed } = await syncPlan(shop, admin, { force: true, now });
      if (changed || publishError) {
        await publish(shop, admin);
        if (changed) result.changed.push(shop);
      }
    } catch (error) {
      result.failed.push(shop);
      console.error(`Plan check failed for ${shop}`, error);
    }
  }
  return result;
}

declare global {
  var sizemateReconcileTimer: ReturnType<typeof setInterval> | undefined;
}

/** Starts the hourly job once per server process (production only, unless turned off). */
export function startReconcileJob(adminFor: (shop: string) => Promise<AdminGraphql | null>): void {
  if (process.env.NODE_ENV !== "production" || process.env.SIZEMATE_RECONCILE === "off" || global.sizemateReconcileTimer) return;
  const run = () => {
    reconcileShops(adminFor).catch((error: unknown) => console.error("Plan reconcile failed", error));
  };
  global.sizemateReconcileTimer = setInterval(run, RECONCILE_INTERVAL_MS);
  global.sizemateReconcileTimer.unref?.();
  setTimeout(run, 60_000).unref?.();
}
