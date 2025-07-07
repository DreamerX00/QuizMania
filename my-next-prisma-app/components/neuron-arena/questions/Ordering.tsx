import React from 'react';

const Ordering = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[Ordering]</div>
      <ol className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <li key={i} className="rounded-lg bg-white/10 px-4 py-2 shadow flex items-center gap-2 cursor-move">
            <span className="font-bold">{i+1}.</span> Step {i+1}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Ordering; 