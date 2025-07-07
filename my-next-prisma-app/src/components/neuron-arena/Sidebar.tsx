import React from 'react';
import { useQuizStore } from './state/quizStore';

const Sidebar = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const setCurrentIndex = useQuizStore((s) => s.setCurrentIndex);
  const markedForReview = useQuizStore((s) => s.markedForReview);
  if (!quiz) return null;
  return (
    <aside className="rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur-md h-full flex flex-col gap-6">
      <div className="font-heading text-lg mb-2">Questions</div>
      {/* Question grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {quiz.questions.map((q, i) => {
          const isCurrent = i === currentIndex;
          const isMarked = markedForReview.includes(q.id);
          // Placeholder for correct/incorrect/answered
          return (
            <button
              key={q.id}
              className={`rounded-full w-10 h-10 font-bold border-2 flex items-center justify-center transition
                ${isCurrent ? 'bg-[var(--primary-accent)] border-[var(--primary-accent)] text-white scale-110' : 'bg-white/10 border-white/20 text-white/80'}
                ${isMarked ? 'ring-2 ring-yellow-400' : ''}
              `}
              onClick={() => setCurrentIndex(i)}
            >
              {i + 1}
              {isMarked && <span className="ml-1 text-yellow-400 text-xs">★</span>}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-block w-4 h-4 rounded-full bg-green-400 mr-1"></span> Correct
        <span className="inline-block w-4 h-4 rounded-full bg-red-400 mx-1"></span> Incorrect
        <span className="inline-block w-4 h-4 rounded-full bg-yellow-400 mx-1"></span> Marked
      </div>
      {/* Submit/Cancel placeholder */}
      <div className="mt-auto flex flex-col gap-2">
        <button className="w-full rounded-lg py-2 bg-[var(--primary-accent)] text-white font-bold">Submit</button>
        <button className="w-full rounded-lg py-2 bg-white/10 text-white">Cancel</button>
      </div>
    </aside>
  );
};

export default Sidebar; 