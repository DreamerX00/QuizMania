/*
  Warnings:

  - You are about to drop the column `text` on the `QuizComment` table. All the data in the column will be lost.
  - Added the required column `comment` to the `QuizComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizComment" DROP COLUMN "text",
ADD COLUMN     "comment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizRating" ADD COLUMN     "dollarValue" DOUBLE PRECISION NOT NULL DEFAULT 0;
