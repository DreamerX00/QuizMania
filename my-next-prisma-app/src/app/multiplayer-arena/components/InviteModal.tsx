import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Link, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useSWR from "swr";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const InviteModal = ({ isOpen, onClose, roomId }: InviteModalProps) => {
  const {
    data: friendsData,
    error: friendsError,
    isLoading: friendsLoading,
  } = useSWR(isOpen ? "/api/friends" : null, fetcher);
  const handleInvite = async (friendId: string) => {
    try {
      await fetch("/api/rooms/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, inviteeId: friendId, action: "send" }),
      });
      toast.success("Invite sent!");
    } catch {
      toast.error("Failed to send invite.");
    }
  };
  if (!isOpen) return null;
  if (friendsError) toast.error("Failed to load friends.");
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-[#16192a] backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus size={24} /> Invite Players
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Invite friends from your list or share an invite link.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search friends..."
              className="pl-9 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {friendsLoading ? (
              <div className="text-slate-400">Loading friends...</div>
            ) : friendsError ? (
              <div className="text-red-500">Error loading friends.</div>
            ) : friendsData?.friends?.length === 0 ? (
              <div className="text-slate-400">No friends found.</div>
            ) : (
              (
                friendsData?.friends as Array<{
                  userId: string;
                  name?: string;
                  [key: string]: unknown;
                }>
              )?.map((friend) => (
                <div
                  key={friend.userId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={String(friend.avatar)} />
                      <AvatarFallback>
                        {friend.name?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {String(friend.name)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {String(friend.status)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleInvite(friend.userId)}>
                    Invite
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Input
              readOnly
              value={`https://quizmania.gg/invite/${roomId}`}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"
            />
            <Button
              variant="outline"
              className="text-gray-900 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Link size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
