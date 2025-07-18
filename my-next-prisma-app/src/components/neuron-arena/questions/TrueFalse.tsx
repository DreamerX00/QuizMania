import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../state/quizStore';
import type { Question } from '../types/quiz.types';
import isEqual from 'lodash.isequal';

const TrueFalse = ({ question }: { question: Question }) => {
  const responses = useQuizStore(s => s.responses);
  const prev = responses.find(r => r.questionId === question.id)?.response ?? null;
  const [selected, setSelected] = useState<boolean | null>(prev);
  useEffect(() => {
    if (!isEqual(selected, prev)) {
      setSelected(prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, question.id]);
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleSelect(val: boolean) {
    setSelected(val);
    setResponse({ questionId: question.id, response: val });
  }
  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20 w-full text-center">
        {question.question}
      </div>
      <div className="flex gap-6 bg-muted/60 rounded-xl p-6 shadow-lg">
        <button
          className={`rounded-full px-8 py-4 font-bold text-xl transition
            ${selected === true ? 'bg-green-500/80 text-white scale-105 shadow-lg' : 'bg-green-500/20 hover:bg-green-500/40 text-green-300'}`}
          onClick={() => handleSelect(true)}
          aria-pressed={selected === true}
        >✅ True</button>
        <button
          className={`rounded-full px-8 py-4 font-bold text-xl transition
            ${selected === false ? 'bg-red-500/80 text-white scale-105 shadow-lg' : 'bg-red-500/20 hover:bg-red-500/40 text-red-300'}`}
          onClick={() => handleSelect(false)}
          aria-pressed={selected === false}
        >❌ False</button>
      </div>
    </div>
  );
};

export default TrueFalse; 