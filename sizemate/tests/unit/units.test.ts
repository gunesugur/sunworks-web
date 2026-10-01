import { describe, expect, it } from "vitest";

import { convertCell, convertValue, dimensionOf, displayUnit, formatFeetInches, formatNumber, isLengthUnit, isWeightUnit, parseMeasurement, systemOf } from "~/lib/units";

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

describe("units v2: mm, kg, lb, feet and inches", () => {
  it("converts millimetres and keeps them whole", () => {
    expect(convertCell("16.5", "mm", "in")).toBe("0.6");
    expect(convertCell("2.5", "in", "mm")).toBe("64");
    expect(formatNumber(15.7, "mm")).toBe("16");
  });

  it("converts weights and refuses to mix dimensions", () => {
    expect(convertCell("14–16", "kg", "lb")).toBe("30.9–35.3");
    expect(convertCell("100", "lb", "kg")).toBe("45.4");
    expect(() => convertValue(1, "kg", "cm")).toThrow();
  });

  it("writes heights in feet and inches", () => {
    expect(formatFeetInches(67)).toBe("5′7″");
    expect(formatFeetInches(71.8)).toBe("6′0″");
    expect(convertCell("170", "cm", "in", { feetInches: true })).toBe("5′7″");
    expect(convertCell("160–170", "cm", "in", { feetInches: true })).toBe("5′3″–5′7″");
    expect(convertCell("66", "in", "in", { feetInches: true })).toBe("5′6″");
  });

  it("shows each system in the chart's own metric unit", () => {
    expect(displayUnit("cm", "metric")).toBe("cm");
    expect(displayUnit("mm", "metric")).toBe("mm");
    expect(displayUnit("in", "metric")).toBe("cm");
    expect(displayUnit("mm", "imperial")).toBe("in");
    expect(displayUnit("kg", "imperial")).toBe("lb");
    expect(displayUnit("lb", "metric")).toBe("kg");
  });

  it("knows each unit's dimension and system", () => {
    expect(dimensionOf("lb")).toBe("weight");
    expect(dimensionOf("mm")).toBe("length");
    expect(systemOf("in")).toBe("imperial");
    expect(systemOf("kg")).toBe("metric");
    expect(isLengthUnit("mm")).toBe(true);
    expect(isLengthUnit("kg")).toBe(false);
    expect(isWeightUnit("lb")).toBe(true);
  });
});
