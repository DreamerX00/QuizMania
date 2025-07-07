import React from 'react';

const QuizContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      {/* Header, Progress, Timer, etc. */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md">
        <div className="font-heading text-2xl tracking-widest">Neuron Arena</div>
        <div className="flex items-center gap-4">
          {/* Timer, Mark for Review, etc. */}
          <div className="rounded-lg bg-white/10 px-4 py-2 font-mono">🕒 00:00</div>
        </div>
      </header>
      {/* Progress Bar */}
      <div className="w-full px-6 py-2">
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-[var(--primary-accent)] transition-all duration-500" style={{ width: '30%' }} />
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
          {/* Sidebar placeholder */}
        </aside>
      </main>
      {/* Navigation & Sticky Submit */}
      <footer className="sticky bottom-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition">← Prev</button>
          <div className="font-heading text-lg">Q5</div>
          <button className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition">Next →</button>
        </div>
        <button className="mt-2 w-full rounded-xl py-3 bg-[var(--primary-accent)] text-white font-bold text-lg shadow-lg hover:scale-105 transition">Submit Quiz</button>
      </footer>
    </div>
  );
};

export default QuizContainer; 