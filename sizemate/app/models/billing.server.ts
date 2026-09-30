import { isPlanId, planFromSubscriptions, type PlanId, type Subscription } from "../lib/plans";
import { gql, type AdminGraphql } from "./graphql.server";
import { getShop, planOf, setPlan } from "./shop.server";

const SUBSCRIPTIONS_QUERY = `#graphql
  query SizemateSubscriptions {
    currentAppInstallation {
      activeSubscriptions { name status }
    }
  }`;

/** How long a plan read from Shopify is trusted before checking again. */
const PLAN_TTL_MS = 60_000;

export async function fetchPlan(admin: AdminGraphql): Promise<PlanId> {
  // Lets a developer try paid features on a dev store without subscribing.
  const override = process.env.SIZEMATE_DEV_PLAN;
  if (override && process.env.NODE_ENV !== "production" && isPlanId(override)) return override;
  const data = await gql<{ currentAppInstallation: { activeSubscriptions: Subscription[] } }>(admin, SUBSCRIPTIONS_QUERY);
  return planFromSubscriptions(data.currentAppInstallation.activeSubscriptions);
}

/**
 * Keeps the stored plan in step with Shopify. Called on app loads and from the
 * app_subscriptions/update webhook, so a missed webhook heals itself.
 */
export async function syncPlan(
  shop: string,
  admin: AdminGraphql,
  options: { force?: boolean } = {},
): Promise<{ plan: PlanId; changed: boolean }> {
  const record = await getShop(shop);
  const stored = planOf(record);
  const fresh = record.planCheckedAt && Date.now() - record.planCheckedAt.getTime() < PLAN_TTL_MS;
  if (fresh && !options.force) return { plan: stored, changed: false };
  const plan = await fetchPlan(admin);
  await setPlan(shop, plan);
  return { plan, changed: plan !== stored };
}

export function appHandle(): string {
  return process.env.SHOPIFY_APP_HANDLE || "sizemate";
}

/** Shopify-hosted plan picker used by managed pricing. */
export function pricingPageUrl(shop: string): string {
  const store = shop.replace(/\.myshopify\.com$/, "");
  return `https://admin.shopify.com/store/${encodeURIComponent(store)}/charges/${encodeURIComponent(appHandle())}/pricing_plans`;
}
