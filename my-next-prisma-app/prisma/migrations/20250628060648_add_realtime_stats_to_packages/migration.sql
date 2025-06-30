/*
  Warnings:

  - You are about to drop the column `likeCount` on the `QuizPackage` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `QuizPackage` table. All the data in the column will be lost.
  - You are about to drop the column `totalEarnings` on the `QuizPackage` table. All the data in the column will be lost.
  - You are about to drop the column `usersTaken` on the `QuizPackage` table. All the data in the column will be lost.
  - You are about to drop the `PackageAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackageLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackageRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackageAttempt" DROP CONSTRAINT "PackageAttempt_packageId_fkey";

-- DropForeignKey
ALTER TABLE "PackageAttempt" DROP CONSTRAINT "PackageAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "PackageLike" DROP CONSTRAINT "PackageLike_packageId_fkey";

-- DropForeignKey
ALTER TABLE "PackageLike" DROP CONSTRAINT "PackageLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "PackageRating" DROP CONSTRAINT "PackageRating_packageId_fkey";

-- DropForeignKey
ALTER TABLE "PackageRating" DROP CONSTRAINT "PackageRating_userId_fkey";

-- AlterTable
ALTER TABLE "QuizPackage" DROP COLUMN "likeCount",
DROP COLUMN "rating",
DROP COLUMN "totalEarnings",
DROP COLUMN "usersTaken",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "earnings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "PackageAttempt";

-- DropTable
DROP TABLE "PackageLike";

-- DropTable
DROP TABLE "PackageRating";
