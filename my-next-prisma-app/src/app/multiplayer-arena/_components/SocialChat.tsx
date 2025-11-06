"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Users,
  PartyPopper,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SocialChat = ({
  friendId,
  roomId,
}: {
  friendId?: string;
  roomId?: string;
}) => {
  const [tab, setTab] = useState(friendId ? "friends" : "party");
  const [input, setInput] = useState("");
  const {
    data: friendsChatData,
    error: friendsChatError,
    isLoading: friendsChatLoading,
    mutate: mutateFriendsChat,
  } = useSWR(
    tab === "friends" && friendId
      ? `/api/social-chat/friends?friendId=${friendId}`
      : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const {
    data: partyChatData,
    error: partyChatError,
    isLoading: partyChatLoading,
    mutate: mutatePartyChat,
  } = useSWR(
    tab === "party" && roomId
      ? `/api/social-chat/party?roomId=${roomId}`
      : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      if (tab === "friends" && friendId) {
        await fetch("/api/social-chat/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId, message: input }),
        });
        mutateFriendsChat();
      } else if (tab === "party" && roomId) {
        await fetch("/api/social-chat/party", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, message: input }),
        });
        mutatePartyChat();
      }
      setInput("");
      toast.success("Message sent!");
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const chatMessages =
    tab === "friends" ? friendsChatData?.messages : partyChatData?.messages;
  const loading = tab === "friends" ? friendsChatLoading : partyChatLoading;
  const error = tab === "friends" ? friendsChatError : partyChatError;

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
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div className="relative">
          <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Communication Hub
        </h2>
      </div>

      <Tabs
        defaultSelectedKey={tab}
        className="w-full flex flex-col h-full relative z-10"
        onSelectionChange={(key) => setTab(key as string)}
      >
        <TabList className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-1 backdrop-blur-sm mb-4">
          <Tab
            id="friends"
            className={({ isSelected }) =>
              `flex items-center gap-2 py-2 px-4 cursor-pointer transition-all duration-300 rounded-lg ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`
            }
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Allies</span>
          </Tab>
          <Tab
            id="party"
            className={({ isSelected }) =>
              `flex items-center gap-2 py-2 px-4 cursor-pointer transition-all duration-300 rounded-lg ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`
            }
          >
            <PartyPopper className="w-4 h-4" />
            <span className="text-sm font-medium">Squad</span>
          </Tab>
        </TabList>

        <TabPanel
          id="friends"
          className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 outline-none"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p className="text-sm">Failed to load chat.</p>
            </div>
          ) : chatMessages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs opacity-70">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatMessages?.map((msg: any) => (
                <motion.div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-700/80 rounded-xl border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {msg.senderId === friendId ? "F" : "Y"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        {msg.senderId === friendId ? "Ally" : "You"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {msg.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel
          id="party"
          className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 outline-none"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p className="text-sm">Failed to load chat.</p>
            </div>
          ) : chatMessages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <PartyPopper className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No squad messages</p>
              <p className="text-xs opacity-70">Coordinate with your team!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatMessages?.map((msg: any) => (
                <motion.div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 bg-white/80 dark:bg-slate-700/80 rounded-xl border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {msg.senderId === roomId ? "S" : "Y"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                        {msg.senderId === roomId ? "Squad" : "You"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {msg.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabPanel>

        {/* Message Input */}
        <div className="mt-4 flex gap-3">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-white/80 dark:bg-slate-800/80 border-slate-300/50 dark:border-slate-600/50 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl backdrop-blur-sm shadow-sm"
          />
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl aspect-square shadow-lg"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default SocialChat;
