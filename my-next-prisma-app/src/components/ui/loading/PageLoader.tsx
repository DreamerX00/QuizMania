import React from "react";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function PageLoader({
  text = "Loading...",
  fullScreen = true,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "fixed inset-0 bg-black/80 backdrop-blur-sm z-50",
        !fullScreen && "w-full h-full min-h-[200px]",
        className
      )}
    >
      <div className="relative">
        <Spinner size="xl" />
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-xl animate-pulse" />
      </div>
      <p className="text-lg font-medium bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
        {text}
      </p>
    </div>
  );
}
