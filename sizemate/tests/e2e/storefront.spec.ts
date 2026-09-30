import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

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
    await openStore(page, { settings: { layout: "drawer" } });
    await page.getByRole("button", { name: "Size chart" }).click();
    await settled(page);
    const box = await page.getByRole("dialog").boundingBox();
    expect(Math.round(box!.x + box!.width)).toBe(1280);
    expect(Math.round(box!.height)).toBe(800);
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
