import React from 'react';

const Navigation = () => {
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <button className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition">← Prev</button>
      <div className="font-heading text-lg">Q5</div>
      <button className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 transition">Next →</button>
    </div>
  );
};

export default Navigation; 