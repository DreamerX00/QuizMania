import { useState } from "react";
import { useQuizStore } from "@/components/neuron-arena/state/quizStore";

// Types for the payload
interface SubmissionResponse {
  success: boolean;
  summary: unknown;
  manualReviewPending: boolean;
}

export function useQuizSubmission() {
  const quiz = useQuizStore((s) => s.quiz);
  const responses = useQuizStore((s) => s.responses);
  const startTime = useQuizStore((s) => s.startTime);
  const violations = useQuizStore((s) => s.violations);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResponse | null>(null);

  // Helper: Evaluate responses and build summary
  function evaluateAndBuildSummary() {
    if (!quiz) return null;
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;
    let obtainedMarks = 0;
    let pendingManualMarks = 0;
    const totalQuestions = quiz.questions.length;
    const summaryPerQuestion: Array<Record<string, unknown>> = [];
    responses.forEach((resp) => {
      const q = quiz.questions.find((q) => q.id === resp.questionId);
      if (!q) return;
      attempted++;
      const isManual = [
        "essay",
        "paragraph",
        "audio",
        "video",
        "poll",
      ].includes(q.type);
      let isCorrect = false;
      if (isManual) {
        pendingManualMarks += q.marks || 0;
      } else {
        // Auto-evaluate
        if (JSON.stringify(resp.response) === JSON.stringify(q.correctAnswer)) {
          isCorrect = true;
          correct++;
          obtainedMarks += q.marks || 0;
        } else {
          incorrect++;
        }
      }
      summaryPerQuestion.push({
        questionId: q.id,
        type: q.type,
        isCorrect,
        isManual,
        userAnswer: resp.response,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 0,
      });
    });
    return {
      totalQuestions,
      attempted,
      correct,
      incorrect,
      obtainedMarks,
      pendingManualMarks,
      percentage: totalQuestions
        ? Math.round(
            (obtainedMarks / (obtainedMarks + pendingManualMarks)) * 100
          )
        : 0,
      durationInSeconds: startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0,
      perQuestion: summaryPerQuestion,
    };
  }

  // Helper: Format responses for backend
  function formatResponses() {
    if (!quiz) return [];
    return responses.map((resp) => {
      const q = quiz.questions.find((q) => q.id === resp.questionId);
      return {
        questionId: resp.questionId,
        answer: resp.response,
        type: q?.type || "unknown",
        requiresManualReview: q
          ? ["essay", "paragraph", "audio", "video", "poll"].includes(q.type)
          : false,
      };
    });
  }

  // Main submit function
  async function submitQuiz() {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      if (!quiz) throw new Error("Quiz not loaded");
      // Ensure an atomic start exists on the server and get quizRecordId
      const startRes = await fetch(`/api/quizzes/${quiz.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        throw new Error(
          startData.reason || startData.error || "Could not start quiz"
        );
      }
      const quizRecordId = startData.quizRecordId;
      const summary = evaluateAndBuildSummary();
      if (!summary) throw new Error("Could not build summary");
      const payload = {
        quizId: quiz.id,
        submittedAt: new Date().toISOString(),
        quizRecordId,
        responses: formatResponses(),
        summary,
        violations: {
          count: violations.length,
          reasons: violations.map((v) => `${v.type}: ${v.reason}`),
        },
      };
      const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setResult(data);
      // Optionally update Zustand store: set submitted, score summary, etc.
      useQuizStore.setState({ submitted: true });
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Unknown error");
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submitQuiz, isSubmitting, error, result };
}
