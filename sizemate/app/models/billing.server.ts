import { bestPlan, computeAccess, readSubscriptions, type Access, type ShopifySubscription } from "../lib/access";
import { isPlanId, type PlanId } from "../lib/plans";
import { gql, type AdminGraphql } from "./graphql.server";
import { factsOf, getShop, planOf, savePlan, setPlan } from "./shop.server";

const SUBSCRIPTIONS_QUERY = `#graphql
  query SizemateSubscriptions {
    currentAppInstallation {
      activeSubscriptions { name status createdAt currentPeriodEnd trialDays test }
    }
  }`;

/** How long a subscription read from Shopify is trusted before checking again. */
export const PLAN_TTL_MS = 60_000;

export async function fetchSubscriptions(admin: AdminGraphql): Promise<ShopifySubscription[]> {
  const data = await gql<{ currentAppInstallation: { activeSubscriptions: ShopifySubscription[] } }>(admin, SUBSCRIPTIONS_QUERY);
  return data.currentAppInstallation.activeSubscriptions;
}

/** Lets a developer try paid plans on a dev store without subscribing. Ignored in production. */
function devOverride(): PlanId | null {
  const override = process.env.SIZEMATE_DEV_PLAN;
  return override && process.env.NODE_ENV !== "production" && isPlanId(override) ? override : null;
}

export interface PlanSync {
  plan: PlanId;
  changed: boolean;
  access: Access;
}

/**
 * Keeps the stored plan in step with Shopify and the calendar. Called on app
 * loads, from the app_subscriptions/update webhook and by the hourly
 * reconcile job, so a missed webhook heals itself and a paid period or the
 * welcome period ends on time even if the merchant never opens the app.
 */
export async function syncPlan(
  shop: string,
  admin: AdminGraphql,
  options: { force?: boolean; now?: Date } = {},
): Promise<PlanSync> {
  const now = options.now ?? new Date();
  const record = await getShop(shop, now);
  const stored = planOf(record);
  const fresh = record.planCheckedAt && now.getTime() - record.planCheckedAt.getTime() < PLAN_TTL_MS;

  if (fresh && !options.force) {
    // Shopify was asked a moment ago, but time still matters: a period may just have ended.
    const access = computeAccess(factsOf(record), now);
    if (access.plan !== stored) await setPlan(shop, access.plan, null);
    return { plan: access.plan, changed: access.plan !== stored, access };
  }

  let subscriptions: ShopifySubscription[];
  try {
    subscriptions = await fetchSubscriptions(admin);
  } catch (error) {
    // Shopify unreachable for a moment: keep going with what we know, and ask again next time.
    console.error(`Couldn't read the subscription for ${shop}`, error);
    const access = computeAccess(factsOf(record), now);
    if (access.plan !== stored) await setPlan(shop, access.plan, null);
    return { plan: access.plan, changed: access.plan !== stored, access };
  }
  const reading = readSubscriptions(subscriptions, now);
  const override = devOverride();
  const subscribed = override ?? reading.subscribed;
  const facts = factsOf(record);
  // Remember the paid period of the active subscription. Keep an earlier one that is still
  // running and was for a higher plan (a downgrade or cancellation leaves the merchant what
  // they paid for), and drop everything when Shopify froze the subscription for non-payment.
  const stillPaid = facts.paidPlan && facts.paidUntil && facts.paidUntil > now ? { plan: facts.paidPlan, until: facts.paidUntil } : null;
  let paid = reading.paid;
  if (stillPaid && (!paid || bestPlan(stillPaid.plan, paid.plan) !== paid.plan)) paid = stillPaid;
  if (reading.frozen) paid = null;
  const access = computeAccess(
    { subscribed, paidPlan: paid?.plan ?? null, paidUntil: paid?.until ?? null, welcomeUntil: record.welcomeUntil, frozen: reading.frozen },
    now,
  );
  await savePlan(shop, {
    plan: access.plan,
    subscribedPlan: subscribed,
    paidPlan: paid?.plan ?? null,
    paidUntil: paid?.until ?? null,
    frozen: reading.frozen,
    trialEndsAt: reading.trialEndsAt,
    renewsAt: reading.renewsAt,
    checkedAt: now,
  });
  return { plan: access.plan, changed: access.plan !== stored, access };
}

export function appHandle(): string {
  return process.env.SHOPIFY_APP_HANDLE || "sizemate";
}

/** Shopify-hosted plan picker used by managed pricing. */
export function pricingPageUrl(shop: string): string {
  const store = shop.replace(/\.myshopify\.com$/, "");
  return `https://admin.shopify.com/store/${encodeURIComponent(store)}/charges/${encodeURIComponent(appHandle())}/pricing_plans`;
}
