"use client";
import { useRef, useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import QuizCard from "./QuizCard";

type QuizGridProps = {
  quizzes: any[];
  isLoading: boolean;
  onQuizClick: (quiz: any) => void;
};

export default function QuizGrid({
  quizzes,
  isLoading,
  onQuizClick,
}: QuizGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);

  // Dynamically adjust columns based on viewport width
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1); // sm
      else if (width < 768) setColumns(2); // md
      else if (width < 1280) setColumns(3); // xl
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Calculate row count based on number of columns
  const rowCount = Math.ceil((quizzes?.length || 0) / columns);

  // Only use virtual scrolling if there are more than 20 items
  const useVirtual = (quizzes?.length || 0) > 20;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated height per row (card height + gap)
    overscan: 2, // Render 2 extra rows for smooth scrolling
    enabled: useVirtual,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8 w-full min-w-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-full min-w-0 flex">
            {/* Basic Skeleton Card */}
            <div className="w-full h-80 bg-slate-800/60 rounded-xl animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // For small lists, render without virtualization
  if (!useVirtual) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8 w-full min-w-0">
        {quizzes?.map((quiz) => (
          <div
            key={quiz.id}
            className="h-full min-w-0 flex"
            onClick={() => onQuizClick(quiz)}
          >
            <QuizCard quiz={quiz} onClick={() => onQuizClick(quiz)} />
          </div>
        ))}
      </div>
    );
  }

  // Virtual scrolling for large lists
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="w-full min-w-0"
      style={{ height: "80vh", overflow: "auto" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const startIdx = virtualRow.index * columns;
          const rowItems = quizzes.slice(startIdx, startIdx + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8 w-full min-w-0">
                {rowItems.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="h-full min-w-0 flex"
                    onClick={() => onQuizClick(quiz)}
                  >
                    <QuizCard quiz={quiz} onClick={() => onQuizClick(quiz)} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

