import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserMinus, Lock, Users, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Room {
  id: string;
  name: string;
  code: string;
  type: string;
  maxParticipants: number;
  quizTypes: string[];
  quizType?: string;
  isLocked?: boolean;
  status?: string;
  startedAt?: Date;
  password?: string;
}

interface RoomHostControlsProps {
  room: Room;
  onInvite?: () => void;
  onStartMatch?: () => void;
  onKickPlayer?: (playerId: string) => void;
  onLockRoom?: (locked: boolean) => void;
  onSetQuizType?: (quizType: string) => void;
}

export default function RoomHostControls({
  room,
  onInvite,
  onStartMatch,
  onKickPlayer: _onKickPlayer,
  onLockRoom,
  onSetQuizType,
}: RoomHostControlsProps) {
  const [isLocked, setIsLocked] = useState(room.isLocked || false);
  const [selectedQuizType, _setSelectedQuizType] = useState(
    room.quizType || "general"
  );

  // Validate room has required properties
  if (!room.id) {
    console.error("Room ID is required for host controls");
    return null;
  }

  const handleKick = async () => {
    // TODO: Show player selection modal
    toast("Kick player functionality - select a player to kick");
  };

  const handleInvite = () => {
    if (onInvite) {
      onInvite();
    } else {
      toast("Invite functionality - share room code or invite specific users");
    }
  };

  const handleLockRoom = async () => {
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);

    try {
      // API call to lock/unlock room
      const response = await fetch(`/api/rooms/${room.id}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: newLockedState }),
      });

      if (response.ok) {
        toast.success(newLockedState ? "Room locked" : "Room unlocked");
        if (onLockRoom) onLockRoom(newLockedState);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update room lock status");
        setIsLocked(!newLockedState); // Revert on error
      }
    } catch (error) {
      console.error("Error updating room lock:", error);
      toast.error("Failed to update room lock status");
      setIsLocked(!newLockedState); // Revert on error
    }
  };

  const handleSetQuizType = async () => {
    try {
      // API call to set quiz type
      const response = await fetch(`/api/rooms/${room.id}/quiz-type`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizType: selectedQuizType }),
      });

      if (response.ok) {
        toast.success(`Quiz type set to ${selectedQuizType}`);
        if (onSetQuizType) onSetQuizType(selectedQuizType);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to set quiz type");
      }
    } catch (error) {
      console.error("Error setting quiz type:", error);
      toast.error("Failed to set quiz type");
    }
  };

  const handleStartMatch = async () => {
    try {
      // API call to start match
      const response = await fetch(`/api/rooms/${room.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        await response.json();

        // ✅ Emit WebSocket event to notify all room members in real-time
        const { socketService } = await import("@/lib/socket");
        if (socketService.isConnected()) {
          socketService.startGame(
            room.id as string,
            String(room.quizType || "standard")
          );
        }

        toast.success("Match started!");
        if (onStartMatch) onStartMatch();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to start match");
      }
    } catch (error) {
      console.error("Error starting match:", error);
      toast.error("Failed to start match");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-linear-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-md rounded-2xl p-5 border border-yellow-500/40 shadow-xl shadow-yellow-500/10 mb-3 flex flex-col gap-3"
    >
      <div className="flex flex-col md:flex-row gap-3 flex-wrap">
        <Button
          onClick={handleKick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 min-w-[130px] bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-xl shadow-lg shadow-red-500/20 transition-all duration-300 hover:shadow-red-500/40 hover:scale-105"
        >
          <UserMinus size={18} />
          <span>Kick</span>
        </Button>

        <Button
          onClick={handleInvite}
          className="flex items-center justify-center gap-2 px-5 py-2.5 min-w-[130px] bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
        >
          <Users size={18} />
          <span>Invite</span>
        </Button>

        <Button
          onClick={handleLockRoom}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 min-w-[130px] font-medium rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
            isLocked
              ? "bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-600 shadow-green-500/20 hover:shadow-green-500/40"
              : "bg-linear-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/20 hover:shadow-slate-500/40"
          } text-white`}
        >
          <Lock size={18} />
          <span>{isLocked ? "Unlock" : "Lock"}</span>
        </Button>

        <Button
          onClick={handleSetQuizType}
          className="flex items-center justify-center gap-2 px-5 py-2.5 min-w-[130px] bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
        >
          <Sparkles size={18} />
          <span>Quiz Type</span>
        </Button>

        <Button
          onClick={handleStartMatch}
          className="flex items-center justify-center gap-2 px-5 py-2.5 min-w-[130px] bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:scale-105"
        >
          <Play size={18} />
          <span>Start Match</span>
        </Button>
      </div>
    </motion.div>
  );
}
