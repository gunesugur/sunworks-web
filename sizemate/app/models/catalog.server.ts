import { gql, type AdminGraphql } from "./graphql.server";

const CATALOG_QUERY = `#graphql
  query SizemateCatalog {
    products(first: 250, sortKey: UPDATED_AT, reverse: true) {
      nodes { productType vendor tags }
    }
    shopLocales { locale name primary published }
  }`;

export interface ShopLocale {
  locale: string;
  name: string;
  primary: boolean;
  published: boolean;
}

export interface Catalog {
  productTypes: string[];
  vendors: string[];
  tags: string[];
  locales: ShopLocale[];
}

function unique(values: string[]): string[] {
  const seen = new Map<string, string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) seen.set(trimmed.toLowerCase(), trimmed);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Suggestions for the assignment fields, taken from recently updated products. */
export async function getCatalog(admin: AdminGraphql): Promise<Catalog> {
  try {
    const data = await gql<{
      products: { nodes: { productType: string; vendor: string; tags: string[] }[] };
      shopLocales: ShopLocale[];
    }>(admin, CATALOG_QUERY);
    const products = data.products.nodes;
    return {
      productTypes: unique(products.map((p) => p.productType)),
      vendors: unique(products.map((p) => p.vendor)),
      tags: unique(products.flatMap((p) => p.tags)),
      locales: data.shopLocales,
    };
  } catch (error) {
    console.error("Could not load catalog suggestions", error);
    return { productTypes: [], vendors: [], tags: [], locales: [] };
  }
}
