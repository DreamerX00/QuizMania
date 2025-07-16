-- CreateTable
CREATE TABLE "QuizLinkSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "deviceInfo" JSONB NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuizLinkSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizLinkSession_quizId_userId_isActive_idx" ON "QuizLinkSession"("quizId", "userId", "isActive");

-- AddForeignKey
ALTER TABLE "QuizLinkSession" ADD CONSTRAINT "QuizLinkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizLinkSession" ADD CONSTRAINT "QuizLinkSession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
