-- CreateTable
CREATE TABLE "QuizAccessLog" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "QuizAccessLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizAccessLog" ADD CONSTRAINT "QuizAccessLog_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAccessLog" ADD CONSTRAINT "QuizAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;
