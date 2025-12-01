import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const quizTypes = [
  "MCQ",
  "True/False",
  "Match",
  "Essay",
  "Puzzle",
  "Audio",
  "Live Video",
];
const roomTypes = ["Public", "Friends Only", "Invite", "Private"];

export default function CreateRoomForm({
  onCreate,
}: {
  onCreate: (room: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [type, setType] = useState(roomTypes[0]);
  const [selectedQuizTypes, setSelectedQuizTypes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setError("");
    if (!title) {
      setError("Room title is required.");
      return;
    }
    if (maxPlayers < 2 || maxPlayers > 50) {
      setError("Max players must be between 2 and 50.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          maxPlayers,
          type,
          quizTypes: selectedQuizTypes,
          password: type === "Private" ? password : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create room");
      }

      const data = await response.json();
      const room = {
        id: data.room.id,
        title: data.room.name,
        code: data.room.code,
        host: "You",
        players: [
          {
            name: "You",
            avatar: "https://api.dicebear.com/8.x/lorelei/svg?seed=You",
            isHost: true,
            isSpeaking: false,
          },
        ],
        maxPlayers: data.room.maxParticipants,
        type: data.room.type || "Public",
        quizTypes: selectedQuizTypes,
        password: type === "Private" ? password : undefined,
      };
      onCreate(room);
    } catch (error) {
      console.error("Failed to create room:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create room"
      );
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col gap-4 w-full"
    >
      <h2 className="text-2xl font-bold text-green-400 mb-2">Create Room</h2>
      <Input
        placeholder="Room Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-slate-900/60 border border-green-500 text-white"
      />
      <div className="flex gap-2">
        <Input
          type="number"
          min={2}
          max={50}
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          className="w-24 bg-slate-900/60 border border-green-500 text-white"
        />
        <span className="text-white self-center">Max Players</span>
      </div>
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-slate-900/60 border border-green-500 text-white rounded-lg px-3 py-2"
        >
          {roomTypes.map((rt) => (
            <option key={rt}>{rt}</option>
          ))}
        </select>
      </div>
      {type === "Private" && (
        <Input
          placeholder="Password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-900/60 border border-green-500 text-white"
        />
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {quizTypes.map((qt) => (
          <Button
            key={qt}
            size="sm"
            variant={selectedQuizTypes.includes(qt) ? "default" : "outline"}
            className={
              selectedQuizTypes.includes(qt)
                ? "bg-purple-600 text-white"
                : "text-purple-400 border-purple-400"
            }
            onClick={() =>
              setSelectedQuizTypes((f) =>
                f.includes(qt) ? f.filter((x) => x !== qt) : [...f, qt]
              )
            }
          >
            {qt}
          </Button>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button
        className="bg-green-600 hover:bg-green-700 text-white w-full text-lg mt-2"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? "Creating..." : "Generate Room Link"}
      </Button>
    </motion.div>
  );
}
