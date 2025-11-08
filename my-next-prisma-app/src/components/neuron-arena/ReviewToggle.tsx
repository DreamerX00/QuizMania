import React from 'react';
import { useQuizStore } from './state/quizStore';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewToggle = () => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const markedForReview = useQuizStore((s) => s.markedForReview);
  const toggleMarkForReview = useQuizStore((s) => s.toggleMarkForReview);
  if (!quiz) return null;
  const qid = quiz.questions[currentIndex]?.id;
  const isMarked = markedForReview.includes(qid);
  return (
    <motion.button
      className={`rounded-lg px-4 py-2 font-bold transition
        ${isMarked
          ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
          : 'bg-yellow-300 text-yellow-900 hover:bg-yellow-400'}
        shadow focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:ring-offset-2
      `}
      onClick={() => toggleMarkForReview(qid)}
      aria-label={isMarked ? 'Unmark for review' : 'Mark for review'}
      title={isMarked ? 'Unmark this question for review' : 'Mark this question for review'}
      tabIndex={0}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: isMarked ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isMarked ? 'unmark' : 'mark'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {isMarked ? 'Unmark Review' : 'Mark for Review'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default ReviewToggle; 
