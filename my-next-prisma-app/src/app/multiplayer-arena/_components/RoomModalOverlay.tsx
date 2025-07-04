import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Sparkles, X } from 'lucide-react';
import JoinRoomFlow from '@/components/rooms/JoinRoomFlow';
import CreateRoomForm from '@/components/rooms/CreateRoomForm';
import RoomLobby from '@/components/rooms/RoomLobby';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const RoomModalOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<'choose' | 'join' | 'create' | 'lobby'>('choose');
  const [roomData, setRoomData] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const { data: myRoomsData, error: myRoomsError, isLoading: myRoomsLoading, mutate: mutateMyRooms } = useSWR(open ? '/api/rooms?my=1' : null, fetcher);
  const { data: roomMembersData, error: roomMembersError, isLoading: roomMembersLoading, mutate: mutateRoomMembers } = useSWR(roomId ? `/api/rooms/members?roomId=${roomId}` : null, fetcher);

  // Handlers for join/create
  const handleJoin = async (room: any) => {
    setRoomData(room);
    setRoomId(room.id);
    setStep('lobby');
    toast.success('Joined room!');
  };
  const handleCreate = async (room: any) => {
    setRoomData(room);
    setRoomId(room.id);
    setStep('lobby');
    toast.success('Room created!');
  };

  // Reset state on close
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('choose');
        setRoomData(null);
        setRoomId(null);
      }, 400);
    }
  }, [open]);

  if (myRoomsLoading) return <div className="p-6 text-center text-slate-400">Loading rooms...</div>;
  if (myRoomsError) {
    toast.error('Failed to load rooms.');
    return <div className="p-6 text-center text-red-500">Error loading rooms.</div>;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Animated Gradient Background */}
          <motion.div
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="absolute inset-0 w-full h-full z-0"
            style={{
              background: 'linear-gradient(120deg, #0f1021 0%, #23234d 40%, #3b82f6 70%, #a78bfa 100%)',
              backgroundSize: '200% 200%',
              filter: 'blur(2px) brightness(0.9)',
            }}
          />
          {/* Main Glassmorphism Container */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            className="relative w-full max-w-[1280px] min-w-[320px] h-full min-h-screen flex flex-col md:flex-row rounded-3xl bg-white/10 backdrop-blur-2xl border-4 border-blue-500/40 shadow-[0_0_64px_8px_rgba(59,130,246,0.25)] overflow-hidden mx-auto"
            style={{ boxShadow: '0 0 64px 8px #3b82f6aa, 0 0 0 3px #a78bfa55' }}
          >
            <div className="flex-1 flex flex-col h-full w-full">
              <AnimatePresence mode="wait">
                {step === 'choose' && (
                  <motion.div
                    key="choose"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-8 w-full"
                  >
                    <h2 className="text-4xl font-orbitron font-extrabold text-purple-300 text-center mb-6 drop-shadow-glow animate-title-glow tracking-widest select-none">
                      Custom Room
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-8 w-full">
                      <motion.button
                        whileHover={{ scale: 1.08, boxShadow: '0 0 24px #3b82f6' }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                        onClick={() => setStep('join')}
                      >
                        Join Room
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08, boxShadow: '0 0 24px #22c55e' }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
                        onClick={() => setStep('create')}
                      >
                        Create Room
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                {step === 'join' && (
                  <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="w-full">
                    {/* Implement join room flow with real API */}
                    {/* Example: List available rooms, allow code entry, call /api/rooms/members POST to join */}
                    <Button variant="ghost" className="text-gray-400 mt-4 w-full" onClick={() => setStep('choose')}>Back</Button>
                  </motion.div>
                )}
                {step === 'create' && (
                  <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="w-full">
                    {/* Implement create room flow with real API */}
                    {/* Example: Form to enter room name, call /api/rooms POST to create */}
                    <Button variant="ghost" className="text-gray-400 mt-4 w-full" onClick={() => setStep('choose')}>Back</Button>
                  </motion.div>
                )}
                {step === 'lobby' && roomData && (
                  <motion.div key="lobby" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }} className="w-full h-[70vh] flex items-stretch">
                    {/* Pass real room and member data to RoomLobby */}
                    <RoomLobby room={roomData} members={roomMembersData?.members || []} />
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