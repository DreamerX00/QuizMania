"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Users,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface RoomInfo {
  id: string;
  name: string;
  code: string;
  type: string;
  maxParticipants: number;
  currentParticipants: number;
  isLocked: boolean;
  status: string;
}

interface Creator {
  id: string;
  name: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/rooms/invite-links/${params.token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid invite link");
        setLoading(false);
        return;
      }

      if (data.valid) {
        setRoomInfo(data.room);
        setCreator(data.creator);
        setExpiresAt(data.expiresAt);
      } else {
        setError("Invite link is not valid");
      }
    } catch (err) {
      console.error("Error validating invite:", err);
      setError("Failed to validate invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!session) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/invite/${params.token}`);
      router.push(`/api/auth/signin?callbackUrl=${returnUrl}`);
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/rooms/invite-links/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to join room");
        setJoining(false);
        return;
      }

      if (data.success) {
        toast.success(
          data.alreadyMember
            ? "You are already a member of this room"
            : "Successfully joined the room!"
        );
        // Redirect to multiplayer arena with room ID
        router.push(`/multiplayer-arena?room=${data.roomId}&autoJoin=true`);
      }
    } catch (err) {
      console.error("Error joining room:", err);
      toast.error("Failed to join room");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-300">Validating invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => router.push("/multiplayer-arena")}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Go to Arena
          </Button>
        </div>
      </div>
    );
  }

  if (!roomInfo) {
    return null;
  }

  const timeUntilExpiry = expiresAt
    ? Math.max(
        0,
        Math.floor(
          (new Date(expiresAt).getTime() - Date.now()) / 1000 / 60 / 60
        )
      )
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-lg w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            You&apos;ve been invited!
          </h1>
          <p className="text-slate-400">
            {creator?.name || "Someone"} invited you to join their room
          </p>
        </div>

        {/* Room Info Card */}
        <div className="bg-slate-900/50 rounded-xl p-6 mb-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {roomInfo.name}
            </h2>
            <p className="text-slate-400 text-sm">Room Code: {roomInfo.code}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-slate-500">Players</p>
                <p className="font-semibold">
                  {roomInfo.currentParticipants}/{roomInfo.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-500">Expires in</p>
                <p className="font-semibold">{timeUntilExpiry}h</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              {roomInfo.type}
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {roomInfo.status}
            </span>
            {roomInfo.isLocked && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm flex items-center gap-1">
                <Shield className="w-3 h-3" /> Protected
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {sessionStatus === "loading" ? (
            <Button disabled className="w-full">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </Button>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
            >
              {joining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Joining...
                </>
              ) : session ? (
                "Join Room"
              ) : (
                "Sign In to Join"
              )}
            </Button>
          )}

          <Button
            onClick={() => router.push("/multiplayer-arena")}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            View All Rooms
          </Button>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By joining, you agree to follow the room rules and community
          guidelines
        </p>
      </div>
    </div>
  );
}
