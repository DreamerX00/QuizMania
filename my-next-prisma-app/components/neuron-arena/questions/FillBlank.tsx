import React from 'react';

const FillBlank = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[Fill in the Blank]</div>
      <div className="text-lg">
        The capital of France is <input className="inline-block w-32 px-2 py-1 rounded bg-white/10 border-b-2 border-[var(--primary-accent)] text-white focus:outline-none" placeholder="__________" />.
      </div>
      <div className="text-xs text-white/60 mt-2">Case doesn't matter</div>
    </div>
  );
};

export default FillBlank; 