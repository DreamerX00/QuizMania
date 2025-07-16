import React, { useState } from 'react';
import { useQuizStore } from '../state/quizStore';
import type { Question } from '../types/quiz.types';

const FillBlank = ({ question }: { question: Question }) => {
  const blanks = question.fillBlanksAnswers || [];
  const parts = question.question.split(/(___+)/g);
  const [answers, setAnswers] = useState<string[]>(Array(blanks.length).fill(''));
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleChange(idx: number, val: string) {
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);
    setResponse({ questionId: question.id, response: next });
  }
  // Use reduce to track blank indices
  let blankCounter = 0;
  const rendered = parts.map((part, i) => {
    if (part.match(/^___+$/)) {
      const idx = blankCounter;
      blankCounter++;
      return (
        <input
          key={i}
          className="inline-block w-32 px-2 py-1 mx-1 rounded bg-white/10 border-b-2 border-[var(--primary-accent)] text-white focus:outline-none"
          placeholder={"__________"}
          value={answers[idx] || ''}
          onChange={e => handleChange(idx, e.target.value)}
        />
      );
    } else {
      return <span key={i}>{part}</span>;
    }
  });
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        <span className="inline-block">
          {rendered}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-2">Case doesn't matter</div>
    </div>
  );
};

export default FillBlank; 