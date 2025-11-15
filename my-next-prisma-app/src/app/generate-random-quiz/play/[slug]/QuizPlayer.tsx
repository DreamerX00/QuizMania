"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Award,
} from "lucide-react";
import { Spinner } from "@/components/ui/loading";

interface QuizQuestion {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  difficulty?: string;
  topic?: string;
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
  timeLimit?: number;
  questions: QuizQuestion[];
  baseXP: number;
  bonusMultiplier?: number;
  createdAt: string;
}

interface ResumeData {
  attemptId: string;
  answers: Record<string, string>;
  currentQuestion: number;
  timeRemaining?: number;
}

interface QuizPlayerProps {
  quiz: QuizData;
  userId: string;
  userName: string;
  resumeData?: ResumeData;
}

export default function QuizPlayer({
  quiz,
  userId,
  resumeData,
}: QuizPlayerProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(
    resumeData?.currentQuestion || 0
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    resumeData?.answers || {}
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(
    resumeData?.timeRemaining || quiz.timeLimit || 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(
    resumeData?.attemptId || null
  );
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  // Initialize timer
  useEffect(() => {
    if (!quiz.timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.timeLimit]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!attemptId) return;

    autoSaveTimerRef.current = setInterval(() => {
      saveProgress();
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQuestion, timeRemaining, attemptId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-4 for selecting options
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQ = quiz.questions[currentQuestion];
        if (currentQ && currentQ.options[optionIndex]) {
          handleAnswer(currentQ.options[optionIndex].id);
        }
      }
      // N for next
      else if (e.key.toLowerCase() === "n" && !e.ctrlKey && !e.metaKey) {
        if (currentQuestion < quiz.questions.length - 1) {
          handleNext();
        }
      }
      // P for previous
      else if (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey) {
        if (currentQuestion > 0) {
          handlePrevious();
        }
      }
      // S for submit
      else if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowConfirmSubmit(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, quiz.questions.length]);

  const saveProgress = async () => {
    if (!attemptId) {
      // Create new attempt
      try {
        const response = await fetch("/api/ai-quiz/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            userId,
            answers,
            timeRemaining,
            status: "IN_PROGRESS",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAttemptId(data.attemptId);
        }
      } catch (error) {
        console.error("Failed to create attempt:", error);
      }
    } else {
      // Update existing attempt
      try {
        await fetch(`/api/ai-quiz/attempt/${attemptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            timeRemaining,
          }),
        });
        lastSaveRef.current = Date.now();
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  };

  const handleAnswer = (optionId: string) => {
    const currentQ = quiz.questions[currentQuestion];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    toast.info("Time's up! Submitting your quiz...");
    await submitQuiz();
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai-quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          userId,
          answers,
          attemptId,
          timeSpent: quiz.timeLimit
            ? quiz.timeLimit - timeRemaining
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Submit failed:", errorData);
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const data = await response.json();

      toast.success("Quiz submitted successfully! 🎉", {
        description: `You earned ${data.totalXP} XP!`,
      });

      // Redirect to results page
      router.push(`/generate-random-quiz/results/${data.attemptId}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;

    if (unansweredCount > 0) {
      toast.warning(`You have ${unansweredCount} unanswered questions`, {
        description: "You can still submit, but they will be marked incorrect.",
        action: {
          label: "Review",
          onClick: () => setShowConfirmSubmit(false),
        },
      });
    }

    setShowConfirmSubmit(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = quiz.questions[currentQuestion];
  const progressPercentage =
    (Object.keys(answers).length / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  // Safety check for currentQ
  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz question not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please refresh the page or return to the quiz selection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {quiz.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {quiz.subject} • {quiz.difficultyTier} Level
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {quiz.timeLimit && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    timeRemaining < 300
                      ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-mono font-bold text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              {/* XP Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg">
                <Award className="w-5 h-5" />
                <span className="font-bold">
                  {quiz.baseXP} <span className="text-sm">Base XP</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <span>
                {answeredQuestions} / {quiz.questions.length} answered
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                      Question {currentQuestion + 1}
                    </span>
                    {currentQ.difficulty && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                        {currentQ.difficulty}
                      </span>
                    )}
                    {currentQ.topic && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                        {currentQ.topic}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                    {currentQ.text}
                  </h2>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = answers[currentQ.id] === option.id;
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {optionLabel}
                        </div>
                        <span
                          className={`flex-1 text-lg ${
                            isSelected
                              ? "text-blue-900 dark:text-blue-100 font-medium"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {option.text}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  💡 Tip: Use{" "}
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    1-4
                  </kbd>{" "}
                  to select,{" "}
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    N
                  </kbd>{" "}
                  for next,{" "}
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    P
                  </kbd>{" "}
                  for previous
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {quiz.questions.map((_, index) => {
                  const question = quiz.questions[index];
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        index === currentQuestion
                          ? "bg-blue-500 text-white scale-110"
                          : question && answers[question.id]
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg relative"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" withGlow={false} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Quiz</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setShowConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Submit Quiz?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You have answered {answeredQuestions} out of{" "}
                  {quiz.questions.length} questions.
                  {answeredQuestions < quiz.questions.length &&
                    " Unanswered questions will be marked incorrect."}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-all"
                  >
                    Review
                  </button>
                  <button
                    onClick={submitQuiz}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Spinner size="sm" withGlow={false} />}
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
