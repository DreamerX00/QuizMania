import React from 'react';

const ScoreSummary = () => {
  return (
    <div className="rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-md flex flex-col items-center">
      <div className="font-heading text-3xl mb-4">Score Summary</div>
      <div className="text-5xl font-bold mb-2">0/10</div>
      <div className="text-lg text-white/70">Correct Answers</div>
      {/* Pie chart/Confetti placeholder */}
    </div>
  );
};

export default ScoreSummary; 