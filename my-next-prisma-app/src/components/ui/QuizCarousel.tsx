import React, { useRef } from "react";
import QuizCard from "@/app/explore/components/QuizCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  imageUrl: string | null;
  rating: number;
  likeCount: number;
  usersTaken: number;
  createdAt: string;
  creator: {
    name: string | null;
    avatarUrl: string | null;
  } | null;
  durationInSeconds?: number;
  isLocked?: boolean;
  difficultyLevel?: string;
  pricePerAttempt?: number;
  pointPerAttempt?: number;
  slug?: string;
  price: number;
  field: string | null;
  subject: string | null;
  [key: string]: unknown;
};

interface QuizCarouselProps {
  quizzes: Quiz[];
  onQuizClick: (quiz: Quiz) => void;
  isPremiumUser?: boolean;
  unlockedQuizIds?: Set<string>;
}

const CARD_WIDTH = 280; // px
const CARD_GAP = 24; // px
const VISIBLE_CARDS = 3; // default, responsive via Tailwind

export default function QuizCarousel({
  quizzes,
  onQuizClick,
  isPremiumUser = false,
  unlockedQuizIds = new Set(),
}: QuizCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = (CARD_WIDTH + CARD_GAP) * VISIBLE_CARDS;
    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 hover:bg-slate-800/90 rounded-full p-2 shadow-lg border border-slate-700 disabled:opacity-30"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        type="button"
      >
        <FiChevronLeft className="text-3xl text-white" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar py-2 px-8 snap-x snap-mandatory scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="min-w-[260px] max-w-[320px] w-[90vw] sm:w-[260px] md:w-[280px] snap-start shrink-0"
            onClick={() => onQuizClick(quiz)}
          >
            <QuizCard
              quiz={quiz}
              onClick={() => onQuizClick(quiz)}
              isPremiumUser={isPremiumUser}
              isUnlocked={unlockedQuizIds.has(quiz.id)}
            />
          </div>
        ))}
      </div>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/80 hover:bg-slate-800/90 rounded-full p-2 shadow-lg border border-slate-700 disabled:opacity-30"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        type="button"
      >
        <FiChevronRight className="text-3xl text-white" />
      </button>
    </div>
  );
}
