"use client";
import { cn } from "../../src/lib/utils";
import React from "react";

interface GlowingEffectProps {
  children: React.ReactNode;
  className?: string;
  glowClassName?: string;
}

export const GlowingEffect = ({
  children,
  className,
  glowClassName,
}: GlowingEffectProps) => {
  return (
    <div className={cn("relative group", className)}>
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200",
          glowClassName
        )}
      />
      <div className="relative bg-black rounded-xl">{children}</div>
    </div>
  );
}; 