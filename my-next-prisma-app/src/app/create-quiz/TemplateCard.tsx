"use client";
import React from "react";
import { motion } from "framer-motion";
import type { Quiz } from "@prisma/client";
import { Tag, Calendar, DollarSign, BookOpen } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface TemplateCardProps {
  quiz: Quiz;
  onSelect: (quiz: Quiz) => void;
  hideImage?: boolean;
}

export default function TemplateCard({
  quiz,
  onSelect,
  hideImage = false,
}: TemplateCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(quiz)}
      className={`rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/30 border border-white/10 shadow-xl p-4 ${
        hideImage ? "flex-row items-center gap-6" : "flex-col gap-3"
      } hover:scale-105 hover:border-purple-400/80 transition-all duration-300 cursor-pointer group`}
    >
      {/* Image/Cover (hide in list view) */}
      {!hideImage && (
        <div className="relative aspect-[4/3] bg-white/10 rounded-xl mb-1 overflow-hidden">
          {quiz.imageUrl ? (
            <Image
              src={quiz.imageUrl}
              alt={quiz.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <BookOpen size={36} />
            </div>
          )}
          <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-yellow-300 bg-yellow-900/60 rounded-full backdrop-blur-sm">
            Not Published
          </div>
        </div>
      )}

      {/* Title */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3
              className={`text-base font-bold text-white group-hover:text-purple-300 transition-colors ${
                hideImage ? "truncate max-w-[220px]" : "truncate"
              }`}
            >
              {quiz.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent>
            <p>{quiz.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Tags */}
      <div
        className={`flex flex-wrap gap-1.5 items-center ${
          hideImage ? "min-w-[120px]" : ""
        }`}
      >
        <Tag size={14} className="text-white/40" />
        {quiz.tags.length > 0 ? (
          quiz.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-xs text-white/50">No tags</span>
        )}
      </div>

      {/* Meta Info */}
      <div
        className={`${
          hideImage
            ? "border-0 pt-0 mt-0 flex-col items-start gap-1"
            : "mt-auto pt-2.5 border-t"
        } border-white/10 flex justify-between items-center text-xs text-white/60`}
      >
        <div className="flex items-center gap-1.5">
          <Calendar size={12} />
          <span>{format(new Date(quiz.createdAt), "dd MMM yyyy")}</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-green-400">
          <DollarSign size={12} />
          <span>{quiz.price === 0 ? "Free" : `₹${quiz.price}`}</span>
        </div>
      </div>
    </motion.div>
  );
}
