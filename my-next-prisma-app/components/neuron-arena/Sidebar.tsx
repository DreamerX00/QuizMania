import React from 'react';

const Sidebar = () => {
  return (
    <aside className="rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur-md h-full flex flex-col gap-6">
      <div className="font-heading text-lg mb-2">Questions</div>
      {/* Question grid placeholder */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[...Array(10)].map((_, i) => (
          <button key={i} className="rounded-full w-10 h-10 bg-white/10 hover:bg-[var(--primary-accent)] transition font-bold">{i+1}</button>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-block w-4 h-4 rounded-full bg-green-400 mr-1"></span> Correct
        <span className="inline-block w-4 h-4 rounded-full bg-red-400 mx-1"></span> Incorrect
        <span className="inline-block w-4 h-4 rounded-full bg-yellow-400 mx-1"></span> Marked
      </div>
      {/* Submit/Cancel placeholder */}
      <div className="mt-auto flex flex-col gap-2">
        <button className="w-full rounded-lg py-2 bg-[var(--primary-accent)] text-white font-bold">Submit</button>
        <button className="w-full rounded-lg py-2 bg-white/10 text-white">Cancel</button>
      </div>
    </aside>
  );
};

export default Sidebar; 