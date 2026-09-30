import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

import type { PlanId } from "../lib/plans";
import { authenticate } from "../shopify.server";
import { syncPlan } from "./billing.server";
import type { AdminGraphql } from "./graphql.server";
import { publish } from "./publisher.server";

export interface AdminContext {
  admin: AdminGraphql & AdminApiContext;
  shop: string;
  plan: PlanId;
  redirect: Awaited<ReturnType<typeof authenticate.admin>>["redirect"];
}

/** Authenticates an admin request and makes sure the plan is current. */
export async function adminContext(request: Request): Promise<AdminContext> {
  const { admin, session, redirect } = await authenticate.admin(request);
  const graphql = admin as AdminGraphql & AdminApiContext;
  const { plan, changed } = await syncPlan(session.shop, graphql);
  if (changed) {
    // A plan change turns paid features on or off on the storefront.
    await publish(session.shop, graphql).catch((error: unknown) => console.error("Republish after plan change failed", error));
  }
  return { admin: graphql, shop: session.shop, plan, redirect };
}
