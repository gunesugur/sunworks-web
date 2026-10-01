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
  | "allTemplates"
  | "removeBranding"
  | "customStyle"
  | "chartImage"
  | "fitScale"
  | "csv"
  | "fitFinder"
  | "sizeMemory"
  | "translations"
  | "insights";

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

/** Shopify's free trial on paid plans (set in the Partner Dashboard). */
export const TRIAL_DAYS = 7;
/** New installs get every Plus feature for this long, no card needed (a "reverse trial"). */
export const WELCOME_DAYS = 14;

const PRO_FEATURES: readonly Feature[] = [
  "unlimitedCharts",
  "allTemplates",
  "removeBranding",
  "customStyle",
  "chartImage",
  "fitScale",
  "csv",
  "fitFinder",
];

/*
 * How the plans are cut:
 * - Free is a complete, good-looking size chart (it earns installs and reviews)
 *   but stops where a store grows: a third chart, more templates, its own look,
 *   and the Fit Finder, the feature that pays for itself in fewer returns.
 * - Pro is the plan most stores need: everything to sell more and return less.
 * - Plus is for stores with traffic and more than one market: features that
 *   pay off with scale (size memory for returning shoppers, insights,
 *   translations) and hands-on help.
 * Readability (accessibility, units, dark mode) is never paywalled.
 */
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    tagline: "A polished size chart that matches your theme.",
    chartLimit: 2,
    features: [],
    highlights: [
      "2 size charts on any number of products",
      "11 essential templates",
      "Matches your theme's fonts and colours, light or dark",
      "Numbered how-to-measure illustrations",
      "Metric and imperial: cm, mm, inches, feet, kg and lb",
      "Accessible: keyboard, screen readers, larger text",
      "Shopper-facing text in 8 languages",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4.99,
    yearlyPrice: 49.9,
    tagline: "Everything to sell more and cut size returns.",
    chartLimit: Number.POSITIVE_INFINITY,
    features: PRO_FEATURES,
    highlights: [
      "Fit Finder on every chart: shoppers get their size, unlimited",
      "Unlimited size charts and the full library: 60 templates",
      "Design studio: 7 styles, colours, fonts, drawer and in-page layouts",
      "Photo card beside the chart and a runs small / large scale",
      "No Sizemate branding, CSV import and export",
    ],
  },
  plus: {
    id: "plus",
    name: "Plus",
    monthlyPrice: 9.99,
    yearlyPrice: 99.9,
    tagline: "For stores with returning shoppers and more than one market.",
    chartLimit: Number.POSITIVE_INFINITY,
    features: [...PRO_FEATURES, "sizeMemory", "translations", "insights"],
    highlights: [
      "Everything in Pro",
      "Size memory: returning shoppers see their size on every product",
      "Insights: chart views, the sizes shoppers get, missing-size alerts",
      "Translate charts for every store language",
      "Priority support, and we set up your first charts for you",
    ],
  },
};

export const PLAN_ORDER: readonly PlanId[] = ["free", "pro", "plus"];

export const FEATURE_LABELS: Record<Feature, string> = {
  unlimitedCharts: "Unlimited size charts",
  allTemplates: "Full template library",
  removeBranding: "Remove Sizemate branding",
  customStyle: "Design studio",
  chartImage: "Photo card",
  fitScale: "Fit scale",
  csv: "CSV import and export",
  fitFinder: "Fit Finder",
  sizeMemory: "Size memory",
  translations: "Chart translations",
  insights: "Insights",
};

export function hasFeature(plan: PlanId, feature: Feature): boolean {
  return PLANS[plan].features.includes(feature);
}

/** The cheapest plan that includes a feature, for "Upgrade to …" prompts. */
export function planFor(feature: Feature): Plan {
  const id = PLAN_ORDER.find((planId) => hasFeature(planId, feature));
  return PLANS[id ?? "plus"];
}

/** "1 size chart", "2 size charts". */
export function chartCount(count: number): string {
  return `${count} size chart${count === 1 ? "" : "s"}`;
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
