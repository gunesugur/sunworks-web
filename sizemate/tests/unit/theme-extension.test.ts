import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { check } from "@shopify/theme-check-node";
import { describe, expect, it } from "vitest";

import { EXTENSION_DIR } from "../helpers/liquid";

describe("theme app extension", () => {
  it("only contains what Shopify accepts", () => {
    // `shopify app dev` and `deploy` reject anything else in the extension folder.
    const allowed = new Set(["assets", "blocks", "snippets", "locales", "shopify.extension.toml"]);
    expect(readdirSync(EXTENSION_DIR).filter((entry) => !allowed.has(entry))).toEqual([]);
  });

  it("is never loaded by the admin from extensions/", () => {
    // `shopify app dev` serves /extensions/* itself, so such imports load nothing in the admin.
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(ts|tsx)$/.test(entry.name) && /from\s+["'][^"']*extensions\//.test(readFileSync(path, "utf8"))) offenders.push(path);
      }
    };
    walk(join(EXTENSION_DIR, "../../app"));
    expect(offenders).toEqual([]);
  });

  it("passes Shopify's theme check", async () => {
    const offenses = await check(EXTENSION_DIR, "theme-check:theme-app-extension");
    expect(offenses.map((o) => `${o.check} ${o.uri.split("sizemate-theme/")[1]}: ${o.message}`)).toEqual([]);
  }, 60_000);
});
