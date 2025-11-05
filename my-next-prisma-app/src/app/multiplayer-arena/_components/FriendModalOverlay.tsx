import React, { useState, useRef, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Star,
  MessageSquare,
  UserMinus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Bell,
  Pin,
  PinOff,
  X,
  Send,
  Gift,
  Heart,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Image from "next/image";
// import Lottie from 'lottie-react'; // For real Lottie gifts, if available
// import giftLottie from '@/assets/lottie/gift.json';

const statusColor = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  "in-match": "bg-yellow-400",
};
const statusPulse = {
  online: "animate-pulse-slow",
  offline: "",
  "in-match": "animate-pulse-fast",
};

const sortFriends = (friends) => {
  return [...friends].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const statusOrder = { online: 0, "in-match": 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
};

const FriendCard = ({
  friend,
  onPin,
  onRemove,
  onMessage,
  onInvite,
  onGift,
}: any) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`relative flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 mb-3 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
        isHover ? "ring-2 ring-purple-400/60" : ""
      }`}
    >
      {/* Holographic floating icon */}
      {isHover && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-4 right-8 z-10 pointer-events-none"
        >
          <SparkleIcon />
        </motion.div>
      )}

      <div className="flex items-center gap-3 z-10">
        <div className="relative">
          <span
            className={`absolute w-3 h-3 rounded-full ${
              statusColor[friend.status as keyof typeof statusColor]
            } ${statusPulse[friend.status as keyof typeof statusPulse]}`}
          ></span>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
            <Image
              src={friend.avatar}
              alt={friend.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base drop-shadow-sm">
            {friend.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {friend.status === "in-match"
              ? "In Battle"
              : friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}
          </span>
        </div>
        {friend.pinned && <Pin size={16} className="text-yellow-500 ml-2" />}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          className="text-blue-500 hover:bg-blue-500/10 p-2"
          title="Message"
          onClick={() => onMessage(friend)}
        >
          <MessageSquare size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-green-500 hover:bg-green-500/10 p-2"
          title="Invite"
          onClick={() => onInvite(friend)}
        >
          <UserPlus size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-pink-500 hover:bg-pink-500/10 p-2"
          title="Send Gift"
          onClick={() => onGift(friend)}
        >
          <Gift size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-yellow-500 hover:bg-yellow-500/10 p-2"
          title={friend.pinned ? "Unpin" : "Pin"}
          onClick={() => onPin(friend)}
        >
          {friend.pinned ? <PinOff size={16} /> : <Pin size={16} />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10 p-2"
          title="Remove"
          onClick={() => onRemove(friend)}
        >
          <UserMinus size={16} />
        </Button>
      </div>

      {/* Animated glowing border on hover */}
      {isHover && (
        <motion.div
          layoutId="glow"
          className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-purple-400/40 shadow-glow"
          style={{ boxShadow: "0 0 32px 8px #a855f788" }}
        />
      )}
    </motion.div>
  );
};

// Animated floating sparkles/holographic icon
const SparkleIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    className="animate-spin-slow"
  >
    <circle
      cx="16"
      cy="16"
      r="12"
      stroke="#a855f7"
      strokeWidth="2"
      opacity="0.4"
    />
    <circle
      cx="16"
      cy="16"
      r="6"
      stroke="#3b82f6"
      strokeWidth="2"
      opacity="0.7"
    />
    <circle cx="16" cy="16" r="2" fill="#ec4899" />
  </svg>
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const FriendModalOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("friends");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<any>(null);
  const [showRemove, setShowRemove] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [messageTarget, setMessageTarget] = useState<any>(null);
  const [showGift, setShowGift] = useState(false);
  const [giftTarget, setGiftTarget] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SWR hooks for friends and requests
  const {
    data: friendsData,
    error: friendsError,
    isLoading: friendsLoading,
    mutate: mutateFriends,
  } = useSWR(open ? "/api/friends" : null, fetcher);
  const {
    data: requestsData,
    error: requestsError,
    isLoading: requestsLoading,
    mutate: mutateRequests,
  } = useSWR(open ? "/api/friends/requests" : null, fetcher);
  const {
    data: searchData,
    error: searchError,
    isLoading: searchLoading,
    mutate: mutateSearch,
  } = useSWR(
    search.length >= 2 && tab === "add" && open
      ? `/api/friends/search?q=${encodeURIComponent(search)}`
      : null,
    fetcher
  );

  const playSound = (src: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    } else {
      audioRef.current.src = src;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    setIsClient(true);
    playSound("/game_arena/pin.mp3");
    playSound("/game_arena/remove.mp3");
    playSound("/game_arena/confirm.mp3");
    playSound("/game_arena/message.mp3");
    playSound("/game_arena/invite.mp3");
    playSound("/game_arena/gift.mp3");
    playSound("/game_arena/invite_sent.mp3");
    playSound("/game_arena/gift_sent.mp3");
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePin = (friend: any) => {
    mutateFriends((friends) =>
      friends.map((f) =>
        f.name === friend.name ? { ...f, pinned: !f.pinned } : f
      )
    );
    playSound("/game_arena/pin.mp3");
    toast.success(friend.pinned ? "Unpinned ally." : "Pinned ally!");
  };
  const handleRemove = (friend: any) => {
    setShowRemove(true);
    setRemoveTarget(friend);
    playSound("/game_arena/remove.mp3");
  };
  const confirmRemove = async () => {
    try {
      await mutateFriends((friends) =>
        friends.filter((f) => f.name !== removeTarget.name)
      );
      setShowRemove(false);
      setRemoveTarget(null);
      playSound("/game_arena/confirm.mp3");
      toast.success("Ally removed.");
    } catch (e) {
      toast.error("Failed to remove ally.");
    }
  };
  const handleMessage = (friend: any) => {
    setShowMessage(true);
    setMessageTarget(friend);
    playSound("/game_arena/message.mp3");
    toast("Opening chat...");
  };
  const handleInvite = (friend: any) => {
    setShowInvite(true);
    setInviteTarget(friend);
    playSound("/game_arena/invite.mp3");
    toast("Invite sent!");
  };
  const handleGift = (friend: any) => {
    setShowGift(true);
    setGiftTarget(friend);
    playSound("/game_arena/gift.mp3");
    toast("Gift sent!");
  };

  // Add handlers for add, remove, accept, decline
  const handleAddFriend = async (userId: string) => {
    try {
      await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: userId }),
      });
      mutateFriends();
      mutateRequests();
      mutateSearch();
      playSound("/game_arena/confirm.mp3");
      toast.success("Ally request sent!");
    } catch (e) {
      toast.error("Failed to send ally request.");
    }
  };
  const handleRemoveFriend = async (userId: string) => {
    try {
      await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: userId }),
      });
      mutateFriends();
      mutateRequests();
      playSound("/game_arena/confirm.mp3");
      toast.success("Ally removed.");
    } catch (e) {
      toast.error("Failed to remove ally.");
    }
  };
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      mutateFriends();
      mutateRequests();
      playSound("/game_arena/confirm.mp3");
      toast.success("Ally request accepted!");
    } catch (e) {
      toast.error("Failed to accept ally request.");
    }
  };
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await fetch("/api/friends/requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      mutateRequests();
      playSound("/game_arena/confirm.mp3");
      toast.success("Ally request declined.");
    } catch (e) {
      toast.error("Failed to decline ally request.");
    }
  };

  if (!isClient) return null;

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
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>

            {/* Header */}
            <div className="relative z-10 p-6 pb-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Allies Hub
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      Manage your battle companions and forge new alliances
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
            <div className="relative z-10 p-6 flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-1 mb-6">
                  <TabsTrigger
                    value="friends"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Allies
                  </TabsTrigger>
                  <TabsTrigger
                    value="requests"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Requests
                  </TabsTrigger>
                  <TabsTrigger
                    value="add"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Ally
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="space-y-4">
                  {friendsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Loading allies...
                        </p>
                      </div>
                    </div>
                  ) : friendsError ? (
                    <div className="flex items-center justify-center py-12 text-red-500">
                      <p>Failed to load allies.</p>
                    </div>
                  ) : friendsData?.friends?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                      <Users className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-lg font-semibold mb-2">
                        No Allies Yet
                      </p>
                      <p className="text-sm text-center">
                        Start building your alliance by adding new allies!
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {sortFriends(friendsData?.friends || []).map((friend) => (
                        <FriendCard
                          key={friend.id}
                          friend={friend}
                          onPin={handlePin}
                          onRemove={handleRemove}
                          onMessage={handleMessage}
                          onInvite={handleInvite}
                          onGift={handleGift}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                  {requestsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Loading requests...
                        </p>
                      </div>
                    </div>
                  ) : requestsError ? (
                    <div className="flex items-center justify-center py-12 text-red-500">
                      <p>Failed to load requests.</p>
                    </div>
                  ) : requestsData?.requests?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                      <Bell className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-lg font-semibold mb-2">
                        No Pending Requests
                      </p>
                      <p className="text-sm text-center">
                        All clear! No ally requests waiting.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requestsData?.requests?.map((request: any) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 shadow-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 overflow-hidden flex-shrink-0">
                              <Image
                                src={request.sender.avatar}
                                alt={request.sender.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-200">
                                {request.sender.name}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Wants to join your alliance
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineRequest(request.id)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="add" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search for allies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl"
                    />
                  </div>

                  {searchLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Searching...
                        </p>
                      </div>
                    </div>
                  ) : searchError ? (
                    <div className="flex items-center justify-center py-12 text-red-500">
                      <p>Failed to search.</p>
                    </div>
                  ) : searchData?.users?.length === 0 && search.length >= 2 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                      <Search className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-lg font-semibold mb-2">
                        No Results Found
                      </p>
                      <p className="text-sm text-center">
                        Try searching with a different name or username.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchData?.users?.map((user: any) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-600/50 shadow-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 overflow-hidden flex-shrink-0">
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-200">
                                {user.name}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddFriend(user.id)}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add Ally
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FriendModalOverlay;

// Custom CSS needed:
// .font-orbitron { font-family: 'Orbitron', sans-serif; }
// .shadow-glow { box-shadow: 0 0 32px 8px #60a5fa88, 0 0 48px 12px #a78bfa66; }
// .animate-title-glow { animation: title-glow 2s infinite alternate; }
// @keyframes title-glow { 0% { text-shadow: 0 0 8px #60a5fa, 0 0 16px #a78bfa; } 100% { text-shadow: 0 0 24px #f472b6, 0 0 32px #a78bfa; } }
// .animate-badge-pulse { animation: badge-pulse 1.2s infinite alternate; }
// @keyframes badge-pulse { 0% { box-shadow: 0 0 0 0 #f472b6; } 100% { box-shadow: 0 0 16px 8px #f472b6; } }
// .animate-float-bounce { animation: float-bounce 2s infinite alternate; }
// @keyframes float-bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
// .animate-glow-bar { animation: glow-bar 3s infinite alternate; }
// @keyframes glow-bar { 0% { opacity: 0.7; } 100% { opacity: 1; } }
// .animate-spin-slow { animation: spin 8s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }
// .animate-pulse-slow { animation: pulse-slow 2s infinite; } @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
// .animate-pulse-fast { animation: pulse-fast 1s infinite; } @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
