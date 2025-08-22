import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Link2, BookOpen, UserCircle2 } from 'lucide-react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useUser, SignInButton } from '@clerk/nextjs';
// Development components removed for production

interface CreatorInfo {
  name: string;
  profileImage?: string;
  message?: string;
}

interface QuizInitModalProps {
  open: boolean;
  onAcknowledge: () => void;
  creatorInfo?: CreatorInfo;
  rules?: string;
  guide?: string;
  loading?: boolean;
  quizId: string;
}

const TABS = [
  { key: 'rules', label: 'Rules', icon: BookOpen },
  { key: 'guide', label: 'Guide', icon: Sparkles },
  { key: 'creator', label: "Creator", icon: UserCircle2 },
  { key: 'link', label: 'Unique Link', icon: Link2 },
];

const tabBg = {
  rules: 'from-blue-500/30 via-purple-500/30 to-pink-500/30',
  guide: 'from-green-400/30 via-blue-400/30 to-purple-400/30',
  creator: 'from-yellow-400/30 via-pink-400/30 to-purple-400/30',
  link: 'from-fuchsia-500/30 via-blue-500/30 to-green-400/30',
};

export default function QuizInitModal({ open, onAcknowledge, creatorInfo, rules, guide, loading, quizId }: QuizInitModalProps) {
  const { isSignedIn } = useUser();
  const [tab, setTab] = useState('rules');
  const [link, setLink] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [consent, setConsent] = useState(false);

  React.useEffect(() => {
    // Collect fingerprint and device info on mount
    (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
      setDeviceInfo({
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        // Optionally, add more entropy here
      });
    })();
  }, []);

  // Placeholder for link generation logic
  const handleGenerateLink = async () => {
    if (!consent) {
      setLinkError('You must consent to data collection to generate a link.');
      return;
    }
    setLinkLoading(true);
    setLinkError(null);
    try {
      // DEV-ONLY: Clear in-progress attempts if toggle is enabled
      // Production-ready rules (hardcoded for security)
      const rules = { allowMultipleAttempts: false };
      if (rules.allowMultipleAttempts) {
        await fetch('/api/dev/clear-in-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId }),
        });
      }
      const res = await fetch(`/api/quiz/${quizId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint, deviceInfo }),
      });
      const data = await res.json();
      if (!res.ok || !data.quizLink) throw new Error(data.error || 'Failed to generate link');
      setLink(data.quizLink);
      setLinkLoading(false);
    } catch (e: any) {
      setLinkError(e.message || 'Failed to generate link. Please try again.');
      setLinkLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => {}} fullScreen>
      {!isSignedIn ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
          <p className="mb-4 text-lg font-semibold text-red-600">You must be signed in to start this quiz.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 rounded-lg bg-primary text-white font-bold">Sign In</button>
          </SignInButton>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full items-center justify-center p-0 md:p-6 bg-gradient-to-br from-[#1a1333] via-[#1e2235] to-[#2a1a3a] dark:from-[#0e0a1a] dark:via-[#181a23] dark:to-[#1a1333]">
          {/* Hero Icon & Sparkles */}
          <div className="relative flex flex-col items-center mt-8 mb-2 select-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
              className="rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-blue-400 p-4 shadow-2xl border-4 border-white/10 dark:border-black/20"
            >
              <Brain className="w-16 h-16 text-white drop-shadow-xl animate-pulse" />
            </motion.div>
            <Sparkles className="absolute -top-2 -right-4 w-8 h-8 text-fuchsia-400 animate-spin-slow opacity-70" />
          </div>
          {/* Modal Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }}
            className="relative w-[90vw] md:w-[70vw] h-[80vh] max-w-full md:max-w-[1200px] max-h-[90vh] md:max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden border border-purple-700/60 bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl flex flex-col"
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 pointer-events-none z-0 rounded-3xl border-4 border-transparent bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-400 bg-clip-border animate-gradient-x opacity-60" />
            {/* Tab Navigation */}
            <div className="relative flex gap-2 px-4 md:px-8 pt-6 md:pt-8 pb-2 z-10">
              {TABS.map((t, i) => {
                const Icon = t.icon;
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition border-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:ring-offset-2
                    ${isActive
                      ? 'bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-blue-400 text-white border-fuchsia-400 shadow-lg'
                      : 'bg-white/30 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 border-transparent hover:bg-fuchsia-100/30 dark:hover:bg-fuchsia-900/20'}
                  `}
                    onClick={() => setTab(t.key)}
                    tabIndex={0}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{t.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute left-0 right-0 -bottom-1 h-1 rounded-b-xl bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Content Area */}
            <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-4 md:py-6 transition-all duration-300 bg-gradient-to-br ${tabBg[tab as keyof typeof tabBg]} rounded-2xl overflow-y-auto`}> 
              <AnimatePresence mode="wait">
                {tab === 'rules' && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full text-lg whitespace-pre-line text-gray-900 dark:text-gray-100"
                  >
                    {rules || 'No rules provided.'}
                  </motion.div>
                )}
                {tab === 'guide' && (
                  <motion.div
                    key="guide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full text-lg whitespace-pre-line text-gray-900 dark:text-gray-100"
                  >
                    {guide || 'No guide provided.'}
                  </motion.div>
                )}
                {tab === 'creator' && creatorInfo && (
                  <motion.div
                    key="creator"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-3 w-full"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-300 via-fuchsia-400 to-purple-400 blur-lg opacity-60 animate-pulse" />
                      {creatorInfo.profileImage ? (
                        <img src={creatorInfo.profileImage} alt={creatorInfo.name} className="w-20 h-20 rounded-full border-4 border-fuchsia-400 shadow-xl relative z-10" />
                      ) : (
                        <UserCircle2 className="w-20 h-20 text-fuchsia-400 bg-white/80 rounded-full border-4 border-fuchsia-400 shadow-xl relative z-10" />
                      )}
                    </div>
                    <div className="font-bold text-2xl text-fuchsia-700 dark:text-fuchsia-300 drop-shadow">{creatorInfo.name}</div>
                    {creatorInfo.message && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="italic text-lg text-center text-gray-800 dark:text-gray-200">“{creatorInfo.message}”</motion.div>}
                  </motion.div>
                )}
                {tab === 'link' && (
                  <motion.div
                    key="link"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-4 w-full"
                  >
                    {!link && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-blue-400 text-white font-bold text-lg shadow-lg hover:brightness-110 transition flex items-center gap-2"
                        onClick={handleGenerateLink}
                        disabled={linkLoading || !consent}
                      >
                        <Link2 className="w-5 h-5" />
                        {linkLoading ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="ml-2 animate-pulse"
                          >Generating…</motion.span>
                        ) : 'Generate Unique Link'}
                      </motion.button>
                    )}
                    {link && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="font-mono text-base break-all bg-white/80 dark:bg-gray-900/80 px-4 py-2 rounded-lg border-2 border-fuchsia-400 shadow-md animate-bounce-in">
                          {link}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 shadow"
                            onClick={() => navigator.clipboard.writeText(link)}
                          >Copy Link</button>
                          <button
                            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow"
                            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                          >Open in Incognito</button>
                        </div>
                      </motion.div>
                    )}
                    {linkError && <div className="text-red-500">{linkError}</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Consent Notice */}
            <div className="flex items-center gap-2 mt-4 mb-2 px-4 md:px-8">
              <input
                type="checkbox"
                id="consent-checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="w-5 h-5 accent-fuchsia-500 border-2 border-fuchsia-400 rounded focus:ring-2 focus:ring-fuchsia-400/60"
              />
              <label htmlFor="consent-checkbox" className="text-sm md:text-base text-gray-700 dark:text-gray-200 select-none">
                I consent to the collection of device and browser information for quiz security and anti-cheat purposes. See our{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-fuchsia-600 hover:text-fuchsia-800">Privacy Policy</a>.
              </label>
            </div>
            {/* Start Button */}
            <div className="flex justify-end mt-6 px-4 md:px-8 pb-6 md:pb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-blue-400 text-white font-bold text-xl shadow-xl hover:brightness-110 transition disabled:opacity-60 disabled:grayscale focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:ring-offset-2"
                onClick={onAcknowledge}
                disabled={loading || (tab === 'link' && !link) || !consent}
                aria-disabled={loading || (tab === 'link' && !link) || !consent}
              >
                Start Quiz
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </Modal>
  );
} 