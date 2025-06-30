/*
  Warnings:

  - You are about to drop the column `comment` on the `QuizComment` table. All the data in the column will be lost.
  - Added the required column `text` to the `QuizComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizComment" DROP COLUMN "comment",
ADD COLUMN     "text" TEXT NOT NULL;
