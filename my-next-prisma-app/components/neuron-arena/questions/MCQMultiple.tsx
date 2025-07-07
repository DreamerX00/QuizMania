import React from 'react';

const MCQMultiple = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[MCQ Multiple]</div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <button key={i} className="rounded-full px-6 py-3 bg-white/10 hover:bg-[var(--primary-accent)] transition font-bold">
            Option {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>
      <div className="text-xs text-white/60 mt-2">Selected 0 of 2</div>
    </div>
  );
};

export default MCQMultiple; 