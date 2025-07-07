import React from 'react';

const DragDrop = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[Drag & Drop]</div>
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white/10 px-4 py-2 shadow cursor-grab">Item {i+1}</div>
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white/5 border-2 border-dashed border-[var(--primary-accent)] w-24 h-16 flex items-center justify-center">Dropzone {i+1}</div>
        ))}
      </div>
    </div>
  );
};

export default DragDrop; 