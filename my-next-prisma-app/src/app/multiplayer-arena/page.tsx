"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket";
import {
  useCurrentRoom,
  useParticipants,
  useGame,
  useVoice,
  useUI,
  useMultiplayerActions,
} from "@/store/multiplayer";
import GameSetup from "./_components/GameSetup";
import Lobby from "./_components/Lobby";
import SocialChat from "./_components/SocialChat";
import PublicChat from "./_components/PublicChat";
import VotingSystem from "./_components/VotingSystem";
import FriendModalOverlay from "./_components/FriendModalOverlay";
import RankPanelOverlay from "./_components/RankPanelOverlay";
import ClanHubOverlay from "./_components/ClanHubOverlay";
import RoomModalOverlay from "./_components/RoomModalOverlay";
import VoiceChat from "@/components/voice/VoiceChat";
import { AnimatePresence, motion } from "framer-motion";
import { User, Users, Shield, Home, DoorOpen, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingDock } from "@/components/ui/floating-dock";

export default function MultiplayerArenaPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { isConnected } = useSocket();

  // Multiplayer store state
  const currentRoom = useCurrentRoom();
  const participants = useParticipants();
  const game = useGame();
  const voice = useVoice();
  const ui = useUI();
  const actions = useMultiplayerActions();

  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (userId && !isConnected) {
      const initializeConnection = async () => {
        try {
          actions.connect(userId);
        } catch (error) {
          console.error("Failed to initialize connection:", error);
        }
      };
      initializeConnection();
    }

    return () => {
      if (isConnected) {
        actions.disconnect();
      }
    };
  }, [userId, isConnected, actions]);

  // Auto-join room if specified in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room");
    if (roomId && isConnected && !currentRoom) {
      actions.joinRoom(roomId, "public");
    }
  }, [isConnected, currentRoom, actions]);

  // Persist dock state in localStorage
  useEffect(() => {
    if (activePanel) {
      localStorage.setItem("arenaDockPanel", activePanel);
    } else {
      localStorage.removeItem("arenaDockPanel");
    }
  }, [activePanel]);

  useEffect(() => {
    const lastPanel = localStorage.getItem("arenaDockPanel");
    if (lastPanel) setActivePanel(lastPanel);
  }, []);

  const handleVoiceButtonClick = () => {
    actions.toggleVoiceChat();
  };

  // Dock items
  const dockItems = [
    {
      title: "Friends",
      icon: <Users className="w-7 h-7" />,
      onClick: () =>
        setActivePanel(activePanel === "friends" ? null : "friends"),
    },
    {
      title: "Room",
      icon: <DoorOpen className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === "room" ? null : "room"),
    },
    {
      title: "Voice",
      icon: ui.showVoiceChat ? (
        <Phone className="w-7 h-7 text-purple-400" />
      ) : voice.isConnected ? (
        <Phone className="w-7 h-7" />
      ) : (
        <Phone className="w-7 h-7 opacity-50" />
      ),
      onClick: handleVoiceButtonClick,
    },
    {
      title: "Home",
      icon: <Home className="w-7 h-7" />,
      onClick: () => setActivePanel(null),
    },
    {
      title: "Rank",
      icon: <User className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === "rank" ? null : "rank"),
    },
    {
      title: "Clan",
      icon: <Shield className="w-7 h-7" />,
      onClick: () => setActivePanel(activePanel === "clan" ? null : "clan"),
    },
  ];

  return (
    <main className="min-h-screen w-screen overflow-x-hidden pt-16 bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-[#0a0a0f] dark:via-[#1a1a2e] dark:to-[#16213e] text-gray-900 dark:text-white relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-linear-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-linear-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Overlays */}
      <FriendModalOverlay
        open={activePanel === "friends"}
        onClose={() => setActivePanel(null)}
      />
      <RankPanelOverlay
        open={activePanel === "rank"}
        onClose={() => setActivePanel(null)}
      />
      <ClanHubOverlay
        open={activePanel === "clan"}
        onClose={() => setActivePanel(null)}
      />
      <RoomModalOverlay
        open={activePanel === "room"}
        onClose={() => setActivePanel(null)}
      />

      {/* Voice Chat Panel */}
      <AnimatePresence>
        {ui.showVoiceChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-20 sm:top-24 right-2 sm:right-6 z-30 w-72 sm:w-80 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl"
          >
            {currentRoom ? (
              <VoiceChat
                roomId={currentRoom.id}
                onClose={() => actions.toggleVoiceChat()}
              />
            ) : (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                      Voice Chat
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => actions.toggleVoiceChat()}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <div className="text-center py-6 sm:py-8">
                  <Phone className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-3 sm:mb-4">
                    Join a room to start voice chat
                  </p>
                  <Button
                    onClick={() => actions.toggleVoiceChat()}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
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
            className="w-full h-full pt-4 sm:pt-6 pb-20 sm:pb-24 px-2 sm:px-4 md:px-6"
          >
            <div className="w-[90vw] max-w-[1600px] mx-auto h-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 h-full">
                {/* Left Column - Game Setup */}
                <div className="lg:col-span-3 xl:col-span-3 h-full">
                  <GameSetup />
                </div>

                {/* Center Column - Battle Arena */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-3 sm:gap-4 lg:gap-6 h-full">
                  <div className="flex-1 min-h-0">
                    <Lobby
                      participants={participants}
                      currentRoom={currentRoom}
                      gameState={game.phase}
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <VotingSystem roomId={currentRoom?.id || ""} />
                  </div>
                </div>

                {/* Right Column - Communication Hub */}
                <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-3 sm:gap-4 lg:gap-6 h-full">
                  <div className="flex-1 min-h-0">
                    <SocialChat roomId={currentRoom?.id} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <PublicChat />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Animated Floating Dock (bottom center, always visible) */}
      <FloatingDock
        items={dockItems.map((item) => ({
          title: item.title,
          icon: item.icon,
          href: "#",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            item.onClick();
          },
        }))}
        desktopClassName="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        mobileClassName="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      />
    </main>
  );
}
