-- CreateTable
CREATE TABLE "QuizSlugRedirect" (
    "oldSlug" TEXT NOT NULL,
    "newSlug" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizSlugRedirect_pkey" PRIMARY KEY ("oldSlug")
);
