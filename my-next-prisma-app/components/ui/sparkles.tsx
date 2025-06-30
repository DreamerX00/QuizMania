"use client";
import { cn } from "../../src/lib/utils";
import React, { useEffect, useState } from "react";

interface SparklesProps {
  children: React.ReactNode;
  className?: string;
  sparklesClassName?: string;
  count?: number;
  duration?: number;
}

export const Sparkles = ({
  children,
  className,
  sparklesClassName,
  duration = 1000,
}: SparklesProps) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const generateSparkle = () => {
      const newSparkle = {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setSparkles((prev) => [...prev, newSparkle]);

      setTimeout(() => {
        setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== newSparkle.id));
      }, duration);
    };

    const interval = setInterval(generateSparkle, 200);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className={cn("relative inline-block", className)}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={cn(
            "absolute pointer-events-none animate-ping",
            sparklesClassName
          )}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animationDuration: `${duration}ms`,
          }}
        >
          <div className="w-1 h-1 bg-purple-400 rounded-full" />
        </div>
      ))}
      {children}
    </div>
  );
}; 