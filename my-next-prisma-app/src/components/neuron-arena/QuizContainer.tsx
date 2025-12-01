import React from "react";
import Sidebar from "./Sidebar";
import ReviewToggle from "./ReviewToggle";
import { useQuizStore } from "./state/quizStore";
import Timer from "./Timer";
import Navigation from "./Navigation";
import SubmitButton from "./SubmitButton";
// Production-ready violation rules (hardcoded for security)
const _rules = {
  tabSwitch: true,
  copy: true,
  paste: true,
  rightClick: true,
  printScreen: true,
  ctrlC: true,
  ctrlV: true,
  ctrlS: true,
  ctrlP: true,
};
import ScoreSummary from "./ScoreSummary";

const QuizContainer = ({
  children,
  sessionId,
}: {
  children: React.ReactNode;
  sessionId?: string;
}) => {
  const quiz = useQuizStore((s) => s.quiz);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const addViolation = useQuizStore((s) => s.addViolation);
  const total = quiz?.questions.length || 1;
  const percent = ((currentIndex + 1) / total) * 100;
  const [violationMsg, setViolationMsg] = React.useState<string | null>(null);

  // Production-ready violation rules (hardcoded for security)
  const rules = React.useMemo(
    () => ({
      tabSwitch: true,
      copy: true,
      paste: true,
      rightClick: true,
      printScreen: true,
      ctrlC: true,
      ctrlV: true,
      ctrlS: true,
      ctrlP: true,
    }),
    []
  );
  const submitted = useQuizStore((s) => s.submitted);

  React.useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && _rules.tabSwitch) {
        addViolation("tab-switch", "User switched tabs or minimized window");
        setViolationMsg("Tab switch detected! This is against quiz rules.");
      }
    }
    function handleCopy(_e: ClipboardEvent) {
      if (_rules.copy) {
        addViolation("copy", "User copied content");
        setViolationMsg("Copy action detected! This is against quiz rules.");
      }
    }
    function handlePaste(_e: ClipboardEvent) {
      if (_rules.paste) {
        addViolation("paste", "User pasted content");
        setViolationMsg("Paste action detected! This is against quiz rules.");
      }
    }
    function handleContextMenu(_e: MouseEvent) {
      if (_rules.rightClick) {
        addViolation("right-click", "User opened context menu");
        setViolationMsg("Right-click detected! This is against quiz rules.");
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      // Print Screen
      if (e.key === "PrintScreen" && rules.printScreen) {
        addViolation("print-screen", "User pressed Print Screen");
        setViolationMsg("Print Screen detected! This is against quiz rules.");
      }
      // Suspicious shortcuts
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === "c" && rules.ctrlC) {
          addViolation("ctrl-c", "User pressed Ctrl+C");
          setViolationMsg("Ctrl+C detected! This is against quiz rules.");
        }
        if (e.key.toLowerCase() === "v" && rules.ctrlV) {
          addViolation("ctrl-v", "User pressed Ctrl+V");
          setViolationMsg("Ctrl+V detected! This is against quiz rules.");
        }
        if (e.key.toLowerCase() === "s" && rules.ctrlS) {
          addViolation("ctrl-s", "User pressed Ctrl+S");
          setViolationMsg("Ctrl+S detected! This is against quiz rules.");
        }
        if (e.key.toLowerCase() === "p" && rules.ctrlP) {
          addViolation("ctrl-p", "User pressed Ctrl+P");
          setViolationMsg("Ctrl+P detected! This is against quiz rules.");
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addViolation, rules]);

  React.useEffect(() => {
    if (violationMsg) {
      const timeout = setTimeout(() => setViolationMsg(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [violationMsg]);

  React.useEffect(() => {
    return () => {
      // On unmount, invalidate the session if present
      if (sessionId) {
        fetch(`/api/quiz/invalidate-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      }
    };
  }, [sessionId]);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-background flex flex-col text-foreground">
      {/* DEV-ONLY: Floating violation toggle panel. Remove before production! */}
      {/* Development components removed for production */}
      {/* Violation Banner */}
      {violationMsg && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 font-bold animate-pulse">
          {violationMsg}
        </div>
      )}
      {/* Header: Fixed Top */}
      <header className="h-16 fixed top-0 left-0 right-0 z-50 bg-background/90 border-b border-border flex items-center px-6 backdrop-blur-md">
        <div className="font-heading text-2xl tracking-widest flex-1">
          Neuron Arena
        </div>
        <div className="flex items-center gap-6">
          <span className="font-heading text-lg">
            Q{currentIndex + 1} / {total}
          </span>
          <ReviewToggle />
          <Timer />
        </div>
      </header>
      {/* Progress Bar: Under Header */}
      <div className="fixed top-16 left-0 right-0 z-40 px-6 bg-transparent">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-[var(--primary-accent)] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {/* Main Content: Question + Sidebar or ScoreSummary */}
      <main className="flex flex-1 pt-16">
        {/* Left: Question Panel or ScoreSummary */}
        <section className="flex-1 h-[calc(100vh-64px-72px)] overflow-y-auto p-6 flex flex-col justify-center">
          {submitted ? <ScoreSummary /> : children}
        </section>
        {/* Right: Sidebar (Desktop Only) */}
        <aside className="w-[320px] h-[calc(100vh-64px-72px)] border-l border-border overflow-y-auto p-4 hidden lg:block bg-background/80">
          <Sidebar />
        </aside>
      </main>
      {/* Footer: Fixed Bottom Control Bar */}
      {!submitted && (
        <footer className="fixed bottom-0 left-0 right-0 h-[72px] z-50 bg-background/90 border-t border-border flex items-center justify-between px-6 py-4 backdrop-blur-md">
          <div className="flex gap-2 items-center">
            <Navigation />
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="rounded-lg px-6 py-3 bg-destructive/10 text-destructive font-bold border border-destructive/30 hover:bg-destructive/20 transition"
              aria-label="Cancel quiz and exit"
              tabIndex={0}
              onClick={() => {
                /* TODO: Add cancel logic */
              }}
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </footer>
      )}
    </div>
  );
};

export default QuizContainer;
