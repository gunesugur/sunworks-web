import { describe, expect, it } from "vitest";

import { convertCell, convertValue, formatNumber, parseMeasurement } from "~/lib/units";

describe("parseMeasurement", () => {
  it.each([
    ["86", { min: 86, max: 86 }],
    ["86.5", { min: 86.5, max: 86.5 }],
    ["86,5", { min: 86.5, max: 86.5 }],
    ["86-91", { min: 86, max: 91 }],
    ["86 – 91", { min: 86, max: 91 }],
    ["86—91", { min: 86, max: 91 }],
    ["86 to 91", { min: 86, max: 91 }],
    ["91-86", { min: 86, max: 91 }],
    [" 22,9 ", { min: 22.9, max: 22.9 }],
  ])("parses %j", (raw, expected) => {
    expect(parseMeasurement(raw)).toEqual(expected);
  });

  it.each(["", "S", "EU 38", "32/34", "one size", "-", "86-"])("returns null for text %j", (raw) => {
    expect(parseMeasurement(raw)).toBeNull();
  });
});

describe("conversion", () => {
  it("round-trips without drift", () => {
    expect(convertValue(convertValue(86, "cm", "in"), "in", "cm")).toBeCloseTo(86, 10);
  });

  it("converts ranges and single values", () => {
    expect(convertCell("86–91", "cm", "in")).toBe("33.9–35.8");
    expect(convertCell("34", "in", "cm")).toBe("86.4");
    expect(convertCell("25.4", "cm", "in")).toBe("10");
  });

  it("keeps the merchant's own formatting in the chart's unit", () => {
    expect(convertCell("86 - 91", "cm", "cm")).toBe("86 - 91");
  });

  it("leaves text cells untouched", () => {
    expect(convertCell("EU 38", "cm", "in")).toBe("EU 38");
  });

  it("formats with at most one decimal", () => {
    expect(formatNumber(33.858)).toBe("33.9");
    expect(formatNumber(34.0000001)).toBe("34");
  });
});
