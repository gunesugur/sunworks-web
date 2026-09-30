import { buildPublication, CHART_KEY_PREFIX, CONFIG_KEY, METAFIELD_NAMESPACE, oversizedEntries } from "../lib/publish";
import { listCharts } from "./charts.server";
import { assertNoUserErrors, gql, type AdminGraphql, type UserError } from "./graphql.server";
import { getShop, planOf, recordPublish, settingsOf } from "./shop.server";

const INSTALLATION_QUERY = `#graphql
  query SizemateInstallation($namespace: String!) {
    currentAppInstallation {
      id
      metafields(namespace: $namespace, first: 250) { nodes { key } }
    }
  }`;

const SET_MUTATION = `#graphql
  mutation SizemateSetMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { key }
      userErrors { field message }
    }
  }`;

const DELETE_MUTATION = `#graphql
  mutation SizemateDeleteMetafields($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields { key }
      userErrors { field message }
    }
  }`;

/** metafieldsSet accepts at most 25 metafields per call. */
const BATCH = 25;

export interface PublishSummary {
  published: number;
  paused: string[];
}

export class PublishError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishError";
  }
}

/**
 * Writes the shop's charts to app-data metafields for the theme extension.
 * Charts are written before the config that references them, and stale charts
 * are removed afterwards, so the storefront never sees a rule without its chart.
 */
export async function publish(shop: string, admin: AdminGraphql): Promise<PublishSummary> {
  try {
    const record = await getShop(shop);
    const charts = (await listCharts(shop)).map((stored) => stored.chart);
    const publication = buildPublication(charts, settingsOf(record), planOf(record));

    const oversized = oversizedEntries(publication);
    if (oversized.length) {
      throw new PublishError(
        oversized.includes(CONFIG_KEY)
          ? "Your assignment rules are too large to publish. Remove some tags, vendors or product types."
          : "A size chart is too large to publish. Remove some rows, columns or translations.",
      );
    }

    const installation = await gql<{
      currentAppInstallation: { id: string; metafields: { nodes: { key: string }[] } };
    }>(admin, INSTALLATION_QUERY, { namespace: METAFIELD_NAMESPACE });
    const ownerId = installation.currentAppInstallation.id;

    const entries = [
      ...Object.entries(publication.charts),
      [CONFIG_KEY, publication.config] as const,
    ].map(([key, value]) => ({ ownerId, namespace: METAFIELD_NAMESPACE, key, type: "json", value: JSON.stringify(value) }));
    for (let i = 0; i < entries.length; i += BATCH) {
      const data = await gql<{ metafieldsSet: { userErrors: UserError[] } }>(admin, SET_MUTATION, {
        metafields: entries.slice(i, i + BATCH),
      });
      assertNoUserErrors(data.metafieldsSet.userErrors, "Saving to your store failed");
    }

    const keep = new Set(Object.keys(publication.charts));
    const stale = installation.currentAppInstallation.metafields.nodes
      .map((node) => node.key)
      .filter((key) => key.startsWith(CHART_KEY_PREFIX) && !keep.has(key));
    for (let i = 0; i < stale.length; i += BATCH) {
      const data = await gql<{ metafieldsDelete: { userErrors: UserError[] } }>(admin, DELETE_MUTATION, {
        metafields: stale.slice(i, i + BATCH).map((key) => ({ ownerId, namespace: METAFIELD_NAMESPACE, key })),
      });
      assertNoUserErrors(data.metafieldsDelete.userErrors, "Cleaning up old charts failed");
    }

    await recordPublish(shop, null);
    return { published: keep.size, paused: publication.paused };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publishing failed";
    await recordPublish(shop, message).catch(() => undefined);
    throw error instanceof PublishError ? error : new PublishError(message);
  }
}
