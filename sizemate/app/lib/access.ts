/**
 * Which plan a shop can use right now, and why.
 *
 * Shopify reports the subscription as it stands: a cancelled or downgraded
 * subscription leaves activeSubscriptions at once, even though the merchant has
 * paid until the end of the billing period. So the app keeps three facts and
 * combines them here:
 *
 * - subscription: the plan Shopify says is active (Free when there is none);
 * - paid period:  the last paid plan and the end of the period it was paid for
 *                 (a cancellation keeps that plan until then);
 * - welcome:      new installs get every Plus feature for WELCOME_DAYS
 *                 (a "reverse trial": try everything, then choose).
 *
 * The best of the three wins. Nothing here talks to Shopify, so it is easy to
 * test every timeline.
 */

import { PLAN_ORDER, PLANS, type PlanId } from "./plans";

export interface ShopifySubscription {
  name: string;
  status: string;
  createdAt?: string | null;
  currentPeriodEnd?: string | null;
  trialDays?: number | null;
  test?: boolean | null;
}

export interface AccessFacts {
  /** The plan of the active subscription (Free when there is none). */
  subscribed: PlanId;
  /** The last paid plan and when its paid period ends. */
  paidPlan: PlanId | null;
  paidUntil: Date | null;
  /** End of the welcome period for new installs (null for shops installed before it existed). */
  welcomeUntil: Date | null;
  /** Shopify froze a subscription for non-payment: no grace, the merchant hasn't paid. */
  frozen?: boolean;
}

export type AccessSource = "subscription" | "paid-period" | "welcome" | "free";

export interface Access {
  /** The plan whose features are on. */
  plan: PlanId;
  source: AccessSource;
  /** When `plan` stops applying (end of the paid period or the welcome), if it will. */
  endsAt: Date | null;
  /** What the shop falls back to after endsAt. */
  next: PlanId;
}

const rank = (plan: PlanId) => PLAN_ORDER.indexOf(plan);

export function bestPlan(...plans: PlanId[]): PlanId {
  return plans.reduce((best, plan) => (rank(plan) > rank(best) ? plan : best), "free" as PlanId);
}

export function computeAccess(facts: AccessFacts, now: Date): Access {
  const candidates: { plan: PlanId; source: AccessSource; endsAt: Date | null }[] = [
    { plan: facts.subscribed, source: facts.subscribed === "free" ? "free" : "subscription", endsAt: null },
  ];
  if (facts.paidPlan && facts.paidUntil && facts.paidUntil > now && !facts.frozen) {
    candidates.push({ plan: facts.paidPlan, source: "paid-period", endsAt: facts.paidUntil });
  }
  if (facts.welcomeUntil && facts.welcomeUntil > now) {
    candidates.push({ plan: "plus", source: "welcome", endsAt: facts.welcomeUntil });
  }
  // Highest plan first; on a tie, the subscription (which doesn't end) wins.
  candidates.sort((a, b) => rank(b.plan) - rank(a.plan) || (a.endsAt ? 1 : 0) - (b.endsAt ? 1 : 0));
  const winner = candidates[0]!;
  const remaining = candidates.filter((c) => c !== winner && (!c.endsAt || !winner.endsAt || c.endsAt > winner.endsAt));
  const next = winner.endsAt ? bestPlan(facts.subscribed, ...remaining.map((c) => c.plan)) : winner.plan;
  return { plan: winner.plan, source: winner.source, endsAt: winner.endsAt, next };
}

/** Matches a subscription name to a plan ("Pro", "pro", "Plus (yearly)"). */
export function planFromName(name: string): PlanId | null {
  const value = name.trim().toLowerCase();
  return PLAN_ORDER.find((id) => id !== "free" && (value === id || value.startsWith(`${id} `))) ?? null;
}

/** True while a subscription is still inside Shopify's free trial (nothing paid yet). */
export function inShopifyTrial(subscription: ShopifySubscription, now: Date): boolean {
  if (!subscription.trialDays || !subscription.createdAt) return false;
  const trialEnd = new Date(subscription.createdAt).getTime() + subscription.trialDays * 86_400_000;
  return trialEnd > now.getTime();
}

export interface SubscriptionReading {
  subscribed: PlanId;
  frozen: boolean;
  /** Set when an active paid subscription is past its trial: the paid period to remember. */
  paid: { plan: PlanId; until: Date } | null;
  /** End of Shopify's trial when the active subscription is in one. */
  trialEndsAt: Date | null;
  /** When the active subscription renews (end of the current period). */
  renewsAt: Date | null;
}

/** Reads Shopify's active subscriptions. Only ACTIVE ones count; FROZEN ones mean unpaid. */
export function readSubscriptions(subscriptions: readonly ShopifySubscription[], now: Date): SubscriptionReading {
  let best: ShopifySubscription | null = null;
  let bestPlanId: PlanId = "free";
  let frozen = false;
  for (const subscription of subscriptions) {
    const status = subscription.status.toUpperCase();
    if (status === "FROZEN") frozen = true;
    if (status !== "ACTIVE") continue;
    const plan = planFromName(subscription.name);
    if (plan && rank(plan) > rank(bestPlanId)) {
      best = subscription;
      bestPlanId = plan;
    }
  }
  if (!best) return { subscribed: "free", frozen, paid: null, trialEndsAt: null, renewsAt: null };
  const trial = inShopifyTrial(best, now);
  const periodEnd = best.currentPeriodEnd ? new Date(best.currentPeriodEnd) : null;
  const validEnd = periodEnd && !Number.isNaN(periodEnd.getTime()) ? periodEnd : null;
  return {
    subscribed: bestPlanId,
    frozen,
    paid: !trial && validEnd ? { plan: bestPlanId, until: validEnd } : null,
    trialEndsAt: trial ? new Date(new Date(best.createdAt!).getTime() + best.trialDays! * 86_400_000) : null,
    renewsAt: validEnd,
  };
}

/** Plain-language summary for banners, e.g. what turns off when access ends. */
export function planName(plan: PlanId): string {
  return PLANS[plan].name;
}
