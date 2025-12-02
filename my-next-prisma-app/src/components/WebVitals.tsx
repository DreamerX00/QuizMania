"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/utils/performance";

export default function WebVitals() {
  useEffect(() => {
    // Report web vitals when available
    if (typeof window !== "undefined") {
      // Report LCP (Largest Contentful Paint)
      const reportLCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            processingStart?: number;
          };
          reportWebVitals({
            name: "LCP",
            value: lastEntry.startTime,
            id: (lastEntry as any).id || "lcp-observer",
          });
        });
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      };

      // Report FID (First Input Delay)
      const reportFID = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const eventEntry = entry as PerformanceEventTiming;
            reportWebVitals({
              name: "FID",
              value: (eventEntry.processingStart || 0) - entry.startTime,
              id: (eventEntry as any).id || "fid-observer",
            });
          });
        });
        observer.observe({ entryTypes: ["first-input"] });
      };

      // Report CLS (Cumulative Layout Shift)
      const reportCLS = () => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries() as Array<
            PerformanceEntry & {
              hadRecentInput?: boolean;
              value: number;
            }
          >;
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          reportWebVitals({
            name: "CLS",
            value: clsValue,
            id: "cls-observer",
          });
        });
        observer.observe({ entryTypes: ["layout-shift"] });
      };

      // Report FCP (First Contentful Paint)
      const reportFCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as PerformanceNavigationTiming;
          reportWebVitals({
            name: "FCP",
            value: firstEntry.startTime,
            id: (firstEntry as any).id || "fcp-observer",
          });
        });
        observer.observe({ entryTypes: ["paint"] });
      };

      // Report TTFB (Time to First Byte)
      const reportTTFB = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceNavigationTiming[];
          entries.forEach((entry) => {
            if (entry.entryType === "navigation") {
              reportWebVitals({
                name: "TTFB",
                value: entry.responseStart - entry.requestStart,
                id: (entry as any).id,
              });
            }
          });
        });
        observer.observe({ entryTypes: ["navigation"] });
      };

      // Initialize all observers
      try {
        reportLCP();
        reportFID();
        reportCLS();
        reportFCP();
        reportTTFB();
      } catch (error) {
        console.warn("Web Vitals reporting not supported:", error);
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
