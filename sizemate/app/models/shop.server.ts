import type { Shop } from "@prisma/client";

import db from "../db.server";
import { isPlanId, type PlanId } from "../lib/plans";
import { parseSettings, type AppearanceSettings } from "../lib/settings";

export interface Onboarding {
  /** The merchant opened the theme editor from the setup guide. */
  themeEditorOpened?: boolean;
  /** The merchant previewed the chart on the storefront. */
  previewed?: boolean;
  /** The setup guide was dismissed. */
  guideDismissed?: boolean;
}

export async function getShop(shop: string): Promise<Shop> {
  return db.shop.upsert({ where: { shop }, create: { shop }, update: {} });
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

export async function setPlan(shop: string, plan: PlanId): Promise<void> {
  await db.shop.update({ where: { shop }, data: { plan, planCheckedAt: new Date() } });
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
    db.shop.deleteMany({ where: { shop } }),
    db.session.deleteMany({ where: { shop } }),
  ]);
}
