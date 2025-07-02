import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Sparkles, X } from 'lucide-react';
import JoinRoomFlow from '@/components/rooms/JoinRoomFlow';
import CreateRoomForm from '@/components/rooms/CreateRoomForm';
import RoomLobby from '@/components/rooms/RoomLobby';
import { Button } from '@/components/ui/button';

const mockUser = { name: 'QuantumLeap' };

type Step = 'choose' | 'join' | 'create' | 'lobby';

const RoomModalOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<Step>('choose');
  const [roomData, setRoomData] = useState<any>(null);

  // Reset state on close
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('choose');
        setRoomData(null);
      }, 400);
    }
  }, [open]);

  // Handlers for join/create
  const handleJoin = (room: any) => {
    setRoomData(room);
    setStep('lobby');
  };
  const handleCreate = (room: any) => {
    setRoomData(room);
    setStep('lobby');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative max-w-4xl w-full min-h-[600px] max-h-[90vh] mx-auto p-10 rounded-2xl bg-gradient-to-br from-white/10 via-purple-900/20 to-blue-900/30 backdrop-blur-2xl border border-purple-400/30 shadow-2xl flex flex-col items-center overflow-auto"
            style={{ boxShadow: '0 0 48px 8px #a78bfa33, 0 0 0 1.5px #a78bfa55' }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-purple-400/30"
              animate={{ boxShadow: [
                '0 0 32px 8px #a78bfa66',
                '0 0 48px 12px #60a5fa44',
                '0 0 32px 8px #a78bfa66',
              ] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'loop' }}
            />
            <button
              onClick={onClose}
              className="absolute -top-5 -right-5 bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition border-2 border-white/20"
              style={{ boxShadow: '0 0 16px #a78bfa' }}
              aria-label="Close"
            >
              <X size={24} />
            </button>
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
                      <DoorOpen className="mr-2" /> Join Room
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: '0 0 24px #22c55e' }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
                      onClick={() => setStep('create')}
                    >
                      <Sparkles className="mr-2" /> Create Room
                    </motion.button>
                  </div>
                </motion.div>
              )}
              {step === 'join' && (
                <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="w-full">
                  <JoinRoomFlow onJoin={handleJoin} />
                  <Button variant="ghost" className="text-gray-400 mt-4 w-full" onClick={() => setStep('choose')}>Back</Button>
                </motion.div>
              )}
              {step === 'create' && (
                <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="w-full">
                  <CreateRoomForm onCreate={handleCreate} />
                  <Button variant="ghost" className="text-gray-400 mt-4 w-full" onClick={() => setStep('choose')}>Back</Button>
                </motion.div>
              )}
              {step === 'lobby' && roomData && (
                <motion.div key="lobby" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }} className="w-full h-[70vh] flex items-stretch">
                  <RoomLobby room={roomData} user={mockUser} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomModalOverlay; 