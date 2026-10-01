-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "planCheckedAt" DATETIME,
    "subscribedPlan" TEXT NOT NULL DEFAULT 'free',
    "paidPlan" TEXT,
    "paidUntil" DATETIME,
    "frozen" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" DATETIME,
    "renewsAt" DATETIME,
    "welcomeUntil" DATETIME,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "onboarding" TEXT NOT NULL DEFAULT '{}',
    "publishedAt" DATETIME,
    "publishError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- Existing shops keep their plan as the subscribed plan until the next check with Shopify.
INSERT INTO "new_Shop" ("createdAt", "onboarding", "plan", "subscribedPlan", "planCheckedAt", "publishError", "publishedAt", "settings", "shop", "updatedAt") SELECT "createdAt", "onboarding", "plan", "plan", "planCheckedAt", "publishError", "publishedAt", "settings", "shop", "updatedAt" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
