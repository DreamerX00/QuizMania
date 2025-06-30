/*
  Warnings:

  - You are about to drop the column `category` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "category",
DROP COLUMN "name",
ADD COLUMN     "field" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jsonContent" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Quiz',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "QuizLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "QuizLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "QuizComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizRating" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "QuizRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizLike_quizId_userId_key" ON "QuizLike"("quizId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizRating_quizId_userId_key" ON "QuizRating"("quizId", "userId");

-- AddForeignKey
ALTER TABLE "QuizLike" ADD CONSTRAINT "QuizLike_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizLike" ADD CONSTRAINT "QuizLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizComment" ADD CONSTRAINT "QuizComment_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizComment" ADD CONSTRAINT "QuizComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRating" ADD CONSTRAINT "QuizRating_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRating" ADD CONSTRAINT "QuizRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
