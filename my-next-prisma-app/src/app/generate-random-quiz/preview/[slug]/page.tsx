import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PreviewClient from "./PreviewClient";

interface PreviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/generate-random-quiz/preview/" + slug);
  }

  // Fetch quiz from database
  const quiz = await prisma.aIGeneratedQuiz.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      provider: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Check if user owns this quiz
  if (quiz.userId !== session.user.id) {
    redirect("/generate-random-quiz");
  }

  // Parse questions from JSON
  const questionsData = quiz.questions as Array<{
    id: string;
    text?: string;
    question?: string; // Some AI responses use 'question' instead of 'text'
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    explanation?: string;
    difficulty?: string;
    topic?: string;
  }>;

  // Normalize question field name
  const questions = questionsData.map((q) => ({
    ...q,
    text: q.text || q.question || "Question text not available",
  }));

  // Calculate estimated minutes (2 minutes per question default)
  const estimatedMinutes = Math.ceil(quiz.questionCount * 2);
  // Calculate potential XP (baseXP * 3.3 for max bonuses)
  const potentialXP = Math.round(quiz.baseXP * 3.3);

  return (
    <PreviewClient
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
        estimatedMinutes,
        potentialXP,
        bonusMultiplier: quiz.bonusXPMultiplier || undefined,
        status: quiz.status,
        createdAt: quiz.createdAt.toISOString(),
        provider: quiz.provider.name,
        providerType: quiz.provider.type,
      }}
      userName={session.user.name || "You"}
    />
  );
}
