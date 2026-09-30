/**
 * Plans and what each one unlocks.
 *
 * Billing uses Shopify managed pricing: plans are created in the Partner
 * Dashboard with the names below, and Shopify hosts the plan picker. The app
 * only reads the active subscription and gates features on it. Every gate is
 * enforced on the server; the UI only explains them.
 */

export type PlanId = "free" | "pro" | "plus";

export type Feature =
  | "unlimitedCharts"
  | "removeBranding"
  | "customStyle"
  | "csv"
  | "fitFinder"
  | "translations";

export interface Plan {
  id: PlanId;
  /** Must match the plan name in the Partner Dashboard (case-insensitive). */
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  tagline: string;
  chartLimit: number;
  features: readonly Feature[];
  highlights: readonly string[];
}

export const TRIAL_DAYS = 7;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    tagline: "One great size chart for a focused store.",
    chartLimit: 1,
    features: [],
    highlights: [
      "1 size chart on any number of products",
      "10 ready-made templates",
      "cm / inch switch for shoppers",
      "Measuring guide with diagrams",
      "Shopper-facing text in 8 languages",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4.99,
    yearlyPrice: 49.9,
    tagline: "For stores with more than one kind of product.",
    chartLimit: Number.POSITIVE_INFINITY,
    features: ["unlimitedCharts", "removeBranding", "customStyle", "csv"],
    highlights: [
      "Unlimited size charts",
      "Rules by collection, type, vendor, tag or product",
      "Your colours, icon and drawer layout",
      "No Sizemate branding",
      "CSV import and export",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    monthlyPrice: 9.99,
    yearlyPrice: 99.9,
    tagline: "Help shoppers pick the right size and cut returns.",
    chartLimit: Number.POSITIVE_INFINITY,
    features: ["unlimitedCharts", "removeBranding", "customStyle", "csv", "fitFinder", "translations"],
    highlights: [
      "Everything in Pro",
      "Fit Finder: size recommendations from shopper measurements",
      "Translate charts for every store language",
      "Priority support",
    ],
  },
};

export const PLAN_ORDER: readonly PlanId[] = ["free", "pro", "plus"];

export const FEATURE_LABELS: Record<Feature, string> = {
  unlimitedCharts: "Unlimited size charts",
  removeBranding: "Remove Sizemate branding",
  customStyle: "Custom colours, icon and drawer layout",
  csv: "CSV import and export",
  fitFinder: "Fit Finder",
  translations: "Chart translations",
};

export function hasFeature(plan: PlanId, feature: Feature): boolean {
  return PLANS[plan].features.includes(feature);
}

/** The cheapest plan that includes a feature, for "Upgrade to …" prompts. */
export function planFor(feature: Feature): Plan {
  const id = PLAN_ORDER.find((planId) => hasFeature(planId, feature));
  return PLANS[id ?? "plus"];
}

export function canCreateChart(plan: PlanId, existingCharts: number): boolean {
  return existingCharts < PLANS[plan].chartLimit;
}

export interface Subscription {
  name: string;
  status: string;
}

/** Maps Shopify's active subscriptions to a plan; anything unknown is Free. */
export function planFromSubscriptions(subscriptions: readonly Subscription[]): PlanId {
  let best: PlanId = "free";
  for (const subscription of subscriptions) {
    if (subscription.status.toUpperCase() !== "ACTIVE") continue;
    const name = subscription.name.trim().toLowerCase();
    const match = PLAN_ORDER.find((id) => id !== "free" && (name === id || name.startsWith(`${id} `)));
    if (match && PLAN_ORDER.indexOf(match) > PLAN_ORDER.indexOf(best)) best = match;
  }
  return best;
}

export function isPlanId(value: string): value is PlanId {
  return (PLAN_ORDER as readonly string[]).includes(value);
}
