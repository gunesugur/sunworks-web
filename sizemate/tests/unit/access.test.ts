import { describe, expect, it } from "vitest";

import { computeAccess, inShopifyTrial, planFromName, readSubscriptions, type AccessFacts } from "~/lib/access";
import { whatChanges } from "~/lib/downgrade";
import { applyPreset, DEFAULT_SETTINGS } from "~/lib/settings";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

const day = 86_400_000;
const NOW = new Date("2026-10-15T12:00:00Z");
const at = (days: number) => new Date(NOW.getTime() + days * day);
const facts = (patch: Partial<AccessFacts>): AccessFacts => ({ subscribed: "free", paidPlan: null, paidUntil: null, welcomeUntil: null, ...patch });

describe("access", () => {
  it("uses the active subscription", () => {
    expect(computeAccess(facts({ subscribed: "pro" }), NOW)).toEqual({ plan: "pro", source: "subscription", endsAt: null, next: "pro" });
    expect(computeAccess(facts({}), NOW)).toEqual({ plan: "free", source: "free", endsAt: null, next: "free" });
  });

  it("keeps a cancelled plan until the end of the paid period, then drops it", () => {
    const cancelled = facts({ subscribed: "free", paidPlan: "pro", paidUntil: at(10) });
    expect(computeAccess(cancelled, NOW)).toEqual({ plan: "pro", source: "paid-period", endsAt: at(10), next: "free" });
    expect(computeAccess(cancelled, at(10)).plan).toBe("free");
    expect(computeAccess(cancelled, at(11)).plan).toBe("free");
  });

  it("keeps Plus until the period ends after a downgrade to Pro", () => {
    const downgraded = facts({ subscribed: "pro", paidPlan: "plus", paidUntil: at(5) });
    expect(computeAccess(downgraded, NOW)).toMatchObject({ plan: "plus", source: "paid-period", next: "pro" });
    expect(computeAccess(downgraded, at(6))).toMatchObject({ plan: "pro", source: "subscription" });
  });

  it("gives no grace while a subscription is frozen for non-payment", () => {
    expect(computeAccess(facts({ paidPlan: "pro", paidUntil: at(10), frozen: true }), NOW).plan).toBe("free");
  });

  it("gives new installs Plus during the welcome period", () => {
    const welcome = facts({ welcomeUntil: at(3) });
    expect(computeAccess(welcome, NOW)).toEqual({ plan: "plus", source: "welcome", endsAt: at(3), next: "free" });
    expect(computeAccess(welcome, at(4)).plan).toBe("free");
    // Subscribing to Pro during the welcome keeps Plus until the welcome ends, then Pro.
    expect(computeAccess(facts({ subscribed: "pro", welcomeUntil: at(3) }), NOW)).toMatchObject({ plan: "plus", next: "pro" });
    // A Plus subscriber gains nothing from the welcome and is told nothing ends.
    expect(computeAccess(facts({ subscribed: "plus", welcomeUntil: at(3) }), NOW)).toMatchObject({ plan: "plus", source: "subscription", endsAt: null });
  });

  it("falls back to the best remaining plan", () => {
    // Welcome ends first, the paid Pro period later.
    expect(computeAccess(facts({ welcomeUntil: at(2), paidPlan: "pro", paidUntil: at(9) }), NOW)).toMatchObject({ plan: "plus", next: "pro" });
    // Paid period ends before the welcome.
    expect(computeAccess(facts({ welcomeUntil: at(9), paidPlan: "pro", paidUntil: at(2) }), NOW)).toMatchObject({ plan: "plus", next: "free" });
  });
});

describe("reading Shopify subscriptions", () => {
  const sub = (patch: Record<string, unknown>) => ({ name: "Pro", status: "ACTIVE", createdAt: at(-40).toISOString(), currentPeriodEnd: at(20).toISOString(), trialDays: 7, ...patch });

  it("reads the plan, the paid period and the renewal date", () => {
    expect(readSubscriptions([sub({})], NOW)).toEqual({ subscribed: "pro", frozen: false, paid: { plan: "pro", until: at(20) }, trialEndsAt: null, renewsAt: at(20) });
  });

  it("doesn't count a period inside Shopify's free trial as paid", () => {
    const reading = readSubscriptions([sub({ createdAt: at(-2).toISOString() })], NOW);
    expect(reading).toMatchObject({ subscribed: "pro", paid: null, trialEndsAt: at(5) });
    expect(inShopifyTrial(sub({ createdAt: at(-2).toISOString() }), NOW)).toBe(true);
    expect(inShopifyTrial(sub({ trialDays: 0 }), NOW)).toBe(false);
  });

  it("ignores subscriptions that aren't active and notices frozen ones", () => {
    for (const status of ["PENDING", "DECLINED", "EXPIRED", "CANCELLED"]) {
      expect(readSubscriptions([sub({ status })], NOW).subscribed, status).toBe("free");
    }
    expect(readSubscriptions([sub({ status: "FROZEN" })], NOW)).toMatchObject({ subscribed: "free", frozen: true });
  });

  it("matches plan names and picks the best of several", () => {
    expect(planFromName("Plus (yearly)")).toBe("plus");
    expect(planFromName(" pro ")).toBe("pro");
    expect(planFromName("Producer")).toBeNull();
    expect(readSubscriptions([sub({}), sub({ name: "Plus" })], NOW).subscribed).toBe("plus");
    expect(readSubscriptions([sub({ currentPeriodEnd: "not a date" })], NOW).paid).toBeNull();
  });
});

describe("what a downgrade changes", () => {
  it("lists the merchant's own losses", () => {
    const charts = ["womens-tops", "mens-tops", "womens-shoes", "bras-cup"].map((key) => chartFromTemplate(getTemplate(key)!));
    charts[0]!.image = { url: "https://cdn.shopify.com/x.jpg", alt: "" };
    charts[1]!.fitScale = 1;
    charts[2]!.translations = { de: { title: "Schuhe" } };
    const settings = { ...applyPreset(DEFAULT_SETTINGS, "bold"), container: "drawer" as const };
    expect(whatChanges(charts, settings, "plus", "free")).toEqual([
      "2 charts are paused: Free shows 2 size charts. Nothing is deleted.",
      "The Fit Finder turns off on 3 charts.",
      "Your custom design switches back to the “Match my theme” style.",
      "Photo cards are hidden on 1 chart.",
      "The fit scale is hidden on 1 chart.",
      "“Powered by Sizemate” appears under your charts.",
      "Charts made from library templates keep working; new ones can only use the essentials.",
      "Your translations are hidden on 1 chart.",
      "Returning shoppers no longer see their size on every product.",
      "Insights stop counting.",
    ]);
    expect(whatChanges(charts, settings, "plus", "pro")).toEqual([
      "Your translations are hidden on 1 chart.",
      "Returning shoppers no longer see their size on every product.",
      "Insights stop counting.",
    ]);
    expect(whatChanges(charts, settings, "pro", "pro")).toEqual([]);
  });
});
