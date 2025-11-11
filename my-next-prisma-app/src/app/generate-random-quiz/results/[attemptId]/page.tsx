import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ResultsDashboard from "./ResultsDashboard";

interface ResultsPageProps {
  params: {
    attemptId: string;
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      "/signin?callbackUrl=/generate-random-quiz/results/" + params.attemptId
    );
  }

  // Fetch attempt with quiz and questions
  const attempt = await prisma.aIQuizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      quiz: {
        include: {
          provider: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  // Check if user owns this attempt OR the quiz is public
  if (attempt.userId !== session.user.id && !attempt.quiz.isPublic) {
    redirect("/generate-random-quiz");
  }

  // Parse questions and answers
  const questions = attempt.quiz.questions as Array<{
    id: string;
    text?: string;
    question?: string;
    options: Array<{
      id: string;
      text: string;
    }>;
    correctAnswer: string; // "a", "b", "c", or "d"
    explanation?: string;
    difficulty?: string;
    topic?: string;
  }>;

  const userAnswers = attempt.answers as Record<string, string>;

  // Build question results with correct/incorrect info
  const questionResults = questions.map((question) => {
    const selectedAnswerId = userAnswers[question.id];
    // correctAnswer is "a", "b", "c", or "d"
    const correctAnswerId = question.correctAnswer.toLowerCase();
    const correctOption = question.options.find(
      (opt) => opt.id.toLowerCase() === correctAnswerId
    );
    const selectedOption = question.options.find(
      (opt) => opt.id.toLowerCase() === selectedAnswerId?.toLowerCase()
    );
    const isCorrect = selectedAnswerId?.toLowerCase() === correctAnswerId;
    const wasSkipped = !selectedAnswerId;

    return {
      id: question.id,
      text: question.text || question.question || "Question text not available",
      options: question.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id.toLowerCase() === correctAnswerId,
      })),
      selectedAnswer: selectedOption
        ? {
            id: selectedOption.id,
            text: selectedOption.text,
          }
        : null,
      correctAnswer: {
        id: correctOption?.id || correctAnswerId,
        text: correctOption?.text || "",
      },
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      isCorrect,
      wasSkipped,
    };
  });

  // Calculate grade
  const score = attempt.score;
  let grade = "F";
  if (score >= 95) grade = "S";
  else if (score >= 90) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 80) grade = "B+";
  else if (score >= 75) grade = "B";
  else if (score >= 70) grade = "C+";
  else if (score >= 65) grade = "C";
  else if (score >= 60) grade = "D";

  return (
    <ResultsDashboard
      attempt={{
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        percentage: attempt.percentage,
        accuracy: attempt.accuracy,
        grade,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        skippedCount: attempt.skippedCount,
        totalQuestions: attempt.totalQuestions,
        xpEarned: attempt.xpEarned,
        baseXP: attempt.baseXP,
        accuracyBonus: attempt.accuracyBonus,
        speedBonus: attempt.speedBonus,
        streakBonus: attempt.streakBonus,
        perfectBonus: attempt.perfectBonus,
        streak: attempt.streak,
        totalTimeSpent: attempt.totalTimeSpent,
        averageTimePerQ: attempt.averageTimePerQ,
        completedAt:
          attempt.completedAt?.toISOString() || new Date().toISOString(),
        status: attempt.status,
      }}
      quiz={{
        id: attempt.quiz.id,
        slug: attempt.quiz.slug,
        title: attempt.quiz.title,
        subject: attempt.quiz.subject,
        domain: attempt.quiz.domain || undefined,
        className: attempt.quiz.className || undefined,
        topics: attempt.quiz.topics,
        difficultyLevel: attempt.quiz.difficultyLevel,
        difficultyTier: attempt.quiz.difficultyTier,
        questionCount: attempt.quiz.questionCount,
        allowReplay: attempt.quiz.allowReplay,
        provider: attempt.quiz.provider.name,
        providerType: attempt.quiz.provider.type,
      }}
      questions={questionResults}
      userId={session.user.id}
      userName={session.user.name || "Player"}
      isOwner={attempt.userId === session.user.id}
    />
  );
}
