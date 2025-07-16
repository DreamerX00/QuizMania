/*
  Warnings:

  - You are about to drop the `QuizAccessLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSlugRedirect` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizAccessLog" DROP CONSTRAINT "QuizAccessLog_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSlugRedirect" DROP CONSTRAINT "QuizSlugRedirect_quizId_fkey";

-- DropTable
DROP TABLE "QuizAccessLog";

-- DropTable
DROP TABLE "QuizSlugRedirect";
