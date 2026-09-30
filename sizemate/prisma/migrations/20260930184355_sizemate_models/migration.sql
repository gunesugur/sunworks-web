-- CreateTable
CREATE TABLE "Shop" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "planCheckedAt" DATETIME,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "onboarding" TEXT NOT NULL DEFAULT '{}',
    "publishedAt" DATETIME,
    "publishError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chart_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Shop" ("shop") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Chart_shop_position_idx" ON "Chart"("shop", "position");
