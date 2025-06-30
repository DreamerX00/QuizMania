-- AlterTable
ALTER TABLE "QuizPackage" ADD COLUMN     "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalEarnings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usersTaken" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PackageLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PackageLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageRating" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "packageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PackageRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "dateTaken" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "QuizStatus" NOT NULL,

    CONSTRAINT "PackageAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageLike_packageId_userId_key" ON "PackageLike"("packageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageRating_packageId_userId_key" ON "PackageRating"("packageId", "userId");

-- AddForeignKey
ALTER TABLE "PackageLike" ADD CONSTRAINT "PackageLike_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "QuizPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageLike" ADD CONSTRAINT "PackageLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRating" ADD CONSTRAINT "PackageRating_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "QuizPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRating" ADD CONSTRAINT "PackageRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageAttempt" ADD CONSTRAINT "PackageAttempt_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "QuizPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageAttempt" ADD CONSTRAINT "PackageAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
