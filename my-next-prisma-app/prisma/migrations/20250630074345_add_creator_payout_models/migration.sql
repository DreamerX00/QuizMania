/*
  Warnings:

  - A unique constraint covering the columns `[razorpayPayoutId]` on the table `Withdrawal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fundAccountId` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundAccountType" AS ENUM ('BANK_ACCOUNT', 'VPA');

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "fundAccountId" TEXT NOT NULL,
ADD COLUMN     "razorpayPayoutId" TEXT;

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayContactId" TEXT,
    "earnings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundAccount" (
    "id" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "razorpayFundAccountId" TEXT NOT NULL,
    "accountType" "FundAccountType" NOT NULL,
    "maskedAccountNumber" TEXT,
    "ifsc" TEXT,
    "bankName" TEXT,
    "vpaAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_razorpayContactId_key" ON "CreatorProfile"("razorpayContactId");

-- CreateIndex
CREATE UNIQUE INDEX "FundAccount_razorpayFundAccountId_key" ON "FundAccount"("razorpayFundAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_razorpayPayoutId_key" ON "Withdrawal"("razorpayPayoutId");

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_fundAccountId_fkey" FOREIGN KEY ("fundAccountId") REFERENCES "FundAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundAccount" ADD CONSTRAINT "FundAccount_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
