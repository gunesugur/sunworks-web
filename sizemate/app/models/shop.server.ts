import type { Shop } from "@prisma/client";

import db from "../db.server";
import type { AccessFacts } from "../lib/access";
import { isPlanId, WELCOME_DAYS, type PlanId } from "../lib/plans";
import { parseSettings, type AppearanceSettings } from "../lib/settings";

export interface Onboarding {
  /** The merchant opened the theme editor from the setup guide. */
  themeEditorOpened?: boolean;
  /** The merchant previewed the chart on the storefront. */
  previewed?: boolean;
  /** The setup guide was dismissed. */
  guideDismissed?: boolean;
}

/** The shop's record, created on first use with its welcome period starting now. */
export async function getShop(shop: string, now = new Date()): Promise<Shop> {
  return db.shop.upsert({
    where: { shop },
    create: { shop, welcomeUntil: new Date(now.getTime() + WELCOME_DAYS * 86_400_000) },
    update: {},
  });
}

export function factsOf(record: Shop): AccessFacts {
  return {
    subscribed: isPlanId(record.subscribedPlan) ? record.subscribedPlan : "free",
    paidPlan: record.paidPlan && isPlanId(record.paidPlan) ? record.paidPlan : null,
    paidUntil: record.paidUntil,
    welcomeUntil: record.welcomeUntil,
    frozen: record.frozen,
  };
}

export function planOf(record: Shop): PlanId {
  return isPlanId(record.plan) ? record.plan : "free";
}

export function settingsOf(record: Shop): AppearanceSettings {
  try {
    return parseSettings(JSON.parse(record.settings));
  } catch {
    return parseSettings({});
  }
}

export function onboardingOf(record: Shop): Onboarding {
  try {
    const value = JSON.parse(record.onboarding) as unknown;
    return typeof value === "object" && value !== null ? (value as Onboarding) : {};
  } catch {
    return {};
  }
}

export async function saveSettings(shop: string, settings: AppearanceSettings): Promise<void> {
  await db.shop.update({ where: { shop }, data: { settings: JSON.stringify(settings) } });
}

export async function updateOnboarding(shop: string, patch: Onboarding): Promise<Onboarding> {
  const current = onboardingOf(await getShop(shop));
  const next = { ...current, ...patch };
  await db.shop.update({ where: { shop }, data: { onboarding: JSON.stringify(next) } });
  return next;
}

export interface PlanRecord {
  plan: PlanId;
  subscribedPlan: PlanId;
  paidPlan: PlanId | null;
  paidUntil: Date | null;
  frozen: boolean;
  trialEndsAt: Date | null;
  renewsAt: Date | null;
  checkedAt: Date;
}

export async function savePlan(shop: string, record: PlanRecord): Promise<void> {
  const { checkedAt, ...data } = record;
  await db.shop.update({ where: { shop }, data: { ...data, planCheckedAt: checkedAt } });
}

/** Only the effective plan, keeping what is known about the subscription. */
export async function setPlan(shop: string, plan: PlanId, checkedAt: Date | null = new Date()): Promise<void> {
  await db.shop.update({ where: { shop }, data: { plan, ...(checkedAt ? { planCheckedAt: checkedAt } : {}) } });
}

/**
 * The app was uninstalled: Shopify cancels the subscription at once, and a
 * reinstall starts from Free (Shopify treats it as a fresh install). Charts
 * and settings stay until shop/redact.
 */
export async function resetSubscription(shop: string): Promise<void> {
  await db.shop.updateMany({
    where: { shop },
    data: { plan: "free", subscribedPlan: "free", paidPlan: null, paidUntil: null, frozen: false, trialEndsAt: null, renewsAt: null, planCheckedAt: null },
  });
}

export async function recordPublish(shop: string, error: string | null): Promise<void> {
  await db.shop.update({
    where: { shop },
    data: error ? { publishError: error } : { publishError: null, publishedAt: new Date() },
  });
}

/** GDPR shop/redact: remove everything we hold for the shop. */
export async function deleteShopData(shop: string): Promise<void> {
  await db.$transaction([
    db.chart.deleteMany({ where: { shop } }),
    db.insightDay.deleteMany({ where: { shop } }),
    db.shop.deleteMany({ where: { shop } }),
    db.session.deleteMany({ where: { shop } }),
  ]);
}
