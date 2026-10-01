import "@shopify/shopify-app-react-router/adapters/node";
import { ApiVersion, AppDistribution, shopifyApp } from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

import prisma from "./db.server";
import { syncPlan } from "./models/billing.server";
import type { AdminGraphql } from "./models/graphql.server";
import { publish } from "./models/publisher.server";
import { startReconcileJob } from "./models/reconcile.server";
import { getShop } from "./models/shop.server";

export const apiVersion = ApiVersion.July26;

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  hooks: {
    // On install (and re-install) make sure the storefront has a config to read,
    // including charts kept from an earlier install.
    afterAuth: async ({ session, admin }) => {
      await getShop(session.shop);
      await syncPlan(session.shop, admin, { force: true });
      await publish(session.shop, admin).catch((error: unknown) => {
        console.error(`Initial publish failed for ${session.shop}`, error);
      });
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}),
});

export default shopify;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// Ends paid periods and the welcome period on time, even for merchants who never open the app.
startReconcileJob(async (shop) => {
  try {
    const { admin } = await shopify.unauthenticated.admin(shop);
    return admin as unknown as AdminGraphql;
  } catch {
    return null; // no offline session: the app is uninstalled
  }
});
