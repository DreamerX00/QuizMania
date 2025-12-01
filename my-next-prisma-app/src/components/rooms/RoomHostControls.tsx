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
      const response = await fetch(`/api/rooms/${room.id}/start-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
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
      className="bg-slate-900/70 rounded-xl p-4 border border-yellow-500 mb-2 flex flex-col gap-2"
    >
      <div className="flex flex-col md:flex-row gap-3 flex-wrap">
        <Button
          onClick={handleKick}
          className="flex items-center gap-1 px-4 py-2 min-w-[120px] bg-red-600 text-white hover:bg-red-700"
        >
          <UserMinus size={16} />
          Kick
        </Button>

        <Button
          onClick={handleInvite}
          className="flex items-center gap-1 px-4 py-2 min-w-[120px] bg-blue-600 text-white hover:bg-blue-700"
        >
          <Users size={16} />
          Invite
        </Button>

        <Button
          onClick={handleLockRoom}
          className={`flex items-center gap-1 px-4 py-2 min-w-[120px] ${
            isLocked
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-700 hover:bg-gray-800"
          } text-white`}
        >
          <Lock size={16} />
          {isLocked ? "Unlock" : "Lock"}
        </Button>

        <Button
          onClick={handleSetQuizType}
          className="flex items-center gap-1 px-4 py-2 min-w-[120px] bg-purple-600 text-white hover:bg-purple-700"
        >
          <Sparkles size={16} />
          Quiz Type
        </Button>

        <Button
          onClick={handleStartMatch}
          className="flex items-center gap-1 px-4 py-2 min-w-[120px] bg-green-600 text-white hover:bg-green-700"
        >
          <Play size={16} />
          Start Match
        </Button>
      </div>
    </motion.div>
  );
}
