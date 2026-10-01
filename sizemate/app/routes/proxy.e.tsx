import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { parseEvent } from "../lib/insights";
import { hasFeature } from "../lib/plans";
import { getChart } from "../models/charts.server";
import { recordEvent } from "../models/insights.server";
import { getShop, planOf } from "../models/shop.server";
import { authenticate } from "../shopify.server";

/**
 * Insights counter, reached from the storefront through the app proxy
 * (/apps/sizemate/e). Shopify signs every proxied request; anything else is
 * rejected by authenticate.public.appProxy.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);
  const shop = session?.shop;
  if (!shop) return new Response(null, { status: 204 });
  const event = parseEvent(await request.text());
  if (!event) return new Response(null, { status: 204 });
  const record = await getShop(shop);
  if (!hasFeature(planOf(record), "insights")) return new Response(null, { status: 204 });
  if (!(await getChart(shop, event.chartId))) return new Response(null, { status: 204 });
  await recordEvent(shop, event);
  return new Response(null, { status: 204 });
};

export const loader = async (_args: LoaderFunctionArgs) => new Response(null, { status: 405 });
