"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Trophy,
  Target,
  Zap,
  Award,
  Clock,
  TrendingUp,
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  MinusCircle,
  BookOpen,
} from "lucide-react";

interface AttemptData {
  id: string;
  attemptNumber: number;
  score: number;
  percentage: number;
  accuracy: number;
  grade: string;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalQuestions: number;
  xpEarned: number;
  baseXP: number;
  accuracyBonus: number;
  speedBonus: number;
  streakBonus: number;
  perfectBonus: number;
  streak: number;
  totalTimeSpent: number;
  averageTimePerQ: number;
  completedAt: string;
  status: string;
}

interface QuizData {
  id: string;
  slug: string;
  title: string;
  subject: string;
  domain?: string;
  className?: string;
  topics: string[];
  difficultyLevel: number;
  difficultyTier: string;
  questionCount: number;
  allowReplay: boolean;
  provider: string;
  providerType: string;
}

interface QuestionResult {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  selectedAnswer: {
    id: string;
    text: string;
  } | null;
  correctAnswer: {
    id: string;
    text: string;
  };
  explanation?: string;
  difficulty?: string;
  topic?: string;
  isCorrect: boolean;
  wasSkipped: boolean;
}

interface ResultsDashboardProps {
  attempt: AttemptData;
  quiz: QuizData;
  questions: QuestionResult[];
  userId: string;
  userName: string;
  isOwner: boolean;
}

type QuestionFilter = "all" | "correct" | "wrong" | "skipped";

export default function ResultsDashboard({
  attempt,
  quiz,
  questions,
}: ResultsDashboardProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const getGradeColor = (grade: string) => {
    if (grade === "S") return "from-yellow-400 to-orange-500";
    if (grade.startsWith("A")) return "from-green-400 to-emerald-500";
    if (grade.startsWith("B")) return "from-blue-400 to-cyan-500";
    if (grade.startsWith("C")) return "from-purple-400 to-pink-500";
    if (grade.startsWith("D")) return "from-orange-400 to-red-500";
    return "from-red-500 to-red-700";
  };

  const getGradeEmoji = (grade: string) => {
    if (grade === "S") return "🏆";
    if (grade.startsWith("A")) return "🌟";
    if (grade.startsWith("B")) return "👍";
    if (grade.startsWith("C")) return "📝";
    if (grade.startsWith("D")) return "😅";
    return "💪";
  };

  const filteredQuestions = questions.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "wrong") return !q.isCorrect && !q.wasSkipped;
    if (filter === "skipped") return q.wasSkipped;
    return true;
  });

  const handleRetake = () => {
    router.push(`/generate-random-quiz/play/${quiz.slug}`);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareText = `I scored ${attempt.score}% (Grade ${attempt.grade}) on "${quiz.title}" and earned ${attempt.xpEarned} XP! 🎉`;
      const shareUrl = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: `Quiz Results: ${quiz.title}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const xpBonuses = [
    {
      label: "Base XP",
      value: attempt.baseXP,
      icon: Award,
      color: "text-blue-500",
      show: true,
    },
    {
      label: "Accuracy Bonus",
      value: attempt.accuracyBonus,
      icon: Target,
      color: "text-green-500",
      show: attempt.accuracyBonus > 0,
    },
    {
      label: "Speed Bonus",
      value: attempt.speedBonus,
      icon: Zap,
      color: "text-yellow-500",
      show: attempt.speedBonus > 0,
    },
    {
      label: "Streak Bonus",
      value: attempt.streakBonus,
      icon: TrendingUp,
      color: "text-purple-500",
      show: attempt.streakBonus > 0,
    },
    {
      label: "Perfect Score",
      value: attempt.perfectBonus,
      icon: Trophy,
      color: "text-orange-500",
      show: attempt.perfectBonus > 0,
    },
  ].filter((bonus) => bonus.show);

  return (
    <div className="min-h-screen pt-20 bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {quiz.title} • Attempt #{attempt.attemptNumber}
          </p>
        </div>

        {/* Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Grade Display */}
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-linear-to-br ${getGradeColor(
                  attempt.grade
                )} text-white text-6xl font-bold shadow-lg mb-4`}
              >
                {attempt.grade}
              </div>
              <div className="text-5xl mb-2">
                {getGradeEmoji(attempt.grade)}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {attempt.score}%
              </p>
              <p className="text-gray-600 dark:text-gray-400">Your Score</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Correct
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {attempt.correctCount}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Wrong
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {attempt.wrongCount}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MinusCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Skipped
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {attempt.skippedCount}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Time
                  </span>
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(attempt.totalTimeSpent)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-500" />
            XP Breakdown
          </h2>

          <div className="space-y-4">
            {xpBonuses.map((bonus, index) => {
              const Icon = bonus.icon;
              return (
                <motion.div
                  key={bonus.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center ${bonus.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {bonus.label}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    +{bonus.value} XP
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Total XP Earned
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                {attempt.xpEarned} XP
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Performance Metrics
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Accuracy
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(attempt.accuracy * 100)}%
              </p>
            </div>

            <div className="text-center p-4 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Max Streak
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {attempt.streak}
              </p>
            </div>

            <div className="text-center p-4 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Time/Q
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {attempt.averageTimePerQ}s
              </p>
            </div>
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-500" />
              Question Review
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "correct", label: "Correct" },
                  { key: "wrong", label: "Wrong" },
                  { key: "skipped", label: "Skipped" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === tab.key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const isExpanded = expandedQuestion === question.id;
              const questionNumber =
                questions.findIndex((q) => q.id === question.id) + 1;

              return (
                <div
                  key={question.id}
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    question.isCorrect
                      ? "border-green-200 dark:border-green-800"
                      : question.wasSkipped
                      ? "border-gray-200 dark:border-gray-700"
                      : "border-red-200 dark:border-red-800"
                  }`}
                >
                  <button
                    onClick={() =>
                      setExpandedQuestion(isExpanded ? null : question.id)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          question.isCorrect
                            ? "bg-green-100 dark:bg-green-900/20"
                            : question.wasSkipped
                            ? "bg-gray-100 dark:bg-gray-700"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {question.isCorrect ? (
                          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : question.wasSkipped ? (
                          <MinusCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Question {questionNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {question.difficulty && `${question.difficulty} • `}
                          {question.topic || quiz.subject}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30"
                    >
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {question.text}
                      </p>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => {
                          const isSelected =
                            option.id === question.selectedAnswer?.id;
                          const isCorrect = option.isCorrect;

                          return (
                            <div
                              key={option.id}
                              className={`p-4 rounded-lg border-2 ${
                                isCorrect
                                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                  : isSelected
                                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isCorrect && (
                                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                                )}
                                {!isCorrect && isSelected && (
                                  <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                                )}
                                <span
                                  className={`flex-1 ${
                                    isCorrect || isSelected ? "font-medium" : ""
                                  } ${
                                    isCorrect
                                      ? "text-green-900 dark:text-green-100"
                                      : isSelected
                                      ? "text-red-900 dark:text-red-100"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {option.text}
                                </span>
                                {isCorrect && (
                                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    Correct Answer
                                  </span>
                                )}
                                {!isCorrect && isSelected && (
                                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            💡 Explanation
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          {quiz.allowReplay && (
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Quiz
            </button>
          )}

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share Results
          </button>

          <button
            onClick={() => router.push("/generate-random-quiz")}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
}
