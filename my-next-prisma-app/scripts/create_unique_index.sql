-- Create unique partial index to prevent multiple IN_PROGRESS QuizRecord rows per (userId, quizId)
-- Run this against your development/test Postgres database (NOT production) with psql or your DB tool.

CREATE UNIQUE INDEX IF NOT EXISTS unique_inprogress_per_user_quiz
ON "QuizRecord" ("userId", "quizId")
WHERE status = 'IN_PROGRESS';
