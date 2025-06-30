"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tab, TabList, Tabs } from 'react-aria-components';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lock, Globe, UsersRound, BarChart, Gem, Coins, ArrowUp, ArrowDown, Droplets, BrainCircuit, Globe2 } from 'lucide-react';
import { DifficultyLevel } from '@prisma/client';

const difficultyLevels = Object.values(DifficultyLevel);

const GameSetup = () => {
  const [selectedGameMode, setSelectedGameMode] = useState('Solo');

  const gameModes = [
    { name: 'Solo', icon: <Users size={20} /> },
    { name: 'Duo', icon: <Users size={20} /> },
    { name: 'Trio', icon: <Users size={20} /> },
    { name: '5-Squad', icon: <UsersRound size={20} /> },
    { name: 'Custom', icon: <UsersRound size={20} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col gap-4 text-gray-900 dark:text-white border dark:border-slate-700"
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Game Setup
      </h2>

      {/* Difficulty Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <BrainCircuit size={16} /> Dynamic Difficulty
        </label>
        <Select defaultValue={difficultyLevels[1]}>
          <SelectTrigger className="w-full bg-slate-900/70 border-slate-700 hover:bg-slate-800/70 rounded-lg">
            <SelectValue placeholder="Select a difficulty..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 text-white border-slate-700">
            {difficultyLevels.map((level) => (
              <SelectItem key={level} value={level} className="cursor-pointer hover:!bg-slate-800">
                {level.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Game Modes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Game Modes</label>
        <div className="grid grid-cols-3 gap-2">
          {gameModes.map((mode) => (
            <motion.div
              key={mode.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGameMode(mode.name)}
              className={`p-3 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1 border transition-colors ${
                selectedGameMode === mode.name
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800/70'
              }`}
            >
              {mode.icon}
              <span className="text-xs font-semibold">{mode.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Room Type */}
      <Tabs defaultValue="public" className="w-full">
        <TabList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-lg p-1">
            <Tab id="private" className={({isSelected}) => `flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800/60'}`}>
                <Lock size={14} /> Private
            </Tab>
            <Tab id="public" className={({isSelected}) => `flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800/60'}`}>
                <Globe size={14} /> Public
            </Tab>
            <Tab id="friends" className={({isSelected}) => `flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800/60'}`}>
                <Users size={14} /> Friends
            </Tab>
        </TabList>
      </Tabs>

      {/* Region Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Globe2 size={16} /> Region
        </label>
        <div className="bg-gray-100 dark:bg-slate-900/50 border-gray-300 dark:border-slate-700 rounded-lg p-3 text-center text-sm">
          Auto-Detect (Ping: 42ms) 🌍
        </div>
      </div>

      {/* This empty div is for spacing, to push the Impact Indicator to the bottom */}
      <div className="flex-grow"></div>

      {/* Impact Indicator stub */}
      <div className="flex items-center gap-4 p-2 bg-slate-100 dark:bg-slate-900/70 rounded-lg border border-slate-200 dark:border-transparent">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">N</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Rank</span>
            <span className="text-green-400">↑+25</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets size={16} className="text-red-400" />
            <span className="text-slate-500 dark:text-slate-400">XP</span>
            <span className="text-red-400">↓-10</span>
          </div>
      </div>
    </motion.div>
  );
};

export default GameSetup; 