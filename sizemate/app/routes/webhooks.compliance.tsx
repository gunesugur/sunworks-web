import type { ActionFunctionArgs } from "react-router";

import { deleteShopData } from "../models/shop.server";
import { authenticate } from "../shopify.server";

/**
 * Mandatory privacy webhooks. Sizemate stores no customer data: the Fit
 * Finder runs in the shopper's browser and nothing is sent to our server.
 * customers/data_request and customers/redact therefore have nothing to
 * return or delete. shop/redact removes all of the shop's data.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (topic.toUpperCase().replace("/", "_") === "SHOP_REDACT") await deleteShopData(shop);
  return new Response();
};
