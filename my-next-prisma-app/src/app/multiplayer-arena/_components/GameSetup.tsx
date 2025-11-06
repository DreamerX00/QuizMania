"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tab, TabList, Tabs } from "react-aria-components";
import {
  Users,
  Lock,
  Globe,
  UsersRound,
  Droplets,
  BrainCircuit,
  Globe2,
  Settings,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const gameModes = [
  { name: "Solo", icon: <Users size={20} />, description: "1v1 Battle" },
  { name: "Duo", icon: <Users size={20} />, description: "2v2 Team" },
  { name: "Trio", icon: <Users size={20} />, description: "3v3 Squad" },
  { name: "5-Squad", icon: <UsersRound size={20} />, description: "5v5 War" },
  {
    name: "Custom",
    icon: <UsersRound size={20} />,
    description: "Custom Rules",
  },
];

const difficulties = [
  {
    value: "Easy",
    label: "Easy",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    value: "Medium",
    label: "Medium",
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    value: "Hard",
    label: "Hard",
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    value: "Expert",
    label: "Expert",
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
];

const regions = [
  { value: "Auto", label: "Auto", icon: "🌍" },
  { value: "US-East", label: "US-East", icon: "🇺🇸" },
  { value: "US-West", label: "US-West", icon: "🇺🇸" },
  { value: "EU", label: "Europe", icon: "🇪🇺" },
  { value: "Asia", label: "Asia", icon: "🌏" },
];

const GameSetup = () => {
  const { data, error, isLoading, mutate } = useSWR("/api/game-setup", fetcher);
  const [selectedGameMode, setSelectedGameMode] = useState("Solo");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [selectedRegion, setSelectedRegion] = useState("Auto");

  useEffect(() => {
    if (data?.setup) {
      setSelectedGameMode(data.setup.mode);
      setSelectedDifficulty(data.setup.difficulty);
      setSelectedRegion(data.setup.region);
    }
  }, [data]);

  const saveSetup = async (
    mode: string,
    difficulty: string,
    region: string
  ) => {
    try {
      await fetch("/api/game-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, difficulty, region }),
      });
      mutate();
      toast.success("Game setup saved!");
    } catch {
      toast.error("Failed to save setup.");
    }
  };

  const handleGameModeClick = (modeName: string) => {
    setSelectedGameMode(modeName);
    saveSetup(modeName, selectedDifficulty, selectedRegion);
  };

  const handleDifficultyChange = (val: string) => {
    setSelectedDifficulty(val);
    saveSetup(selectedGameMode, val, selectedRegion);
  };

  const handleRegionChange = (val: string) => {
    setSelectedRegion(val);
    saveSetup(selectedGameMode, selectedDifficulty, val);
  };

  if (isLoading)
    return (
      <div className="h-full bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 rounded-3xl p-6 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading setup...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="h-full bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 rounded-3xl p-6 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl">
        <div className="text-center text-red-500">
          <p>Failed to load game setup.</p>
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 rounded-3xl p-6 flex flex-col gap-6 text-gray-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative">
          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Battle Configuration
        </h2>
      </div>

      {/* Difficulty Selector */}
      <div className="relative z-10 space-y-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Combat Difficulty
        </label>
        <Select
          value={selectedDifficulty}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger className="w-full bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white border border-slate-300/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl backdrop-blur-sm shadow-sm">
            <SelectValue placeholder="Select difficulty..." />
          </SelectTrigger>
          <SelectContent className="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white border border-slate-300/50 dark:border-slate-600/50 backdrop-blur-xl">
            {difficulties.map((level) => (
              <SelectItem
                key={level.value}
                value={level.value}
                className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${level.color}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${level.bg}`}></div>
                  {level.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Game Modes */}
      <div className="relative z-10 space-y-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Battle Formation
        </label>
        <div className="grid grid-cols-2 gap-3">
          {gameModes.map((mode) => (
            <motion.div
              key={mode.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGameModeClick(mode.name)}
              className={`p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 border transition-all duration-300 ${
                selectedGameMode === mode.name
                  ? "bg-gradient-to-br from-purple-600 to-blue-600 border-purple-500 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/80 dark:bg-slate-800/80 border-slate-300/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  selectedGameMode === mode.name
                    ? "bg-white/20"
                    : "bg-slate-100 dark:bg-slate-700"
                }`}
              >
                {mode.icon}
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold">{mode.name}</span>
                <p className="text-xs opacity-80 mt-1">{mode.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Room Type */}
      <div className="relative z-10 space-y-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Battle Access
        </label>
        <Tabs defaultSelectedKey="public" className="w-full">
          <TabList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-600/50 rounded-xl p-1 backdrop-blur-sm">
            <Tab
              id="private"
              className={({ isSelected }) =>
                `flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`
              }
            >
              <Lock className="w-4 h-4" /> Private
            </Tab>
            <Tab
              id="public"
              className={({ isSelected }) =>
                `flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`
              }
            >
              <Globe className="w-4 h-4" /> Public
            </Tab>
            <Tab
              id="friends"
              className={({ isSelected }) =>
                `flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`
              }
            >
              <Users className="w-4 h-4" /> Friends
            </Tab>
          </TabList>
        </Tabs>
      </div>

      {/* Region Selector */}
      <div className="relative z-10 space-y-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Battle Server
        </label>
        <Select value={selectedRegion} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white border border-slate-300/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl backdrop-blur-sm shadow-sm">
            <SelectValue placeholder="Select region..." />
          </SelectTrigger>
          <SelectContent className="bg-white/95 dark:bg-slate-800/95 text-gray-900 dark:text-white border border-slate-300/50 dark:border-slate-600/50 backdrop-blur-xl">
            {regions.map((region) => (
              <SelectItem
                key={region.value}
                value={region.value}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span>{region.icon}</span>
                  {region.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Impact Indicator */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Battle Impact
              </span>
            </div>
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Rank
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ↑+25
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                XP
              </span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ↓-10
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Coins
              </span>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                +50
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Gems
              </span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                +2
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameSetup;
