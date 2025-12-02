import React, { useState, useEffect } from "react";
import { useQuizStore } from "../state/quizStore";
import type { Question } from "../types/quiz.types";
import { isEqual } from "lodash";

const MCQMultiple = ({ question }: { question: Question }) => {
  const responses = useQuizStore((s) => s.responses);
  const defaultSelected: string[] = [];
  const prev =
    responses.find((r) => r.questionId === question.id)?.response ??
    defaultSelected;
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(prev) ? prev : defaultSelected
  );
  useEffect(() => {
    if (!isEqual(selected, prev)) {
      setSelected(Array.isArray(prev) ? prev : defaultSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, question.id]);
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleToggle(optId: string) {
    let next;
    if (selected.includes(optId)) {
      next = selected.filter((id) => id !== optId);
    } else {
      next = [...selected, optId];
    }
    setSelected(next);
    setResponse({ questionId: question.id, response: next });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      <div className="grid grid-cols-2 gap-3 bg-muted/60 rounded-xl p-6 shadow-lg">
        {(
          question.options as
            | Array<{ id?: string; text?: string; label?: string }>
            | undefined
        )?.map((opt, i) => {
          const optId = opt.id || String(i);
          return (
            <button
              key={optId}
              className={`rounded-full px-6 py-3 font-bold flex items-center gap-3 transition
                ${
                  selected.includes(optId)
                    ? "bg-[var(--primary-accent)] text-white scale-105 shadow-lg"
                    : "bg-white/10 hover:bg-[var(--primary-accent)]/80 text-white"
                }
              `}
              onClick={() => handleToggle(optId)}
              aria-pressed={selected.includes(optId)}
            >
              <span className="rounded-full w-8 h-8 flex items-center justify-center bg-white/20 font-heading">
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text || opt.label}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Selected {selected.length} of {question.options?.length}
      </div>
    </div>
  );
};

export default MCQMultiple;
