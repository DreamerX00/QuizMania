import React from "react";
import { getRankByXP } from "@/utils/rank";

interface RankCardProps {
  xp: number;
  className?: string;
  compact?: boolean;
}

const gradientThemes: Record<string, string> = {
  Novara: "from-blue-200 via-white to-blue-400",
  Mentora: "from-sky-300 via-gray-100 to-blue-500",
  Cognita: "from-green-200 via-teal-200 to-green-400",
  Sapienta: "from-yellow-200 via-red-100 to-yellow-400",
  Lexora: "from-navy-900 via-gray-200 to-slate-400",
  Intellica: "from-cyan-400 via-black to-cyan-700",
  Acuvera: "from-emerald-400 via-gray-900 to-green-700",
  Mindara: "from-purple-500 via-gray-400 to-purple-800",
  Neurona: "from-green-300 via-pink-200 to-pink-500",
  Strategix: "from-indigo-700 via-blue-400 to-yellow-300",
  Excellon: "from-red-500 via-yellow-200 to-yellow-500",
  Ascendrix: "from-purple-700 via-black to-purple-300",
  Quizora: "from-blue-900 via-yellow-100 to-yellow-400",
  Ecliptix: "from-black via-yellow-200 to-yellow-400",
  Omniscian: "from-yellow-400 via-purple-500 to-black",
};

const RankCard: React.FC<RankCardProps> = ({
  xp,
  className,
  compact = false,
}) => {
  const rankInfo = getRankByXP(xp);
  const _gradient =
    gradientThemes[rankInfo.current.name] || "from-gray-200 to-gray-400";

  // Compact mode adjustments
  const padding = compact ? "p-3" : "p-6";
  const iconSize = compact ? "text-4xl" : "text-6xl";
  const nameSize = compact ? "text-2xl" : "text-3xl";
  const descSize = compact ? "text-sm" : "text-base";
  const barHeight = compact ? "h-3" : "h-4";
  const cardRadius = compact ? "rounded-2xl" : "rounded-3xl";
  const cardShadow = compact ? "shadow-xl" : "shadow-2xl";
  const mb = compact ? "mb-1" : "mb-2";
  const mt = compact ? "mt-2" : "mt-4";
  const nextRankMt = compact ? "mt-3" : "mt-6";

  return (
    <div
      className={`relative ${cardRadius} ${cardShadow} ${padding} overflow-hidden flex flex-col items-center border-4 border-white/10 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${rankInfo.current.colorScheme[0]}, ${rankInfo.current.colorScheme[1]})`,
        boxShadow: `0 0 40px 0 ${rankInfo.current.colorScheme[0]}55, 0 0 80px 0 ${rankInfo.current.colorScheme[1]}33`,
      }}
    >
      {/* Glow ring */}
      <div
        className={`absolute -inset-2 z-0 ${cardRadius} pointer-events-none`}
        style={{
          boxShadow: `0 0 60px 10px ${rankInfo.current.colorScheme[0]}55, 0 0 120px 20px ${rankInfo.current.colorScheme[1]}33`,
          filter: "blur(8px)",
        }}
      />
      {/* Rank Icon and Name */}
      <div className={`relative z-10 flex flex-col items-center gap-2 ${mb}`}>
        <span
          className={`${iconSize} drop-shadow-lg`}
          role="img"
          aria-label={rankInfo.current.name}
        >
          {rankInfo.current.emoji}
        </span>
        <h2
          className={`${nameSize} font-extrabold tracking-wide`}
          style={{
            color: rankInfo.current.colorScheme[0],
            textShadow: `0 2px 16px ${rankInfo.current.colorScheme[1]}99`,
          }}
        >
          {rankInfo.current.name}
        </h2>
        <p
          className={`${descSize} text-white/80 text-center max-w-xs font-medium`}
        >
          {rankInfo.current.description}
        </p>
      </div>
      {/* XP Bar */}
      <div className={`w-full ${mt}`}>
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>{rankInfo.current.xpMin.toLocaleString()} XP</span>
          <span>{xp.toLocaleString()} XP</span>
          <span>
            {rankInfo.current.xpMax === Infinity
              ? "∞"
              : rankInfo.current.xpMax.toLocaleString() + " XP"}
          </span>
        </div>
        <div
          className={`${barHeight} rounded-full bg-white/10 overflow-hidden relative`}
        >
          <div
            className="h-full rounded-full animate-pulse"
            style={{
              width: `${rankInfo.progressPercent}%`,
              background: "linear-gradient(90deg, #a8ff78, #78ffd6)",
              boxShadow: "0 0 16px 2px #a8ff7899",
              transition: "width 0.7s cubic-bezier(.4,2,.3,1)",
            }}
          />
        </div>
      </div>
      {/* Next Rank Preview */}
      <div className={`${nextRankMt} w-full flex flex-col items-center`}>
        {rankInfo.next ? (
          <>
            <div className="flex items-center gap-2 text-lg font-semibold text-white/90">
              <span
                className="text-2xl"
                role="img"
                aria-label={rankInfo.next.name}
              >
                {rankInfo.next.emoji}
              </span>
              Next: {rankInfo.next.name}
            </div>
            <div className="text-sm text-green-200 mt-1">
              {rankInfo.next.xpMin - xp} XP to level up
            </div>
          </>
        ) : (
          <div className="text-yellow-300 font-bold text-lg">
            Max Rank Achieved
          </div>
        )}
      </div>
    </div>
  );
};

export default RankCard;
