"use client";
import { cn } from "../../src/lib/utils";
import React, { useEffect, useRef, useState } from "react";

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export const Spotlight = ({ children, className }: SpotlightProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => setOpacity(1);
  const handleBlur = () => setOpacity(0);

  useEffect(() => {
    handleFocus();
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-1 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(147, 51, 234, 0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}; 