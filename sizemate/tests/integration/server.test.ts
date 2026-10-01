import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestDatabase } from "./setup";

// Set before the app's Prisma client is created.
const url = await createTestDatabase();
process.env.DATABASE_URL = url;

const { default: db } = await import("~/db.server");
const charts = await import("~/models/charts.server");
const shops = await import("~/models/shop.server");
const { publish, PublishError } = await import("~/models/publisher.server");
const { syncPlan, pricingPageUrl } = await import("~/models/billing.server");
const { chartFromTemplate, getTemplate } = await import("~/lib/templates");
const { emptyAssignment } = await import("~/lib/chart");
const insights = await import("~/models/insights.server");

const SHOP = "demo.myshopify.com";

interface Call {
  query: string;
  variables?: Record<string, unknown>;
}

/** Fake Admin API: records calls and answers the queries the app makes. */
function fakeAdmin(options: { existingKeys?: string[]; subscriptions?: { name: string; status: string }[]; userErrors?: boolean } = {}) {
  const calls: Call[] = [];
  const admin = {
    calls,
    graphql: vi.fn(async (query: string, opts?: { variables?: Record<string, unknown> }) => {
      calls.push({ query, variables: opts?.variables });
      let data: unknown = {};
      if (query.includes("SizemateInstallation")) {
        data = {
          currentAppInstallation: {
            id: "gid://shopify/AppInstallation/1",
            metafields: { nodes: (options.existingKeys ?? []).map((key) => ({ key })) },
          },
        };
      } else if (query.includes("SizemateSetMetafields")) {
        data = { metafieldsSet: { metafields: [], userErrors: options.userErrors ? [{ field: ["value"], message: "Value is too big" }] : [] } };
      } else if (query.includes("SizemateDeleteMetafields")) {
        data = { metafieldsDelete: { deletedMetafields: [], userErrors: [] } };
      } else if (query.includes("SizemateSubscriptions")) {
        data = { currentAppInstallation: { activeSubscriptions: options.subscriptions ?? [] } };
      }
      return { json: async () => ({ data }) };
    }),
  };
  return admin;
}

function tops() {
  return chartFromTemplate(getTemplate("womens-tops")!);
}

beforeAll(async () => {
  await db.$connect();
});

beforeEach(async () => {
  await db.chart.deleteMany();
  await db.shop.deleteMany();
});

describe("charts repository", () => {
  it("creates charts in order and lists them back validated", async () => {
    const a = await charts.saveChart(SHOP, tops(), "pro");
    const b = await charts.saveChart(SHOP, chartFromTemplate(getTemplate("mens-bottoms")!), "pro");
    const listed = await charts.listCharts(SHOP);
    expect(listed.map((s) => s.chart.id)).toEqual([a.id, b.id]);
    expect(listed[0]!.chart.rows).toHaveLength(6);
  });

  it("enforces the Free plan limit on the server", async () => {
    await charts.saveChart(SHOP, tops(), "free");
    await charts.saveChart(SHOP, tops(), "free");
    await expect(charts.saveChart(SHOP, tops(), "free")).rejects.toThrow("The Free plan includes 2 size charts.");
    // Editing the existing chart is still allowed.
    const [existing] = await charts.listCharts(SHOP);
    await expect(charts.saveChart(SHOP, { ...existing!.chart, name: "Renamed" }, "free")).resolves.toMatchObject({ name: "Renamed" });
  });

  it("rejects invalid charts with readable errors", async () => {
    const chart = tops();
    chart.name = "";
    await expect(charts.saveChart(SHOP, chart, "pro")).rejects.toMatchObject({ errors: ["Give the chart a name"] });
  });

  it("never lets one shop overwrite another shop's chart", async () => {
    const chart = await charts.saveChart(SHOP, tops(), "pro");
    await expect(charts.saveChart("other.myshopify.com", chart, "pro")).rejects.toBeInstanceOf(charts.ValidationError);
    expect(await charts.getChart("other.myshopify.com", chart.id)).toBeNull();
    expect(await charts.deleteChart("other.myshopify.com", chart.id)).toBe(false);
  });

  it("duplicates as a draft and reorders", async () => {
    const a = await charts.saveChart(SHOP, tops(), "pro");
    const copy = (await charts.duplicate(SHOP, a.id, "pro"))!;
    expect(copy.status).toBe("draft");
    expect(await charts.move(SHOP, copy.id, "up")).toBe(true);
    expect((await charts.listCharts(SHOP)).map((s) => s.chart.id)).toEqual([copy.id, a.id]);
    expect(await charts.move(SHOP, copy.id, "up")).toBe(false);
  });

  it("changes status", async () => {
    const a = await charts.saveChart(SHOP, tops(), "pro");
    await charts.setStatus(SHOP, a.id, "draft");
    expect((await charts.getChart(SHOP, a.id))!.chart.status).toBe("draft");
  });
});

describe("publishing", () => {
  it("writes charts before the config and removes stale charts", async () => {
    const chart = tops();
    chart.assignment = { ...emptyAssignment("conditions"), collections: [{ id: "gid://shopify/Collection/9", title: "Tops" }] };
    await charts.saveChart(SHOP, chart, "pro");
    const admin = fakeAdmin({ existingKeys: ["config", `chart_${chart.id}`, "chart_c_oldchart1"] });
    const summary = await publish(SHOP, admin);
    expect(summary).toEqual({ published: 1, paused: [] });

    const set = admin.calls.filter((c) => c.query.includes("SizemateSetMetafields"));
    const written = set.flatMap((c) => c.variables!.metafields as { key: string; value: string; ownerId: string; type: string }[]);
    expect(written.map((m) => m.key)).toEqual([`chart_${chart.id}`, "config"]);
    expect(written.every((m) => m.ownerId === "gid://shopify/AppInstallation/1" && m.type === "json")).toBe(true);
    expect(JSON.parse(written[1]!.value).rules[0].col).toEqual(["9"]);

    const deleted = admin.calls.find((c) => c.query.includes("SizemateDeleteMetafields"))!;
    expect((deleted.variables!.metafields as { key: string }[]).map((m) => m.key)).toEqual(["chart_c_oldchart1"]);
    expect((await shops.getShop(SHOP)).publishedAt).not.toBeNull();
  });

  it("batches more than 25 metafields", async () => {
    for (let i = 0; i < 30; i++) await charts.saveChart(SHOP, tops(), "pro");
    await shops.setPlan(SHOP, "pro");
    const admin = fakeAdmin();
    await publish(SHOP, admin);
    const batches = admin.calls.filter((c) => c.query.includes("SizemateSetMetafields"));
    expect(batches.map((c) => (c.variables!.metafields as unknown[]).length)).toEqual([25, 6]);
  });

  it("publishes only the first two active charts on Free", async () => {
    const first = await charts.saveChart(SHOP, tops(), "pro");
    await charts.saveChart(SHOP, tops(), "pro");
    const third = await charts.saveChart(SHOP, tops(), "pro");
    expect(await publish(SHOP, fakeAdmin())).toEqual({ published: 2, paused: [third.id] });
    expect(first.id).not.toBe(third.id);
  });

  it("records Shopify errors so the merchant can see them", async () => {
    await charts.saveChart(SHOP, tops(), "pro");
    await expect(publish(SHOP, fakeAdmin({ userErrors: true }))).rejects.toBeInstanceOf(PublishError);
    expect((await shops.getShop(SHOP)).publishError).toMatch(/Value is too big/);
  });
});

describe("billing", () => {
  it("reads the plan from Shopify and caches it briefly", async () => {
    // A shop from before the welcome period, so the subscription alone decides.
    await db.shop.create({ data: { shop: SHOP, welcomeUntil: null } });
    const admin = fakeAdmin({ subscriptions: [{ name: "Plus", status: "ACTIVE" }] });
    expect(await syncPlan(SHOP, admin)).toMatchObject({ plan: "plus", changed: true });
    expect(await syncPlan(SHOP, admin)).toMatchObject({ plan: "plus", changed: false });
    expect(admin.graphql).toHaveBeenCalledTimes(1);
    const downgrade = fakeAdmin({ subscriptions: [] });
    // No paid period was reported (no currentPeriodEnd), so nothing to keep.
    expect(await syncPlan(SHOP, downgrade, { force: true })).toMatchObject({ plan: "free", changed: true });
  });

  it("links to Shopify's plan picker", () => {
    expect(pricingPageUrl("cool-shop.myshopify.com")).toBe("https://admin.shopify.com/store/cool-shop/charges/sizemate/pricing_plans");
  });
});

describe("shop data", () => {
  it("stores settings and onboarding, and deletes everything on shop/redact", async () => {
    await shops.getShop(SHOP);
    await shops.saveSettings(SHOP, { ...shops.settingsOf(await shops.getShop(SHOP)), buttonLabel: "Sizes" });
    expect(shops.settingsOf(await shops.getShop(SHOP)).buttonLabel).toBe("Sizes");
    expect(await shops.updateOnboarding(SHOP, { previewed: true })).toEqual({ previewed: true });
    await charts.saveChart(SHOP, tops(), "pro");
    await shops.deleteShopData(SHOP);
    expect(await db.chart.count({ where: { shop: SHOP } })).toBe(0);
    expect(await db.shop.count({ where: { shop: SHOP } })).toBe(0);
  });

  it("survives corrupt stored JSON", async () => {
    await db.shop.create({ data: { shop: SHOP, settings: "{not json", onboarding: "[]", plan: "gold" } });
    const record = await shops.getShop(SHOP);
    expect(shops.settingsOf(record).buttonStyle).toBe("link");
    expect(shops.planOf(record)).toBe("free");
  });
});

describe("insights", () => {
  it("counts views and Fit Finder results per day and deletes them with the shop", async () => {
    await shops.getShop(SHOP);
    const now = new Date("2026-10-01T12:00:00Z");
    await insights.recordEvent(SHOP, { type: "open", chartId: "c_abcd" }, now);
    await insights.recordEvent(SHOP, { type: "open", chartId: "c_abcd" }, now);
    await insights.recordEvent(SHOP, { type: "fit", chartId: "c_abcd", size: "M", status: "exact" }, now);
    await insights.recordEvent(SHOP, { type: "fit", chartId: "c_abcd", size: "XL", status: "above" }, now);
    await insights.recordEvent(SHOP, { type: "open", chartId: "c_abcd" }, new Date("2026-08-01T12:00:00Z"));
    const result = await insights.loadInsights(SHOP, 30, now);
    expect(result.totals).toEqual({ opens: 2, fits: 2 });
    expect(result.charts[0]).toMatchObject({ chartId: "c_abcd", above: 1, sizes: [{ size: "M", count: 1 }, { size: "XL", count: 1 }] });
    await shops.deleteShopData(SHOP);
    expect(await db.insightDay.count({ where: { shop: SHOP } })).toBe(0);
  });
});
