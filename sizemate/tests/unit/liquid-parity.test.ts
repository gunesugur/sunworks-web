import { describe, expect, it } from "vitest";

import { emptyAssignment, type SizeChart } from "~/lib/chart";
import { buildPublication } from "~/lib/publish";
import { matchChart, type ProductFacts } from "~/lib/rules";
import { DEFAULT_SETTINGS } from "~/lib/settings";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

import { createEngine, renderSnippet, type StorefrontProduct } from "../helpers/liquid";

// Small deterministic PRNG so failures are reproducible.
function random(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const TYPES = ["T-Shirts", "Jeans", "Shoes", "", "Hats"];
const VENDORS = ["Acme", "Nordic", "", "Sol"];
const TAGS = ["summer", "Sale", "kids", "Organic", "new"];
const COLLECTIONS = [101, 102, 103, 104];

function pick<T>(rand: () => number, values: T[], max: number): T[] {
  return values.filter(() => rand() < max / values.length);
}

function randomCase(rand: () => number, value: string): string {
  return rand() < 0.3 ? value.toUpperCase() : rand() < 0.5 ? value.toLowerCase() : value;
}

function randomCharts(rand: () => number): SizeChart[] {
  const count = 1 + Math.floor(rand() * 4);
  return Array.from({ length: count }, (_, index) => {
    const chart = chartFromTemplate(getTemplate("womens-tops")!);
    chart.title = `Chart ${index}`;
    if (rand() < 0.25) chart.status = "draft";
    if (rand() < 0.3) return chart; // all products
    chart.assignment = {
      ...emptyAssignment("conditions"),
      products: rand() < 0.3 ? [{ id: `gid://shopify/Product/${1 + Math.floor(rand() * 3)}`, title: "P" }] : [],
      collections: pick(rand, COLLECTIONS, 1).map((id) => ({ id: `gid://shopify/Collection/${id}`, title: "C" })),
      productTypes: pick(rand, TYPES.filter(Boolean), 1).map((v) => randomCase(rand, v)),
      vendors: pick(rand, VENDORS.filter(Boolean), 1).map((v) => randomCase(rand, v)),
      tags: pick(rand, TAGS, 1.5).map((v) => randomCase(rand, v)),
    };
    return chart;
  });
}

function randomProduct(rand: () => number): StorefrontProduct {
  return {
    id: 1 + Math.floor(rand() * 4),
    type: randomCase(rand, TYPES[Math.floor(rand() * TYPES.length)]!),
    vendor: randomCase(rand, VENDORS[Math.floor(rand() * VENDORS.length)]!),
    tags: pick(rand, TAGS, 2).map((t) => randomCase(rand, t)),
    collections: pick(rand, COLLECTIONS, 1.5).map((id) => ({ id })),
  };
}

function facts(product: StorefrontProduct): ProductFacts {
  return {
    id: String(product.id),
    type: product.type,
    vendor: product.vendor,
    tags: product.tags,
    collectionIds: product.collections.map((c) => String(c.id)),
  };
}

function renderedChart(html: string): string | null {
  return /data-chart="([^"]+)"/.exec(html)?.[1] ?? null;
}

describe("Liquid matching agrees with rules.ts", () => {
  const engine = createEngine();

  it("on 400 random shops and products", async () => {
    const rand = random(20260930);
    let matched = 0;
    for (let i = 0; i < 400; i++) {
      const charts = randomCharts(rand);
      const publication = buildPublication(charts, DEFAULT_SETTINGS, "plus");
      const product = randomProduct(rand);
      const expected = matchChart(publication.config.rules, facts(product));
      const actual = renderedChart(await renderSnippet(engine, { publication, product }));
      expect(actual, `case ${i}: ${JSON.stringify({ rules: publication.config.rules, product })}`).toBe(expected);
      if (expected) matched++;
    }
    // Make sure the fuzzing exercises both outcomes.
    expect(matched).toBeGreaterThan(100);
    expect(matched).toBeLessThan(400);
  });

  it("renders nothing without a config, a product or a match", async () => {
    const product = randomProduct(random(1));
    expect(renderedChart(await renderSnippet(engine, { publication: null, product }))).toBeNull();
    const publication = buildPublication([chartFromTemplate(getTemplate("hats")!)], DEFAULT_SETTINGS, "free");
    expect(renderedChart(await renderSnippet(engine, { publication, product: null }))).toBeNull();
  });
});
