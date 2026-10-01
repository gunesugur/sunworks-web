import { describe, expect, it } from "vitest";

import { dayOf, parseEvent, summarize } from "~/lib/insights";

describe("insights", () => {
  it("accepts only well-formed, anonymous events", () => {
    expect(parseEvent('{"e":"open","c":"c_abc123"}')).toEqual({ type: "open", chartId: "c_abc123" });
    expect(parseEvent('{"e":"fit","c":"c_abc123","s":" M ","st":"exact"}')).toEqual({ type: "fit", chartId: "c_abc123", size: "M", status: "exact" });
    for (const bad of ["", "nope", "null", '{"e":"open"}', '{"e":"open","c":"../x"}', '{"e":"fit","c":"c_abc123","st":"exact"}', '{"e":"fit","c":"c_abc123","s":"M","st":"weird"}', '{"e":"buy","c":"c_abc123"}', "x".repeat(600)]) {
      expect(parseEvent(bad), bad).toBeNull();
    }
  });

  it("uses UTC days", () => {
    expect(dayOf(new Date("2026-10-01T23:30:00Z"))).toBe("2026-10-01");
  });

  it("adds up days and hints when shoppers fall outside the chart", () => {
    const rows = [
      { chartId: "c_a1b2", day: "2026-09-30", opens: 40, fits: 15, above: 3, below: 0, sizes: '{"M":10,"L":5}' },
      { chartId: "c_a1b2", day: "2026-10-01", opens: 30, fits: 10, above: 2, below: 0, sizes: '{"L":6,"XL":4}' },
      { chartId: "c_c3d4", day: "2026-10-01", opens: 80, fits: 1, above: 0, below: 0, sizes: "broken" },
    ];
    const { totals, charts } = summarize(rows);
    expect(totals).toEqual({ opens: 150, fits: 26 });
    expect(charts[0]!.chartId).toBe("c_c3d4");
    expect(charts[0]!.hints[0]).toMatch(/Few shoppers use the Fit Finder/);
    const a = charts[1]!;
    expect(a.sizes).toEqual([
      { size: "L", count: 11 },
      { size: "M", count: 10 },
      { size: "XL", count: 4 },
    ]);
    expect(a.hints).toEqual(["20% of shoppers measured above your largest size. A bigger size could win sales."]);
  });

  it("stays quiet with too little data", () => {
    const { charts } = summarize([{ chartId: "c_a1b2", day: "2026-10-01", opens: 3, fits: 2, above: 2, below: 0, sizes: "{}" }]);
    expect(charts[0]!.hints).toEqual([]);
  });
});
