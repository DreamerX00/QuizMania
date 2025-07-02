"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Swords, Bell, Users, Settings } from 'lucide-react';
import ClanModal from '../components/ClanModal'; // Adjusted import path

const ClanModule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasJoinRequests = true; // dummy data

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-6 flex flex-col justify-between text-gray-900 dark:text-white border dark:border-slate-700"
      >
        <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Clan Hub</h2>
            
            {/* Clan Summary Widget */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                    <img src="https://api.dicebear.com/8.x/icons/svg?seed=wolf" alt="Clan Emblem" className="w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-800 p-2" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Celestial Wolves</h3>
                <p className="text-sm italic text-slate-500 dark:text-slate-400">"To the stars and beyond."</p>
                <div className="mt-2 text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1">
                    Your Role: Leader
                </div>
            </div>

            <div className="my-6 h-px bg-slate-700"></div>

             {/* Action Buttons */}
             <div className="space-y-3">
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center gap-2"
                >
                    <Users size={16} /> Open Clan Dashboard
                </Button>
                <Button 
                    variant="outline"
                    className="w-full text-slate-600 dark:text-slate-300 border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-2 relative"
                >
                    <Bell size={16} /> Join Requests
                    {hasJoinRequests && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#16192a]"></span>
                    )}
                </Button>
            </div>
        </div>

         <p className="text-xs text-center text-slate-500 mt-4">
            Clans are a premium feature. <a href="/premium" className="underline hover:text-purple-400">Upgrade now</a>.
         </p>
      </motion.div>

      <ClanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default ClanModule; 