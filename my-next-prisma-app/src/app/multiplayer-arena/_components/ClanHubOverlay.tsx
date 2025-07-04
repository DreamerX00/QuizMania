import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, MessageSquare, Users, Settings, Swords, Crown, UserPlus, Bell, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import ClanPanelTabs from './ClanPanelTabs';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const MemberCard = ({ member }: { member: any }) => (
    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.username?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-gray-900 dark:text-white">{member.username}</p>
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

const ClanHubOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[80vh] flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 text-xl font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white z-10">×</button>
            <ClanPanelTabs />
          </div>
        </div>
      )}
    </>
  );
};

export default ClanHubOverlay; 