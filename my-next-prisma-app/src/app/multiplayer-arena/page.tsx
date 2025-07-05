"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSocket } from '@/lib/socket';
import { useMultiplayerStore, useCurrentRoom, useParticipants, useChat, useVoting, useGame, useVoice, useUI, useMultiplayerActions } from '@/store/multiplayer';
import GameSetup from './_components/GameSetup';
import Lobby from './_components/Lobby';
import SocialChat from './_components/SocialChat';
import PublicChat from './_components/PublicChat';
import VotingSystem from './_components/VotingSystem';
import { FloatingDock } from '@/components/ui/floating-dock';
import FriendModalOverlay from './_components/FriendModalOverlay';
import RankPanelOverlay from './_components/RankPanelOverlay';
import ClanHubOverlay from './_components/ClanHubOverlay';
import RoomModalOverlay from './_components/RoomModalOverlay';
import VoiceChat from '@/components/voice/VoiceChat';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Users, Shield, Home, DoorOpen, Phone, Mic, MicOff, Zap, Crown, Xp, Coins, Gem, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MultiplayerArenaPage() {
  const { userId, getToken } = useAuth();
  const { connect, disconnect, isConnected } = useSocket();
  
  // Multiplayer store state
  const currentRoom = useCurrentRoom();
  const participants = useParticipants();
  const chat = useChat();
  const voting = useVoting();
  const game = useGame();
  const voice = useVoice();
  const ui = useUI();
  const actions = useMultiplayerActions();
  
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    rank: 'Bronze',
    xp: 1250,
    level: 15,
    coins: 500,
    gems: 25,
    winRate: 68.5,
    totalMatches: 156,
    currentStreak: 5
  });

  // Initialize socket connection
  useEffect(() => {
    if (userId && !isConnected) {
      const initializeConnection = async () => {
        try {
          const token = await getToken();
          actions.connect(userId, token || undefined);
        } catch (error) {
          console.error('Failed to initialize connection:', error);
        }
      };
      initializeConnection();
    }

    return () => {
      if (isConnected) {
        actions.disconnect();
      }
    };
  }, [userId, isConnected, actions, getToken]);

  // Auto-join room if specified in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId && isConnected && !currentRoom) {
      actions.joinRoom(roomId, 'public');
    }
  }, [isConnected, currentRoom, actions]);

  // Persist dock state in localStorage
  useEffect(() => {
    if (activePanel) {
      localStorage.setItem('arenaDockPanel', activePanel);
    } else {
      localStorage.removeItem('arenaDockPanel');
    }
  }, [activePanel]);
  
  useEffect(() => {
    const lastPanel = localStorage.getItem('arenaDockPanel');
    if (lastPanel) setActivePanel(lastPanel);
  }, []);

  const handleVoiceToggle = () => {
    if (currentRoom) {
      if (voice.isConnected) {
        actions.leaveVoice(currentRoom.id);
      } else {
        actions.joinVoice(currentRoom.id);
      }
    }
  };

  const handleMuteToggle = () => {
    actions.muteVoice(!voice.isMuted);
  };

  // Dock items
  const dockItems = [
    {
      title: 'Friends',
      icon: <Users className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === 'friends' ? null : 'friends'),
    },
    {
      title: 'Room',
      icon: <DoorOpen className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === 'room' ? null : 'room'),
    },
    {
      title: 'Voice',
      icon: voice.isConnected ? <Phone className="w-7 h-7" /> : <Phone className="w-7 h-7 opacity-50" />,
      onClick: () => {
        if (currentRoom) {
          handleVoiceToggle();
        }
      },
    },
    {
      title: 'Home',
      icon: <Home className="w-7 h-7" />,
      onClick: () => setActivePanel(null),
    },
    {
      title: 'Rank',
      icon: <User className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === 'rank' ? null : 'rank'),
    },
    {
      title: 'Clan',
      icon: <Shield className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === 'clan' ? null : 'clan'),
    },
  ];

  // Main UI fades out when a panel is open
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white p-4 pt-20 relative">
      {/* Header with Connection Status */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  QuizMania Arena
                </h1>
              </div>
              <Badge variant="outline" className={`${isConnected ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
              {currentRoom && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  {currentRoom.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Voice Controls */}
              {currentRoom && voice.isConnected && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={voice.isMuted ? "destructive" : "outline"}
                    onClick={handleMuteToggle}
                    className="w-8 h-8 p-0"
                  >
                    {voice.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              
              {/* User Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">{userStats.rank}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Xp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{userStats.xp}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{userStats.coins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gem className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{userStats.gems}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <FriendModalOverlay open={activePanel === 'friends'} onClose={() => setActivePanel(null)} />
      <RankPanelOverlay open={activePanel === 'rank'} onClose={() => setActivePanel(null)} />
      <ClanHubOverlay open={activePanel === 'clan'} onClose={() => setActivePanel(null)} />
      <RoomModalOverlay open={activePanel === 'room'} onClose={() => setActivePanel(null)} />

      {/* Voice Chat Panel */}
      <AnimatePresence>
        {ui.showVoiceChat && currentRoom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 right-4 z-30 w-80"
          >
            <VoiceChat roomId={currentRoom.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Arena UI (hidden when overlay is open) */}
      <AnimatePresence>
        {!activePanel && (
          <motion.section
            key="arena-main-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4"
            style={{ height: 'calc(100vh - 8rem)' }}
          >
            {/* Left Column */}
            <div className="lg:col-span-1 h-full">
              <GameSetup />
            </div>
            {/* Middle Column */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
              <div className="flex-1">
                <Lobby 
                  participants={participants}
                  currentRoom={currentRoom}
                  gameState={game.phase}
                />
              </div>
              <div className="flex-1">
                <VotingSystem 
                  gameState={game.phase}
                  voting={voting}
                  onVote={actions.castVote}
                />
              </div>
            </div>
            {/* Right Column: Chat only (Rank/Clan moved to dock) */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full">
              <div className="flex-1">
                <SocialChat 
                  messages={chat.messages}
                  onSendMessage={actions.sendMessage}
                />
              </div>
              <div className="flex-1">
                <PublicChat 
                  messages={chat.messages}
                  onSendMessage={actions.sendMessage}
                />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Dock (bottom center, always visible) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <FloatingDock
          items={dockItems.map(({ title, icon, onClick }) => ({
            title,
            icon: (
              <button
                type="button"
                aria-label={title}
                className="focus:outline-none"
                onClick={e => {
                  e.preventDefault();
                  onClick();
                }}
              >
                {icon}
              </button>
            ),
            href: '#',
          }))}
        />
      </div>
    </main>
  );
} 