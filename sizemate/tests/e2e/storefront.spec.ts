import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { chartFromTemplate, getTemplate } from "../../app/lib/templates";

import { openStore, womensChart } from "./storefront";

/** Waits for the dialog's opening animation to finish. */
async function settled(page: Page) {
  await page.getByRole("dialog").evaluate((dialog) => Promise.all(dialog.getAnimations().map((a) => a.finished)));
}

test.describe("placement", () => {
  test("the app embed puts the button before the buy buttons", async ({ page }) => {
    await openStore(page);
    const button = page.getByRole("button", { name: "Size chart" });
    await expect(button).toBeVisible();
    const order = await page.evaluate(() => {
      const trigger = document.querySelector("[data-sizemate]")!;
      const buttons = document.querySelector(".product-form__buttons")!;
      return trigger.compareDocumentPosition(buttons) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(order).toBeTruthy();
  });

  test("respects the other placements", async ({ page }) => {
    await openStore(page, { settings: { autoPlacement: "after_price" } });
    await expect(page.locator("#price-main + [data-sizemate]")).toBeVisible();
    await openStore(page, { settings: { autoPlacement: "after_variant_picker" } });
    await expect(page.locator("variant-radios + [data-sizemate]")).toBeVisible();
  });

  test("shows nothing when automatic placement is off", async ({ page }) => {
    await openStore(page, { settings: { autoPlacement: "off" } });
    await expect(page.getByRole("button", { name: "Size chart" })).toBeHidden();
  });

  test("the app block wins over the embed", async ({ page }) => {
    await openStore(page, { withBlock: true });
    await expect(page.locator("[data-sizemate]")).toHaveCount(1);
    await expect(page.locator("[data-sizemate]")).toHaveAttribute("data-sizemate-source", "block");
    await expect(page.getByRole("button", { name: "Size chart" })).toBeVisible();
  });
});

test.describe("dialog", () => {
  test("opens, closes with Escape and returns focus", async ({ page }) => {
    await openStore(page);
    const trigger = page.getByRole("button", { name: "Size chart" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Women's size chart" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("row")).toHaveCount(7);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes with the close button and the backdrop", async ({ page }) => {
    await openStore(page);
    const dialog = page.getByRole("dialog");
    await page.getByRole("button", { name: "Size chart" }).click();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Size chart" }).click();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
  });

  test("switches tabs with the keyboard", async ({ page }) => {
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    const tabs = page.getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "How to measure" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "How to measure" })).toBeFocused();
    await expect(page.getByText(/fullest part of your bust/)).toBeVisible();
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Find my size" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Size chart" })).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("units", () => {
  test("converts to inches and remembers the choice", async ({ page }) => {
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    const firstCell = page.locator("tbody td").first();
    await expect(firstCell).toHaveText("80–84");
    await page.getByRole("button", { name: "in", exact: true }).click();
    await expect(firstCell).toHaveText("31.5–33.1");
    await expect(page.locator("thead th").nth(1)).toContainText("(in)");
    await expect(page.getByRole("button", { name: "in", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await page.getByRole("button", { name: "Size chart" }).click();
    await expect(page.locator("tbody td").first()).toHaveText("31.5–33.1");
  });

  test("starts in inches for US shoppers", async ({ page }) => {
    await openStore(page, { country: "US" });
    await page.getByRole("button", { name: "Size chart" }).click();
    await expect(page.locator("tbody td").first()).toHaveText("31.5–33.1");
  });
});

test.describe("Fit Finder", () => {
  test("recommends a size, highlights it and selects the variant", async ({ page }) => {
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    await page.getByRole("tab", { name: "Find my size" }).click();
    await page.getByLabel("Bust").fill("90");
    await page.getByLabel("Waist").fill("72");
    await page.getByLabel("Hips").fill("96");
    await page.getByRole("button", { name: "Find my size" }).click();
    await expect(page.getByText("We recommend size M.")).toBeVisible();
    await expect(page.locator("tbody tr.is-recommended th")).toHaveText("M");
    await page.getByRole("button", { name: "Select size M" }).click();
    await expect(page.getByRole("button", { name: "Size M selected." })).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(page.locator("#size-M")).toBeChecked();
  });

  test("works in inches and explains in-between results", async ({ page }) => {
    await openStore(page, { country: "US" });
    await page.getByRole("button", { name: "Size chart" }).click();
    await page.getByRole("tab", { name: "Find my size" }).click();
    await expect(page.locator(".sizemate-field-suffix").first()).toHaveText("in");
    await page.getByLabel("Bust").fill("33.9"); // 86 cm: S
    await page.getByLabel("Hips").fill("39.4"); // 100 cm: L
    await page.getByRole("button", { name: "Find my size" }).click();
    await expect(page.getByText("You're between M and L. We recommend L.")).toBeVisible();
  });

  test("asks for a measurement when none is given", async ({ page }) => {
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    await page.getByRole("tab", { name: "Find my size" }).click();
    await page.getByRole("button", { name: "Find my size" }).click();
    await expect(page.getByText("Enter at least one measurement.")).toBeVisible();
  });
});

test.describe("layout", () => {
  test("becomes a bottom sheet on phones", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const box = await page.getByRole("dialog").boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y + box!.height)).toBe(844);
    expect(Math.round(box!.width)).toBe(390);
  });

  test("opens as a drawer on the right", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStore(page, { settings: { container: "drawer" } });
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const box = await page.getByRole("dialog").boundingBox();
    expect(Math.round(box!.x + box!.width)).toBe(1280);
    expect(Math.round(box!.height)).toBe(800);
  });
});

test.describe("theme matching", () => {
  test("uses the theme's fonts, colours and button colour", async ({ page }) => {
    await openStore(page, {
      themeCss: `body { font-family: Georgia, serif; font-size: 17px; } h1 { font-family: "Courier New", monospace; }
        [name='add'] { background: rgb(138, 43, 226); color: rgb(255, 255, 255); border-radius: 12px; }`,
    });
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const look = await page.evaluate(() => {
      const dialog = document.querySelector<HTMLElement>("[data-sizemate-dialog]")!;
      const title = document.querySelector<HTMLElement>(".sizemate-title")!;
      const tab = document.querySelector<HTMLElement>(".sizemate-tab[aria-selected='true']")!;
      return {
        font: getComputedStyle(dialog).fontFamily,
        size: getComputedStyle(dialog).fontSize,
        heading: getComputedStyle(title).fontFamily,
        accent: getComputedStyle(tab, "::after").backgroundColor,
        radius: getComputedStyle(dialog).borderTopLeftRadius,
      };
    });
    expect(look.font).toContain("Georgia");
    expect(look.size).toBe("17px");
    expect(look.heading).toContain("Courier New");
    expect(look.accent).toBe("rgb(138, 43, 226)");
    expect(look.radius).toBe("12px");
  });

  test("follows a dark theme and keeps the accent readable", async ({ page }) => {
    await openStore(page, { themeCss: "body { background: rgb(18, 18, 18); color: rgb(240, 240, 240); } [name='add'] { background: rgb(20, 20, 60); color: #fff; }" });
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const colours = await page.evaluate(() => {
      const dialog = document.querySelector<HTMLElement>("[data-sizemate-dialog]")!;
      const tab = document.querySelector<HTMLElement>(".sizemate-tab[aria-selected='true']")!;
      return { bg: getComputedStyle(dialog).backgroundColor, fg: getComputedStyle(dialog).color, accent: getComputedStyle(tab, "::after").backgroundColor };
    });
    expect(colours.bg).toBe("rgb(18, 18, 18)");
    expect(colours.fg).toBe("rgb(240, 240, 240)");
    // The navy button is unreadable on black, so the text colour takes over.
    expect(colours.accent).toBe("rgb(240, 240, 240)");
    const results = await new AxeBuilder({ page }).include("[data-sizemate]").withTags(["wcag2aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test("forces light or dark when the merchant asks", async ({ page }) => {
    await openStore(page, { settings: { colorMode: "dark" } });
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector("[data-sizemate-dialog]")!).backgroundColor);
    expect(bg).toBe("rgb(22, 22, 22)");
  });
});

test.describe("v2 features", () => {
  test("loads the runtime only when a shopper reaches for the chart", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(new URL(request.url()).pathname));
    await page.addInitScript(() => {
      // Hold back the idle prefetch so the test sees the on-demand load.
      (window as unknown as { requestIdleCallback: unknown }).requestIdleCallback = () => 0;
    });
    await openStore(page);
    await expect(page.getByRole("button", { name: "Size chart" })).toBeVisible();
    expect(requests).not.toContain("/assets/sizemate-runtime.js");
    await page.getByRole("button", { name: "Size chart" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(requests).toContain("/assets/sizemate-runtime.js");
  });

  test("shows heights in feet and inches and weights in pounds for US shoppers", async ({ page }) => {
    const kids = chartFromTemplate(getTemplate("kids-height-weight")!);
    await openStore(page, { charts: [kids], country: "US" });
    await page.getByRole("button", { name: "Size chart" }).click();
    const cells = page.locator("tbody tr").first().locator("td");
    await expect(cells.nth(1)).toHaveText("3′1″–3′3″");
    await expect(cells.nth(2)).toHaveText("30.9–35.3");
    await expect(page.locator("thead th").nth(2)).toContainText("(ft/in)");
    await expect(page.locator("thead th").nth(3)).toContainText("(lb)");
    await page.getByRole("button", { name: "cm · kg" }).click();
    await expect(cells.nth(1)).toHaveText("93–98");
  });

  test("lets shoppers enlarge the text and remembers it", async ({ page }) => {
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    const size = () => page.evaluate(() => getComputedStyle(document.querySelector("[data-sizemate-dialog]")!).fontSize);
    const before = Number.parseFloat(await size());
    await page.getByRole("button", { name: "Larger text" }).click();
    await expect(page.getByRole("button", { name: "Larger text" })).toHaveAttribute("aria-pressed", "true");
    expect(Number.parseFloat(await size())).toBeCloseTo(before * 1.2, 0);
    await page.reload();
    await page.getByRole("button", { name: "Size chart" }).click();
    await expect(page.getByRole("button", { name: "Larger text" })).toHaveAttribute("aria-pressed", "true");
  });

  test("highlights the row and column under the pointer", async ({ page }) => {
    await openStore(page);
    await page.getByRole("button", { name: "Size chart" }).click();
    await page.locator("tbody tr").nth(2).locator("td").nth(1).hover();
    await expect(page.locator("tbody tr").nth(2)).toHaveClass(/is-hover-row/);
    await expect(page.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveClass(/is-hover-col/);
  });

  test("opens in place with the inline container", async ({ page }) => {
    await openStore(page, { settings: { container: "inline" } });
    const trigger = page.getByRole("button", { name: "Size chart" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const region = page.getByRole("region", { name: "Women's size chart" }).first();
    await expect(region).toBeVisible();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("shows the figure beside the chart in the split layout on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStore(page, { settings: { arrangement: "split" } });
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const media = await page.locator(".sizemate-media").boundingBox();
    const table = await page.locator(".sizemate-table-wrap").boundingBox();
    expect(media && table && media.x + media.width <= table.x).toBeTruthy();
  });

  test("has no axe violations in every layout", async ({ page }) => {
    for (const settings of [{ arrangement: "stacked" as const }, { arrangement: "split" as const }, { preset: "contrast" as const, tableStyle: "grid" as const, headerStyle: "solid" as const }]) {
      await openStore(page, { settings });
      await page.getByRole("button", { name: "Size chart" }).click();
      await settled(page);
      const results = await new AxeBuilder({ page }).include("[data-sizemate]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => `${JSON.stringify(settings)} ${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    }
  });
});

test.describe("accessibility", () => {
  for (const tab of ["Size chart", "How to measure", "Find my size"]) {
    test(`has no axe violations on the "${tab}" tab`, async ({ page }) => {
      await openStore(page);
      await page.getByRole("button", { name: "Size chart" }).click();
      await page.getByRole("tab", { name: tab }).click();
      await settled(page);
      const results = await new AxeBuilder({ page })
        .include("[data-sizemate]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    });
  }

  test("the button has no violations on the page", async ({ page }) => {
    await openStore(page, { charts: [womensChart()], settings: { buttonStyle: "outline" } });
    const results = await new AxeBuilder({ page }).include("[data-sizemate]").analyze();
    expect(results.violations).toEqual([]);
  });
});
