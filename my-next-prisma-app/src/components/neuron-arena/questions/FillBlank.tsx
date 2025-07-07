import React from 'react';
import type { Question } from '../types/quiz.types';

const FillBlank = ({ question }: { question: Question }) => {
  // For now, just show the question text and a single input if fillBlanksAnswers exists
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">{question.question}</div>
      <div className="text-lg">
        {question.fillBlanksAnswers ? (
          question.question.replace(/___+/g, () => (
            `<input class='inline-block w-32 px-2 py-1 rounded bg-white/10 border-b-2 border-[var(--primary-accent)] text-white focus:outline-none' placeholder='__________' />`
          ))
        ) : (
          <input className="inline-block w-32 px-2 py-1 rounded bg-white/10 border-b-2 border-[var(--primary-accent)] text-white focus:outline-none" placeholder="__________" />
        )}
      </div>
      <div className="text-xs text-white/60 mt-2">Case doesn't matter</div>
    </div>
  );
};

export default FillBlank; 