import React, { useState, useEffect } from "react";
import { useQuizStore } from "../state/quizStore";
import type { Question } from "../types/quiz.types";
import { isEqual } from "lodash";

const Ordering = ({ question }: { question: Question }) => {
  const responses = useQuizStore((s) => s.responses);
  const defaultOrder: unknown[] = Array.isArray(question.orderedItems)
    ? question.orderedItems
    : [];
  const prev =
    responses.find((r) => r.questionId === question.id)?.response ??
    defaultOrder;
  const [order, setOrder] = useState<unknown[]>(
    Array.isArray(prev) ? prev : defaultOrder
  );
  useEffect(() => {
    if (!isEqual(order, prev)) {
      setOrder(Array.isArray(prev) ? prev : defaultOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, question.id]);
  const setResponse = useQuizStore((s) => s.setResponse);
  function move(idx: number, dir: -1 | 1) {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrder(next);
    setResponse({ questionId: question.id, response: next });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      <ol className="flex flex-col gap-2 bg-muted/60 rounded-xl p-6 shadow-lg">
        {order.map((item, i: number) => {
          const text = typeof item === "string" ? item : String(item);
          return (
            <li
              key={i}
              className="rounded-lg bg-white/10 px-4 py-2 shadow flex items-center gap-2 cursor-move"
            >
              <span className="font-bold">{i + 1}.</span> {text}
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="ml-2 px-2 py-1 rounded bg-white/20 text-xs disabled:opacity-40"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                className="px-2 py-1 rounded bg-white/20 text-xs disabled:opacity-40"
              >
                ↓
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Ordering;
