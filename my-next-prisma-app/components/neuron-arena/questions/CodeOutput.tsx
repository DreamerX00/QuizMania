import React from 'react';

const CodeOutput = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[Code Output]</div>
      <pre className="bg-black/60 rounded-lg p-4 font-mono text-white mb-2">const x = 5 + 3;\nconsole.log(x);</pre>
      <input className="w-40 px-2 py-2 rounded bg-white/10 border-b-2 border-[var(--primary-accent)] text-white focus:outline-none font-mono" placeholder="Expected Output" />
    </div>
  );
};

export default CodeOutput; 