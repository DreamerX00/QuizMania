-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('SUPER_EASY', 'EASY', 'NORMAL', 'MEDIUM', 'HARD', 'IMPOSSIBLE', 'INSANE', 'JEE_ADVANCED', 'JEE_MAIN', 'NEET_UG', 'UPSC_CSE', 'GATE', 'CAT', 'CLAT', 'CA', 'GAOKAO', 'GRE', 'GMAT', 'USMLE', 'LNAT', 'MCAT', 'CFA', 'GOD_LEVEL');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "difficultyLevel" "DifficultyLevel",
ADD COLUMN     "durationInSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockPassword" TEXT;
