"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, PartyPopper } from 'lucide-react';

const SocialChat = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col text-gray-900 dark:text-white border dark:border-slate-700"
    >
      <Tabs defaultValue="party" className="w-full flex flex-col h-full">
        <TabList className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700">
          <Tab id="friends" className={({isSelected}) => `flex items-center gap-1.5 py-2 px-1 cursor-pointer transition-colors border-b-2 ${isSelected ? 'border-purple-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
            <Users size={16} /> <span className="text-sm">Friends</span>
          </Tab>
          <Tab id="party" className={({isSelected}) => `flex items-center gap-1.5 py-2 px-1 cursor-pointer transition-colors border-b-2 ${isSelected ? 'border-purple-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
            <PartyPopper size={16} /> <span className="text-sm">Party</span>
          </Tab>
        </TabList>
        <TabPanel id="friends" className="flex-1 mt-2 overflow-y-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 outline-none">
            <div className="text-sm text-center text-slate-500 dark:text-slate-400 h-full flex items-center justify-center">Friends chat is not yet implemented.</div>
        </TabPanel>
        <TabPanel id="party" className="flex-1 mt-2 overflow-y-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 outline-none">
            <div className="text-sm space-y-2">
                <p><span className="font-bold text-purple-600 dark:text-purple-400">Player1: </span>Hey everyone! Ready to start?</p>
                <p><span className="font-bold text-blue-600 dark:text-blue-400">You: </span>Born ready. Let's do this!</p>
                <p><span className="font-bold text-yellow-600 dark:text-yellow-400">Player2: </span>Just a sec, choosing my difficulty.</p>
                <p><span className="font-bold text-green-600 dark:text-green-400">System: </span>Player3 has joined the party.</p>
            </div>
        </TabPanel>
        <div className="mt-2 flex gap-2">
            <Input placeholder="Type a message..." className="bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 focus:border-purple-500 rounded-lg" />
            <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg aspect-square">
                <Send size={18} />
            </Button>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default SocialChat; 