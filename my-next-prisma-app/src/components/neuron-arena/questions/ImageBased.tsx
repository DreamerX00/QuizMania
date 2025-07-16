import React, { useState } from 'react';
import { useQuizStore } from '../state/quizStore';
import type { Question } from '../types/quiz.types';

const ImageBased = ({ question }: { question: Question }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleSelect(optId: string) {
    setSelected(optId);
    setResponse({ questionId: question.id, response: optId });
  }
  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setResponse({ questionId: question.id, response: e.target.value });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      {question.imageUrl && (
        <img src={question.imageUrl} alt="Question" className="rounded-xl w-full max-w-xs mx-auto object-cover aspect-square" />
      )}
      <div className="bg-muted/60 rounded-xl p-6 shadow-lg flex flex-col gap-3 mt-2">
        {question.options ? (
          question.options.map((opt, i) => (
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
              <span className="rounded-full w-8 h-8 flex items-center justify-center bg-white/20 font-heading">{String.fromCharCode(65 + i)}</span>
              {opt.text}
            </button>
          ))
        ) : (
          <input
            className="w-full px-2 py-2 rounded bg-white/10 border-b-2 border-[var(--primary-accent)] text-white focus:outline-none font-mono"
            placeholder="Your Answer"
            value={input}
            onChange={handleInput}
          />
        )}
      </div>
    </div>
  );
};

export default ImageBased; 