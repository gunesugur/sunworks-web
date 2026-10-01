/**
 * Test access to the theme extension's Liquid (see app/lib/liquid.ts).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Liquid } from "liquidjs";

import { createStorefrontEngine, liquidGlobals, renderCore, type RenderContext, type Translations } from "~/lib/liquid";

export { liquidGlobals, type RenderContext, type StorefrontProduct } from "~/lib/liquid";

// Resolved from a path string: under jsdom, URL is jsdom's and fileURLToPath rejects it.
export const EXTENSION_DIR = `${resolve(dirname(fileURLToPath(import.meta.url)), "../../extensions/sizemate-theme")}/`;

export function loadLocale(name: string): Translations {
  return JSON.parse(readFileSync(`${EXTENSION_DIR}locales/${name}.json`, "utf8")) as Translations;
}

function loadTemplates(): Record<string, string> {
  const templates: Record<string, string> = {};
  for (const folder of ["snippets", "blocks"]) {
    for (const file of readdirSync(`${EXTENSION_DIR}${folder}`).filter((f) => f.endsWith(".liquid"))) {
      templates[file.replace(/\.liquid$/, "")] = readFileSync(`${EXTENSION_DIR}${folder}/${file}`, "utf8");
    }
  }
  return templates;
}

export function createEngine(locale = "en.default"): Liquid {
  return createStorefrontEngine(loadTemplates(), loadLocale(locale));
}

export async function renderSnippet(engine: Liquid, context: RenderContext, source: "block" | "embed" = "block"): Promise<string> {
  return renderCore(engine, context, source);
}

export async function renderBlock(engine: Liquid, file: "size-chart" | "sizemate-embed", context: RenderContext): Promise<string> {
  const source = readFileSync(`${EXTENSION_DIR}blocks/${file}.liquid`, "utf8");
  const globals = liquidGlobals(context);
  return engine.parseAndRender(source, { ...globals, block: { id: "block-1", shopify_attributes: "" } }, { globals });
}
