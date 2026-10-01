import { describe, expect, it } from "vitest";

import { contrast, luminance, parseColor, toCss } from "~/storefront/theme";

describe("theme colour helpers", () => {
  it("parses the colours browsers report", () => {
    expect(parseColor("rgb(18, 18, 18)")).toEqual([18, 18, 18, 255]);
    expect(parseColor("rgba(0, 0, 0, 0)")).toEqual([0, 0, 0, 0]);
    expect(parseColor("rgb(255 255 255 / 50%)")).toEqual([255, 255, 255, 128]);
    expect(parseColor("transparent")).toEqual([0, 0, 0, 0]);
  });

  it("measures contrast like WCAG", () => {
    expect(contrast([0, 0, 0, 255], [255, 255, 255, 255])).toBeCloseTo(21, 0);
    expect(contrast([255, 255, 255, 255], [255, 255, 255, 255])).toBe(1);
    expect(luminance([255, 255, 255, 255])).toBeCloseTo(1, 5);
  });

  it("writes CSS colours", () => {
    expect(toCss([10, 20, 30, 255])).toBe("rgb(10 20 30)");
    expect(toCss([10, 20, 30, 128])).toBe("rgb(10 20 30 / 0.5)");
  });
});
