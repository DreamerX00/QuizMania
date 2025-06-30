-- CreateTable
CREATE TABLE "PremiumSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templatesUsed" INTEGER NOT NULL DEFAULT 0,
    "quizPacks" INTEGER NOT NULL DEFAULT 0,
    "timeSaved" INTEGER NOT NULL DEFAULT 0,
    "dollarValue" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "PremiumSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PremiumSummary_userId_key" ON "PremiumSummary"("userId");

-- AddForeignKey
ALTER TABLE "PremiumSummary" ADD CONSTRAINT "PremiumSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
