import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Link, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Dummy data
const friends = [
    { name: 'Cortex', status: 'Online', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Cortex' },
    { name: 'Zenith', status: 'In a match', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Zenith' },
    { name: 'Echo', status: 'Offline', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Echo' },
];

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteModal = ({ isOpen, onClose }: InviteModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-black/50 backdrop-blur-xl border-slate-700 text-white p-0">
            <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <UserPlus size={24} /> Invite Players
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                    Invite friends from your list or share an invite link.
                </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-6">
                <div className="relative mb-4">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Search friends..." className="pl-9 bg-slate-800 border-slate-700" />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {friends.map(friend => (
                        <div key={friend.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={friend.avatar} />
                                    <AvatarFallback>{friend.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{friend.name}</p>
                                    <p className={`text-xs ${friend.status === 'Online' ? 'text-green-400' : 'text-slate-500'}`}>{friend.status}</p>
                                </div>
                            </div>
                            <Button size="sm" disabled={friend.status !== 'Online'}>Invite</Button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
                    <Input readOnly value="https://quizmania.gg/invite/aG4fS9x" className="bg-slate-900 border-slate-700" />
                    <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-800">
                        <Link size={16} />
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default InviteModal; 