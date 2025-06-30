import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import clsx from "clsx";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = true }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 rounded-2xl bg-white/90 shadow-[0_0_24px_4px_rgba(59,130,246,0.15)] dark:bg-slate-900/50 dark:border dark:border-slate-700 overflow-hidden shadow-lg backdrop-blur-md">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-purple-700/10 dark:to-blue-700/10 text-blue-900 dark:text-white focus:outline-none transition-colors hover:bg-blue-200/80 dark:hover:bg-slate-800/40 bg-opacity-20 backdrop-blur"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <FiChevronDown
          className={clsx(
            "ml-2 text-2xl transition-transform duration-300",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      <div
        className={clsx(
          "transition-all duration-400 ease-in-out overflow-hidden",
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
        style={{
          willChange: "max-height, opacity",
        }}
      >
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
} 