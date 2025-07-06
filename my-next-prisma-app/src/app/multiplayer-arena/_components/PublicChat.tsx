"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Globe, MessageSquare, Users } from 'lucide-react';
import useSWR from 'swr';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const PublicChat = () => {
  const [input, setInput] = useState('');
  const { data, error, isLoading, mutate } = useSWR('/api/public-chat', fetcher, { refreshInterval: 5000 });

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await fetch('/api/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      setInput('');
      mutate();
      toast.success('Message sent!');
    } catch {
      toast.error('Failed to send message.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 rounded-3xl p-6 flex flex-col text-gray-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Global Arena
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {data?.onlineUsers || 0} Online
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Loading global chat...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <p className="text-sm">Failed to load chat.</p>
          </div>
        ) : data?.messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No global messages</p>
            <p className="text-xs opacity-70">Be the first to speak!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.messages?.map((msg: any) => (
              <motion.div 
                key={msg.id} 
                className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-700/80 rounded-xl border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(msg.sender?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {msg.sender?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{msg.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="relative z-10 flex gap-3">
        <Input 
          placeholder="Broadcast to the arena..." 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-white/80 dark:bg-slate-800/80 border-slate-300/50 dark:border-slate-600/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl backdrop-blur-sm shadow-sm" 
        />
        <Button 
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl aspect-square shadow-lg" 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PublicChat; 