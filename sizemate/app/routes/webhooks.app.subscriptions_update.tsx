import type { ActionFunctionArgs } from "react-router";

import { syncPlan } from "../models/billing.server";
import { publish } from "../models/publisher.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, admin, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  // No admin context means the app is already uninstalled.
  if (!admin) return new Response();
  const { changed } = await syncPlan(shop, admin, { force: true });
  if (changed) await publish(shop, admin);
  return new Response();
};
