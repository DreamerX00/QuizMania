import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  MessageSquare,
  Users,
  Settings,
  Swords,
  Crown,
  UserPlus,
  Bell,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRankByXP } from "@/utils/rank";
import useSWR from "swr";
import Image from "next/image";

// Dummy data
const clanData = {
  name: "Celestial Wolves",
  motto: '"To the stars and beyond."',
  emblem: "https://api.dicebear.com/8.x/icons/svg?seed=wolf",
};

const members = [
  {
    name: "QuantumLeap",
    role: "Leader",
    avatar: "https://api.dicebear.com/8.x/lorelei/svg?seed=QuantumLeap",
    isMVP: true,
  },
  {
    name: "Nova",
    role: "Elder",
    avatar: "https://api.dicebear.com/8.x/lorelei/svg?seed=Nova",
  },
  {
    name: "Glitch",
    role: "Member",
    avatar: "https://api.dicebear.com/8.x/lorelei/svg?seed=Glitch",
  },
  {
    name: "Raptor",
    role: "Member",
    avatar: "https://api.dicebear.com/8.x/lorelei/svg?seed=Raptor",
  },
];

const joinRequests = [
  { name: "Cypher", rank: getRankByXP(30000).current.name },
  { name: "Echo", rank: "Platinum V" },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  clan: any;
}

const MemberCard = ({ member }: { member: (typeof members)[0] }) => (
  <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={member.avatar} />
        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">
          {member.name}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {member.role}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {member.role === "Leader" && (
        <Crown size={18} className="text-yellow-500 dark:text-yellow-400" />
      )}
      {member.isMVP && (
        <Swords size={18} className="text-purple-600 dark:text-purple-400" />
      )}
      <Button size="sm" variant="ghost">
        ...
      </Button>
    </div>
  </div>
);

const ClanModal = ({ isOpen, onClose, clan }: ClanModalProps) => {
  const {
    data: membersData,
    error: membersError,
    isLoading: membersLoading,
  } = useSWR(clan ? `/api/clans/members?clanId=${clan.id}` : null, fetcher);
  const {
    data: requestsData,
    error: requestsError,
    isLoading: requestsLoading,
  } = useSWR(
    clan ? `/api/clans/join-requests?clanId=${clan.id}` : null,
    fetcher
  );
  const {
    data: chatData,
    error: chatError,
    isLoading: chatLoading,
    mutate: mutateChat,
  } = useSWR(clan ? `/api/clans/chat?clanId=${clan.id}` : null, fetcher);
  const [chatInput, setChatInput] = useState("");
  if (!isOpen) return null;
  if (!clan)
    return (
      <div className="p-6 text-center text-slate-400">No clan selected.</div>
    );

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    await fetch("/api/clans/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clanId: clan.id, message: chatInput }),
    });
    setChatInput("");
    mutateChat();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-[70vw] h-[80vh] bg-white dark:bg-[#16192a] backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center gap-4 space-y-0">
          <div className="relative w-16 h-16 rounded-lg border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex-shrink-0">
            <Image
              src={clan.emblemUrl}
              alt="emblem"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {clan.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 italic">
              {clan.motto}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0">
              <TabsTrigger value="chat">
                <MessageSquare size={16} className="mr-2" />
                Clan Chat
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users size={16} className="mr-2" />
                Members ({membersData?.members?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings size={16} className="mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="chat" className="h-full flex flex-col">
                <div className="flex-1 space-y-4 p-2 bg-slate-100 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  {chatLoading ? (
                    <div className="text-slate-400">Loading chat...</div>
                  ) : chatError ? (
                    <div className="text-red-500">Error loading chat.</div>
                  ) : chatData?.messages?.length === 0 ? (
                    <div className="text-slate-400">No messages yet.</div>
                  ) : (
                    chatData?.messages?.map((msg: any) => (
                      <p
                        key={msg.id}
                        className="text-sm text-slate-600 dark:text-slate-400"
                      >
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {msg.user.name}:
                        </span>{" "}
                        {msg.message}
                      </p>
                    ))
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"
                  />
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleSendChat}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="members">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {membersLoading ? (
                    <div className="text-slate-400">Loading members...</div>
                  ) : membersError ? (
                    <div className="text-red-500">Error loading members.</div>
                  ) : (
                    membersData?.members?.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user.avatarUrl} />
                            <AvatarFallback>
                              {member.user.name?.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {member.user.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.role === "LEADER" && (
                            <Crown
                              size={18}
                              className="text-yellow-500 dark:text-yellow-400"
                            />
                          )}
                          {member.role === "ELDER" && (
                            <Swords
                              size={18}
                              className="text-purple-600 dark:text-purple-400"
                            />
                          )}
                          <Button size="sm" variant="ghost">
                            ...
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Bell size={18} /> Join Requests
                  </h3>
                  <div className="space-y-2">
                    {requestsLoading ? (
                      <div className="text-slate-400">Loading requests...</div>
                    ) : requestsError ? (
                      <div className="text-red-500">
                        Error loading requests.
                      </div>
                    ) : requestsData?.requests?.length === 0 ? (
                      <div className="text-slate-400">No join requests.</div>
                    ) : (
                      requestsData?.requests?.map((req: any) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {req.user.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Pending
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 dark:text-green-400 border-green-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-black"
                              onClick={async () => {
                                await fetch("/api/clans/join-requests", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    action: "accept",
                                    requestId: req.id,
                                  }),
                                });
                                location.reload();
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 dark:text-red-400 border-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-black"
                              onClick={async () => {
                                await fetch("/api/clans/join-requests", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    action: "decline",
                                    requestId: req.id,
                                  }),
                                });
                                location.reload();
                              }}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Clan Details
                    </h3>
                    <div className="space-y-2 mt-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Clan Name
                        </label>
                        <Input
                          defaultValue={clan.name}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Clan Motto
                        </label>
                        <Input
                          defaultValue={clan.motto}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <Button>Update Details</Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Danger Zone
                    </h3>
                    <Button variant="destructive" className="mt-2">
                      Disband Clan
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClanModal;

// Add a label prop to the Input component if it doesn't have one
declare module "@/components/ui/input" {
  interface InputProps {
    label?: string;
  }
}
