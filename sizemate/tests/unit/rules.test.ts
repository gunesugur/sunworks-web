import { describe, expect, it } from "vitest";

import { matchChart, numericId, type ProductFacts, type PublishedRule } from "~/lib/rules";

const rule = (c: string, patch: Partial<PublishedRule> = {}): PublishedRule => ({
  c, all: false, p: [], col: [], ty: [], ve: [], tg: [], ...patch,
});
const product = (patch: Partial<ProductFacts> = {}): ProductFacts => ({
  id: "1", type: "", vendor: "", tags: [], collectionIds: [], ...patch,
});

describe("matchChart", () => {
  it("returns null when nothing applies", () => {
    expect(matchChart([], product())).toBeNull();
    expect(matchChart([rule("a", { tg: ["x"] })], product())).toBeNull();
  });

  it("uses the all-products chart as a fallback", () => {
    expect(matchChart([rule("all", { all: true })], product())).toBe("all");
  });

  it("prefers a directly assigned product over conditions over the fallback", () => {
    const rules = [rule("all", { all: true }), rule("tag", { tg: ["summer"] }), rule("direct", { p: ["1"] })];
    expect(matchChart(rules, product({ tags: ["Summer"] }))).toBe("direct");
    expect(matchChart(rules, product({ id: "2", tags: ["Summer"] }))).toBe("tag");
    expect(matchChart(rules, product({ id: "2" }))).toBe("all");
  });

  it("breaks ties by list order", () => {
    const rules = [rule("first", { col: ["10"] }), rule("second", { tg: ["x"] })];
    expect(matchChart(rules, product({ collectionIds: ["10"], tags: ["x"] }))).toBe("first");
    expect(matchChart([rule("a", { all: true }), rule("b", { all: true })], product())).toBe("a");
  });

  it("matches type, vendor and tags case-insensitively", () => {
    const rules = [rule("t", { ty: ["t-shirts"] }), rule("v", { ve: ["acme"] })];
    expect(matchChart(rules, product({ type: "T-Shirts" }))).toBe("t");
    expect(matchChart(rules, product({ vendor: "ACME" }))).toBe("v");
  });

  it("never matches an empty type or vendor", () => {
    expect(matchChart([rule("t", { ty: [""] })], product({ type: "" }))).toBeNull();
  });
});

describe("numericId", () => {
  it("extracts the id", () => {
    expect(numericId("gid://shopify/Collection/42")).toBe("42");
  });
});
