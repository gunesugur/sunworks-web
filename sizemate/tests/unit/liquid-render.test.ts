// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { emptyAssignment } from "~/lib/chart";
import { buildPublication } from "~/lib/publish";
import { DEFAULT_SETTINGS, type AppearanceSettings } from "~/lib/settings";
import { chartFromTemplate, getTemplate } from "~/lib/templates";

import { createEngine, renderBlock, renderSnippet, type StorefrontProduct } from "../helpers/liquid";

const product: StorefrontProduct = { id: 7, type: "Dresses", vendor: "Acme", tags: [], collections: [{ id: 1 }] };

function publication(options: { plan?: "free" | "pro" | "plus"; settings?: Partial<AppearanceSettings>; key?: string } = {}) {
  const chart = chartFromTemplate(getTemplate(options.key ?? "womens-tops")!);
  chart.translations = {
    de: { title: "Damengrößen", note: "Im Zweifel größer wählen.", columns: { [chart.columns[1]!.id]: "Brustumfang" } },
  };
  return buildPublication([chart], { ...DEFAULT_SETTINGS, ...options.settings }, options.plan ?? "plus");
}

function parse(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
}

describe("sizemate-core.liquid", () => {
  const en = createEngine();

  it("renders the button, the table and every tab on Plus", async () => {
    const dom = parse(await renderSnippet(en, { publication: publication(), product }));
    expect(dom.querySelector(".sizemate-trigger")?.textContent?.trim()).toBe("Size chart");
    expect(dom.querySelector(".sizemate-title")?.textContent).toBe("Women's size chart");
    expect([...dom.querySelectorAll("thead th")].map((th) => th.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "Size",
      "Bust (cm)",
      "Waist (cm)",
      "Hips (cm)",
    ]);
    expect(dom.querySelectorAll("tbody tr")).toHaveLength(6);
    expect(dom.querySelector("tbody td")?.getAttribute("data-raw")).toBe("80–84");
    expect([...dom.querySelectorAll("[data-sizemate-tab]")].map((t) => t.textContent)).toEqual([
      "Size chart",
      "How to measure",
      "Find my size",
    ]);
    expect(dom.querySelector(".sizemate-howto dd")?.textContent).toMatch(/fullest part of your bust/);
    expect(dom.querySelector(".sizemate-diagram")?.getAttribute("src")).toBe("/assets/diagram-torso.svg");
    expect(dom.querySelector(".sizemate-footer")).toBeNull();
  });

  it("hides the Fit Finder and shows branding on Free", async () => {
    const dom = parse(await renderSnippet(en, { publication: publication({ plan: "free" }), product }));
    expect(dom.querySelector("[data-sizemate-panel='fit']")).toBeNull();
    expect(dom.querySelector(".sizemate-footer a")?.textContent).toBe("Powered by Sizemate");
  });

  it("uses no tabs when there is only the table", async () => {
    const pub = publication({ plan: "free", key: "tshirt-flat" });
    Object.values(pub.charts)[0]!.guide.on = false;
    const dom = parse(await renderSnippet(en, { publication: pub, product }));
    expect(dom.querySelector("[role='tablist']")).toBeNull();
    expect(dom.querySelector("[data-sizemate-panel='chart']")?.hasAttribute("role")).toBe(false);
  });

  it("applies appearance settings", async () => {
    const dom = parse(
      await renderSnippet(en, {
        publication: publication({
          settings: { buttonLabel: "Find your fit", buttonStyle: "filled", alignment: "center", accentColor: "#aa0000", layout: "drawer", icon: "none" },
        }),
        product,
      }),
    );
    const root = dom.querySelector<HTMLElement>("[data-sizemate]")!;
    expect(root.className).toContain("sizemate--align-center");
    expect(root.getAttribute("style")).toContain("--sizemate-accent: #aa0000");
    expect(dom.querySelector(".sizemate-trigger")?.className).toContain("sizemate-trigger--filled");
    expect(dom.querySelector(".sizemate-trigger")?.textContent?.trim()).toBe("Find your fit");
    expect(dom.querySelector(".sizemate-icon")).toBeNull();
    expect(dom.querySelector("dialog")?.className).toContain("sizemate-dialog--drawer");
  });

  it("picks inches for US shoppers and centimetres elsewhere", async () => {
    const us = parse(await renderSnippet(en, { publication: publication(), product, country: "US" }));
    const de = parse(await renderSnippet(en, { publication: publication(), product, country: "DE" }));
    expect(us.querySelector("[data-sizemate]")?.getAttribute("data-default-unit")).toBe("in");
    expect(de.querySelector("[data-sizemate]")?.getAttribute("data-default-unit")).toBe("cm");
    const fixed = parse(await renderSnippet(en, { publication: publication({ settings: { defaultUnit: "cm" } }), product, country: "US" }));
    expect(fixed.querySelector("[data-sizemate]")?.getAttribute("data-default-unit")).toBe("cm");
  });

  it("shows the merchant's translations and translated interface text", async () => {
    const de = createEngine("de");
    const dom = parse(await renderSnippet(de, { publication: publication(), product, locale: "de" }));
    expect(dom.querySelector(".sizemate-title")?.textContent).toBe("Damengrößen");
    expect(dom.querySelector(".sizemate-note")?.textContent).toBe("Im Zweifel größer wählen.");
    expect(dom.querySelectorAll("thead th")[1]?.textContent).toContain("Brustumfang");
    expect(dom.querySelector(".sizemate-trigger")?.textContent?.trim()).toBe("Größentabelle");
    expect(dom.querySelector("[data-sizemate-tab='fit']")?.textContent).toBe("Meine Größe finden");
  });

  it("falls back from a regional locale to the language", async () => {
    const dom = parse(await renderSnippet(en, { publication: publication(), product, locale: "de-CH" }));
    expect(dom.querySelector(".sizemate-title")?.textContent).toBe("Damengrößen");
  });

  it("escapes merchant content", async () => {
    const chart = chartFromTemplate(getTemplate("hats")!);
    chart.title = '<img src=x onerror="alert(1)">';
    chart.rows[0]!.cells[chart.columns[0]!.id] = "<script>alert(1)</script>";
    chart.note = '"><svg onload=alert(1)>';
    const dom = parse(await renderSnippet(en, { publication: buildPublication([chart], DEFAULT_SETTINGS, "plus"), product }));
    expect(dom.querySelector("script, img[onerror], svg[onload]")).toBeNull();
    expect(dom.querySelector(".sizemate-title")?.textContent).toBe('<img src=x onerror="alert(1)">');
  });

  it("explains a missing chart in the theme editor only", async () => {
    const chart = chartFromTemplate(getTemplate("hats")!);
    chart.assignment = { ...emptyAssignment("conditions"), tags: ["never"] };
    const pub = buildPublication([chart], DEFAULT_SETTINGS, "plus");
    const editor = await renderSnippet(en, { publication: pub, product, designMode: true });
    expect(editor).toContain("no size chart is assigned");
    expect((await renderSnippet(en, { publication: pub, product })).trim()).toBe("");
    expect((await renderSnippet(en, { publication: pub, product, designMode: true }, "embed")).trim()).toBe("");
  });

  it("renders the app embed hidden, and only on product pages", async () => {
    const dom = parse(await renderBlock(en, "sizemate-embed", { publication: publication(), product }));
    const root = dom.querySelector<HTMLElement>("[data-sizemate]")!;
    expect(root.getAttribute("data-sizemate-source")).toBe("embed");
    expect(root.hidden).toBe(true);
    expect((await renderBlock(en, "sizemate-embed", { publication: publication(), product: null })).trim()).toBe("");
  });

  it("renders the app block", async () => {
    const dom = parse(await renderBlock(en, "size-chart", { publication: publication(), product }));
    expect(dom.querySelector("[data-sizemate]")?.getAttribute("data-sizemate-source")).toBe("block");
  });
});

describe("theme extension files", () => {
  it("has every translation key in every language", async () => {
    const { loadLocale } = await import("../helpers/liquid");
    const keys = (node: unknown, prefix = ""): string[] =>
      typeof node === "object" && node !== null
        ? Object.entries(node).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
        : [prefix.slice(0, -1)];
    const reference = keys(loadLocale("en.default")).sort();
    for (const locale of ["de", "fr", "es", "it", "nl", "pt-BR", "tr"]) {
      expect(keys(loadLocale(locale)).sort(), locale).toEqual(reference);
    }
  });

  it("stays under Shopify's 100 KB Liquid limit", async () => {
    const { readdirSync, statSync } = await import("node:fs");
    const { EXTENSION_DIR } = await import("../helpers/liquid");
    let total = 0;
    for (const dir of ["blocks", "snippets"]) {
      for (const file of readdirSync(`${EXTENSION_DIR}${dir}`)) total += statSync(`${EXTENSION_DIR}${dir}/${file}`).size;
    }
    expect(total).toBeLessThan(100_000);
  });
});
