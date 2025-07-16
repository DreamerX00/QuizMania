import React, { useState } from 'react';
import { useQuizStore } from './state/quizStore';
import { useQuizSubmission } from '@/hooks/useQuizSubmission';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

const SubmitButton = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const responses = useQuizStore((s) => s.responses);
  const [showSuccess, setShowSuccess] = useState(false);
  const { submitQuiz, isSubmitting, error, result } = useQuizSubmission();
  const [dialogOpen, setDialogOpen] = useState(false);
  if (!quiz) return null;
  // Required: all non-manual, non-poll questions must be answered
  const requiredIds = quiz.questions.filter(q => !['essay','paragraph','audio','video','poll'].includes(q.type)).map(q => q.id);
  const answeredIds = responses.map(r => r.questionId);
  const unansweredCount = requiredIds.filter(id => !answeredIds.includes(id)).length;
  const allAnswered = unansweredCount === 0;
  const tooltip = isSubmitting ? 'Submitting...' : 'Submit quiz';

  // Show feedback on result
  React.useEffect(() => {
    if (result && result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [result]);

  const handleClick = async () => {
    if (allAnswered) {
      await submitQuiz();
    } else {
      setDialogOpen(true);
    }
  };

  const handleSubmitAnyway = async () => {
    setDialogOpen(false);
    await submitQuiz();
  };

  return (
    <>
      <button
        className="w-full rounded-xl py-3 bg-[var(--primary-accent)] text-white font-bold text-lg shadow-lg hover:scale-105 transition sticky bottom-0 disabled:opacity-60"
        onClick={handleClick}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        aria-label="Submit quiz"
        title={tooltip}
      >
        {isSubmitting ? 'Submitting…' : 'Submit Quiz'}
      </button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Some questions are unanswered</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-base">
            You have <b>{unansweredCount}</b> required question{unansweredCount !== 1 ? 's' : ''} remaining to answer.<br />
            Are you sure you want to submit anyway?
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded bg-muted text-foreground border border-border hover:bg-muted/80 transition"
              onClick={() => setDialogOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-[var(--primary-accent)] text-white font-semibold hover:bg-primary/90 transition"
              onClick={handleSubmitAnyway}
              type="button"
              disabled={isSubmitting}
            >
              Submit Anyway
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      {showSuccess && <div className="text-green-600 mt-2 text-sm">Submitted successfully!</div>}
    </>
  );
};

export default SubmitButton; 