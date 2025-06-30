/*
  Warnings:

  - You are about to drop the column `fundAccountId` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayPayoutId` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the `CreatorProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FundAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreatorProfile" DROP CONSTRAINT "CreatorProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "FundAccount" DROP CONSTRAINT "FundAccount_creatorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Withdrawal" DROP CONSTRAINT "Withdrawal_fundAccountId_fkey";

-- DropIndex
DROP INDEX "Withdrawal_razorpayPayoutId_key";

-- AlterTable
ALTER TABLE "Withdrawal" DROP COLUMN "fundAccountId",
DROP COLUMN "razorpayPayoutId";

-- DropTable
DROP TABLE "CreatorProfile";

-- DropTable
DROP TABLE "FundAccount";

-- DropEnum
DROP TYPE "FundAccountType";

-- CreateTable
CREATE TABLE "PayoutAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayAccountId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'upi',
    "accountDetails" JSONB NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutAccount_userId_key" ON "PayoutAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutAccount_razorpayAccountId_key" ON "PayoutAccount"("razorpayAccountId");

-- AddForeignKey
ALTER TABLE "PayoutAccount" ADD CONSTRAINT "PayoutAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
