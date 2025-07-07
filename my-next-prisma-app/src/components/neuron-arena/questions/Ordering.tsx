import React from 'react';
import type { Question } from '../types/quiz.types';

const Ordering = ({ question }: { question: Question }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">{question.question}</div>
      <ol className="flex flex-col gap-2">
        {question.orderedItems?.map((item, i) => (
          <li key={i} className="rounded-lg bg-white/10 px-4 py-2 shadow flex items-center gap-2 cursor-move">
            <span className="font-bold">{i+1}.</span> {item}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Ordering; 