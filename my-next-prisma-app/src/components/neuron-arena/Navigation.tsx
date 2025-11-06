import React, { useEffect } from "react";
import { useQuizStore } from "./state/quizStore";

const Navigation = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const setCurrentIndex = useQuizStore((s) => s.setCurrentIndex);

  // Always call hooks, even if quiz is null
  useEffect(() => {
    if (!quiz) return;
    function handleKey(e: KeyboardEvent) {
      if (!quiz) return; // Extra null check for TypeScript
      if (e.key === "ArrowLeft" && currentIndex > 0)
        setCurrentIndex(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < quiz.questions.length - 1)
        setCurrentIndex(currentIndex + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [quiz, currentIndex, setCurrentIndex]);

  if (!quiz) return null;
  const total = quiz.questions.length;

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <button
        className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition disabled:opacity-40"
        onClick={() => setCurrentIndex(currentIndex - 1)}
        disabled={currentIndex === 0}
        aria-label="Previous question"
        title="Previous question (←)"
      >
        ← Prev
      </button>
      <div className="font-heading text-lg">
        Q{currentIndex + 1} / {total}
      </div>
      <button
        className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition disabled:opacity-40"
        onClick={() => setCurrentIndex(currentIndex + 1)}
        disabled={currentIndex === total - 1}
        aria-label="Next question"
        title="Next question (→)"
      >
        Next →
      </button>
    </div>
  );
};

export default Navigation;
