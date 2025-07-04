"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Globe } from 'lucide-react';
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
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col text-gray-900 dark:text-white border dark:border-slate-700"
    >
      <h2 className="flex items-center gap-2 text-slate-800 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 pb-2">
        <Globe size={16} /> Public Chat
      </h2>
      <div className="flex-1 mt-2 overflow-y-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 outline-none">
        {isLoading ? <div className="text-slate-400">Loading chat...</div> : error ? <div className="text-red-500">Failed to load chat.</div> : data?.messages?.length === 0 ? <div className="text-slate-400">No messages yet.</div> : data?.messages?.map((msg: any) => (
          <div key={msg.id} className="text-sm mb-1"><span className="font-bold text-purple-600 dark:text-purple-400">{msg.sender?.username || 'User'}:</span> {msg.message}</div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} className="bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 focus:border-purple-500 rounded-lg" />
        <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg aspect-square" onClick={handleSend} disabled={isLoading}>
          <Send size={18} />
        </Button>
      </div>
    </motion.div>
  );
};

export default PublicChat; 