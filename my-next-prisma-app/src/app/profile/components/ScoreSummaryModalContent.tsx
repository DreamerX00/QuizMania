import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import validator from 'validator';
import jsPDF from 'jspdf';

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

const QUESTIONS_PER_PAGE = 20;

export default function ScoreSummaryModalContent({ quizId, attemptId, onClose }: ScoreSummaryModalContentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfTooltip, setPdfTooltip] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/quiz/${quizId}/attempt/${attemptId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load result.'))
      .finally(() => setLoading(false));
  }, [quizId, attemptId]);

  useEffect(() => { setPage(1); }, [data]);

  const sanitize = (str: string | null | undefined) => str ? validator.escape(str) : '';

  const handleDownload = async (format: 'pdf' | 'md') => {
    setDownloading(true);
    try {
      if (format === 'md') {
        let content = `# Quiz Result: ${sanitize(data?.attempt?.quizTitle)}\n`;
        content += `\n- Attempt ID: ${attemptId}`;
        content += `\n- Date: ${data?.attempt?.dateTaken ? new Date(data.attempt.dateTaken).toLocaleString() : ''}`;
        content += `\n- Auto-evaluated Marks: ${data?.attempt?.autoMarks}`;
        content += `\n- Revised Marks: ${data?.attempt?.revisedMarks}`;
        content += `\n- Status: ${data?.attempt?.allReviewed ? 'Reviewed' : 'Pending manual review'}`;
        content += `\n\n## Per-Question Breakdown\n`;
        data?.manualReviews?.forEach((r: ManualReview, i: number) => {
          content += `\n### Q${i + 1}`;
          content += `\n- Marks Awarded: ${r.marksAwarded ?? 'N/A'}`;
          content += `\n- Reviewed: ${r.reviewed ? 'Yes' : 'No'}`;
          content += `\n- Feedback: ${sanitize(r.feedback)}`;
        });
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-result-${attemptId}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Scaffold: PDF generation coming soon
        setPdfTooltip(true);
        setTimeout(() => setPdfTooltip(false), 2000);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading score summary...</div>;
  if (error) return <div className="text-red-400 text-center py-20">{sanitize(error)}</div>;
  if (!data) return null;

  const { attempt, manualReviews } = data;
  const totalQuestions = manualReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / QUESTIONS_PER_PAGE));
  const paginatedReviews = manualReviews.slice((page - 1) * QUESTIONS_PER_PAGE, page * QUESTIONS_PER_PAGE);

  const paginationControls = (
    <div className="flex items-center justify-between gap-2 my-2">
      <button
        className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >Prev</button>
      <span className="text-white/80 text-sm">Page {page} of {totalPages}</span>
      <button
        className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >Next</button>
    </div>
  );

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-start p-4 md:p-8"
      id="score-summary-modal-content"
      aria-labelledby="score-summary-modal-title"
      aria-describedby="score-summary-modal-desc"
      style={{ maxWidth: '90vw', maxHeight: '80vh', width: '100%', height: 'auto', overflow: 'hidden' }}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div id="score-summary-modal-title" className="text-2xl md:text-3xl font-bold text-white">Score Summary</div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold px-4 py-2 rounded-full bg-black/30" aria-label="Close dialog">×</button>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-8 mb-6">
        <div className="flex-1 bg-linear-to-br from-blue-900/60 to-pink-900/40 rounded-2xl p-6 shadow-xl border border-white/10">
          <div className="text-lg text-white/80 font-semibold mb-2">Quiz: <span className="font-bold">{sanitize(attempt.quizTitle)}</span></div>
          <div className="text-white/70 mb-1">Attempt ID: <span className="font-mono">{attempt.id}</span></div>
          <div className="text-white/70 mb-1">Date: {attempt.dateTaken ? new Date(attempt.dateTaken).toLocaleString() : ''}</div>
          <div className="text-white/70 mb-1">Auto-evaluated Marks: <span className="font-bold text-green-400">{attempt.autoMarks}</span></div>
          <div className="text-white/70 mb-1">Revised Marks: <span className="font-bold text-yellow-300">{attempt.revisedMarks}</span></div>
          <div className="text-white/70 mb-1">Status: {attempt.allReviewed ? <span className="text-green-400 font-bold">Reviewed</span> : <span className="text-yellow-300 font-bold">Pending manual review</span>}</div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            className="rounded-lg px-6 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition"
            onClick={() => handleDownload('md')}
            disabled={downloading}
            aria-label="Download as Markdown"
          >
            {downloading ? 'Downloading...' : 'Download as Markdown'}
          </button>
          <div className="relative">
            <button
              className="rounded-lg px-6 py-2 bg-linear-to-r from-yellow-500 to-orange-600 text-white font-semibold shadow hover:scale-105 transition opacity-60 cursor-not-allowed"
              disabled
              aria-label="Download as PDF (Coming Soon)"
              onMouseEnter={() => setPdfTooltip(true)}
              onMouseLeave={() => setPdfTooltip(false)}
              onFocus={() => setPdfTooltip(true)}
              onBlur={() => setPdfTooltip(false)}
            >
              Download as PDF (Coming Soon)
            </button>
            {pdfTooltip && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-3 py-1 rounded bg-black text-white text-xs shadow-lg z-50 whitespace-nowrap">
                PDF export coming soon!
              </div>
            )}
          </div>
          <button
            className="rounded-lg px-6 py-2 bg-linear-to-r from-pink-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition opacity-60 cursor-not-allowed"
            disabled
          >
            Premium: Request Re-evaluation
          </button>
          <button
            className="rounded-lg px-6 py-2 bg-linear-to-r from-green-500 to-blue-600 text-white font-semibold shadow hover:scale-105 transition opacity-60 cursor-not-allowed"
            disabled
          >
            Premium: Chat with Quiz Creator
          </button>
        </div>
      </div>
      <div id="score-summary-modal-desc" className="w-full bg-white/10 rounded-xl p-4 mb-4 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <div className="text-lg font-semibold text-white mb-2">Per-Question Breakdown</div>
        {paginationControls}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedReviews.length === 0 && <div className="text-white/60 italic">No manual review data available.</div>}
          {paginatedReviews.map((r: ManualReview, i: number) => (
            <div key={r.id} className="bg-linear-to-br from-blue-800/40 to-pink-800/30 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">Q{(page - 1) * QUESTIONS_PER_PAGE + i + 1}:</span>
                <span className="text-white/80">{sanitize(r.type)}</span>
              </div>
              <div className="text-white/70 mb-1">Marks Awarded: <span className="font-bold text-yellow-300">{r.marksAwarded ?? 'N/A'}</span></div>
              <div className="text-white/70 mb-1">Reviewed: {r.reviewed ? <span className="text-green-400 font-bold">Yes</span> : <span className="text-yellow-300 font-bold">No</span>}</div>
              <div className="text-white/70 mb-1">Feedback: <span className="italic">{sanitize(r.feedback)}</span></div>
              {r.reviewedBy && <div className="text-white/60 text-xs">Reviewed by: {sanitize(r.reviewedBy)}</div>}
              {r.reviewedAt && <div className="text-white/60 text-xs">Reviewed at: {new Date(r.reviewedAt).toLocaleString()}</div>}
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
