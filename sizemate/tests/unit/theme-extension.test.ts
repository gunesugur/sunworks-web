import { readdirSync } from "node:fs";

import { check } from "@shopify/theme-check-node";
import { describe, expect, it } from "vitest";

import { EXTENSION_DIR } from "../helpers/liquid";

describe("theme app extension", () => {
  it("only contains what Shopify accepts", () => {
    // `shopify app dev` and `deploy` reject anything else in the extension folder.
    const allowed = new Set(["assets", "blocks", "snippets", "locales", "shopify.extension.toml"]);
    expect(readdirSync(EXTENSION_DIR).filter((entry) => !allowed.has(entry))).toEqual([]);
  });

  it("passes Shopify's theme check", async () => {
    const offenses = await check(EXTENSION_DIR, "theme-check:theme-app-extension");
    expect(offenses.map((o) => `${o.check} ${o.uri.split("sizemate-theme/")[1]}: ${o.message}`)).toEqual([]);
  }, 60_000);
});
