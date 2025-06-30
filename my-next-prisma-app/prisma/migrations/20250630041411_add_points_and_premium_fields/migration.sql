-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "pointPerAttempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pricePerAttempt" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QuizRecord" ADD COLUMN     "earnedPoints" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "premiumUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_quizId_userId_date_key" ON "Attempt"("quizId", "userId", "date");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
