"use client";
import React, { useEffect, useState } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { User, Users, Shield, Home, DoorOpen } from 'lucide-react';

export default function MultiplayerArenaPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null);

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

  // Dock items
  const dockItems = [
    {
      title: 'Friends',
      icon: <Users className="w-7 h-7" />, // or custom SVG
      onClick: () => setActivePanel(activePanel === 'friends' ? null : 'friends'),
    },
    {
      title: 'Room',
      icon: <DoorOpen className="w-7 h-7" />, // Room icon
      onClick: () => setActivePanel(activePanel === 'room' ? null : 'room'),
    },
    {
      title: 'Home',
      icon: <Home className="w-7 h-7" />, // Home icon always returns to main UI
      onClick: () => setActivePanel(null),
    },
    {
      title: 'Rank',
      icon: <User className="w-7 h-7" />, // or custom SVG
      onClick: () => setActivePanel(activePanel === 'rank' ? null : 'rank'),
    },
    {
      title: 'Clan',
      icon: <Shield className="w-7 h-7" />, // or custom SVG
      onClick: () => setActivePanel(activePanel === 'clan' ? null : 'clan'),
    },
  ];

  // Main UI fades out when a panel is open
  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#0f1021] dark:to-[#23234d] text-gray-900 dark:text-white p-4 pt-20 relative">
      {/* Overlays */}
      <FriendModalOverlay open={activePanel === 'friends'} onClose={() => setActivePanel(null)} />
      <RankPanelOverlay open={activePanel === 'rank'} onClose={() => setActivePanel(null)} />
      <ClanHubOverlay open={activePanel === 'clan'} onClose={() => setActivePanel(null)} />
      <RoomModalOverlay open={activePanel === 'room'} onClose={() => setActivePanel(null)} />

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
                <Lobby />
              </div>
              <div className="flex-1">
                <VotingSystem />
              </div>
            </div>
            {/* Right Column: Chat only (Rank/Clan moved to dock) */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full">
              <div className="flex-1">
                <SocialChat />
              </div>
              <div className="flex-1">
                <PublicChat />
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