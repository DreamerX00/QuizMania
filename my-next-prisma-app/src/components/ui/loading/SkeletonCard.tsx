import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  variant?: "default" | "quiz" | "profile" | "timeline";
}

export function SkeletonCard({
  className,
  variant = "default",
}: SkeletonCardProps) {
  const variants = {
    default: (
      <div className="space-y-4">
        <div className="h-6 w-3/4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
        <div className="h-4 w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded animate-pulse" />
      </div>
    ),
    quiz: (
      <div className="space-y-4">
        <div className="h-8 w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    ),
    profile: (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    ),
    timeline: (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-purple-500/20"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-purple-500/20 bg-gray-900/50 backdrop-blur-sm",
        className
      )}
    >
      {variants[variant]}
    </div>
  );
}
