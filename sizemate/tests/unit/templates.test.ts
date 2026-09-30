import { describe, expect, it } from "vitest";

import { validateChart } from "~/lib/chart";
import { PLANS } from "~/lib/plans";
import { chartFromTemplate, TEMPLATES } from "~/lib/templates";
import { parseMeasurement } from "~/lib/units";

describe("templates", () => {
  it.each(TEMPLATES.map((t) => [t.key, t] as const))("%s produces a valid chart", (_key, template) => {
    const result = validateChart(chartFromTemplate(template));
    expect(result.ok, result.ok ? "" : result.errors.join("; ")).toBe(true);
  });

  it.each(TEMPLATES.map((t) => [t.key, t] as const))("%s has a value for every cell and parseable measurements", (_key, template) => {
    for (const row of template.rows) {
      if (template.key === "blank") continue;
      expect(row).toHaveLength(template.columns.length);
      template.columns.forEach((column, index) => {
        if (column.kind === "measure") expect(parseMeasurement(row[index]!), `${template.key} ${row[0]}`).not.toBeNull();
      });
    }
  });

  it("measurement ranges grow with the size", () => {
    for (const template of TEMPLATES) {
      template.columns.forEach((column, index) => {
        if (column.kind !== "measure") return;
        const mins = template.rows.map((row) => parseMeasurement(row[index] ?? "")?.min).filter((v) => v !== undefined);
        expect([...mins].sort((a, b) => a! - b!), `${template.key} ${column.label}`).toEqual(mins);
      });
    }
  });

  it("keys are unique", () => {
    expect(new Set(TEMPLATES.map((t) => t.key)).size).toBe(TEMPLATES.length);
  });

  it("matches the template count advertised on the Free plan", () => {
    const readyMade = TEMPLATES.filter((t) => t.key !== "blank").length;
    expect(PLANS.free.highlights).toContain(`${readyMade} ready-made templates`);
  });

  it("enables the Fit Finder only where body measurements exist", () => {
    const byKey = Object.fromEntries(TEMPLATES.map((t) => [t.key, chartFromTemplate(t)]));
    expect(byKey["womens-tops"]!.fitFinder).toBe(true);
    expect(byKey["tshirt-flat"]!.fitFinder).toBe(false);
  });
});
