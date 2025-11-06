import React, { useEffect, useState } from "react";
import { useQuizStore } from "./state/quizStore";
import Confetti from "./Confetti";
import { useRouter } from "next/navigation";
import { evaluateResponse } from "./utils/evaluateResponse";

const ICONS = {
  correct: "✔",
  incorrect: "✖",
  manual: "🕒",
  poll: "📊",
};
const COLORS = {
  correct: "text-green-400",
  incorrect: "text-red-400",
  manual: "text-yellow-400",
  poll: "text-blue-400",
};

const ScoreSummary = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const responses = useQuizStore((s) => s.responses);
  const violations = useQuizStore((s) => s.violations);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const router = useRouter();
  if (!quiz) return null;

  // Evaluate all questions
  const questionResults = quiz.questions.map((q) => {
    const resp = responses.find((r) => r.questionId === q.id);
    return { ...evaluateResponse(q, resp!), question: q, userResponse: resp };
  });
  const correct = questionResults.filter((r) => r.status === "correct").length;
  const incorrect = questionResults.filter(
    (r) => r.status === "incorrect"
  ).length;
  const manual = questionResults.filter((r) => r.status === "manual").length;
  const poll = questionResults.filter((r) => r.status === "poll").length;
  const total = quiz.questions.length;
  const percent = Math.round((correct / (total - poll - manual)) * 100) || 0;
  const perfect =
    correct === total - poll - manual && incorrect === 0 && manual === 0;

  // Animate score
  useEffect(() => {
    setShowConfetti(true);
    let n = 0;
    const target = correct;
    const interval = setInterval(() => {
      n++;
      setAnimatedScore(Math.min(n, target));
      if (n >= target) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [correct]);

  // Auto-scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Animated progress bar
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    setTimeout(() => setProgress(percent), 200);
  }, [percent]);

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#232946] via-[#3b3b5b] to-[#1a1a2e] p-8 shadow-2xl backdrop-blur-2xl flex flex-col items-center border border-blue-400/20">
      {showConfetti && <Confetti />}
      <div className="font-heading text-4xl mb-2 text-white flex items-center gap-4">
        Score Summary
        {perfect && (
          <span className="ml-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-base font-bold animate-bounce">
            Perfect!
          </span>
        )}
      </div>
      <div className="w-full max-w-xl mt-2 mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg text-white/80 font-semibold">
            Total Score
          </span>
          <span className="text-2xl font-bold text-green-400">
            {animatedScore}/{total - poll - manual}
          </span>
        </div>
        <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>{percent}%</span>
          <span>
            {correct} Correct, {incorrect} Incorrect, {manual} Manual, {poll}{" "}
            Poll
          </span>
        </div>
      </div>
      {/* Question grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8 w-full max-w-2xl">
        {questionResults.map((r, i) => (
          <div
            key={r.question.id}
            className={`flex flex-col items-center p-3 rounded-xl shadow bg-white/10 border-2 ${
              r.status === "correct"
                ? "border-green-400"
                : r.status === "incorrect"
                ? "border-red-400"
                : r.status === "manual"
                ? "border-yellow-400"
                : "border-blue-400"
            } transition`}
          >
            <span className={`text-2xl font-bold ${COLORS[r.status]}`}>
              {ICONS[r.status]}
            </span>
            <span className="text-xs text-white/70 mt-1">Q{i + 1}</span>
          </div>
        ))}
      </div>
      {manual > 0 && (
        <div className="mt-2 text-yellow-300 text-center">
          Some answers require manual review before your final score is
          confirmed.
        </div>
      )}
      {poll > 0 && (
        <div className="mt-2 text-blue-300 text-center">
          Poll results will be available after quiz submission.
        </div>
      )}
      {violations.length > 0 && (
        <div className="mt-6 p-4 bg-red-100/10 border border-red-400 rounded-lg">
          <div className="font-bold text-red-300 mb-2">
            {violations.length} Violation{violations.length > 1 ? "s" : ""}{" "}
            Detected
          </div>
          <ul className="list-disc list-inside text-red-200">
            {violations.map((v, i) => (
              <li key={i}>
                {v.type}: {v.reason}
              </li>
            ))}
          </ul>
          <div className="text-xs text-red-400 mt-2">
            Your attempt may be flagged for review.
          </div>
        </div>
      )}
      <div className="flex gap-4 mt-10">
        <button
          className="rounded-xl px-8 py-3 bg-[var(--primary-accent)] text-white font-bold text-lg shadow-lg hover:scale-105 transition"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
        <button
          className="rounded-xl px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 transition"
          onClick={() => setShowReview(true)}
        >
          Review Answers
        </button>
      </div>
      <div className="mt-4 text-xs text-white/60">
        You will be redirected to the home page automatically.
      </div>
      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
            <button
              className="absolute top-4 right-4 text-xl text-white/60 hover:text-white/90"
              onClick={() => setShowReview(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="font-heading text-2xl mb-4 text-white">
              Review Answers
            </div>
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {questionResults.map((r, i) => (
                <div
                  key={r.question.id}
                  className="rounded-lg p-4 bg-white/5 border border-white/10 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xl font-bold ${COLORS[r.status]}`}>
                      {ICONS[r.status]}
                    </span>
                    <span className="font-semibold text-white/90">
                      Q{i + 1}:
                    </span>
                    <span className="text-white/80">{r.question.question}</span>
                  </div>
                  <div className="flex flex-col gap-1 ml-8">
                    <span className="text-sm text-white/70">
                      Your answer:{" "}
                      <span className="font-mono text-white/90">
                        {JSON.stringify(r.userResponse?.response) ?? (
                          <span className="italic text-red-400">No answer</span>
                        )}
                      </span>
                    </span>
                    {r.status === "incorrect" &&
                      r.question.correctAnswer !== undefined && (
                        <span className="text-sm text-green-300">
                          Correct answer:{" "}
                          <span className="font-mono">
                            {JSON.stringify(r.question.correctAnswer)}
                          </span>
                        </span>
                      )}
                    {"explanation" in r && r.explanation && (
                      <span className="text-xs text-blue-200">
                        Explanation: {r.explanation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreSummary;
