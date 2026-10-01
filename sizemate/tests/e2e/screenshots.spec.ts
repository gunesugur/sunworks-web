import { test, type Page } from "@playwright/test";

import { PRESETS, type PresetId } from "../../app/lib/settings";
import { chartFromTemplate, getTemplate } from "../../app/lib/templates";

import { openStore } from "./storefront";

const presetValues = (id: PresetId) => ({ ...PRESETS.find((p) => p.id === id)!.values, preset: id });

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
  await openStore(page, { locale: "de", settings: { container: "drawer", buttonStyle: "outline", icon: "tape" } });
  await page.getByRole("button", { name: "Größentabelle" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/storefront-drawer-de.png` });
});

const LIGHT_THEME = `body { font-family: "Helvetica Neue", Arial, sans-serif; background: #fbfaf7; color: #1d1d1b; }
  h1 { font-family: Georgia, serif; font-weight: 400; } [name='add'] { background: #1d1d1b; color: #fff; border: 0; border-radius: 4px; padding: 12px 24px; }`;
const DARK_THEME = `body { font-family: "Helvetica Neue", Arial, sans-serif; background: #111111; color: #ededed; }
  h1 { font-family: Georgia, serif; font-weight: 400; } [name='add'] { background: #e7dcc6; color: #111; border: 0; border-radius: 999px; padding: 12px 24px; }`;

test("v2 design variants", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  const shots: [string, Parameters<typeof openStore>[1]][] = [
    ["v2-theme-light", { themeCss: LIGHT_THEME }],
    ["v2-theme-dark", { themeCss: DARK_THEME }],
    ["v2-split", { themeCss: LIGHT_THEME, settings: { arrangement: "split" } }],
    ["v2-boutique", { themeCss: LIGHT_THEME, settings: { ...presetValues("boutique") } }],
    ["v2-bold", { themeCss: LIGHT_THEME, settings: { ...presetValues("bold"), accentColor: "#1f4fd8" } }],
    ["v2-soft", { themeCss: LIGHT_THEME, settings: { ...presetValues("soft"), accentColor: "#7c5cd6" } }],
    ["v2-contrast", { themeCss: LIGHT_THEME, settings: { ...presetValues("contrast") } }],
    ["v2-editorial-dark", { themeCss: DARK_THEME, settings: { ...presetValues("editorial"), arrangement: "split" } }],
  ];
  for (const [name, options] of shots) {
    await openStore(page, options);
    await page.getByRole("button", { name: "Size chart" }).click();
    await settle(page);
    await page.screenshot({ path: `${dir}/${name}.png` });
  }
  await openStore(page, { themeCss: LIGHT_THEME });
  await page.getByRole("button", { name: "Size chart" }).click();
  await page.getByRole("tab", { name: "How to measure" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/v2-guide.png` });
  await openStore(page, { themeCss: LIGHT_THEME, country: "US", charts: [chartFromTemplate(getTemplate("kids-height-weight")!)] });
  await page.getByRole("button", { name: "Size chart" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/v2-imperial.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await openStore(page, { themeCss: DARK_THEME, settings: { arrangement: "split" } });
  await page.getByRole("button", { name: "Size chart" }).click();
  await settle(page);
  await page.screenshot({ path: `${dir}/v2-mobile-dark.png` });
});
