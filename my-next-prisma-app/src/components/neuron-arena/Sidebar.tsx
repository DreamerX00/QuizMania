import React from "react";
import { useQuizStore } from "./state/quizStore";
import { motion } from "framer-motion";

// Realistic state logic for question badges
function getQuestionState(i: number, responses: any[], quiz: any) {
  const q = quiz.questions[i];
  const resp = responses.find((r) => r.questionId === q.id);
  if (!resp) return "unanswered";
  if (
    q.type === "poll" ||
    q.type === "essay" ||
    q.type === "paragraph" ||
    q.type === "audio" ||
    q.type === "video"
  ) {
    return "answered"; // manual review or poll, just mark as answered
  }
  if (q.correctAnswer !== undefined) {
    if (JSON.stringify(resp.response) === JSON.stringify(q.correctAnswer))
      return "correct";
    return "answered"; // treat as answered until submission
  }
  return "answered";
}

const Sidebar = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const setCurrentIndex = useQuizStore((s) => s.setCurrentIndex);
  const markedForReview = useQuizStore((s) => s.markedForReview);
  const responses = useQuizStore((s) => s.responses);
  const submitted = useQuizStore((s) => s.submitted);
  if (!quiz) return null;
  return (
    <aside className="flex flex-col gap-6">
      <div className="font-heading text-lg mb-2">Questions</div>
      {/* Question grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {quiz.questions.map((q, i) => {
          const isCurrent = i === currentIndex;
          const isMarked = markedForReview.includes(q.id);
          const resp = responses.find((r) => r.questionId === q.id);
          // Only count as answered if response is non-empty
          function isNonEmptyResponse(r: any) {
            if (!r) return false;
            const val = r.response;
            if (val === undefined || val === null) return false;
            if (typeof val === "string") return val.trim().length > 0;
            if (Array.isArray(val))
              return val.some((v) =>
                typeof v === "string"
                  ? v.trim().length > 0
                  : v != null && v !== ""
              );
            if (typeof val === "object")
              return Object.values(val).some(
                (v) =>
                  v != null &&
                  v !== "" &&
                  (typeof v !== "string" || v.trim().length > 0)
              );
            return true;
          }
          const hasResponse = isNonEmptyResponse(resp);
          const state = submitted
            ? getQuestionState(i, responses, quiz)
            : hasResponse
            ? "answered"
            : "unanswered";
          // Color priority: marked (yellow) > current (pop) > answered (green) > default
          let borderColor = "border-border";
          let bgColor = "bg-muted text-muted-foreground";
          if (isMarked) {
            borderColor = "border-yellow-400 ring-2 ring-yellow-400";
            bgColor = "bg-yellow-400/90 text-yellow-900";
          } else if (isCurrent) {
            borderColor = "border-primary ring-2 ring-primary";
            bgColor = "bg-primary/90 text-primary-foreground";
          } else if (state === "answered" || state === "correct") {
            if (hasResponse) {
              borderColor = "border-green-500 ring-2 ring-green-500";
              bgColor = "bg-green-500/80 text-white";
            }
          }
          let tooltip = `Question ${i + 1}`;
          if (isMarked) tooltip += " (Marked for review)";
          if (submitted && state === "correct") tooltip += " (Correct)";
          if (submitted && state === "answered") tooltip += " (Answered)";
          if (!submitted && !isMarked && !isCurrent && state === "unanswered")
            tooltip += " (Unanswered)";
          return (
            <motion.button
              key={q.id}
              className={`relative rounded-full w-10 h-10 font-bold border flex items-center justify-center transition ${bgColor} ${borderColor} hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2`}
              onClick={() => setCurrentIndex(i)}
              tabIndex={0}
              aria-label={tooltip}
              title={tooltip}
              aria-current={isCurrent ? "true" : undefined}
              animate={
                isCurrent
                  ? {
                      scale: 1.18,
                      boxShadow: "0 0 0 4px rgba(127,90,240,0.25)",
                    }
                  : { scale: 1, boxShadow: "none" }
              }
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              layout
            >
              {i + 1}
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-background" />
              )}
            </motion.button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="inline-block w-4 h-4 rounded-full border-2 border-primary mx-1"></span>{" "}
        Current
        <span className="inline-block w-4 h-4 rounded-full border-2 border-yellow-400 mx-1"></span>{" "}
        Marked
        <span className="inline-block w-4 h-4 rounded-full border-2 border-green-500 mx-1"></span>{" "}
        Answered
        {submitted && (
          <>
            <span className="inline-block w-4 h-4 rounded-full border-2 border-green-500 mr-1"></span>{" "}
            Correct
            <span className="inline-block w-4 h-4 rounded-full border-2 border-red-500 mx-1"></span>{" "}
            Incorrect
            <span className="inline-block w-4 h-4 rounded-full border-2 border-blue-400 mx-1"></span>{" "}
            Answered
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
