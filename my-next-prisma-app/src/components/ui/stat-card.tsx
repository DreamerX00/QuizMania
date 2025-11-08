import React, { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  /**
   * Icon component to display (from lucide-react)
   */
  icon?: LucideIcon | ReactNode;

  /**
   * Label text for the stat
   */
  label: string;

  /**
   * Value to display (can be number or string)
   */
  value: string | number;

  /**
   * Color variant for the card
   */
  color?:
    | "blue"
    | "purple"
    | "green"
    | "yellow"
    | "pink"
    | "red"
    | "cyan"
    | "orange";

  /**
   * Optional subtitle or description
   */
  subtitle?: string;

  /**
   * Optional custom className
   */
  className?: string;

  /**
   * Enable hover animation
   */
  enableHover?: boolean;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";
}

const colorVariants = {
  blue: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/10 dark:bg-purple-400/10",
    border: "border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  green: {
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10 dark:bg-green-400/10",
    border: "border-green-500/30",
    text: "text-green-600 dark:text-green-400",
  },
  yellow: {
    gradient: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-500/10 dark:bg-yellow-400/10",
    border: "border-yellow-500/30",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  pink: {
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/10 dark:bg-pink-400/10",
    border: "border-pink-500/30",
    text: "text-pink-600 dark:text-pink-400",
  },
  red: {
    gradient: "from-red-500 to-rose-500",
    bg: "bg-red-500/10 dark:bg-red-400/10",
    border: "border-red-500/30",
    text: "text-red-600 dark:text-red-400",
  },
  cyan: {
    gradient: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-500/10 dark:bg-cyan-400/10",
    border: "border-cyan-500/30",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  orange: {
    gradient: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10 dark:bg-orange-400/10",
    border: "border-orange-500/30",
    text: "text-orange-600 dark:text-orange-400",
  },
};

const sizeVariants = {
  sm: {
    padding: "p-3",
    iconSize: "w-4 h-4",
    valueSize: "text-lg",
    labelSize: "text-xs",
  },
  md: {
    padding: "p-4",
    iconSize: "w-5 h-5",
    valueSize: "text-2xl",
    labelSize: "text-sm",
  },
  lg: {
    padding: "p-6",
    iconSize: "w-6 h-6",
    valueSize: "text-3xl",
    labelSize: "text-base",
  },
};

/**
 * Shared StatCard component for displaying statistics
 * Replaces repetitive stat card implementations across the app
 */
export const StatCard = memo(function StatCard({
  icon,
  label,
  value,
  color = "blue",
  subtitle,
  className = "",
  enableHover = true,
  size = "md",
}: StatCardProps) {
  const colors = colorVariants[color];
  const sizes = sizeVariants[size];

  const Icon = icon as LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={enableHover ? { scale: 1.02, y: -2 } : {}}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden
        ${sizes.padding}
        ${colors.bg}
        backdrop-blur-sm
        border ${colors.border}
        rounded-2xl
        shadow-lg hover:shadow-xl
        transition-all duration-300
        ${className}
      `}
    >
      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${colors.gradient} opacity-5 pointer-events-none`}
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        {/* Icon */}
        {icon && (
          <div className={`${colors.text} mb-1`}>
            {typeof icon === "function" ? (
              <Icon className={sizes.iconSize} />
            ) : (
              icon
            )}
          </div>
        )}

        {/* Value */}
        <div
          className={`font-bold ${colors.text} ${sizes.valueSize} drop-shadow-glow`}
        >
          {value}
        </div>

        {/* Label */}
        <div
          className={`text-gray-600 dark:text-white/60 ${sizes.labelSize} text-center`}
        >
          {label}
        </div>

        {/* Optional Subtitle */}
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-white/40 mt-1 text-center">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
});

/**
 * Horizontal variant of StatCard
 */
export const StatCardHorizontal = memo(function StatCardHorizontal({
  icon,
  label,
  value,
  color = "blue",
  subtitle,
  className = "",
  enableHover = true,
}: StatCardProps) {
  const colors = colorVariants[color];
  const Icon = icon as LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={enableHover ? { scale: 1.02, x: 2 } : {}}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden
        p-4
        ${colors.bg}
        backdrop-blur-sm
        border ${colors.border}
        rounded-xl
        shadow-md hover:shadow-lg
        transition-all duration-300
        ${className}
      `}
    >
      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        {icon && (
          <div className={`${colors.text} shrink-0`}>
            {typeof icon === "function" ? <Icon className="w-8 h-8" /> : icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Label */}
          <div className="text-xs text-gray-600 dark:text-white/60 mb-1">
            {label}
          </div>

          {/* Value */}
          <div
            className={`font-bold ${colors.text} text-xl drop-shadow-glow truncate`}
          >
            {value}
          </div>

          {/* Optional Subtitle */}
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-white/40 mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

