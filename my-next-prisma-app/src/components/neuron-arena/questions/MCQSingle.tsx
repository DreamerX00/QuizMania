import React, { useState } from 'react';
import { useQuizStore } from '../state/quizStore';
import type { Question } from '../types/quiz.types';

const MCQSingle = ({ question }: { question: Question }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleSelect(optId: string) {
    setSelected(optId);
    setResponse({ questionId: question.id, response: optId });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      <div className="flex flex-col gap-3 bg-muted/60 rounded-xl p-6 shadow-lg">
        {question.options?.map((opt, i) => (
          <button
            key={opt.id || i}
            className={`rounded-full px-6 py-3 font-bold flex items-center gap-3 transition
              ${selected === (opt.id || i)
                ? 'bg-[var(--primary-accent)] text-white scale-105 shadow-lg'
                : 'bg-white/10 hover:bg-[var(--primary-accent)]/80 text-white'}
            `}
            onClick={() => handleSelect(opt.id || i)}
            aria-pressed={selected === (opt.id || i)}
          >
            <span className="rounded-full w-8 h-8 flex items-center justify-center bg-white/20 font-heading">
              {String.fromCharCode(65 + i)}
            </span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MCQSingle; 