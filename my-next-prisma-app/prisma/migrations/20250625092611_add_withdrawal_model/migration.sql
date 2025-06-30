/*
  Warnings:

  - You are about to drop the column `comment` on the `QuizComment` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `QuizComment` table. All the data in the column will be lost.
  - You are about to drop the column `dollarValue` on the `QuizRating` table. All the data in the column will be lost.
  - The `status` column on the `Withdrawal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `QuizPackage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `text` to the `QuizComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "QuizComment" DROP COLUMN "comment",
DROP COLUMN "rating",
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizRating" DROP COLUMN "dollarValue";

-- AlterTable
ALTER TABLE "QuizRecord" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "QuizPackage";

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
