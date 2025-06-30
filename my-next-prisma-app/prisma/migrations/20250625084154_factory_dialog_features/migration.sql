/*
  Warnings:

  - You are about to drop the column `text` on the `QuizComment` table. All the data in the column will be lost.
  - Added the required column `comment` to the `QuizComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `QuizComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizComment" DROP COLUMN "text",
ADD COLUMN     "comment" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizPackage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "quizIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizPackage_pkey" PRIMARY KEY ("id")
);
