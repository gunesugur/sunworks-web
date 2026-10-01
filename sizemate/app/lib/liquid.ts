/**
 * Renders the theme extension's Liquid with LiquidJS, standing in for
 * Shopify. Used by the admin preview (so merchants see exactly what the
 * storefront renders) and by the tests. Shopify-only filters and tags are
 * provided with the behaviour the snippets rely on.
 */
import { Liquid, Tag, type Emitter, type TagToken, type TopLevelToken } from "liquidjs";

import type { PublishResult } from "./publish";

export type Translations = Record<string, unknown>;

function lookup(translations: Translations, key: string): string {
  const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], translations);
  if (typeof value !== "string") throw new Error(`translation missing: ${key}`);
  return value;
}

/** @param templates Snippet and block sources keyed by name, e.g. { "sizemate-core": "…" }. */
export function createStorefrontEngine(templates: Record<string, string>, translations: Translations): Liquid {
  const engine = new Liquid({
    templates: Object.fromEntries(Object.entries(templates).map(([name, source]) => [`${name}.liquid`, source])),
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

function coreCall(source: string, blockId: string): string {
  return `{% render 'sizemate-core', product: product, source: '${source}', block_id: '${blockId}', shopify_attributes: '' %}`;
}

export async function renderCore(engine: Liquid, context: RenderContext, source = "block", blockId = `${source}-1`): Promise<string> {
  const globals = liquidGlobals(context);
  return engine.parseAndRender(coreCall(source, blockId), globals, { globals });
}

export function renderCoreSync(engine: Liquid, context: RenderContext, source = "preview", blockId = "preview"): string {
  const globals = liquidGlobals(context);
  return engine.parseAndRenderSync(coreCall(source, blockId), globals, { globals });
}
