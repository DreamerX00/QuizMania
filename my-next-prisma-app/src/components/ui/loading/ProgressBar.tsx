import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className,
  size = "md",
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="font-medium bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-gray-800/50 overflow-hidden",
          sizeMap[size]
        )}
      >
        <div
          className="h-full bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
