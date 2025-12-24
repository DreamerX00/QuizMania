"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserMinus, AlertTriangle } from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface KickPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  player: Player | null;
  isLoading?: boolean;
}

export default function KickPlayerModal({
  isOpen,
  onClose,
  onConfirm,
  player,
  isLoading = false,
}: KickPlayerModalProps) {
  if (!player) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md mx-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-red-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-red-500/20">
                  <UserMinus className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Kick Player</h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-4">
              {/* Player info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-14 h-14 rounded-full ring-2 ring-red-500/50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-red-500/50">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-white">
                    {player.name}
                  </p>
                  <p className="text-sm text-white/60">
                    Will be removed from the room
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">
                    This action cannot be undone
                  </p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    The player will need to be invited again to rejoin the room.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-2 flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Kicking...</span>
                  </>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Kick Player</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
