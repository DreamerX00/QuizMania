import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClanPanelTabs from "./ClanPanelTabs";

const _MemberCard = ({ member }: { member: Record<string, unknown> }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10 border-2 border-slate-300 dark:border-slate-700">
        <AvatarImage src={member.avatar} />
        <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white font-semibold">
          {member.username?.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          {member.username}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {member.role}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {member.role === "Leader" && (
        <Crown size={18} className="text-yellow-500" />
      )}
      {member.isMVP && (
        <Swords size={18} className="text-purple-600 dark:text-purple-400" />
      )}
      <Button
        size="sm"
        variant="ghost"
        className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
      >
        ...
      </Button>
    </div>
  </motion.div>
);

const ClanHubOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-linear-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>

            {/* Header */}
            <div className="relative z-10 p-6 pb-4 bg-linear-to-r from-purple-600/10 to-blue-600/10 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Clan Hub
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      Forge alliances and dominate the arena together
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
              <ClanPanelTabs />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClanHubOverlay;
