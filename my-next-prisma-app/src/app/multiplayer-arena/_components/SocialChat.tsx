"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SocialChat = ({ friendId, roomId }: { friendId?: string; roomId?: string }) => {
  const [tab, setTab] = useState(friendId ? 'friends' : 'party');
  const [input, setInput] = useState('');
  const {
    data: friendsChatData,
    error: friendsChatError,
    isLoading: friendsChatLoading,
    mutate: mutateFriendsChat
  } = useSWR(tab === 'friends' && friendId ? `/api/social-chat/friends?friendId=${friendId}` : null, fetcher, { refreshInterval: 5000 });
  const {
    data: partyChatData,
    error: partyChatError,
    isLoading: partyChatLoading,
    mutate: mutatePartyChat
  } = useSWR(tab === 'party' && roomId ? `/api/social-chat/party?roomId=${roomId}` : null, fetcher, { refreshInterval: 5000 });

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      if (tab === 'friends' && friendId) {
        await fetch('/api/social-chat/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friendId, message: input }),
        });
        mutateFriendsChat();
      } else if (tab === 'party' && roomId) {
        await fetch('/api/social-chat/party', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, message: input }),
        });
        mutatePartyChat();
      }
      setInput('');
      toast.success('Message sent!');
    } catch {
      toast.error('Failed to send message.');
    }
  };

  const chatMessages = tab === 'friends' ? friendsChatData?.messages : partyChatData?.messages;
  const loading = tab === 'friends' ? friendsChatLoading : partyChatLoading;
  const error = tab === 'friends' ? friendsChatError : partyChatError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-slate-50 dark:bg-[#16192a] rounded-2xl p-4 flex flex-col text-gray-900 dark:text-white border dark:border-slate-700"
    >
      <Tabs defaultValue={tab} className="w-full flex flex-col h-full" onSelectionChange={setTab}>
        <TabList className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700">
          <Tab id="friends" className={({isSelected}) => `flex items-center gap-1.5 py-2 px-1 cursor-pointer transition-colors border-b-2 ${isSelected ? 'border-purple-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}> <Users size={16} /> <span className="text-sm">Friends</span> </Tab>
          <Tab id="party" className={({isSelected}) => `flex items-center gap-1.5 py-2 px-1 cursor-pointer transition-colors border-b-2 ${isSelected ? 'border-purple-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}> <PartyPopper size={16} /> <span className="text-sm">Party</span> </Tab>
        </TabList>
        <TabPanel id="friends" className="flex-1 mt-2 overflow-y-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 outline-none">
          {loading ? <div className="text-slate-400">Loading chat...</div> : error ? <div className="text-red-500">Failed to load chat.</div> : chatMessages?.length === 0 ? <div className="text-slate-400">No messages yet.</div> : chatMessages?.map((msg: any) => (
            <div key={msg.id} className="text-sm mb-1"><span className="font-bold text-purple-600 dark:text-purple-400">{msg.senderId === friendId ? 'Friend' : 'You'}:</span> {msg.message}</div>
          ))}
        </TabPanel>
        <TabPanel id="party" className="flex-1 mt-2 overflow-y-auto p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 outline-none">
          {loading ? <div className="text-slate-400">Loading chat...</div> : error ? <div className="text-red-500">Failed to load chat.</div> : chatMessages?.length === 0 ? <div className="text-slate-400">No messages yet.</div> : chatMessages?.map((msg: any) => (
            <div key={msg.id} className="text-sm mb-1"><span className="font-bold text-blue-600 dark:text-blue-400">{msg.senderId === roomId ? 'Party' : 'You'}:</span> {msg.message}</div>
          ))}
        </TabPanel>
        <div className="mt-2 flex gap-2">
          <Input placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} className="bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 focus:border-purple-500 rounded-lg" />
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-lg aspect-square" onClick={handleSend} disabled={loading}>
            <Send size={18} />
          </Button>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default SocialChat; 