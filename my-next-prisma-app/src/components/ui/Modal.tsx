import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
  transparent?: boolean;
  wide?: boolean;
}

export default function Modal({ open, onClose, children, fullScreen = false, transparent = false, wide = false }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${fullScreen ? 'p-0' : ''}`}>
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={`relative z-10 ${
              fullScreen 
                ? 'w-screen h-screen max-w-none max-h-none rounded-none p-0' 
                : transparent 
                ? '' 
                : `bg-gray-900/90 border border-purple-700 rounded-2xl p-8 ${wide ? 'max-w-4xl' : 'max-w-md'} w-full`
            } shadow-2xl`}
            style={fullScreen ? { background: 'rgba(20,20,30,0.95)', border: '1.5px solid #7c3aed', backdropFilter: 'blur(16px)' } : {}}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 