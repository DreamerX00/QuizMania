import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinRoomFlow({
  onJoin,
}: {
  onJoin: (room: {
    id: string;
    name: string;
    maxPlayers: number;
    [key: string]: unknown;
  }) => void | Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setError("");
    if (code.length !== 6) {
      setError("Room code must be 6 characters.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join room");
      }

      const data = await response.json();
      const room = {
        id: data.room.id,
        name: data.room.name,
        title: data.room.name,
        code: data.room.code,
        host: "Host", // We'll get this from the members data
        players: [], // We'll get this from the members data
        maxPlayers: data.room.maxParticipants,
        type: data.room.type || "Public",
        quizTypes: [], // We'll get this from the room data
      };
      onJoin(room);
    } catch (error) {
      console.error("Failed to join room:", error);
      setError(error instanceof Error ? error.message : "Failed to join room");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      <h2 className="text-2xl font-bold text-blue-400 mb-2">Join Room</h2>
      <Input
        placeholder="Enter 6-character Room Code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={6}
        className="text-center text-xl tracking-widest bg-slate-900/60 border border-blue-500 text-white"
        disabled={loading}
      />
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white w-full text-lg"
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? "Joining..." : "Join"}
      </Button>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
