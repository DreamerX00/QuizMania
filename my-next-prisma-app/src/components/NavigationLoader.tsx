"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Complete loading when route changes
    setIsLoading(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Simulate progress during loading
    if (isLoading && progress < 90) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress]);

  useEffect(() => {
    // Listen for link clicks to start loading
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        // Check if it's an internal navigation
        const isInternal =
          link.href.startsWith(window.location.origin) ||
          link.href.startsWith("/");

        // Check if it's a different page (not same route or hash link)
        const isSamePage =
          link.href === window.location.href ||
          link.href.startsWith("#") ||
          link.href === window.location.origin + window.location.pathname;

        // Only show loader for internal navigation to different pages
        if (isInternal && !isSamePage && !link.target) {
          setIsLoading(true);
          setProgress(10);
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)",
        }}
      />
    </div>
  );
}
