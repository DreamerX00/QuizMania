import React, { useState, useEffect, useRef } from "react";
import { useQuizStore } from "../state/quizStore";
import type { Question } from "../types/quiz.types";
import MDEditor from "@uiw/react-md-editor";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { isEqual } from "lodash";

const LOCAL_KEY = "paragraph-draft";

const Paragraph = ({ question }: { question: Question }) => {
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
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const setResponse = useQuizStore((s) => s.setResponse);
  const min = question.minWordCount || 0;
  const max = question.maxWordCount || 1000;
  const words = value.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = value.length;
  const underMin = wordCount < min;
  const nearMin = wordCount < min + 5 && !underMin;
  const nearMax = wordCount > max - 10 && wordCount <= max;
  const overMax = wordCount > max;
  const statusRef = useRef(null);

  // Auto-save draft every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(LOCAL_KEY, value);
      setLastSaved(Date.now());
      toast("Draft saved.", { icon: "💾", duration: 1500 });
    }, 30000);
    return () => clearInterval(interval);
  }, [value]);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(LOCAL_KEY);
    if (draft) setValue(draft);
  }, []);

  function handleChange(v: string | undefined) {
    if (!v) v = "";
    if (v.split(/\s+/).length > max) v = words.slice(0, max).join(" ");
    setValue(v);
    setResponse({
      questionId: question.id,
      response: v,
      markedForReview: false,
    });
    setSaving(true);
    setTimeout(() => setSaving(false), 500);
  }

  // Color logic for word count
  let countColor = "text-green-400";
  if (underMin || overMax) countColor = "text-red-400";
  else if (nearMin || nearMax) countColor = "text-yellow-400";

  return (
    <section
      role="region"
      aria-labelledby="question-title"
      className="flex flex-col gap-4"
    >
      <div
        id="question-title"
        className="font-heading text-lg mb-2 flex items-center gap-2"
      >
        {question.question}
        <span
          tabIndex={0}
          className="ml-2 text-xs bg-yellow-400/20 text-yellow-700 px-2 py-1 rounded cursor-help"
          title="This question requires human evaluation."
        >
          🕒 Manual Review
        </span>
      </div>
      <div data-color-mode="dark">
        <MDEditor
          value={value}
          onChange={handleChange}
          height={220}
          preview="edit"
          textareaProps={{
            placeholder:
              "Write your detailed answer here... (Markdown supported)",
            "aria-label": "Markdown editor for your answer",
          }}
        />
      </div>
      <motion.div
        className={`flex items-center gap-4 text-sm ${countColor}`}
        aria-live="polite"
        animate={underMin ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        ref={statusRef}
      >
        <span>
          Word count: {wordCount} / {max}
        </span>
        <span>Char count: {charCount}</span>
        {saving && <span className="text-blue-400">Saving…</span>}
        {lastSaved && <span className="text-white/40">Draft saved</span>}
        {underMin && (
          <span className="text-yellow-400">
            ⚠️ You’ve written {wordCount} words. Minimum {min} required to
            submit.
          </span>
        )}
        {overMax && <span className="text-red-400">Over max word limit!</span>}
      </motion.div>
      <div className="bg-white/5 rounded-lg p-4 min-h-[120px] prose prose-invert">
        <MDEditor.Markdown source={value || "*Nothing to preview yet.*"} />
      </div>
    </section>
  );
};

export default Paragraph;
