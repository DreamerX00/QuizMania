import React, { useState, useRef, useCallback } from "react";
import QuizCard from "./QuizCard";
import { FiX } from "react-icons/fi";

interface ExploreSectionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  quizzes: any[];
  isPremiumUser?: boolean;
  unlockedQuizIds?: Set<string>;
}

const PAGE_SIZE = 16;

export default function ExploreSectionDialog({ 
  open, 
  onClose, 
  title, 
  quizzes, 
  isPremiumUser = false, 
  unlockedQuizIds = new Set() 
}: ExploreSectionDialogProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount when dialog opens or quizzes change
  React.useEffect(() => {
    if (open) setVisibleCount(PAGE_SIZE);
  }, [open, quizzes]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, quizzes.length));
    }
  }, [quizzes.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg pt-16 sm:pt-16">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-6xl h-[calc(90vh-4rem)] bg-linear-to-br from-[#181a2a]/90 to-[#23234d]/90 border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mt-0">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent animate-gradient-move">
            {title}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:scale-110 transition-transform" aria-label="Close">
            <FiX size={32} />
          </button>
        </div>
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 min-w-0"
          onScroll={handleScroll}
        >
          {quizzes.slice(0, visibleCount).map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz} 
              onClick={() => {}} // No action needed in dialog view
              isPremiumUser={isPremiumUser}
              isUnlocked={unlockedQuizIds.has(quiz.id)}
            />
          ))}
          {visibleCount < quizzes.length && (
            <div className="col-span-full flex justify-center py-8">
              <span className="text-white/60 animate-pulse">Loading more...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
