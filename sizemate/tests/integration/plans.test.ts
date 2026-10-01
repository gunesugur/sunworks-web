/**
 * Plan scenarios, end to end on the server: real routes, real database,
 * real publishing; Shopify is a fake "world" whose subscriptions, clock and
 * metafields each test controls. Each scenario checks what the merchant can
 * do in the admin AND what the storefront actually receives.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestDatabase } from "./setup";

const url = await createTestDatabase();
process.env.DATABASE_URL = url;

/* The fake Shopify ------------------------------------------------------------ */

interface Sub {
  name: string;
  status: string;
  createdAt: string;
  currentPeriodEnd: string | null;
  trialDays: number;
  test: boolean;
}

const world = {
  shop: "scenario.myshopify.com",
  subscriptions: [] as Sub[],
  metafields: new Map<string, unknown>(),
  graphqlCalls: 0,
};

const admin = {
  graphql: vi.fn(async (query: string, options?: { variables?: Record<string, unknown> }) => {
    world.graphqlCalls++;
    const variables = options?.variables ?? {};
    let data: unknown = {};
    if (query.includes("SizemateSubscriptions")) {
      data = { currentAppInstallation: { activeSubscriptions: world.subscriptions } };
    } else if (query.includes("SizemateInstallation")) {
      data = { currentAppInstallation: { id: "gid://shopify/AppInstallation/1", metafields: { nodes: [...world.metafields.keys()].map((key) => ({ key })) } } };
    } else if (query.includes("SizemateSetMetafields")) {
      for (const field of variables.metafields as { key: string; value: string }[]) world.metafields.set(field.key, JSON.parse(field.value));
      data = { metafieldsSet: { metafields: [], userErrors: [] } };
    } else if (query.includes("SizemateDeleteMetafields")) {
      for (const field of variables.metafields as { key: string }[]) world.metafields.delete(field.key);
      data = { metafieldsDelete: { deletedMetafields: [], userErrors: [] } };
    } else if (query.includes("SizemateCatalog")) {
      data = { products: { nodes: [] }, shopLocales: [{ locale: "en", name: "English", primary: true, published: true }] };
    } else if (query.includes("SizemateThemeStatus")) {
      data = { themes: { nodes: [] } };
    } else if (query.includes("SizemateStagedUpload")) {
      data = { stagedUploadsCreate: { stagedTargets: [{ url: "https://upload.test/", resourceUrl: "https://upload.test/r", parameters: [] }], userErrors: [] } };
    } else if (query.includes("SizemateFileCreate")) {
      data = { fileCreate: { files: [{ id: "gid://shopify/MediaImage/1" }], userErrors: [] } };
    } else if (query.includes("SizemateFile")) {
      data = { node: { fileStatus: "READY", image: { url: "https://cdn.shopify.com/s/files/photo.jpg" } } };
    }
    return { json: async () => ({ data }) };
  }),
};

const redirect = (location: string) => new Response(null, { status: 302, headers: { Location: location } });

vi.mock("~/shopify.server", () => ({
  authenticate: {
    admin: async () => ({ admin, session: { shop: world.shop }, redirect }),
    webhook: async () => ({ shop: world.shop, admin, session: { shop: world.shop }, topic: "TEST" }),
    public: { appProxy: async () => ({ session: { shop: world.shop } }) },
  },
  unauthenticated: { admin: async () => ({ admin }) },
}));

const { default: db } = await import("~/db.server");
const charts = await import("~/models/charts.server");
const shops = await import("~/models/shop.server");
const { reconcileShops } = await import("~/models/reconcile.server");
const { publish } = await import("~/models/publisher.server");
const { chartFromTemplate, getTemplate } = await import("~/lib/templates");
const { applyPreset, DEFAULT_SETTINGS } = await import("~/lib/settings");
const { WELCOME_DAYS } = await import("~/lib/plans");
const home = await import("~/routes/app._index");
const plansPage = await import("~/routes/app.plans");
const newChart = await import("~/routes/app.charts.new");
const editChart = await import("~/routes/app.charts.$id");
const appearance = await import("~/routes/app.settings");
const insightsPage = await import("~/routes/app.insights");
const proxy = await import("~/routes/proxy.e");
const subscriptionsWebhook = await import("~/routes/webhooks.app.subscriptions_update");
const uninstalledWebhook = await import("~/routes/webhooks.app.uninstalled");

/* Helpers ----------------------------------------------------------------------------- */

const DAY = 86_400_000;
const START = new Date("2026-10-01T09:00:00Z");
let now = START;

function setNow(date: Date) {
  now = date;
  vi.setSystemTime(date);
}
const later = (days: number) => setNow(new Date(now.getTime() + days * DAY));

function subscribe(plan: "Pro" | "Plus", options: { trial?: boolean; periodDays?: number; status?: string } = {}) {
  const createdAt = options.trial ? now : new Date(now.getTime() - 10 * DAY); // past the 7-day trial unless asked
  world.subscriptions = [
    {
      name: plan,
      status: options.status ?? "ACTIVE",
      createdAt: createdAt.toISOString(),
      currentPeriodEnd: new Date(now.getTime() + (options.periodDays ?? 20) * DAY).toISOString(),
      trialDays: 7,
      test: true,
    },
  ];
}

const cancel = () => {
  world.subscriptions = [];
};

/** Calls a route loader or action the way React Router does. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function call<T extends (args: any) => any>(fn: T, request: Request, params: Record<string, string> = {}): ReturnType<T> {
  return fn({ request, params, context: {} } as never) as ReturnType<T>;
}
const req = (path: string, init?: RequestInit) => new Request(`https://app.test${path}`, init);
const json = (path: string, body: unknown) => req(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const form = (path: string, fields: Record<string, string>) => req(path, { method: "POST", body: new URLSearchParams(fields) });

/** Opens the admin Home page (what a merchant returning to the app triggers). */
async function openApp() {
  return call(home.loader, req("/app"));
}

async function storefront() {
  const config = world.metafields.get("config") as {
    plan: string;
    brand: boolean;
    ins: boolean;
    mem: boolean;
    rules: { c: string }[];
    settings: { preset: string; container: string };
  };
  const published = [...world.metafields.entries()].filter(([key]) => key.startsWith("chart_")).map(([, value]) => value as { id: string; fit: boolean; fs: number | null; img: unknown; tr: Record<string, unknown> });
  return { config, charts: published };
}

async function createFromTemplate(key: string) {
  try {
    return await call(newChart.action, form("/app/charts/new", { intent: "template", template: key }));
  } catch (thrown) {
    if (thrown instanceof Response) return thrown; // redirect to the new chart
    throw thrown;
  }
}

async function seedCharts(count: number, plan: "pro" | "plus" = "plus") {
  const keys = ["womens-tops", "mens-tops", "womens-shoes", "bras-cup", "rings"];
  const created = [];
  for (const key of keys.slice(0, count)) {
    const chart = chartFromTemplate(getTemplate(key)!);
    chart.fitScale = -1;
    chart.image = { url: "https://cdn.shopify.com/s/files/model.jpg", alt: "Model" };
    chart.translations = { de: { title: "Größen" } };
    created.push(await charts.saveChart(world.shop, chart, plan));
  }
  // Saving in the editor publishes; do the same here.
  await publish(world.shop, admin);
  return created;
}

beforeAll(async () => {
  await db.$connect();
});

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  setNow(START);
  world.subscriptions = [];
  world.metafields.clear();
  await db.insightDay.deleteMany();
  await db.chart.deleteMany();
  await db.shop.deleteMany();
});

afterEach(() => {
  vi.useRealTimers();
});

/** A shop installed before the welcome period, so it starts on Free. */
async function existingFreeShop() {
  await db.shop.create({ data: { shop: world.shop, welcomeUntil: null } });
}

/* Scenarios ------------------------------------------------------------------------------- */

describe("welcome period (reverse trial)", () => {
  it("gives a new install every Plus feature for 14 days, warns before it ends, then moves to Free", async () => {
    const first = await openApp();
    expect(first.plan).toBe("plus");
    expect(first.notice).toMatchObject({ source: "welcome", daysLeft: WELCOME_DAYS, next: "free" });

    await seedCharts(3);
    await openApp();
    const during = await storefront();
    expect(during.config.rules).toHaveLength(3);
    expect(during.charts.every((c) => c.fit && c.fs === -1 && c.img)).toBe(true);
    expect(during.config).toMatchObject({ brand: false, ins: true, mem: true });

    later(WELCOME_DAYS - 2);
    const warning = await openApp();
    expect(warning.notice.daysLeft).toBe(2);
    expect(warning.notice.changes).toContain("1 chart is paused: Free shows 2 size charts. Nothing is deleted.");
    expect(warning.notice.changes).toContain("The Fit Finder turns off on 3 charts.");

    later(3);
    const after = await openApp();
    expect(after.plan).toBe("free");
    expect(after.notice.source).toBe("free");
    const free = await storefront();
    expect(free.config.rules).toHaveLength(2);
    expect(free.charts.every((c) => !c.fit && c.fs === null && c.img === null && Object.keys(c.tr).length === 0)).toBe(true);
    expect(free.config).toMatchObject({ brand: true, ins: false, mem: false });
    // Nothing was deleted.
    expect(await db.chart.count()).toBe(3);
  });

  it("ends on time even if the merchant never opens the app again (hourly job)", async () => {
    await openApp();
    await seedCharts(3);
    await openApp();
    later(WELCOME_DAYS + 1);
    const result = await reconcileShops(async () => admin);
    expect(result.changed).toEqual([world.shop]);
    expect((await storefront()).config).toMatchObject({ plan: "free", brand: true });
    // Running again changes nothing.
    expect((await reconcileShops(async () => admin)).changed).toEqual([]);
  });

  it("isn't given again to a shop that reinstalls", async () => {
    await openApp();
    later(WELCOME_DAYS + 1);
    await call(uninstalledWebhook.action, req("/webhooks/app/uninstalled", { method: "POST" }));
    expect((await openApp()).plan).toBe("free");
  });

  it("continues with the plan the merchant chose during the welcome", async () => {
    await openApp();
    subscribe("Pro", { trial: true });
    const chosen = await openApp();
    later(1); // past the 60-second cache
    const withPro = await openApp();
    expect(chosen.plan).toBe("plus");
    expect(withPro.notice).toMatchObject({ source: "welcome", next: "pro" });
    later(WELCOME_DAYS);
    expect((await openApp()).plan).toBe("pro");
  });
});

describe("upgrading", () => {
  it("turns Pro features on as soon as the merchant comes back from Shopify's plan page", async () => {
    await existingFreeShop();
    await seedCharts(3, "pro");
    const before = await openApp();
    expect(before.plan).toBe("free");
    expect((await storefront()).config.rules).toHaveLength(2);

    subscribe("Pro");
    later(1);
    const after = await openApp();
    expect(after.plan).toBe("pro");
    const live = await storefront();
    expect(live.config.rules).toHaveLength(3);
    expect(live.charts.every((c) => c.fit && c.fs === -1 && c.img)).toBe(true);
    expect(live.config).toMatchObject({ brand: false, ins: false, mem: false });
    // Pro keeps Plus features locked.
    expect(live.charts.every((c) => Object.keys(c.tr).length === 0)).toBe(true);
  });

  it("also updates the store from the subscription webhook, without the app being opened", async () => {
    await existingFreeShop();
    await seedCharts(1, "pro");
    await openApp();
    subscribe("Plus");
    await call(subscriptionsWebhook.action, req("/webhooks/app/subscriptions_update", { method: "POST" }));
    expect((await storefront()).config).toMatchObject({ plan: "plus", ins: true, mem: true });
  });

  it("shows Shopify's trial end and the renewal date", async () => {
    await existingFreeShop();
    subscribe("Pro", { trial: true });
    const data = await call(plansPage.loader, req("/app/plans"));
    expect(data.plan).toBe("pro");
    expect(data.subscribed).toBe("pro");
    expect(data.notice.trialEndsAt).toBe(new Date(START.getTime() + 7 * DAY).toISOString());
  });
});

describe("cancelling and downgrading", () => {
  it("keeps Pro until the end of the paid period, says so, then switches to Free", async () => {
    await existingFreeShop();
    await seedCharts(3, "pro");
    subscribe("Pro", { periodDays: 12 });
    await openApp();
    expect((await storefront()).config.plan).toBe("pro");

    cancel();
    later(1);
    const cancelled = await openApp();
    expect(cancelled.plan).toBe("pro");
    expect(cancelled.notice).toMatchObject({ source: "paid-period", next: "free" });
    expect(new Date(cancelled.notice.endsAt!).getTime()).toBe(START.getTime() + 12 * DAY);
    expect(cancelled.notice.changes).toEqual([
      "1 chart is paused: Free shows 2 size charts. Nothing is deleted.",
      "The Fit Finder turns off on 3 charts.",
      "Photo cards are hidden on 3 charts.",
      "The fit scale is hidden on 3 charts.",
      "“Powered by Sizemate” appears under your charts.",
    ]);
    expect((await storefront()).config.plan).toBe("pro");

    later(12);
    await reconcileShops(async () => admin);
    const live = await storefront();
    expect(live.config.plan).toBe("free");
    expect(live.config.rules).toHaveLength(2);
    expect((await openApp()).plan).toBe("free");
  });

  it("ends at once when the merchant cancels inside Shopify's free trial (nothing was paid)", async () => {
    await existingFreeShop();
    subscribe("Pro", { trial: true });
    await openApp();
    cancel();
    later(1);
    expect((await openApp()).plan).toBe("free");
  });

  it("keeps Plus until the period ends after a downgrade to Pro, then keeps Pro", async () => {
    await existingFreeShop();
    await seedCharts(2);
    subscribe("Plus", { periodDays: 5 });
    await openApp();
    subscribe("Pro", { periodDays: 30 });
    later(1);
    const downgraded = await openApp();
    expect(downgraded.plan).toBe("plus");
    expect(downgraded.notice).toMatchObject({ source: "paid-period", next: "pro" });
    expect(downgraded.notice.changes).toContain("Insights stop counting.");
    later(5);
    expect((await openApp()).plan).toBe("pro");
    expect((await storefront()).config).toMatchObject({ plan: "pro", ins: false, mem: false });
  });

  it("turns paid features off while Shopify has the subscription frozen for non-payment, and back on after", async () => {
    await existingFreeShop();
    subscribe("Pro");
    await openApp();
    subscribe("Pro", { status: "FROZEN" });
    later(1);
    const frozen = await openApp();
    expect(frozen.plan).toBe("free");
    expect(frozen.notice.frozen).toBe(true);
    subscribe("Pro");
    later(1);
    expect((await openApp()).plan).toBe("pro");
  });

  it("restores everything after upgrading again: nothing was lost", async () => {
    await existingFreeShop();
    const created = await seedCharts(3, "pro");
    await shops.saveSettings(world.shop, { ...applyPreset(DEFAULT_SETTINGS, "bold"), container: "drawer" });
    subscribe("Pro");
    await openApp();
    cancel();
    later(30);
    await openApp();
    expect((await storefront()).config.settings).toMatchObject({ preset: "theme", container: "modal" });
    subscribe("Pro");
    later(1);
    await openApp();
    const back = await storefront();
    expect(back.config.rules.map((r) => r.c)).toEqual(created.map((c) => c.id));
    expect(back.config.settings).toMatchObject({ preset: "bold", container: "drawer" });
    expect(back.charts.every((c) => c.fit && c.img)).toBe(true);
  });

  it("ignores pending, declined and expired subscriptions", async () => {
    await existingFreeShop();
    for (const status of ["PENDING", "DECLINED", "EXPIRED"]) {
      subscribe("Plus", { status });
      later(1);
      expect((await openApp()).plan, status).toBe("free");
    }
  });

  it("starts from Free after an uninstall, and keeps the charts for a reinstall", async () => {
    await existingFreeShop();
    await seedCharts(3, "pro");
    subscribe("Pro");
    await openApp();
    world.subscriptions = []; // Shopify cancels on uninstall
    await call(uninstalledWebhook.action, req("/webhooks/app/uninstalled", { method: "POST" }));
    const record = await shops.getShop(world.shop);
    expect(record).toMatchObject({ plan: "free", subscribedPlan: "free", paidPlan: null });
    expect(await db.chart.count()).toBe(3);
    expect((await openApp()).plan).toBe("free");
  });
});

describe("what each plan can do in the admin (enforced on the server)", () => {
  async function onPlan(plan: "free" | "pro" | "plus") {
    await existingFreeShop();
    if (plan === "pro") subscribe("Pro");
    if (plan === "plus") subscribe("Plus");
    expect((await openApp()).plan).toBe(plan);
  }

  it("Free: two charts, essential templates, no CSV, no photo upload, no Plus pages", async () => {
    await onPlan("free");
    expect(await createFromTemplate("womens-tops")).toHaveProperty("status", 302);
    expect(await createFromTemplate("bras-cup")).toMatchObject({ ok: false, message: expect.stringContaining("Pro template library") });
    expect(await createFromTemplate("mens-tops")).toHaveProperty("status", 302);
    expect(await createFromTemplate("kids")).toMatchObject({ ok: false, message: expect.stringContaining("includes 2 size charts") });
    expect(await call(newChart.action, form("/app/charts/new", { intent: "csv", csv: "Size,Chest (cm)\nS,90\nM,95\n" }))).toMatchObject({ ok: false, message: "CSV import is on the Pro plan." });

    const [chart] = await charts.listCharts(world.shop);
    const upload = new FormData();
    upload.append("image", new File([new Uint8Array(10)], "a.jpg", { type: "image/jpeg" }));
    expect(await call(editChart.action, req(`/app/charts/${chart!.chart.id}`, { method: "POST", body: upload }), { id: chart!.chart.id })).toEqual({
      ok: false,
      errors: ["The photo card is on the Pro plan."],
    });
    expect(await call(editChart.action, json(`/app/charts/${chart!.chart.id}`, { intent: "duplicate" }), { id: chart!.chart.id })).toEqual({
      ok: false,
      errors: ["The Free plan includes 2 size charts. Upgrade to add more."],
    });

    const insights = await call(insightsPage.loader, req("/app/insights"));
    expect(insights).toMatchObject({ allowed: false, insights: null });
  });

  it("Free: design studio choices are saved but stay off the storefront until an upgrade", async () => {
    await onPlan("free");
    await charts.saveChart(world.shop, chartFromTemplate(getTemplate("womens-tops")!), "free");
    const settings = { ...applyPreset(DEFAULT_SETTINGS, "soft"), container: "drawer", accentColor: "#ff0000", textScale: 125 };
    const saved = await call(appearance.action, json("/app/settings", settings));
    expect(saved).toMatchObject({ ok: true });
    expect(shops.settingsOf(await shops.getShop(world.shop))).toMatchObject({ preset: "soft", accentColor: "#ff0000" });
    expect((await storefront()).config.settings).toMatchObject({ preset: "theme", container: "modal", textScale: 125 });
  });

  it("Pro: unlimited charts, the full library, CSV and photo upload; Plus features stay locked", async () => {
    await onPlan("pro");
    for (const key of ["womens-tops", "bras-cup", "rings"]) expect((await createFromTemplate(key)) as Response).toHaveProperty("status", 302);
    const imported = await call(newChart.action, form("/app/charts/new", { intent: "csv", csv: "Size,Chest (cm)\nS,90\nM,95\n" })).catch((r: Response) => r);
    expect((imported as Response).status).toBe(302);

    const [chart] = await charts.listCharts(world.shop);
    const upload = new FormData();
    upload.append("image", new File([new Uint8Array(10)], "a.jpg", { type: "image/jpeg" }));
    vi.stubGlobal("fetch", async () => new Response(null, { status: 204 }));
    expect(await call(editChart.action, req(`/app/charts/${chart!.chart.id}`, { method: "POST", body: upload }), { id: chart!.chart.id })).toMatchObject({
      ok: true,
      intent: "upload",
      image: { url: "https://cdn.shopify.com/s/files/photo.jpg" },
    });
    vi.unstubAllGlobals();

    expect(await call(insightsPage.loader, req("/app/insights"))).toMatchObject({ allowed: false });
    const live = await storefront();
    expect(live.config).toMatchObject({ ins: false, mem: false, brand: false });
    expect(live.charts).toHaveLength(4);
    // On Pro every chart's Fit Finder switch is honoured, whatever the product type (shoes, bras, rings, imported).
    const stored = await charts.listCharts(world.shop);
    for (const { chart } of stored) expect(live.charts.find((c) => c.id === chart.id)?.fit, chart.category).toBe(chart.fitFinder);
    expect(live.charts.filter((c) => c.fit).length).toBeGreaterThanOrEqual(3);
  });

  it("Plus: Insights counts storefront events; on Pro the same events are ignored", async () => {
    await onPlan("plus");
    const [chart] = await seedCharts(1);
    const send = (event: object) => call(proxy.action, req("/proxy/e", { method: "POST", body: JSON.stringify(event) }));
    await send({ e: "open", c: chart!.id });
    await send({ e: "fit", c: chart!.id, s: "M", st: "exact" });
    await send({ e: "open", c: "c_unknown1" }); // not this shop's chart
    await send({ nonsense: true });
    const plus = await call(insightsPage.loader, req("/app/insights"));
    expect(plus).toMatchObject({ allowed: true, insights: { totals: { opens: 1, fits: 1 } } });

    // A downgrade keeps Plus until the paid period ends; after that, events are ignored.
    subscribe("Pro");
    later(1);
    await openApp();
    await send({ e: "open", c: chart!.id });
    expect(await db.insightDay.aggregate({ _sum: { opens: true } })).toMatchObject({ _sum: { opens: 2 } });
    later(25);
    await openApp();
    await send({ e: "open", c: chart!.id });
    expect(await db.insightDay.aggregate({ _sum: { opens: true } })).toMatchObject({ _sum: { opens: 2 } });
  });
});

describe("when things go wrong", () => {
  it("keeps the admin working with the last known plan when Shopify can't be reached", async () => {
    await existingFreeShop();
    subscribe("Pro");
    await openApp();
    admin.graphql.mockImplementationOnce(async () => {
      throw new Error("network down");
    });
    later(1);
    expect((await openApp()).plan).toBe("pro");
  });

  it("retries a storefront update that failed after a plan change", async () => {
    await existingFreeShop();
    await seedCharts(3, "pro");
    subscribe("Pro");
    const original = admin.graphql.getMockImplementation()!;
    admin.graphql.mockImplementation(async (query: string, options?: { variables?: Record<string, unknown> }) => {
      if (query.includes("SizemateSetMetafields")) throw new Error("Shopify had a hiccup");
      return original(query, options);
    });
    await openApp(); // plan changes to Pro, the publish fails
    expect((await shops.getShop(world.shop)).publishError).toBeTruthy();
    expect((await storefront()).config.rules).toHaveLength(2);
    admin.graphql.mockImplementation(original);
    later(1);
    await reconcileShops(async () => admin);
    expect((await storefront()).config.rules).toHaveLength(3);
    expect((await shops.getShop(world.shop)).publishError).toBeNull();
  });

  it("handles the same webhook twice", async () => {
    await existingFreeShop();
    subscribe("Plus");
    for (let i = 0; i < 2; i++) await call(subscriptionsWebhook.action, req("/webhooks/app/subscriptions_update", { method: "POST" }));
    expect((await shops.getShop(world.shop)).plan).toBe("plus");
  });
});

describe("the developer override", () => {
  it("never applies in production", async () => {
    await existingFreeShop();
    vi.stubEnv("SIZEMATE_DEV_PLAN", "plus");
    vi.stubEnv("NODE_ENV", "production");
    expect((await openApp()).plan).toBe("free");
    vi.stubEnv("NODE_ENV", "development");
    later(1);
    expect((await openApp()).plan).toBe("plus");
    vi.unstubAllEnvs();
  });
});
