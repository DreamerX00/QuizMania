import React from "react";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
}

export function ButtonLoader({
  isLoading,
  children,
  loadingText = "Loading...",
  className,
  disabled,
  type = "button",
  onClick,
  variant = "default",
}: ButtonLoaderProps) {
  const variantStyles = {
    default:
      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
    outline:
      "border-2 border-purple-500/50 hover:bg-purple-500/10 text-purple-300",
    ghost: "hover:bg-purple-500/10 text-purple-300",
    destructive:
      "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "px-6 py-3 rounded-lg font-semibold",
        "transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        variantStyles[variant],
        className
      )}
    >
      {isLoading && (
        <Spinner size="sm" withGlow={false} className="absolute left-4" />
      )}
      <span className={cn("transition-opacity", isLoading && "opacity-0")}>
        {children}
      </span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          {loadingText}
        </span>
      )}
    </button>
  );
}
