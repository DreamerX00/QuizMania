import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function ensureIndex() {
  try {
    // Create a partial unique index to prevent multiple IN_PROGRESS quiz records per user+quiz
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_inprogress_per_user_quiz 
      ON "QuizRecord" ("userId", "quizId") WHERE status = 'IN_PROGRESS';
    `);
    console.log("Ensured unique_inprogress_per_user_quiz index exists.");
  } catch (err) {
    console.error("Failed to ensure index:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}` || !import.meta.url) {
  ensureIndex();
}
