import React from 'react';

const MCQSingle = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[MCQ Single]</div>
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <button key={i} className="rounded-full px-6 py-3 bg-white/10 hover:bg-[var(--primary-accent)] transition font-bold">
            Option {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MCQSingle; 