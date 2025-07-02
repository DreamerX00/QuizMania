import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, MessageSquare, Users, Settings, Swords, Crown, UserPlus, Bell, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Dummy data
const clanData = {
    name: 'Celestial Wolves',
    motto: '"To the stars and beyond."',
    emblem: 'https://api.dicebear.com/8.x/icons/svg?seed=wolf',
};

const members = [
    { name: 'QuantumLeap', role: 'Leader', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=QuantumLeap', isMVP: true },
    { name: 'Nova', role: 'Elder', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Nova' },
    { name: 'Glitch', role: 'Member', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Glitch' },
    { name: 'Raptor', role: 'Member', avatar: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Raptor' },
];

const joinRequests = [
    { name: 'Cypher', rank: 'Gold II' },
    { name: 'Echo', rank: 'Platinum V' },
]

interface ClanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemberCard = ({ member }: { member: typeof members[0] }) => (
    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{member.role}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {member.role === 'Leader' && <Crown size={18} className="text-yellow-500 dark:text-yellow-400" />}
            {member.isMVP && <Swords size={18} className="text-purple-600 dark:text-purple-400" />}
            <Button size="sm" variant="ghost">...</Button>
        </div>
    </div>
);

const ClanModal = ({ isOpen, onClose }: ClanModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[70vw] h-[80vh] bg-white dark:bg-[#16192a] backdrop-blur-xl border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white flex flex-col p-0">
            <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center gap-4 space-y-0">
                <img src={clanData.emblem} alt="emblem" className="w-16 h-16 rounded-lg border-2 border-slate-300 dark:border-slate-600" />
                <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">{clanData.name}</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 italic">{clanData.motto}</DialogDescription>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                    <TabsList className="mx-6 mt-4 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none p-0">
                        <TabsTrigger value="chat"><MessageSquare size={16} className="mr-2"/>Clan Chat</TabsTrigger>
                        <TabsTrigger value="members"><Users size={16} className="mr-2"/>Members ({members.length})</TabsTrigger>
                        <TabsTrigger value="settings"><Settings size={16} className="mr-2"/>Settings</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                        <TabsContent value="chat" className="h-full flex flex-col">
                           <div className="flex-1 space-y-4 p-2 bg-slate-100 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800">
                                {/* Chat messages would go here */}
                                <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-bold text-purple-600 dark:text-purple-400">Nova:</span> Welcome to the clan, Raptor!</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-bold text-green-600 dark:text-green-400">Raptor:</span> Glad to be here!</p>
                           </div>
                           <div className="mt-4 flex gap-2">
                               <Input placeholder="Type your message..." className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white" />
                               <Button className="bg-purple-600 hover:bg-purple-700 text-white" sound="send_message.mp3"><Send size={18}/></Button>
                           </div>
                        </TabsContent>

                        <TabsContent value="members">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map(member => <MemberCard key={member.name} member={member} />)}
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Bell size={18} /> Join Requests</h3>
                                <div className="space-y-2">
                                    {joinRequests.map(req => (
                                        <div key={req.name} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{req.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{req.rank}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" sound="accept.mp3" className="text-green-600 dark:text-green-400 border-green-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-black">Accept</Button>
                                                <Button size="sm" variant="outline" sound="decline.mp3" className="text-red-600 dark:text-red-400 border-red-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-black">Decline</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="settings">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clan Details</h3>
                                    <div className="space-y-2 mt-2">
                                        <Input label="Clan Name" defaultValue={clanData.name} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"/>
                                        <Input label="Clan Motto" defaultValue={clanData.motto} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white"/>
                                        <Button>Update Details</Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                                    <Button variant="destructive" sound="close.mp3" className="mt-2">Disband Clan</Button>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default ClanModal;

// Add a label prop to the Input component if it doesn't have one
declare module "@/components/ui/input" {
  interface InputProps {
    label?: string;
  }
} 