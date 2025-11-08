"use client";
import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import styles from "./LeftPanel.module.css";

const DIFFICULTY_LEVELS = [
  { value: "SUPER_EASY", label: "Super Easy" },
  { value: "EASY", label: "Easy" },
  { value: "NORMAL", label: "Normal" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "IMPOSSIBLE", label: "Impossible" },
  { value: "INSANE", label: "Insane" },
  { value: "JEE_MAIN", label: "JEE Main" },
  { value: "JEE_ADVANCED", label: "JEE Adv." },
  { value: "NEET_UG", label: "NEET UG" },
  { value: "UPSC_CSE", label: "UPSC CSE" },
  { value: "GATE", label: "GATE" },
  { value: "CAT", label: "CAT" },
  { value: "CLAT", label: "CLAT" },
  { value: "CA", label: "CA" },
  { value: "GAOKAO", label: "Gaokao" },
  { value: "GRE", label: "GRE" },
  { value: "GMAT", label: "GMAT" },
  { value: "USMLE", label: "USMLE" },
  { value: "LNAT", label: "LNAT" },
  { value: "MCAT", label: "MCAT" },
  { value: "CFA", label: "CFA" },
  { value: "GOD_LEVEL", label: "GOD MODE" },
];

const GAME_MODES = [
  { value: "SOLO", label: "Solo", slots: 1 },
  { value: "DUO", label: "Duo", slots: 2 },
  { value: "TRIO", label: "Trio", slots: 3 },
  { value: "SQUAD", label: "5-Squad", slots: 5 },
  { value: "CUSTOM", label: "Custom", slots: 10 }, // Custom can be 1-50, but show 10 as default
];

const ROOM_TYPES = [
  { value: "PRIVATE", label: "Private 🔒", premium: true },
  { value: "PUBLIC", label: "Public 🌐", premium: false },
  { value: "FRIENDS", label: "Friends Only 👥", premium: false },
];

const REGION_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "asia", label: "Asia" },
  { value: "eu", label: "Europe" },
  { value: "us", label: "US" },
  { value: "oceania", label: "Oceania" },
];

const LeftPanel: React.FC = () => {
  const { status } = useSession();
  const [difficulty, setDifficulty] = useState("NORMAL");
  const [gameMode, setGameMode] = useState("SOLO");
  const [roomType, setRoomType] = useState("PUBLIC");
  const [region, setRegion] = useState("auto");
  const [customSlots, setCustomSlots] = useState(10);
  const impact = {
    xp: 120,
    rank: 2,
    coins: 50,
    gems: 1,
    gain: true,
  };

  return (
    <aside
      className={`w-full max-w-xs h-full flex flex-col gap-6 p-6 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-lg border-r border-gray-200/50 dark:border-white/20 shadow-xl rounded-r-3xl relative ${styles["neon-glass"]}`}
    >
      {status === "authenticated" ? (
        <>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-wide drop-shadow-lg">
            <span className="inline-block animate-pulse">🔧</span> Game Setup
          </h2>
          {/* Difficulty Selector as Dropdown */}
          <div className="mb-6">
            <label
              htmlFor="difficulty-select"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border-2 bg-white/70 dark:bg-zinc-900/80 text-gray-900 dark:text-white border-gray-200/50 dark:border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${styles["neon-glass"]}`}
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <option
                  key={level.value}
                  value={level.value}
                  className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                >
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          {/* Game Mode Tiles */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Game Mode
            </label>
            <div className="flex gap-2 flex-wrap">
              {GAME_MODES.map((mode) => (
                <button
                  key={mode.value}
                  className={`relative flex flex-col items-center justify-center px-4 py-3 rounded-2xl border-2 shadow-lg font-bold text-sm transition-all
                  ${
                    gameMode === mode.value
                      ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-400 animate-pulse"
                      : "bg-white/60 dark:bg-zinc-800/60 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-white/20 hover:bg-blue-100 dark:hover:bg-blue-700/40"
                  }
                  ${styles["neon-glass"]}
                `}
                  onClick={() => setGameMode(mode.value)}
                  type="button"
                >
                  <span className="mb-1 text-lg">{mode.label}</span>
                  <span className="flex gap-1">
                    {[
                      ...Array(
                        mode.value === "CUSTOM" ? customSlots : mode.slots
                      ),
                    ].map((_, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-linear-to-br from-blue-400 to-cyan-300 dark:from-blue-500 dark:to-cyan-500 animate-pulse"
                      />
                    ))}
                  </span>
                  {mode.value === "CUSTOM" && gameMode === "CUSTOM" && (
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={customSlots}
                      onChange={(e) => setCustomSlots(Number(e.target.value))}
                      className="mt-2 w-16 px-2 py-1 rounded bg-white/80 dark:bg-zinc-900/80 border border-blue-400 text-center text-xs text-blue-700 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Room Type Tabs */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Room Type
            </label>
            <div className="flex gap-2">
              {ROOM_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`px-4 py-2 rounded-xl font-bold text-xs border-2 transition-all
                  ${
                    roomType === type.value
                      ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-400 animate-pulse"
                      : "bg-white/60 dark:bg-zinc-800/60 text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-white/20 hover:bg-blue-100 dark:hover:bg-blue-700/40"
                  }
                  ${
                    type.premium
                      ? "relative after:content-['PREMIUM'] after:absolute after:-top-2 after:right-2 after:bg-yellow-400 after:text-xs after:px-2 after:py-0.5 after:rounded after:shadow-md after:text-yellow-900"
                      : ""
                  }
                  ${styles["neon-glass"]}
                `}
                  onClick={() => setRoomType(type.value)}
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          {/* Geo/Latency Region Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Region
            </label>
            <div className="flex items-center gap-2">
              {/* Animated Earth Placeholder */}
              <span className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-cyan-300 dark:from-blue-500 dark:to-cyan-500 flex items-center justify-center shadow-lg animate-spin-slow">
                🌍
              </span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-3 py-1 rounded-xl border-2 bg-white/70 dark:bg-zinc-900/80 text-gray-900 dark:text-white border-gray-200/50 dark:border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                {REGION_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              {/* Ping Indicator (placeholder) */}
              <span className="ml-2 text-xs font-mono text-green-500 animate-pulse">
                12ms
              </span>
            </div>
          </div>
          {/* Impact Indicator */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Impact Indicator
            </label>
            <div
              className={`flex flex-col gap-2 p-4 rounded-2xl border-2 shadow-lg bg-white/80 dark:bg-zinc-900/80 ${styles["neon-glass"]}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-green-500 text-lg font-bold animate-bounce">
                  {impact.gain ? "+" : "-"}
                  {impact.xp} XP
                </span>
                <span className="text-blue-500 text-lg font-bold animate-bounce">
                  {impact.gain ? "+" : "-"}
                  {impact.rank} Rank
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 text-lg font-bold animate-bounce">
                  {impact.gain ? "+" : "-"}
                  {impact.coins} Coins
                </span>
                <span className="text-pink-500 text-lg font-bold animate-bounce">
                  {impact.gain ? "+" : "-"}
                  {impact.gems} Gems
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Sign in to access the Multiplayer Arena
          </p>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all"
          >
            Sign In
          </button>
        </div>
      )}
    </aside>
  );
};

export default LeftPanel;

