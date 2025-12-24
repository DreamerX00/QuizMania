import React, { useEffect, useState } from "react";
import validator from "validator";
import { downloadQuizResultPDF, QuizResultData } from "@/utils/pdfExport";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";

interface ScoreSummaryModalContentProps {
  quizId: string;
  attemptId: string;
  onClose: () => void;
}

interface ManualReview {
  id: string;
  questionId: string;
  marksAwarded: number | null;
  reviewed: boolean;
  feedback: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  type: string;
}

interface ReEvalRequest {
  id: string;
  status: string;
  createdAt: string;
  responses: Array<{
    id: string;
    feedback: string;
    adjustedMarks?: number;
  }>;
}

const QUESTIONS_PER_PAGE = 20;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ScoreSummaryModalContent({
  quizId,
  attemptId,
  onClose,
}: ScoreSummaryModalContentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    score?: number;
    totalScore?: number;
    answers?: Array<Record<string, unknown>>;
    attempt?: {
      quizTitle?: string;
      dateTaken?: string;
      autoMarks?: number;
      revisedMarks?: number;
      allReviewed?: boolean;
      [key: string]: unknown;
    };
    manualReviews?: ManualReview[];
    [key: string]: unknown;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [reEvalSubmitting, setReEvalSubmitting] = useState(false);
  const [reEvalReason, setReEvalReason] = useState("");
  const [showReEvalModal, setShowReEvalModal] = useState(false);
  const [showCreatorChatModal, setShowCreatorChatModal] = useState(false);
  const [creatorChatMessage, setCreatorChatMessage] = useState("");
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{
    name?: string;
    image?: string;
  } | null>(null);

  // Fetch user premium status
  const { data: userData } = useSWR(
    user ? `/api/profile/premium-summary` : null,
    fetcher
  );

  const isPremium =
    userData?.accountType === "PREMIUM" || userData?.accountType === "LIFETIME";
  const isPremiumActive =
    isPremium &&
    (!userData?.premiumUntil || new Date(userData.premiumUntil) > new Date());

  // Fetch re-evaluation status
  const { data: reEvalData, mutate: mutateReEval } = useSWR(
    attemptId ? `/api/quiz/re-evaluation?attemptId=${attemptId}` : null,
    fetcher
  );
  const hasPendingReEval = reEvalData?.hasPending;
  const reEvalRequests: ReEvalRequest[] = reEvalData?.requests || [];

  const handleReEvalRequest = async () => {
    if (!reEvalReason.trim()) {
      alert("Please provide a reason for the re-evaluation request.");
      return;
    }

    setReEvalSubmitting(true);
    try {
      const res = await fetch("/api/quiz/re-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          reason: reEvalReason,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Re-evaluation request submitted successfully!");
        setShowReEvalModal(false);
        setReEvalReason("");
        mutateReEval();
      } else {
        alert(result.error || "Failed to submit request");
      }
    } catch (err) {
      alert("Failed to submit request");
    } finally {
      setReEvalSubmitting(false);
    }
  };

  const handleOpenCreatorChat = async () => {
    if (!isPremiumActive) return;

    try {
      const res = await fetch(`/api/quiz/creator-chat?quizId=${quizId}`);
      const data = await res.json();
      if (res.ok && data.creator) {
        setCreatorInfo(data.creator);
        setShowCreatorChatModal(true);
      } else {
        alert(data.error || "Unable to open chat with creator");
      }
    } catch (err) {
      alert("Failed to connect");
    }
  };

  const handleSendCreatorMessage = async () => {
    if (!creatorChatMessage.trim()) return;

    setChatSubmitting(true);
    try {
      const res = await fetch("/api/quiz/creator-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          message: creatorChatMessage,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Message sent to quiz creator!");
        setShowCreatorChatModal(false);
        setCreatorChatMessage("");
      } else {
        alert(result.error || "Failed to send message");
      }
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setChatSubmitting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/quiz/${quizId}/attempt/${attemptId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load result."))
      .finally(() => setLoading(false));
  }, [quizId, attemptId]);

  useEffect(() => {
    setPage(1);
  }, [data]);

  const sanitize = (str: string | null | undefined) =>
    str ? validator.escape(str) : "";

  const handleDownload = async (format: "pdf" | "md") => {
    setDownloading(true);
    try {
      if (format === "md") {
        let content = `# Quiz Result: ${sanitize(data?.attempt?.quizTitle)}\n`;
        content += `\n- Attempt ID: ${attemptId}`;
        content += `\n- Date: ${
          data?.attempt?.dateTaken
            ? new Date(data.attempt.dateTaken).toLocaleString()
            : ""
        }`;
        content += `\n- Auto-evaluated Marks: ${data?.attempt?.autoMarks}`;
        content += `\n- Revised Marks: ${data?.attempt?.revisedMarks}`;
        content += `\n- Status: ${
          data?.attempt?.allReviewed ? "Reviewed" : "Pending manual review"
        }`;
        content += `\n\n## Per-Question Breakdown\n`;
        (data?.manualReviews || []).forEach((r: ManualReview, i: number) => {
          content += `\n### Q${i + 1}`;
          content += `\n- Marks Awarded: ${r.marksAwarded ?? "N/A"}`;
          content += `\n- Reviewed: ${r.reviewed ? "Yes" : "No"}`;
          content += `\n- Feedback: ${sanitize(r.feedback)}`;
        });
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quiz-result-${attemptId}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        // Generate PDF using jsPDF
        const pdfData: QuizResultData = {
          quizTitle: data?.attempt?.quizTitle || "Quiz Result",
          attemptId,
          dateTaken: data?.attempt?.dateTaken || new Date().toISOString(),
          autoMarks: data?.attempt?.autoMarks || 0,
          revisedMarks: data?.attempt?.revisedMarks,
          totalMarks: data?.totalScore,
          allReviewed: data?.attempt?.allReviewed || false,
          manualReviews: (data?.manualReviews || []).map((r: ManualReview) => ({
            questionId: r.questionId,
            marksAwarded: r.marksAwarded,
            reviewed: r.reviewed,
            feedback: r.feedback,
            type: r.type,
          })),
        };
        downloadQuizResultPDF(pdfData);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="text-white text-center py-20">
        Loading score summary...
      </div>
    );
  if (error)
    return (
      <div className="text-red-400 text-center py-20">{sanitize(error)}</div>
    );
  if (!data) return null;

  const { attempt = {}, manualReviews = [] } = data;
  const totalQuestions = manualReviews.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
  );
  const paginatedReviews = manualReviews.slice(
    (page - 1) * QUESTIONS_PER_PAGE,
    page * QUESTIONS_PER_PAGE
  );

  const paginationControls = (
    <div className="flex items-center justify-between gap-2 my-2">
      <button
        className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        Prev
      </button>
      <span className="text-white/80 text-sm">
        Page {page} of {totalPages}
      </span>
      <button
        className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-start p-4 md:p-8"
      id="score-summary-modal-content"
      aria-labelledby="score-summary-modal-title"
      aria-describedby="score-summary-modal-desc"
      style={{
        maxWidth: "90vw",
        maxHeight: "80vh",
        width: "100%",
        height: "auto",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div
          id="score-summary-modal-title"
          className="text-2xl md:text-3xl font-bold text-white"
        >
          Score Summary
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-2xl font-bold px-4 py-2 rounded-full bg-black/30"
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-8 mb-6">
        <div className="flex-1 bg-linear-to-br from-blue-900/60 to-pink-900/40 rounded-2xl p-6 shadow-xl border border-white/10">
          <div className="text-lg text-white/80 font-semibold mb-2">
            Quiz:{" "}
            <span className="font-bold">{sanitize(attempt.quizTitle)}</span>
          </div>
          <div className="text-white/70 mb-1">
            Attempt ID:{" "}
            <span className="font-mono">{String(attempt.id || "")}</span>
          </div>
          <div className="text-white/70 mb-1">
            Date:{" "}
            {attempt.dateTaken
              ? new Date(attempt.dateTaken).toLocaleString()
              : ""}
          </div>
          <div className="text-white/70 mb-1">
            Auto-evaluated Marks:{" "}
            <span className="font-bold text-green-400">
              {String(attempt.autoMarks || 0)}
            </span>
          </div>
          <div className="text-white/70 mb-1">
            Revised Marks:{" "}
            <span className="font-bold text-yellow-300">
              {String(attempt.revisedMarks || 0)}
            </span>
          </div>
          <div className="text-white/70 mb-1">
            Status:{" "}
            {attempt.allReviewed ? (
              <span className="text-green-400 font-bold">Reviewed</span>
            ) : (
              <span className="text-yellow-300 font-bold">
                Pending manual review
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            className="rounded-lg px-6 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition"
            onClick={() => handleDownload("md")}
            disabled={downloading}
            aria-label="Download as Markdown"
          >
            {downloading ? "Downloading..." : "Download as Markdown"}
          </button>
          <div className="relative">
            <button
              className="rounded-lg px-6 py-2 bg-linear-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow hover:scale-105 transition"
              onClick={() => handleDownload("pdf")}
              disabled={downloading}
              aria-label="Download as PDF"
            >
              {downloading ? "Generating PDF..." : "Download as PDF"}
            </button>
          </div>
          {/* Re-evaluation Button */}
          {isPremiumActive ? (
            hasPendingReEval ? (
              <button
                className="rounded-lg px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow cursor-default"
                disabled
              >
                ⏳ Re-evaluation Pending
              </button>
            ) : (
              <button
                className="rounded-lg px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition"
                onClick={() => setShowReEvalModal(true)}
              >
                ⭐ Request Re-evaluation
              </button>
            )
          ) : (
            <button
              className="rounded-lg px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition opacity-60 cursor-not-allowed"
              disabled
              title="Premium feature - Upgrade to request re-evaluation"
            >
              🔒 Premium: Request Re-evaluation
            </button>
          )}
          {/* Chat with Creator Button */}
          {isPremiumActive ? (
            <button
              className="rounded-lg px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold shadow hover:scale-105 transition"
              onClick={handleOpenCreatorChat}
            >
              💬 Chat with Quiz Creator
            </button>
          ) : (
            <button
              className="rounded-lg px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold shadow hover:scale-105 transition opacity-60 cursor-not-allowed"
              disabled
              title="Premium feature - Upgrade to chat with quiz creators"
            >
              🔒 Premium: Chat with Quiz Creator
            </button>
          )}
        </div>
      </div>

      {/* Re-evaluation Modal */}
      {showReEvalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Request Re-evaluation
            </h3>
            <p className="text-white/70 mb-4">
              Submit a request to the quiz creator to re-evaluate your answers.
              Please provide a detailed reason for your request.
            </p>
            <textarea
              value={reEvalReason}
              onChange={(e) => setReEvalReason(e.target.value)}
              placeholder="Explain why you believe your answers should be re-evaluated..."
              className="w-full h-32 bg-slate-700 text-white rounded-lg p-3 mb-4 resize-none"
              maxLength={1000}
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition"
                onClick={() => setShowReEvalModal(false)}
                disabled={reEvalSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:scale-105 transition disabled:opacity-50"
                onClick={handleReEvalRequest}
                disabled={reEvalSubmitting || !reEvalReason.trim()}
              >
                {reEvalSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-evaluation History */}
      {reEvalRequests.length > 0 && (
        <div className="mb-4 p-4 bg-purple-900/30 rounded-xl">
          <h4 className="text-white font-semibold mb-2">
            Re-evaluation History
          </h4>
          {reEvalRequests.map((req) => (
            <div key={req.id} className="text-white/70 text-sm mb-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  req.status === "PENDING"
                    ? "bg-yellow-500/30 text-yellow-300"
                    : req.status === "IN_PROGRESS"
                    ? "bg-blue-500/30 text-blue-300"
                    : req.status === "COMPLETED"
                    ? "bg-green-500/30 text-green-300"
                    : "bg-red-500/30 text-red-300"
                }`}
              >
                {req.status}
              </span>
              <span className="ml-2">
                {new Date(req.createdAt).toLocaleDateString()}
              </span>
              {req.responses.length > 0 && (
                <p className="mt-1 text-white/60 italic">
                  Response: {req.responses[0].feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Creator Chat Modal */}
      {showCreatorChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              💬 Chat with Quiz Creator
            </h3>
            {creatorInfo && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700 rounded-lg">
                {creatorInfo.image ? (
                  <img
                    src={creatorInfo.image}
                    alt={creatorInfo.name || "Creator"}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {creatorInfo.name?.[0] || "C"}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold">
                    {creatorInfo.name || "Quiz Creator"}
                  </p>
                  <p className="text-white/60 text-sm">Quiz Creator</p>
                </div>
              </div>
            )}
            <p className="text-white/70 mb-4 text-sm">
              Send a message to the quiz creator about your attempt. They will
              receive it as a direct message.
            </p>
            <textarea
              value={creatorChatMessage}
              onChange={(e) => setCreatorChatMessage(e.target.value)}
              placeholder="Write your message to the quiz creator..."
              className="w-full h-32 bg-slate-700 text-white rounded-lg p-3 mb-4 resize-none"
              maxLength={1000}
            />
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition"
                onClick={() => setShowCreatorChatModal(false)}
                disabled={chatSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:scale-105 transition disabled:opacity-50"
                onClick={handleSendCreatorMessage}
                disabled={chatSubmitting || !creatorChatMessage.trim()}
              >
                {chatSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        id="score-summary-modal-desc"
        className="w-full bg-white/10 rounded-xl p-4 mb-4 flex-1 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        <div className="text-lg font-semibold text-white mb-2">
          Per-Question Breakdown
        </div>
        {paginationControls}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedReviews.length === 0 && (
            <div className="text-white/60 italic">
              No manual review data available.
            </div>
          )}
          {paginatedReviews.map((r: ManualReview, i: number) => (
            <div
              key={r.id}
              className="bg-linear-to-br from-blue-800/40 to-pink-800/30 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">
                  Q{(page - 1) * QUESTIONS_PER_PAGE + i + 1}:
                </span>
                <span className="text-white/80">{sanitize(r.type)}</span>
              </div>
              <div className="text-white/70 mb-1">
                Marks Awarded:{" "}
                <span className="font-bold text-yellow-300">
                  {r.marksAwarded ?? "N/A"}
                </span>
              </div>
              <div className="text-white/70 mb-1">
                Reviewed:{" "}
                {r.reviewed ? (
                  <span className="text-green-400 font-bold">Yes</span>
                ) : (
                  <span className="text-yellow-300 font-bold">No</span>
                )}
              </div>
              <div className="text-white/70 mb-1">
                Feedback: <span className="italic">{sanitize(r.feedback)}</span>
              </div>
              {r.reviewedBy && (
                <div className="text-white/60 text-xs">
                  Reviewed by: {sanitize(r.reviewedBy)}
                </div>
              )}
              {r.reviewedAt && (
                <div className="text-white/60 text-xs">
                  Reviewed at: {new Date(r.reviewedAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
        {paginationControls}
      </div>
      {/* Responsive modal sizing and alignment */}
      <style jsx>{`
        @media (max-width: 900px) {
          #score-summary-modal-content {
            max-width: 100vw;
            max-height: 100vh;
            padding: 0.5rem;
            align-items: flex-start;
            justify-content: flex-start;
          }
        }
        @media (max-width: 600px) {
          #score-summary-modal-content {
            max-width: 100vw;
            max-height: 100vh;
            padding: 0.25rem;
            align-items: flex-start;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
