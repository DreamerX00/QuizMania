// import { motion } from "framer-motion";
import QuizCard from "./QuizCard";

type QuizGridProps = {
  quizzes: any[];
  isLoading: boolean;
  onQuizClick: (quiz: any) => void;
};

export default function QuizGrid({ quizzes, isLoading, onQuizClick }: QuizGridProps) {
  
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8 w-full min-w-0">
      {quizzes?.map((quiz) => (
        <div key={quiz.id} className="h-full min-w-0 flex" onClick={() => onQuizClick(quiz)}>
          <QuizCard quiz={quiz} />
        </div>
      ))}
    </div>
  );
} 