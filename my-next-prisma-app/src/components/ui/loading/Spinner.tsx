import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  withGlow?: boolean;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function Spinner({
  size = "md",
  className,
  withGlow = true,
}: SpinnerProps) {
  return (
    <div className="inline-flex items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-transparent",
          "bg-linear-to-r from-purple-500 via-pink-500 to-blue-500",
          "bg-clip-border",
          sizeMap[size],
          withGlow && "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
          className
        )}
        style={{
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "currentColor",
          borderLeftColor: "currentColor",
          background:
            "conic-gradient(from 0deg, #a855f7, #ec4899, #3b82f6, #a855f7)",
        }}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
