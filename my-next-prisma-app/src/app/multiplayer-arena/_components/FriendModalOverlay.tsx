import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Star, MessageSquare, UserMinus, Users, Search, CheckCircle2, XCircle, UserCheck, UserX, Bell, Pin, PinOff, X, Send, Gift } from 'lucide-react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
// import Lottie from 'lottie-react'; // For real Lottie gifts, if available
// import giftLottie from '@/assets/lottie/gift.json';

const statusColor = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  'in-match': 'bg-yellow-400',
};
const statusPulse = {
  online: 'animate-pulse-slow',
  offline: '',
  'in-match': 'animate-pulse-fast',
};

const sortFriends = (friends) => {
  return [...friends].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const statusOrder = { online: 0, 'in-match': 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
};

const FriendCard = ({ friend, onPin, onRemove, onMessage, onInvite, onGift }: any) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ scale: 1.045, boxShadow: '0 8px 32px 0 #60a5fa33' }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`relative flex items-center justify-between p-3 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-2 shadow-xl transition-transform duration-200 overflow-hidden ${isHover ? 'ring-2 ring-blue-400/60' : ''}`}
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
        <span className={`w-3 h-3 rounded-full ${statusColor[friend.status as keyof typeof statusColor]} ${statusPulse[friend.status as keyof typeof statusPulse]}`}></span>
        <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 shadow-md" />
        <span className="font-semibold text-gray-900 dark:text-white text-lg drop-shadow-sm">{friend.name}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{friend.status === 'in-match' ? 'In Match' : friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}</span>
        {friend.pinned && <Pin size={16} className="text-yellow-400 ml-2" />}
      </div>
      <div className="flex items-center gap-2 z-10">
        <Button size="icon" variant="ghost" className="text-blue-500" title="Message" onClick={() => onMessage(friend)}><MessageSquare size={16} /></Button>
        <Button size="icon" variant="ghost" className="text-green-500" title="Invite" onClick={() => onInvite(friend)}><UserPlus size={16} /></Button>
        <Button size="icon" variant="ghost" className="text-pink-500" title="Send Gift" onClick={() => onGift(friend)}><Gift size={16} /></Button>
        <Button size="icon" variant="ghost" className="text-yellow-500" title={friend.pinned ? 'Unpin' : 'Pin'} onClick={() => onPin(friend)}>{friend.pinned ? <PinOff size={16} /> : <Pin size={16} />}</Button>
        <Button size="icon" variant="ghost" className="text-red-500" title="Remove" onClick={() => onRemove(friend)}><UserMinus size={16} /></Button>
      </div>
      {/* Animated glowing border on hover */}
      {isHover && <motion.div layoutId="glow" className="absolute inset-0 rounded-xl pointer-events-none border-2 border-blue-400/40 shadow-glow" style={{ boxShadow: '0 0 32px 8px #60a5fa88' }} />} 
    </motion.div>
  );
};

// Animated floating sparkles/holographic icon
const SparkleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="animate-spin-slow">
    <circle cx="16" cy="16" r="12" stroke="#60a5fa" strokeWidth="2" opacity="0.4" />
    <circle cx="16" cy="16" r="6" stroke="#a78bfa" strokeWidth="2" opacity="0.7" />
    <circle cx="16" cy="16" r="2" fill="#f472b6" />
  </svg>
);

const fetcher = (url: string) => fetch(url).then(res => res.json());

const FriendModalOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('friends');
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
  const { data: friendsData, error: friendsError, isLoading: friendsLoading, mutate: mutateFriends } = useSWR(open ? '/api/friends' : null, fetcher);
  const { data: requestsData, error: requestsError, isLoading: requestsLoading, mutate: mutateRequests } = useSWR(open ? '/api/friends/requests' : null, fetcher);
  const { data: searchData, error: searchError, isLoading: searchLoading, mutate: mutateSearch } = useSWR(search.length >= 2 && tab === 'add' && open ? `/api/friends/search?q=${encodeURIComponent(search)}` : null, fetcher);

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
    playSound('/game_arena/pin.mp3');
    playSound('/game_arena/remove.mp3');
    playSound('/game_arena/confirm.mp3');
    playSound('/game_arena/message.mp3');
    playSound('/game_arena/invite.mp3');
    playSound('/game_arena/gift.mp3');
    playSound('/game_arena/invite_sent.mp3');
    playSound('/game_arena/gift_sent.mp3');
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
    mutateFriends(friends => friends.map(f => f.name === friend.name ? { ...f, pinned: !f.pinned } : f));
    playSound('/game_arena/pin.mp3');
    toast.success(friend.pinned ? 'Unpinned friend.' : 'Pinned friend!');
  };
  const handleRemove = (friend: any) => {
    setShowRemove(true);
    setRemoveTarget(friend);
    playSound('/game_arena/remove.mp3');
  };
  const confirmRemove = async () => {
    try {
      await mutateFriends(friends => friends.filter(f => f.name !== removeTarget.name));
      setShowRemove(false);
      setRemoveTarget(null);
      playSound('/game_arena/confirm.mp3');
      toast.success('Friend removed.');
    } catch (e) {
      toast.error('Failed to remove friend.');
    }
  };
  const handleMessage = (friend: any) => {
    setShowMessage(true);
    setMessageTarget(friend);
    playSound('/game_arena/message.mp3');
    toast('Opening chat...');
  };
  const handleInvite = (friend: any) => {
    setShowInvite(true);
    setInviteTarget(friend);
    playSound('/game_arena/invite.mp3');
    toast('Invite sent!');
  };
  const handleGift = (friend: any) => {
    setShowGift(true);
    setGiftTarget(friend);
    playSound('/game_arena/gift.mp3');
    toast('Gift sent!');
  };

  // Add handlers for add, remove, accept, decline
  const handleAddFriend = async (userId: string) => {
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresseeId: userId }),
      });
      mutateFriends();
      mutateRequests();
      mutateSearch();
      playSound('/game_arena/confirm.mp3');
      toast.success('Friend request sent!');
    } catch (e) {
      toast.error('Failed to send friend request.');
    }
  };
  const handleRemoveFriend = async (userId: string) => {
    try {
      await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: userId }),
      });
      mutateFriends();
      mutateRequests();
      playSound('/game_arena/confirm.mp3');
      toast.success('Friend removed.');
    } catch (e) {
      toast.error('Failed to remove friend.');
    }
  };
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'accept' }),
      });
      mutateFriends();
      mutateRequests();
      playSound('/game_arena/confirm.mp3');
      toast.success('Friend request accepted!');
    } catch (e) {
      toast.error('Failed to accept request.');
    }
  };
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'decline' }),
      });
      mutateFriends();
      mutateRequests();
      playSound('/game_arena/confirm.mp3');
      toast('Request declined.');
    } catch (e) {
      toast.error('Failed to decline request.');
    }
  };

  const sortedFriends = sortFriends(friendsData?.friends || []);

  // Add error toasts for SWR errors
  useEffect(() => {
    if (friendsError) toast.error('Failed to load friends.');
    if (requestsError) toast.error('Failed to load friend requests.');
    if (searchError) toast.error('Failed to search users.');
  }, [friendsError, requestsError, searchError]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          {/* Animated SVG/Canvas/Particles background */}
          <AnimatedFriendModalBG />
          <div
            ref={modalRef}
            className="relative w-full max-w-3xl h-[80vh] bg-gradient-to-br from-[#23234d] to-[#0f1021] rounded-2xl shadow-2xl flex flex-col p-0 border-2 border-blue-500/60 neon-glass overflow-hidden"
          >
            {/* Glowing animated border */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-blue-400/40 shadow-glow"
              animate={{
                boxShadow: [
                  '0 0 32px 8px #60a5fa88',
                  '0 0 48px 12px #a78bfa66',
                  '0 0 32px 8px #60a5fa88',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'loop' }}
            />
            {/* Floating holographic icons/particles */}
            <FloatingParticles />
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between relative">
              <h2 className="text-3xl font-extrabold text-center flex-1 text-blue-200 drop-shadow font-orbitron tracking-widest select-none animate-title-glow">
                FRIENDS
              </h2>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Bell className="text-yellow-400 animate-float-bounce" />
                {requestsData?.incoming.length > 0 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-xs rounded-full px-3 py-1 shadow-lg animate-badge-pulse border-2 border-white"
                  >
                    +{requestsData.incoming.length}
                  </motion.span>
                )}
              </div>
              <button onClick={onClose} className="absolute top-4 right-4 text-xl font-bold text-blue-400 hover:text-white">×</button>
            </div>
            <Tabs defaultValue="friends" value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0 relative">
                <TabsTrigger value="friends" className="relative z-10"> <Users size={16} className="mr-2"/>My Friends</TabsTrigger>
                <TabsTrigger value="add" className="relative z-10"><UserPlus size={16} className="mr-2"/>Add Friend</TabsTrigger>
                {/* Animated tab indicator */}
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 shadow-lg"
                  style={{
                    width: tab === 'friends' ? '120px' : '110px',
                    x: tab === 'friends' ? 0 : 130,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </TabsList>
              <motion.div layout className="flex-1 overflow-y-auto p-6">
                <TabsContent value="friends">
                  {sortedFriends.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center h-full text-center text-blue-200"
                    >
                      <Users size={48} className="mb-4 animate-bounce" />
                      <span className="text-lg font-semibold">No friends yet!</span>
                      <span className="text-sm mt-2">Add friends to start your journey.</span>
                    </motion.div>
                  ) : (
                    <motion.div layout className="space-y-2">
                      {sortedFriends.map(friend => (
                        <FriendCard
                          key={friend.name}
                          friend={friend}
                          onPin={handlePin}
                          onRemove={handleRemove}
                          onMessage={handleMessage}
                          onInvite={handleInvite}
                          onGift={handleGift}
                        />
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
                <TabsContent value="add">
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      placeholder="Search users by name or alias..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"
                    />
                    <Button variant="outline"><Search size={16}/></Button>
                  </div>
                  {/* Placeholder for search results */}
                  <div className="space-y-2">
                    {searchData?.users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                          <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{user.status === 'online' ? 'Online' : user.status === 'in-match' ? 'In Match' : 'Offline'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="text-green-500" title="Add" onClick={() => handleAddFriend(user.id)}><UserCheck size={16} /></Button>
                          {requestsData?.incoming.includes(user.id) && (
                            <Button size="icon" variant="ghost" className="text-yellow-500" title="Accept" onClick={() => handleAcceptRequest(user.id)}><CheckCircle2 size={16} /></Button>
                          )}
                          {requestsData?.outgoing.includes(user.id) && (
                            <Button size="icon" variant="ghost" className="text-red-500" title="Decline" onClick={() => handleDeclineRequest(user.id)}><XCircle size={16} /></Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </motion.div>
            </Tabs>
            {/* Bottom glowing bar */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-2 rounded-full bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 blur-md opacity-80 animate-glow-bar"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'loop' }}
            />
            {/* Invite Modal */}
            <AnimatePresence>
              {showInvite && inviteTarget && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <div className="relative bg-white dark:bg-[#23234d] rounded-2xl shadow-2xl p-8 flex flex-col items-center border-2 border-blue-400">
                    <button onClick={() => setShowInvite(false)} className="absolute top-4 right-4 text-xl font-bold text-blue-400 hover:text-white">×</button>
                    <h3 className="text-xl font-bold mb-2 text-blue-400">Invite Friend</h3>
                    <img src={inviteTarget.avatar} alt={inviteTarget.name} className="w-16 h-16 rounded-full border-2 border-blue-400 mb-2" />
                    <span className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{inviteTarget.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-4">Send an invite to join your room or party!</span>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full text-lg" onClick={() => { setShowInvite(false); playSound('/game_arena/invite_sent.mp3'); }}>Send Invite</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Remove Confirmation Modal */}
            <AnimatePresence>
              {showRemove && removeTarget && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <div className="relative bg-white dark:bg-[#23234d] rounded-2xl shadow-2xl p-8 flex flex-col items-center border-2 border-red-400">
                    <button onClick={() => setShowRemove(false)} className="absolute top-4 right-4 text-xl font-bold text-red-400 hover:text-white">×</button>
                    <h3 className="text-xl font-bold mb-2 text-red-400">Remove Friend</h3>
                    <img src={removeTarget.avatar} alt={removeTarget.name} className="w-16 h-16 rounded-full border-2 border-red-400 mb-2" />
                    <span className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{removeTarget.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-4">Are you sure you want to remove this friend?</span>
                    <div className="flex gap-4 mt-2">
                      <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmRemove}>Remove</Button>
                      <Button variant="outline" onClick={() => setShowRemove(false)}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Message Modal (stub) */}
            <AnimatePresence>
              {showMessage && messageTarget && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <div className="relative bg-white dark:bg-[#23234d] rounded-2xl shadow-2xl p-8 flex flex-col items-center border-2 border-blue-400 w-96">
                    <button onClick={() => setShowMessage(false)} className="absolute top-4 right-4 text-xl font-bold text-blue-400 hover:text-white">×</button>
                    <h3 className="text-xl font-bold mb-2 text-blue-400">Message {messageTarget.name}</h3>
                    <div className="flex-1 w-full mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 text-slate-500 dark:text-slate-400 flex items-center justify-center">(Chat coming soon)</div>
                    <div className="flex gap-2 w-full">
                      <Input placeholder="Type a message..." className="bg-white dark:bg-slate-900/70 border-gray-300 dark:border-slate-700 focus:border-blue-500 rounded-lg flex-1" />
                      <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg aspect-square"><Send size={18} /></Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Gift Modal (stub) */}
            <AnimatePresence>
              {showGift && giftTarget && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <div className="relative bg-white dark:bg-[#23234d] rounded-2xl shadow-2xl p-8 flex flex-col items-center border-2 border-pink-400 w-96">
                    <button onClick={() => setShowGift(false)} className="absolute top-4 right-4 text-xl font-bold text-pink-400 hover:text-white">×</button>
                    <h3 className="text-xl font-bold mb-2 text-pink-400">Send Gift</h3>
                    <img src={giftTarget.avatar} alt={giftTarget.name} className="w-16 h-16 rounded-full border-2 border-pink-400 mb-2" />
                    <span className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{giftTarget.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-4">Send a special gift to your friend!</span>
                    {/* <Lottie animationData={giftLottie} loop style={{ width: 80, height: 80 }} /> */}
                    <Gift size={48} className="text-pink-400 animate-bounce mb-2" />
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white w-full text-lg" onClick={() => { setShowGift(false); playSound('/game_arena/gift_sent.mp3'); }}>Send Gift</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated background component (SVG, sparkles, etc.)
const AnimatedFriendModalBG = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'blur(2px)' }}>
    <defs>
      <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#23234d" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glow2" cx="80%" cy="20%" r="60%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#23234d" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glow3" cx="20%" cy="80%" r="60%">
        <stop offset="0%" stopColor="#f472b6" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#23234d" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="60%" cy="40%" r="320" fill="url(#glow1)" />
    <circle cx="80%" cy="20%" r="180" fill="url(#glow2)" />
    <circle cx="20%" cy="80%" r="180" fill="url(#glow3)" />
    {/* Add more animated sparkles/particles here if desired */}
  </svg>
);

// Floating animated particles/icons (optional, can be expanded)
const FloatingParticles = () => (
  <>
    <motion.div
      className="absolute left-10 top-10 w-6 h-6 z-0"
      animate={{ y: [0, 20, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <SparkleIcon />
    </motion.div>
    <motion.div
      className="absolute right-16 bottom-16 w-8 h-8 z-0"
      animate={{ y: [0, -30, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 6, repeat: Infinity }}
    >
      <SparkleIcon />
    </motion.div>
    <motion.div
      className="absolute left-1/2 top-1/3 w-4 h-4 z-0"
      animate={{ x: [0, 10, -10, 0], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      <SparkleIcon />
    </motion.div>
  </>
);

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
