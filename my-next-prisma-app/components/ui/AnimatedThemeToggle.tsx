"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../src/context/ThemeContext';

export function AnimatedThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    setIsPressed(true);
    toggleTheme();
    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <motion.button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 group overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)" 
          : "0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)"
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          background: theme === 'dark' 
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
            : "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(239, 68, 68, 0.1))"
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Floating particles */}
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -10, y: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0, x: 10, y: 10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-1 left-1 w-1 h-1 bg-yellow-400 rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 10, y: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0, x: -10, y: 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-1 right-1 w-1 h-1 bg-blue-400 rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0, x: -10, y: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0, x: 10, y: -10 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="absolute bottom-1 left-1 w-1 h-1 bg-purple-400 rounded-full"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main icon container */}
      <div className="relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.5 
              }}
              className="relative"
            >
              <Sun className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
              {/* Sun rays animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0.5 h-2 bg-yellow-400 rounded-full" />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0.5 h-2 bg-yellow-400 rounded-full" />
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-0.5 bg-yellow-400 rounded-full" />
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-2 h-0.5 bg-yellow-400 rounded-full" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.5 
              }}
              className="relative"
            >
              <Moon className="w-5 h-5 text-blue-400 drop-shadow-lg" />
              {/* Stars animation */}
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-2 h-2 text-blue-300" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute -bottom-1 -left-1"
                    >
                      <Sparkles className="w-1.5 h-1.5 text-purple-300" />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ripple effect on click */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30"
          />
        )}
      </AnimatePresence>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{
          boxShadow: theme === 'dark'
            ? "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(147, 51, 234, 0.2)"
            : "0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(239, 68, 68, 0.2)"
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
} 