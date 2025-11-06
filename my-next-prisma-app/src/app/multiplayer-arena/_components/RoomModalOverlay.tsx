import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DoorOpen,
  Sparkles,
  X,
  Target,
  Zap,
  Star,
  Users,
  Plus,
  ArrowLeft,
} from "lucide-react";
import JoinRoomFlow from "@/components/rooms/JoinRoomFlow";
import CreateRoomForm from "@/components/rooms/CreateRoomForm";
import RoomLobby from "@/components/rooms/RoomLobby";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RoomModalOverlay = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { userId } = useAuth();
  const [step, setStep] = useState<"choose" | "join" | "create" | "lobby">(
    "choose"
  );
  const [roomData, setRoomData] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const {
    data: myRoomsData,
    error: myRoomsError,
    isLoading: myRoomsLoading,
    mutate: mutateMyRooms,
  } = useSWR(open ? "/api/rooms?my=1" : null, fetcher);
  const {
    data: roomMembersData,
    error: roomMembersError,
    isLoading: roomMembersLoading,
    mutate: mutateRoomMembers,
  } = useSWR(roomId ? `/api/rooms/members?roomId=${roomId}` : null, fetcher);

  // Handlers for join/create
  const handleJoin = async (room: any) => {
    setRoomData(room);
    setRoomId(room.id);
    setStep("lobby");
    toast.success("Joined battle room!");
  };
  const handleCreate = async (room: any) => {
    setRoomData(room);
    setRoomId(room.id);
    setStep("lobby");
    toast.success("Battle room created!");
  };

  // Reset state on close
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("choose");
        setRoomData(null);
        setRoomId(null);
      }, 400);
    }
  }, [open]);

  if (myRoomsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading battle rooms...
          </p>
        </div>
      </div>
    );
  }
  if (myRoomsError) {
    toast.error("Failed to load rooms.");
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <Sparkles className="w-8 h-8 mx-auto mb-3" />
          <p>Error loading battle rooms.</p>
        </div>
      </div>
    );
  }

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10"></div>

            {/* Header */}
            <div className="relative z-10 p-6 pb-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <DoorOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Battle Rooms
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      Join or create custom battle arenas
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
            <div className="relative z-10 flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
              <AnimatePresence mode="wait">
                {step === "choose" && (
                  <motion.div
                    key="choose"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-8 w-full p-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        Choose Your Battle
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Join an existing arena or forge your own
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-2xl">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setStep("join")}
                      >
                        <Users className="w-6 h-6" />
                        Join Battle
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setStep("create")}
                      >
                        <Plus className="w-6 h-6" />
                        Create Arena
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {step === "join" && (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="ghost"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                        onClick={() => setStep("choose")}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Join Battle Room
                      </h3>
                      <div className="w-16"></div>
                    </div>
                    <JoinRoomFlow onJoin={handleJoin} />
                  </motion.div>
                )}

                {step === "create" && (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="ghost"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
                        onClick={() => setStep("choose")}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Battle Arena
                      </h3>
                      <div className="w-16"></div>
                    </div>
                    <CreateRoomForm onCreate={handleCreate} />
                  </motion.div>
                )}

                {step === "lobby" && roomData && (
                  <motion.div
                    key="lobby"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-stretch"
                  >
                    <RoomLobby
                      room={roomData}
                      members={roomMembersData?.members || []}
                      currentUser={{
                        userId: userId || "",
                        name: "User",
                        avatar: undefined,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomModalOverlay;
