import React, { useState, useEffect } from "react";
import { useQuizStore } from "../state/quizStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { isEqual } from "lodash";
import type { Question } from "../types/quiz.types";

interface PollOption {
  id: string;
  votes?: number;
  percent?: number;
  text?: string;
  label?: string;
}

// Simulate poll results for demo
const fakeResults = (options: PollOption[], userAnswer: string) => {
  const base = options.map((opt: PollOption) => ({
    ...opt,
    votes: Math.floor(Math.random() * 20) + 1,
  }));
  if (userAnswer) {
    const idx = base.findIndex((opt: PollOption) => opt.id === userAnswer);
    if (idx !== -1 && base[idx]) {
      base[idx].votes = (base[idx].votes || 0) + 1;
    }
  }
  const total = base.reduce(
    (sum: number, o: PollOption) => sum + (o.votes || 0),
    0
  );
  return base.map((opt: PollOption) => ({
    ...opt,
    percent: Math.round(((opt.votes || 0) / total) * 100),
  }));
};

const Poll = ({ question }: { question: Question }) => {
  const responses = useQuizStore((s) => s.responses);
  const prev =
    responses.find((r) => r.questionId === question.id)?.response ?? "";
  const [selected, setSelected] = useState(String(prev));
  useEffect(() => {
    if (!isEqual(selected, prev)) {
      setSelected(String(prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, question.id]);
  const [submitted, setSubmitted] = useState(false);
  const setResponse = useQuizStore((s) => s.setResponse);

  function handleSelect(id: string) {
    setSelected(id);
    setResponse({
      questionId: question.id,
      response: id,
      markedForReview: false,
    });
    toast("Thanks for voting! Results will be visible after quiz submission.", {
      icon: "🗳️",
    });
    setSubmitted(true);
  }

  // Simulate poll results (replace with real data in production)
  const options = (question.options || []) as unknown as PollOption[];
  const results = fakeResults(options, selected);

  return (
    <section
      role="region"
      aria-labelledby="poll-title"
      className="flex flex-col gap-4"
    >
      <div
        id="poll-title"
        className="font-heading text-lg mb-2 flex items-center gap-2"
      >
        {question.question}
        <span
          tabIndex={0}
          className="ml-2 text-xs bg-blue-400/20 text-blue-700 px-2 py-1 rounded cursor-help"
          title="Polls are not scored. Results are for analytics only."
        >
          📊 Poll
        </span>
      </div>
      {!submitted ? (
        <div className="flex flex-col gap-2">
          {options.map((opt: PollOption) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${
                selected === opt.id
                  ? "bg-(--primary-accent) text-white"
                  : "bg-white/10 text-white/80"
              }`}
              aria-label={`Vote for ${opt.text}`}
            >
              <input
                type="radio"
                name={`poll-${question.id}`}
                checked={selected === opt.id}
                onChange={() => handleSelect(opt.id)}
                className="accent-(--primary-accent)"
                disabled={submitted}
              />
              {opt.text}
            </label>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          <div className="mb-2 text-sm text-blue-300">
            Your choice:{" "}
            <b>{options.find((o: PollOption) => o.id === selected)?.text}</b> ✅
          </div>
          {results.map((opt: PollOption) => (
            <div key={opt.id} className="flex items-center gap-2">
              <span className="w-32 truncate" title={opt.text}>
                {opt.text}
              </span>
              <motion.div
                className="h-4 rounded bg-(--primary-accent)"
                style={{ width: `${opt.percent}%`, minWidth: 8 }}
                initial={{ width: 0 }}
                animate={{ width: `${opt.percent}%` }}
                transition={{ duration: 0.7 }}
              />
              <span className="ml-2 text-xs">
                {opt.votes} votes ({opt.percent}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Poll;
