import { describe, expect, it } from "vitest";

import { validateChart } from "~/lib/chart";
import { isBodyMeasure } from "~/lib/measures";
import { PLANS } from "~/lib/plans";
import {
  chartFromTemplate,
  ESSENTIAL_COUNT,
  getTemplate,
  templateAllowed,
  TEMPLATE_GROUPS,
  TEMPLATES,
} from "~/lib/templates";
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

  // Regular and tall lengths repeat the chest range, so sizes aren't in one order.
  const MIXED_ORDER = new Set(["mens-big-tall"]);

  it("body measurements grow with the size (the Fit Finder relies on it)", () => {
    for (const template of TEMPLATES) {
      if (MIXED_ORDER.has(template.key)) continue;
      template.columns.forEach((column, index) => {
        if (column.kind !== "measure" || !column.measure || !isBodyMeasure(column.measure)) return;
        const mins = template.rows.map((row) => parseMeasurement(row[index] ?? "")?.min).filter((v) => v !== undefined);
        expect([...mins].sort((a, b) => a! - b!), `${template.key} ${column.label}`).toEqual(mins);
      });
    }
  });

  it("keys are unique", () => {
    expect(new Set(TEMPLATES.map((t) => t.key)).size).toBe(TEMPLATES.length);
  });

  it("matches the template counts advertised on the plans", () => {
    const essentials = ESSENTIAL_COUNT - 1; // the blank chart isn't a template to advertise
    const readyMade = TEMPLATES.filter((t) => t.key !== "blank").length;
    expect(PLANS.free.highlights).toContain(`${essentials} essential templates`);
    expect(PLANS.pro.highlights.some((h) => h.includes(`the full library: ${readyMade} templates`))).toBe(true);
  });

  it("covers every group, with essentials for the main kinds of products", () => {
    for (const group of TEMPLATE_GROUPS) expect(TEMPLATES.some((t) => t.group === group), group).toBe(true);
    const essentialGroups = new Set(TEMPLATES.filter((t) => t.essential).map((t) => t.group));
    for (const group of ["Women", "Men", "Kids & baby", "Footwear", "Start fresh"] as const) expect(essentialGroups.has(group), group).toBe(true);
  });

  it("gates the full library on Pro and keeps essentials free", () => {
    expect(templateAllowed("free", getTemplate("womens-tops")!)).toBe(true);
    expect(templateAllowed("free", getTemplate("blank")!)).toBe(true);
    expect(templateAllowed("free", getTemplate("bras-cup")!)).toBe(false);
    expect(templateAllowed("pro", getTemplate("bras-cup")!)).toBe(true);
  });


  it("enables the Fit Finder only where body measurements exist", () => {
    const byKey = Object.fromEntries(TEMPLATES.map((t) => [t.key, chartFromTemplate(t)]));
    expect(byKey["womens-tops"]!.fitFinder).toBe(true);
    expect(byKey["tshirt-flat"]!.fitFinder).toBe(false);
  });
});
