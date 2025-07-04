-- CreateTable
CREATE TABLE "QuestionRecord" (
    "id" TEXT NOT NULL,
    "quizRecordId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "answer" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionRecord" ADD CONSTRAINT "QuestionRecord_quizRecordId_fkey" FOREIGN KEY ("quizRecordId") REFERENCES "QuizRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
