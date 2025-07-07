import React from 'react';

const TrueFalse = () => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="font-heading text-lg mb-2">[True / False]</div>
      <div className="flex gap-6">
        <button className="rounded-full px-8 py-4 bg-green-500/20 hover:bg-green-500/40 text-green-300 font-bold text-xl">✅ True</button>
        <button className="rounded-full px-8 py-4 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold text-xl">❌ False</button>
      </div>
    </div>
  );
};

export default TrueFalse; 