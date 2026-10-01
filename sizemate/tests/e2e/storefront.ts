import { readFileSync } from "node:fs";

import type { Page } from "@playwright/test";

import { emptyAssignment, type SizeChart } from "../../app/lib/chart";
import { buildPublication } from "../../app/lib/publish";
import { DEFAULT_SETTINGS, type AppearanceSettings } from "../../app/lib/settings";
import { chartFromTemplate, getTemplate } from "../../app/lib/templates";
import { createEngine, EXTENSION_DIR, renderBlock, type StorefrontProduct } from "../helpers/liquid";

export const PRODUCT: StorefrontProduct = { id: 1, title: "Linen dress", type: "Dresses", vendor: "Acme", tags: [], collections: [] };
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export interface StoreOptions {
  plan?: "free" | "pro" | "plus";
  settings?: Partial<AppearanceSettings>;
  charts?: SizeChart[];
  /** Also place the app block inside the product section. */
  withBlock?: boolean;
  withEmbed?: boolean;
  country?: string;
  locale?: string;
  /** Extra CSS standing in for the theme's own styles. */
  themeCss?: string;
}

export function womensChart(): SizeChart {
  const chart = chartFromTemplate(getTemplate("womens-tops")!);
  chart.assignment = emptyAssignment("all");
  return chart;
}

/** A small Dawn-like product page. */
export async function productPage(options: StoreOptions = {}): Promise<string> {
  const publication = buildPublication(options.charts ?? [womensChart()], { ...DEFAULT_SETTINGS, ...options.settings }, options.plan ?? "plus");
  const engine = createEngine(options.locale === "de" ? "de" : "en.default");
  const context = { publication, product: PRODUCT, country: options.country ?? "DE", locale: options.locale ?? "en" };
  const block = options.withBlock ? await renderBlock(engine, "size-chart", context) : "";
  const embed = options.withEmbed === false ? "" : await renderBlock(engine, "sizemate-embed", context);
  const radios = SIZES.map(
    (size) => `<input type="radio" id="size-${size}" name="Size" value="${size}"><label for="size-${size}">${size}</label>`,
  ).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${PRODUCT.title}</title>
  <link rel="stylesheet" href="/assets/sizemate.css">
  <style>body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #121212; } main { max-width: 480px; }</style>
  <style>${options.themeCss ?? ""}</style>
</head>
<body>
  <main>
    <section class="shopify-section" id="shopify-section-main-product">
      <product-info>
        <h1>${PRODUCT.title}</h1>
        <div class="price" id="price-main"><span>€49,00</span></div>
        <variant-radios><fieldset><legend>Size</legend>${radios}</fieldset></variant-radios>
        ${block}
        <form action="/cart/add" method="post">
          <div class="product-form__buttons"><button type="submit" name="add">Add to cart</button></div>
        </form>
      </product-info>
    </section>
  </main>
  ${embed}
  <script src="/assets/sizemate.js" defer></script>
</body>
</html>`;
}

export async function openStore(page: Page, options: StoreOptions = {}): Promise<void> {
  const html = await productPage(options);
  await page.route("https://shop.test/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/assets/")) {
      const name = url.pathname.slice("/assets/".length);
      const type = name.endsWith(".css") ? "text/css" : name.endsWith(".js") ? "text/javascript" : "image/svg+xml";
      await route.fulfill({ body: readFileSync(`${EXTENSION_DIR}assets/${name}`), contentType: type });
    } else if (url.pathname.startsWith("/cart/add")) {
      await route.fulfill({ status: 204 });
    } else {
      await route.fulfill({ body: html, contentType: "text/html" });
    }
  });
  await page.goto("https://shop.test/products/linen-dress");
}
