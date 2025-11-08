"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIFFICULTY_LEVELS } from "@/constants/ai-quiz";
import type {
  AIQuizStatus,
  DifficultyTier,
  AIProviderType,
} from "@prisma/client";

interface PreviewQuestion {
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
}

interface PreviewQuiz {
  id: string;
  slug: string;
  title: string;
  subject: string;
  domain?: string;
  className?: string;
  topics: string[];
  difficultyLevel: number;
  difficultyTier: DifficultyTier;
  questionCount: number;
  timeLimit?: number;
  questions: PreviewQuestion[];
  estimatedMinutes: number;
  potentialXP: number;
  bonusMultiplier?: number;
  status: AIQuizStatus;
  createdAt: string;
  provider: string;
  providerType: AIProviderType;
}

interface PreviewClientProps {
  quiz: PreviewQuiz;
  userName: string;
}

export default function PreviewClient({ quiz, userName }: PreviewClientProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const difficultyConfig = DIFFICULTY_LEVELS.find(
    (d) => d.level === quiz.difficultyLevel
  );

  // Validate quiz data
  if (
    !quiz.id ||
    !quiz.slug ||
    !quiz.questions ||
    quiz.questions.length === 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Quiz Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This quiz appears to be corrupted or incomplete.
          </p>
          <button
            onClick={() => router.push("/generate-random-quiz")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Generate New Quiz
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    )
      return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/ai-quiz/${quiz.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete quiz");
      }

      // Show success message briefly before redirect
      alert("Quiz deleted successfully!");
      router.push("/generate-random-quiz");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete quiz");
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 inline-flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {quiz.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Created by {userName} •{" "}
            {new Date(quiz.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Difficulty Card */}
          {difficultyConfig && (
            <div
              className="p-6 rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${difficultyConfig.color}20, ${difficultyConfig.color}40)`,
                borderLeft: `4px solid ${difficultyConfig.color}`,
              }}
            >
              <div className="text-4xl mb-2">{difficultyConfig.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {difficultyConfig.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Level {quiz.difficultyLevel}
              </p>
            </div>
          )}

          {/* Questions & Time */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-2">📝</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {quiz.questionCount} Questions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Est. {quiz.estimatedMinutes} min
              {quiz.timeLimit && ` • ${quiz.timeLimit / 60} min limit`}
            </p>
          </div>

          {/* XP Potential */}
          <div className="p-6 bg-linear-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl shadow-lg border-2 border-yellow-400 dark:border-yellow-600">
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Up to {quiz.potentialXP} XP
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {quiz.bonusMultiplier && quiz.bonusMultiplier > 1
                ? `${quiz.bonusMultiplier}x Bonus!`
                : "Base reward"}
            </p>
          </div>
        </div>

        {/* Subject & Topics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Subject & Topics
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Subject:
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {quiz.subject}
              </span>
              {quiz.domain && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {quiz.domain}
                  </span>
                </>
              )}
              {quiz.className && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {quiz.className}
                  </span>
                </>
              )}
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                Topics ({quiz.topics.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {quiz.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Generated by:
              </span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {quiz.provider} ({quiz.providerType})
              </span>
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Questions Preview
            </h2>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
            >
              {expanded ? "Collapse All" : "Expand All"}
            </button>
          </div>

          <div className="space-y-4">
            {quiz.questions
              .slice(0, expanded ? undefined : 3)
              .map((question, idx) => (
                <div
                  key={question.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium mb-3">
                        {question.text}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border-2 ${
                              option.isCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                            }`}
                          >
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>{" "}
                            <span
                              className={
                                option.isCorrect
                                  ? "text-green-800 dark:text-green-200 font-medium"
                                  : "text-gray-700 dark:text-gray-300"
                              }
                            >
                              {option.text}
                            </span>
                            {option.isCorrect && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                ✓
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                      {question.topic && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Topic: {question.topic}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {!expanded && quiz.questions.length > 3 && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full py-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
              >
                Show {quiz.questions.length - 3} more questions...
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() =>
              router.push(`/generate-random-quiz/play/${quiz.slug}`)
            }
            className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            🚀 Start Quiz
          </button>

          <button
            onClick={() => router.push("/generate-random-quiz")}
            className="px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
          >
            Generate Another
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "🗑️ Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

