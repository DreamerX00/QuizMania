import { ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
  transparent?: boolean;
  wide?: boolean;
  disableEscapeKey?: boolean;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

export default function Modal({ open, onClose, children, fullScreen = false, transparent = false, wide = false, disableEscapeKey = false, ariaLabelledby, ariaDescribedby }: ModalProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Save the element that triggered the modal
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = 'Dialog opened';
      }
    } else {
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = 'Dialog closed';
      }
    }
  }, [open]);

  // Escape key handling
  useEffect(() => {
    if (!open || disableEscapeKey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, disableEscapeKey, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${fullScreen ? 'p-0' : ''}`}
          aria-modal="true"
          role="dialog"
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />
          <FocusTrap
            active={open}
            focusTrapOptions={{
              initialFocus: () => modalRef.current,
              escapeDeactivates: !disableEscapeKey,
              clickOutsideDeactivates: false,
              fallbackFocus: () => modalRef.current,
            }}
          >
            <motion.div
              ref={modalRef}
              tabIndex={-1}
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
              aria-modal="true"
              aria-labelledby={ariaLabelledby}
              aria-describedby={ariaDescribedby}
            >
              {children}
              <div ref={liveRegionRef} aria-live="polite" className="sr-only" />
            </motion.div>
          </FocusTrap>
        </div>
      )}
    </AnimatePresence>
  );
} 
