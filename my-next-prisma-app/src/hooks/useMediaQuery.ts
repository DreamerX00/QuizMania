import { useState, useEffect } from "react";

/**
 * Custom hook to detect media query matches
 * @param query - Media query string (e.g., '(min-width: 1024px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Avoid SSR issues
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
    // Fallback for older browsers
    else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}

/**
 * Common responsive breakpoints matching Tailwind CSS
 */
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
  mobile: "(max-width: 767px)",
  desktop: "(min-width: 1024px)",
} as const;

/**
 * Convenience hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery(breakpoints.mobile);
export const useIsDesktop = () => useMediaQuery(breakpoints.desktop);
export const useIsTablet = () =>
  useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
