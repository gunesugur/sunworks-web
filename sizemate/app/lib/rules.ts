/**
 * Which chart does a product get?
 *
 * This is the reference implementation of the storefront matching done in
 * extensions/sizemate-theme/snippets/sizemate-core.liquid. Both work on the
 * published rules (see publish.ts), and tests/liquid-parity.test.ts checks
 * that they always agree.
 *
 * Precedence, most specific first:
 *   1. a chart that lists the product itself
 *   2. a chart whose collections, product types, vendors or tags match
 *   3. a chart assigned to all products
 * Within each level the chart that is higher in the merchant's list wins.
 */

export interface PublishedRule {
  /** Chart id. */
  c: string;
  /** Assigned to all products. */
  all: boolean;
  /** Product ids (numeric strings). */
  p: string[];
  /** Collection ids (numeric strings). */
  col: string[];
  /** Product types, lowercase. */
  ty: string[];
  /** Vendors, lowercase. */
  ve: string[];
  /** Tags, lowercase. */
  tg: string[];
}

export interface ProductFacts {
  id: string;
  type: string;
  vendor: string;
  tags: string[];
  collectionIds: string[];
}

function matchesConditions(rule: PublishedRule, product: ProductFacts): boolean {
  const type = product.type.toLowerCase();
  const vendor = product.vendor.toLowerCase();
  return (
    (type !== "" && rule.ty.includes(type)) ||
    (vendor !== "" && rule.ve.includes(vendor)) ||
    product.tags.some((tag) => rule.tg.includes(tag.toLowerCase())) ||
    product.collectionIds.some((id) => rule.col.includes(id))
  );
}

export function matchChart(rules: readonly PublishedRule[], product: ProductFacts): string | null {
  const byProduct = rules.find((rule) => rule.p.includes(product.id));
  if (byProduct) return byProduct.c;
  const byCondition = rules.find((rule) => !rule.all && matchesConditions(rule, product));
  if (byCondition) return byCondition.c;
  const fallback = rules.find((rule) => rule.all);
  return fallback ? fallback.c : null;
}

/** "gid://shopify/Product/123" → "123" */
export function numericId(gid: string): string {
  return gid.slice(gid.lastIndexOf("/") + 1);
}
