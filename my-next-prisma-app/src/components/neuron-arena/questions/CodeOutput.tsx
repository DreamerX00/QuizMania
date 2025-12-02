import React, { useState, useEffect } from "react";
import { useQuizStore } from "../state/quizStore";
import type { Question } from "../types/quiz.types";
import { isEqual } from "lodash";

const CodeOutput = ({ question }: { question: Question }) => {
  const responses = useQuizStore((s) => s.responses);
  const prev =
    responses.find((r) => r.questionId === question.id)?.response ?? "";
  const [value, setValue] = useState(String(prev));
  useEffect(() => {
    if (!isEqual(value, prev)) {
      setValue(String(prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, question.id]);
  const setResponse = useQuizStore((s) => s.setResponse);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    setResponse({ questionId: question.id, response: e.target.value });
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="font-heading text-2xl font-bold mb-2 pb-4 border-b border-muted-foreground/20">
        {question.question}
      </div>
      <div className="bg-muted/60 rounded-xl p-6 shadow-lg flex flex-col gap-4">
        <pre className="bg-black/60 rounded-lg p-4 font-mono text-white mb-2">
          {String(question.codeSnippet || "")}
        </pre>
        <input
          className="w-40 px-2 py-2 rounded bg-white/10 border-b-2 border-(--primary-accent) text-white focus:outline-none font-mono"
          placeholder="Expected Output"
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default CodeOutput;
