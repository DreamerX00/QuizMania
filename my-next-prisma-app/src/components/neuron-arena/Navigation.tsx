import React from 'react';
import { useQuizStore } from './state/quizStore';

const Navigation = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const setCurrentIndex = useQuizStore((s) => s.setCurrentIndex);
  if (!quiz) return null;
  const total = quiz.questions.length;

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <button
        className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition disabled:opacity-40"
        onClick={() => setCurrentIndex(currentIndex - 1)}
        disabled={currentIndex === 0}
      >
        ← Prev
      </button>
      <div className="font-heading text-lg">Q{currentIndex + 1} / {total}</div>
      <button
        className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition disabled:opacity-40"
        onClick={() => setCurrentIndex(currentIndex + 1)}
        disabled={currentIndex === total - 1}
      >
        Next →
      </button>
    </div>
  );
};

export default Navigation; 