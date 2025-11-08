import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizPlayer from "./QuizPlayer";

interface PlayPageProps {
  params: {
    slug: string;
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/generate-random-quiz/play/" + params.slug);
  }

  // Fetch quiz from database
  const quiz = await prisma.aIGeneratedQuiz.findUnique({
    where: { slug: params.slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Check if user owns this quiz OR it's public
  if (quiz.userId !== session.user.id && !quiz.isPublic) {
    redirect("/generate-random-quiz");
  }

  // Check if quiz is playable (COMPLETED or ACTIVE)
  if (quiz.status !== "COMPLETED" && quiz.status !== "ACTIVE") {
    redirect(`/generate-random-quiz/preview/${params.slug}`);
  }

  // Fetch recent attempts separately
  const attempts = await prisma.aIQuizAttempt.findMany({
    where: {
      quizId: quiz.id,
      userId: session.user.id,
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 1,
  });

  // Parse questions from JSON (hide correct answers)
  const questionsData = quiz.questions as Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    explanation?: string;
    difficulty?: string;
    topic?: string;
  }>;

  // Remove correct answer indicators for player
  const questions = questionsData.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
    })),
    difficulty: q.difficulty,
    topic: q.topic,
  }));

  // Check if there's a recent incomplete attempt (within last 24 hours)
  const recentAttempt = attempts[0];
  const canResume =
    recentAttempt &&
    recentAttempt.status === "in-progress" &&
    new Date().getTime() - recentAttempt.startedAt.getTime() <
      24 * 60 * 60 * 1000;

  return (
    <QuizPlayer
      quiz={{
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        subject: quiz.subject,
        domain: quiz.domain || undefined,
        className: quiz.className || undefined,
        topics: quiz.topics as string[],
        difficultyLevel: quiz.difficultyLevel,
        difficultyTier: quiz.difficultyTier,
        questionCount: quiz.questionCount,
        timeLimit: quiz.timeLimit || undefined,
        questions: questions,
        baseXP: quiz.baseXP,
        bonusMultiplier: quiz.bonusXPMultiplier || undefined,
        createdAt: quiz.createdAt.toISOString(),
      }}
      userId={session.user.id}
      userName={session.user.name || "Player"}
      resumeData={
        canResume && recentAttempt
          ? {
              attemptId: recentAttempt.id,
              answers: recentAttempt.answers as Record<string, string>,
              currentQuestion: Object.keys(
                recentAttempt.answers as Record<string, string>
              ).length,
              timeRemaining: quiz.timeLimit
                ? quiz.timeLimit - recentAttempt.totalTimeSpent
                : undefined,
            }
          : undefined
      }
    />
  );
}
