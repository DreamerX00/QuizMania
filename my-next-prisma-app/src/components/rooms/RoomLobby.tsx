import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomAvatarGrid from './RoomAvatarGrid';
import RoomInfoPanel from './RoomInfoPanel';
import RoomHostControls from './RoomHostControls';
import { MessageCircle, Trophy, Users, Mic, MicOff, UserMinus, Crown, Gamepad2 } from 'lucide-react';
import useSWR from 'swr';

const playSound = (src: string) => {
  const a = new Audio(src);
  a.currentTime = 0;
  a.play();
};

function ParticleBurst({ x, y, keyId }: { x: number; y: number; keyId: string }) {
  // Simple burst of 8 particles
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 2 }}
      transition={{ duration: 0.8 }}
      style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: ['#60a5fa', '#a78bfa', '#f472b6', '#22c55e'][i % 4],
            left: 0,
            top: 0,
            transform: `rotate(${i * 45}deg) translate(0, -24px)`
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.5 }}
          transition={{ duration: 0.8 }}
        />
      ))}
    </motion.div>
  );
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function RoomLobby({ room, members, currentUser }: { room: any, members: any[], currentUser: any }) {
  const isHost = members.find((m: any) => m.role === 'HOST' && m.userId === currentUser.userId);
  const [chatInput, setChatInput] = useState('');
  const { data: chatData, error: chatError, isLoading: chatLoading, mutate: mutateChat } = useSWR(room ? `/api/rooms/chat?roomId=${room.id}` : null, fetcher);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Chat send handler
  const handleSend = async () => {
    if (!chatInput.trim()) return;
    await fetch('/api/rooms/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id, message: chatInput }),
    });
    setChatInput('');
    mutateChat();
  };

  // Invite handler (real API call can be added)
  const handleInvite = () => {
    // TODO: Implement invite logic
  };

  // Start match handler (real API call can be added)
  const handleStartMatch = () => {
    // TODO: Implement start match logic
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-screen relative">
      {/* Left: Player Grid */}
      <section className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#181a2a]/80 to-[#23234d]/90 p-0 md:p-8 relative">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-400 flex items-center gap-2 mb-6 tracking-widest uppercase drop-shadow-glow">
            Lobby
          </h2>
          <RoomAvatarGrid players={members.map(m => ({ ...m.user, role: m.role }))} host={members.find(m => m.role === 'HOST')?.user.name} teamMode={room.type === 'Squad' || room.type === 'Custom'} user={currentUser} />
        </div>
      </section>
      {/* Right: Info/Controls/Chat */}
      <aside className="flex flex-col gap-6 max-w-[420px] w-full min-w-[320px] bg-gradient-to-br from-[#23234d]/90 to-[#181a2a]/80 p-0 md:p-8 border-l-2 border-blue-500/20 shadow-xl relative overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-[#23234d]/95 to-transparent rounded-t-2xl pb-2 mb-2 flex flex-col gap-2 border-b border-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-purple-300 drop-shadow-glow tracking-wide">{room.title}</span>
            <span className="ml-auto flex items-center gap-2 text-blue-400 font-mono text-lg">
              {members.length}/{room.maxPlayers}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-sm flex-wrap">
            <span className="flex items-center gap-1"><span className="font-semibold text-white">Host:</span> {members.find(m => m.role === 'HOST')?.user.name}</span>
            <span className="flex items-center gap-1"><span className="font-semibold text-white">Type:</span> {room.type}</span>
            <span className="flex items-center gap-1"><span className="font-semibold text-white">Quiz:</span> {room.quizTypes && room.quizTypes.length > 0 ? room.quizTypes.join(', ') : '—'}</span>
          </div>
        </div>
        <RoomInfoPanel room={room} isHost={!!isHost} />
        {isHost && <RoomHostControls room={room} onInvite={handleInvite} onStartMatch={handleStartMatch} />}
        {/* Chat Box (desktop) */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-900/60 rounded-xl p-4 text-slate-300 min-h-[120px] shadow-lg mt-2">
          <div className="flex-1 overflow-y-auto space-y-2">
            {chatLoading ? <div className="text-slate-400">Loading chat...</div> : chatError ? <div className="text-red-500">Error loading chat.</div> : chatData?.messages?.length === 0 ? <div className="text-slate-400">No messages yet.</div> : chatData?.messages?.map((msg: any, i: number) => (
              <div key={msg.id} className="bg-slate-800/80 rounded-lg px-3 py-2 text-white w-fit flex items-center gap-2 animate-fade-in">
                <span className="font-bold text-blue-400">{msg.user.name}:</span> {msg.message}
              </div>
              ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 bg-slate-800/80 rounded-lg px-3 py-2 text-white border border-slate-700"
              placeholder="Type a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg" onClick={handleSend}>Send</button>
          </div>
        </div>
        {/* Footer (host only, sticky) */}
        {isHost && (
          <div className="sticky bottom-0 left-0 w-full bg-gradient-to-t from-blue-900/80 to-transparent p-4 flex items-center justify-end rounded-b-2xl border-t border-blue-500/10 mt-4">
            <button
              className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center gap-2
                ${members.length >= 2 ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse-glow' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
              disabled={members.length < 2}
              title={members.length < 2 ? 'At least 2 players required to start' : 'Start Match'}
            >
              Start Match
            </button>
          </div>
        )}
      </aside>
      {/* Floating Chat Drawer for Mobile */}
      <>
        <button
          className="fixed bottom-6 right-6 z-50 md:hidden bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all"
          onClick={() => setMobileChatOpen(true)}
        >
          <MessageCircle size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-bounce">{unreadCount}</span>
          )}
        </button>
        {mobileChatOpen && (
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#23234d]/95 to-[#0f1021]/95 backdrop-blur-lg p-0 md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-blue-500/20 bg-[#16192a]/80">
              <span className="font-bold text-lg text-white">Room Chat</span>
              <button onClick={() => setMobileChatOpen(false)} className="text-white text-2xl px-2">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Chat content placeholder */}
              <div className="text-center text-slate-400">Chat goes here...</div>
            </div>
            <div className="p-4 border-t border-blue-500/20 bg-[#16192a]/80 flex gap-2">
              <input className="flex-1 bg-slate-800/80 rounded-lg px-3 py-2 text-white border border-slate-700" placeholder="Type a message..." />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Send</button>
            </div>
          </motion.div>
        )}
      </>
    </div>
  );
} 