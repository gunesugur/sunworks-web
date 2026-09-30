/**
 * Renders the theme extension's Liquid with LiquidJS, standing in for Shopify.
 * Shopify-only filters and tags are provided with the same behaviour the
 * snippets rely on.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Liquid, Tag, type TagToken, type TopLevelToken, type Emitter } from "liquidjs";

import type { PublishResult } from "~/lib/publish";

// Resolved from a path string: under jsdom, URL is jsdom's and fileURLToPath rejects it.
export const EXTENSION_DIR = `${resolve(dirname(fileURLToPath(import.meta.url)), "../../extensions/sizemate-theme")}/`;

type Translations = Record<string, unknown>;

export function loadLocale(name: string): Translations {
  return JSON.parse(readFileSync(`${EXTENSION_DIR}locales/${name}.json`, "utf8")) as Translations;
}

function lookup(translations: Translations, key: string): string {
  const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations);
  if (typeof value !== "string") throw new Error(`translation missing: ${key}`);
  return value;
}

export function createEngine(locale = "en.default"): Liquid {
  const translations = loadLocale(locale);
  const engine = new Liquid({
    root: [`${EXTENSION_DIR}snippets`, `${EXTENSION_DIR}blocks`],
    extname: ".liquid",
    strictFilters: true,
  });
  engine.registerFilter("t", (key: string) => lookup(translations, key));
  engine.registerFilter("asset_url", (name: string) => `/assets/${name}`);
  engine.registerFilter("newline_to_br", (text: string) => String(text ?? "").replace(/\n/g, "<br>\n"));
  // {% schema %} only configures the theme editor; it renders nothing.
  engine.registerTag(
    "schema",
    class extends Tag {
      constructor(token: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
        super(token, remainTokens, liquid);
        while (remainTokens.length) {
          const next = remainTokens.shift() as TagToken;
          if (next.name === "endschema") return;
        }
      }
      *render(_ctx: unknown, _emitter: Emitter) {
        // renders nothing
      }
    },
  );
  return engine;
}

export interface StorefrontProduct {
  id: number;
  title?: string;
  type: string;
  vendor: string;
  tags: string[];
  collections: { id: number }[];
}

export interface RenderContext {
  publication: PublishResult | null;
  product: StorefrontProduct | null;
  locale?: string;
  country?: string;
  designMode?: boolean;
}

/** Shopify globals are visible inside rendered snippets, unlike assigned variables. */
export function liquidGlobals({ publication, product, locale = "en", country = "DE", designMode = false }: RenderContext) {
  const namespace: Record<string, { value: unknown }> = {};
  if (publication) {
    namespace.config = { value: publication.config };
    for (const [key, chart] of Object.entries(publication.charts)) namespace[key] = { value: chart };
  }
  return {
    app: { metafields: { sizemate: namespace } },
    product,
    template: { name: product ? "product" : "index" },
    request: { locale: { iso_code: locale }, design_mode: designMode },
    localization: { country: { iso_code: country } },
  };
}

export async function renderSnippet(engine: Liquid, context: RenderContext, source: "block" | "embed" = "block"): Promise<string> {
  const globals = liquidGlobals(context);
  return engine.parseAndRender(
    `{% render 'sizemate-core', product: product, source: '${source}', block_id: '${source}-1', shopify_attributes: '' %}`,
    globals,
    { globals },
  );
}

export async function renderBlock(engine: Liquid, file: "size-chart" | "sizemate-embed", context: RenderContext): Promise<string> {
  const source = readFileSync(`${EXTENSION_DIR}blocks/${file}.liquid`, "utf8");
  const globals = liquidGlobals(context);
  return engine.parseAndRender(source, { ...globals, block: { id: "block-1", shopify_attributes: "" } }, { globals });
}
