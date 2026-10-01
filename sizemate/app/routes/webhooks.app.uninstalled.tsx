import type { ActionFunctionArgs } from "react-router";

import db from "../db.server";
import { resetSubscription } from "../models/shop.server";
import { authenticate } from "../shopify.server";

/**
 * Sessions are removed straight away. Charts are kept so a merchant who
 * reinstalls finds them again; Shopify sends shop/redact 48 hours after
 * uninstall, and that deletes everything (see webhooks.compliance.tsx).
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  // Webhooks can arrive more than once, and after the session is already gone.
  if (session) await db.session.deleteMany({ where: { shop } });
  // Shopify cancels the subscription on uninstall; a reinstall starts from Free.
  await resetSubscription(shop);
  return new Response();
};
