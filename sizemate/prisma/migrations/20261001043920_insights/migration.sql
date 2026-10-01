-- CreateTable
CREATE TABLE "InsightDay" (
    "shop" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "fits" INTEGER NOT NULL DEFAULT 0,
    "above" INTEGER NOT NULL DEFAULT 0,
    "below" INTEGER NOT NULL DEFAULT 0,
    "sizes" TEXT NOT NULL DEFAULT '{}',

    PRIMARY KEY ("shop", "chartId", "day")
);

-- CreateIndex
CREATE INDEX "InsightDay_shop_day_idx" ON "InsightDay"("shop", "day");
