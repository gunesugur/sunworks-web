import { describe, expect, it } from "vitest";

import { BODY_MEASURE_KEYS } from "~/lib/measure-kinds";
import { MEASURES } from "~/lib/measures";

describe("measures", () => {
  it("keeps the storefront's body-measure list in step with MEASURES", () => {
    const body = MEASURES.filter((m) => m.kind === "body").map((m) => m.key);
    expect([...BODY_MEASURE_KEYS].sort()).toEqual([...body].sort());
  });

  it("has instructions for every measurement except 'other'", () => {
    for (const measure of MEASURES) {
      if (measure.key !== "other") expect(measure.howTo, measure.key).not.toBe("");
    }
  });
});
