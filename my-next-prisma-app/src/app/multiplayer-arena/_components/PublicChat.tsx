"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Globe } from 'lucide-react';

const PublicChat = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col text-gray-900 dark:text-white border dark:border-slate-700"
    >
        <h2 className="flex items-center gap-2 text-slate-800 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">
            <Globe size={16} /> Public Chat
        </h2>
        <div className="flex-1 mt-2 overflow-y-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 outline-none">
            <div className="text-sm text-center text-slate-500 dark:text-slate-400 h-full flex items-center justify-center">
                Public chat is not yet implemented. Join the main lobby to chat with everyone!
            </div>
        </div>
        <div className="mt-2 flex gap-2">
            <Input placeholder="Type a message..." className="bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 focus:border-purple-500 rounded-lg" disabled />
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg aspect-square" disabled>
                <Send size={18} />
            </Button>
        </div>
    </motion.div>
  );
};

export default PublicChat; 