import React from 'react';
import type { Question } from '../types/quiz.types';

const MCQMultiple = ({ question }: { question: Question }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">{question.question}</div>
      <div className="grid grid-cols-2 gap-2">
        {question.options?.map((opt, i) => (
          <button key={opt.id || i} className="rounded-full px-6 py-3 bg-white/10 hover:bg-[var(--primary-accent)] transition font-bold flex items-center gap-3">
            <span className="rounded-full w-8 h-8 flex items-center justify-center bg-white/20 font-heading">{String.fromCharCode(65 + i)}</span>
            {opt.text}
          </button>
        ))}
      </div>
      <div className="text-xs text-white/60 mt-2">Selected 0 of {question.options?.length}</div>
    </div>
  );
};

export default MCQMultiple; 