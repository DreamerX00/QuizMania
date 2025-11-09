'use client';

import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): void {
    if (typeof window !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  endTimer(name: string): number {
    if (typeof window !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      const duration = measure.duration;
      
      this.metrics.set(name, duration);
      
      // Clean up marks and measures
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return duration;
    }
    return 0;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  if (typeof window !== 'undefined') {
    // Send to analytics service
    console.log('Web Vital:', metric);
    
    // You can send to your analytics service here
    // Example: analytics.track('web_vital', metric);
  }
}

// Memory usage monitoring
export function getMemoryUsage(): { used: number; total: number; percentage: number } | null {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
}

// Network performance monitoring
export function measureNetworkPerformance(url: string): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    
    fetch(url, { method: 'HEAD' })
      .then(() => {
        const end = performance.now();
        resolve(end - start);
      })
      .catch(() => {
        resolve(-1); // Error
      });
  });
}

// Component render performance hook
export function useRenderPerformance(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    monitor.startTimer(`${componentName}-render`);
    
    return () => {
      const duration = monitor.endTimer(`${componentName}-render`);
      if (duration > 16) { // Longer than one frame (16ms)
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
      }
    };
  });
}

// Lazy loading performance
export function useLazyLoadPerformance<T>(
  importFn: () => Promise<T>,
  componentName: string
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    monitor.startTimer(`${componentName}-lazy-load`);
    
    importFn()
      .then((module) => {
        const duration = monitor.endTimer(`${componentName}-lazy-load`);
        console.log(`${componentName} lazy loaded in ${duration.toFixed(2)}ms`);
        setComponent(module);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [importFn, componentName]);

  return { Component, loading, error };
}

// Bundle size monitoring
export function getBundleSize(): Promise<{ size: number; gzipped: number } | null> {
  if (typeof window !== 'undefined') {
    return fetch('/api/bundle-size')
      .then(res => res.json())
      .catch(() => null);
  }
  return Promise.resolve(null);
}

// Performance budget checking
export function checkPerformanceBudget(metric: string, value: number, budget: number): boolean {
  const isWithinBudget = value <= budget;
  
  if (!isWithinBudget) {
    console.warn(`Performance budget exceeded for ${metric}: ${value}ms (budget: ${budget}ms)`);
  }
  
  return isWithinBudget;
} 
