-- DropForeignKey
ALTER TABLE "QuizAccessLog" DROP CONSTRAINT "QuizAccessLog_userId_fkey";

-- AddForeignKey
ALTER TABLE "QuizSlugRedirect" ADD CONSTRAINT "QuizSlugRedirect_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
