import { test, type Page } from "@playwright/test";

import { openStore } from "./storefront";

// Documentation screenshots: SCREENSHOTS=1 npx playwright test screenshots
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to refresh docs/screenshots");

const dir = "docs/screenshots";

async function settle(page: Page) {
  await page.getByRole("dialog").evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished)));
}

test("storefront screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 820 });
  await openStore(page, { settings: { buttonStyle: "link" } });
  await page.screenshot({ path: `${dir}/storefront-button.png`, clip: { x: 0, y: 0, width: 560, height: 330 } });

  await page.getByRole("button", { name: "Size chart" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/storefront-chart.png` });

  await page.getByRole("tab", { name: "How to measure" }).click();
  await page.screenshot({ path: `${dir}/storefront-guide.png` });

  await page.getByRole("tab", { name: "Find my size" }).click();
  await page.getByLabel("Bust").fill("90");
  await page.getByLabel("Waist").fill("72");
  await page.getByLabel("Hips").fill("96");
  await page.getByRole("button", { name: "Find my size" }).click();
  await page.screenshot({ path: `${dir}/storefront-fit-finder.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "Size chart" }).click();
  await page.screenshot({ path: `${dir}/storefront-mobile.png` });
});

test("storefront in German, drawer layout", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 820 });
  await openStore(page, { locale: "de", settings: { layout: "drawer", buttonStyle: "outline", icon: "tape" } });
  await page.getByRole("button", { name: "Größentabelle" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/storefront-drawer-de.png` });
});
