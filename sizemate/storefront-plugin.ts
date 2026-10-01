import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

const ID = "virtual:sizemate-storefront";
const RESOLVED = `\0${ID}`;
const extension = fileURLToPath(new URL("./extensions/sizemate-theme/", import.meta.url));

/**
 * Exposes the theme extension's Liquid snippets and English strings to the
 * admin preview as a virtual module. The files can't be imported directly:
 * in development `shopify app dev` serves every /extensions/* URL itself.
 */
export function sizemateStorefront(): Plugin {
  return {
    name: "sizemate-storefront",
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      const templates: Record<string, string> = {};
      for (const file of readdirSync(`${extension}snippets`).filter((f) => f.endsWith(".liquid"))) {
        const path = `${extension}snippets/${file}`;
        this.addWatchFile(path);
        templates[file.replace(/\.liquid$/, "")] = readFileSync(path, "utf8");
      }
      const localePath = `${extension}locales/en.default.json`;
      this.addWatchFile(localePath);
      const translations = JSON.parse(readFileSync(localePath, "utf8")) as unknown;
      return `export const templates = ${JSON.stringify(templates)};\nexport const translations = ${JSON.stringify(translations)};\n`;
    },
  };
}
