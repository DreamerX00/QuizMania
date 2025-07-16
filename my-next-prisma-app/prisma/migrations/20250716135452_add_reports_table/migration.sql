-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('Resoloved', 'New', 'Pending', 'Canceled', 'UnderReview');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
