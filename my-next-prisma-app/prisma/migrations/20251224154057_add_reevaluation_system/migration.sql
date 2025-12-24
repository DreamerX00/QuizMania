-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "odId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "gameMode" TEXT NOT NULL DEFAULT 'standard',
    "duration" INTEGER,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReEvaluationRequest" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "questionIds" JSONB NOT NULL DEFAULT '[]',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "responseNote" TEXT,
    "newScore" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReEvaluationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReEvaluationResponse" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "questionId" TEXT,
    "adjustedMarks" INTEGER,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReEvaluationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameResult_roomId_idx" ON "GameResult"("roomId");

-- CreateIndex
CREATE INDEX "GameResult_odId_idx" ON "GameResult"("odId");

-- CreateIndex
CREATE INDEX "GameResult_completedAt_idx" ON "GameResult"("completedAt");

-- CreateIndex
CREATE INDEX "ReEvaluationRequest_userId_idx" ON "ReEvaluationRequest"("userId");

-- CreateIndex
CREATE INDEX "ReEvaluationRequest_creatorId_idx" ON "ReEvaluationRequest"("creatorId");

-- CreateIndex
CREATE INDEX "ReEvaluationRequest_quizId_idx" ON "ReEvaluationRequest"("quizId");

-- CreateIndex
CREATE INDEX "ReEvaluationRequest_status_idx" ON "ReEvaluationRequest"("status");

-- CreateIndex
CREATE INDEX "ReEvaluationResponse_requestId_idx" ON "ReEvaluationResponse"("requestId");

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_odId_fkey" FOREIGN KEY ("odId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReEvaluationRequest" ADD CONSTRAINT "ReEvaluationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReEvaluationRequest" ADD CONSTRAINT "ReEvaluationRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReEvaluationRequest" ADD CONSTRAINT "ReEvaluationRequest_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReEvaluationRequest" ADD CONSTRAINT "ReEvaluationRequest_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReEvaluationResponse" ADD CONSTRAINT "ReEvaluationResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ReEvaluationRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
