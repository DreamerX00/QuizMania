"use client";
import { cn } from "../../src/lib/utils";
import React from "react";
import { motion } from "framer-motion";

interface HeroHighlightProps {
  children: React.ReactNode;
  className?: string;
  highlightClassName?: string;
}

export const HeroHighlight = ({
  children,
  className,
  highlightClassName,
}: HeroHighlightProps) => {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-lg blur-xl",
          highlightClassName
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}; 