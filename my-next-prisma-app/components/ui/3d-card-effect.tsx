"use client";
import { cn } from "../../src/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Card3DEffectProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Card3DEffect = ({
  children,
  className,
  containerClassName,
}: Card3DEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      className={cn("group/card relative", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        ref={containerRef}
        className={cn(
          "relative w-full h-full transition-all duration-200 ease-out",
          className
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
        {isHovered && (
          <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" />
        )}
      </motion.div>
    </div>
  );
};
