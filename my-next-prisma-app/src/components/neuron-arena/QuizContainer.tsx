import React from 'react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import ReviewToggle from './ReviewToggle';
import { useQuizStore } from './state/quizStore';
import Timer from './Timer';

const QuizContainer = ({ children }: { children: React.ReactNode }) => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const total = quiz?.questions.length || 1;
  const percent = ((currentIndex + 1) / total) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      {/* Header, Progress, Timer, etc. */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md">
        <div className="font-heading text-2xl tracking-widest">Neuron Arena</div>
        <div className="flex items-center gap-4">
          {/* Timer, Mark for Review, etc. */}
          <ReviewToggle />
          <Timer />
        </div>
      </header>
      {/* Progress Bar */}
      <div className="w-full px-6 py-2">
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[var(--primary-accent)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-1 flex flex-row gap-6 px-6 py-4">
        {/* Left: Main Panel */}
        <section className="flex-1 flex flex-col gap-4">
          {children}
        </section>
        {/* Right: Sidebar */}
        <aside className="w-80 max-w-full hidden lg:block">
          <Sidebar />
        </aside>
      </main>
      {/* Navigation & Sticky Submit */}
      <footer className="sticky bottom-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-2">
        <Navigation />
        <button className="mt-2 w-full rounded-xl py-3 bg-[var(--primary-accent)] text-white font-bold text-lg shadow-lg hover:scale-105 transition">Submit Quiz</button>
      </footer>
    </div>
  );
};

export default QuizContainer; 