"use client";
import { useEffect, useRef, useState } from "react";

const TAG_GROUPS = [
  {
    label: 'Popular',
    tags: ['#Trending', '#Premium', '#Free', '#EditorsChoice', '#MostLiked', '#MostAttempted', '#Popular', '#Recommended'],
  },
  {
    label: 'Difficulty',
    tags: ['#Beginner', '#Intermediate', '#Advanced', '#Short', '#Long', '#Timed', '#Untimed', '#TimedChallenge'],
  },
  {
    label: 'Subject',
    tags: [
      '#Math', '#Science', '#Physics', '#Chemistry', '#Biology', '#Astronomy', '#History', '#Geography', '#Programming', '#Java', '#Python', '#C++', '#WebDev', '#DataStructures', '#Algorithms', '#AI', '#ML', '#School', '#CompetitiveExams', '#JEE', '#NEET', '#SAT', '#GRE', '#GMAT', '#Olympiad', '#Commerce', '#Economics', '#Business', '#Arts', '#Philosophy', '#Literature', '#English', '#GK', '#CurrentAffairs', '#Logic', '#Puzzles', '#Riddles', '#PictureQuiz', '#AudioQuiz', '#VideoQuiz', '#Poll', '#Essay', '#Matrix', '#Match', '#FillBlanks', '#Ordering', '#TrueFalse', '#MCQ', '#CodeOutput', '#DragDrop', '#ImageBased', '#Paragraph'
    ],
  },
  {
    label: 'Special',
    tags: ['#QuizOfTheDay', '#UserCreated', '#Official', '#Community', '#Fun', '#Serious', '#Practice', '#MockTest', '#ExamPrep', '#SkillTest', '#Leaderboard', '#Pin', '#Saved', '#Favorites', '#MyQuizzes', '#Friends', '#Global', '#Local', '#Custom', '#Random', '#Surprise', '#Challenge', '#Collab', '#Live', '#Event', '#Festival', '#Holiday', '#Seasonal', '#Special', '#Anniversary', '#Milestone', '#Awarded', '#Badge', '#Streak', '#XP', '#Rank', '#Level', '#Unlock', '#Achievement', '#Goal', '#Journey', '#Adventure', '#Explore', '#Discover', '#Learn', '#Grow', '#Future', '#2100', '#Futuristic', '#Marketplace', '#QuizMania'],
  },
];

export default function TopTagsBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logic (setInterval for reliability)
  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    let speed = 1.2; // px per tick
    const interval = setInterval(() => {
      if (!el) return;
      if (direction === "right") {
        el.scrollLeft += speed;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
          setDirection("left");
        }
      } else {
        el.scrollLeft -= speed;
        if (el.scrollLeft <= 0) {
          setDirection("right");
        }
      }
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, [autoScroll, direction]);

  // Pause on user interaction, resume after 2s
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function pause() {
      setAutoScroll(false);
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
      pauseTimeout.current = setTimeout(() => setAutoScroll(true), 2000);
    }
    el.addEventListener("wheel", pause, { passive: true });
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("mousedown", pause);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("focusin", pause);
    return () => {
      el.removeEventListener("wheel", pause);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("mousedown", pause);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("focusin", pause);
    };
  }, []);

  return (
    <div className="relative w-full flex justify-center">
      {/* Edge fade for scroll hint */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 z-10 hidden dark:block bg-gradient-to-r from-[#181a2a] via-[#181a2a]/60 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 z-10 hidden dark:block bg-gradient-to-l from-[#181a2a] via-[#181a2a]/60 to-transparent" />
      <div
        ref={scrollRef}
        className="max-w-5xl w-full mx-auto overflow-x-auto rounded-full custom-scrollbar"
        tabIndex={0}
        style={{ scrollBehavior: autoScroll ? "auto" : "smooth" }}
      >
        <div className="flex items-center gap-8 px-4 py-4 min-w-fit">
          {TAG_GROUPS.map((group, gi) => (
            <div key={group.label} className="flex items-center gap-3">
              {/* Group label */}
              <span className="text-xs font-bold uppercase tracking-widest text-white/60 px-2 select-none">
                {group.label}
              </span>
              {/* Tags */}
              <div className="flex items-center gap-2">
                {group.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="futuristic-badge px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer bg-gradient-to-r from-purple-700/30 to-blue-700/30 text-white shadow-glow hover:scale-110 hover:from-purple-500/60 hover:to-blue-500/60 transition-all duration-200 relative whitespace-nowrap border border-white/20 backdrop-blur-md hover:ring-2 hover:ring-blue-400/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* Divider except after last group */}
              {gi !== TAG_GROUPS.length - 1 && (
                <span className="mx-2 h-8 w-0.5 bg-gradient-to-b from-purple-400/40 to-blue-400/40 rounded-full opacity-60" />
              )}
            </div>
          ))}
          {/* View All Button */}
          <button className="ml-4 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white font-bold shadow-glow border border-white/20 hover:scale-105 hover:from-blue-600/40 hover:to-purple-600/40 transition-all duration-200 backdrop-blur-md">
            View All
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #7f5af0 0%, #2cb1ff 100%);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #7f5af0 #23234d;
        }
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .custom-scrollbar {
            scrollbar-width: none;
          }
        }
      `}</style>
    </div>
  );
} 