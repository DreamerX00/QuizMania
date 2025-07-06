"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Settings, 
  Volume2, 
  VolumeX,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { useLiveKit } from '@/lib/livekit';
import { useSocket } from '@/lib/socket';
import { Participant } from 'livekit-client';
import { toast } from 'react-hot-toast';

interface VoiceChatProps {
  roomId: string;
  className?: string;
  onClose?: () => void;
}

interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isSpeaking: boolean;
  isLocal: boolean;
  volume: number;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ roomId, className = '', onClose }) => {
  const { liveKitService, connect, disconnect, setMuted, setPushToTalk, getVoiceState, isConnected, isMuted, isSpeaking, getParticipants } = useLiveKit();
  const { socketService } = useSocket();
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPushToTalkEnabled, setIsPushToTalkEnabled] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceState, setVoiceState] = useState(getVoiceState());
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [connectionMode, setConnectionMode] = useState<'livekit' | 'webrtc-fallback' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize voice chat
  useEffect(() => {
    if (isVoiceEnabled && !isConnected) {
      initializeVoiceChat();
    }
  }, [isVoiceEnabled, roomId]);

  // Update voice state
  useEffect(() => {
    const updateState = () => {
      setVoiceState(getVoiceState());
      updateParticipants();
    };

    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [getVoiceState]);

  // Setup LiveKit callbacks
  useEffect(() => {
    liveKitService.setCallbacks({
      onParticipantJoined: (participant) => {
        console.log('Voice participant joined:', participant.identity);
        updateParticipants();
        toast.success(`${participant.identity} joined voice chat`);
      },
      onParticipantLeft: (participant) => {
        console.log('Voice participant left:', participant.identity);
        updateParticipants();
        toast(`${participant.identity} left voice chat`);
      },
      onParticipantMuted: (participant, muted) => {
        console.log('Voice participant muted:', participant.identity, muted);
        updateParticipants();
      },
      onParticipantSpeaking: (participant, speaking) => {
        console.log('Voice participant speaking:', participant.identity, speaking);
        updateParticipants();
      },
      onConnectionStateChanged: (state) => {
        console.log('Voice connection state:', state);
        setConnectionMode(state === 'connected' ? 'livekit' : 'disconnected');
      },
      onError: (error) => {
        console.error('Voice error:', error);
        setError(error.message);
        toast.error(`Voice error: ${error.message}`);
      },
      onDisconnected: (reason) => {
        console.log('Voice disconnected:', reason);
        setConnectionMode('disconnected');
        setIsVoiceEnabled(false);
        toast('Voice chat disconnected');
      },
    });
  }, [liveKitService]);

  // Setup Socket.IO callbacks for voice
  useEffect(() => {
    socketService.setCallbacks({
      onVoiceUserJoined: (data) => {
        console.log('Socket voice user joined:', data);
        updateParticipants();
      },
      onVoiceUserLeft: (data) => {
        console.log('Socket voice user left:', data);
        updateParticipants();
      },
      onVoiceUserMuted: (data) => {
        console.log('Socket voice user muted:', data);
        updateParticipants();
      },
      onVoiceUserSpeaking: (data) => {
        console.log('Socket voice user speaking:', data);
        updateParticipants();
      },
      onVoiceFallbackActivated: (data) => {
        console.log('Voice fallback activated:', data);
        setConnectionMode('webrtc-fallback');
        toast.warning('Switched to WebRTC fallback mode');
      },
      onLiveKitJoin: async (data) => {
        console.log('LiveKit join event:', data);
        try {
          await connect(data.token, data.roomId);
          setConnectionMode('livekit');
          toast.success('Connected to LiveKit voice chat');
        } catch (error) {
          console.error('Failed to connect to LiveKit:', error);
          setError('Failed to connect to voice chat');
        }
      },
    });
  }, [socketService, connect]);

  const initializeVoiceChat = async () => {
    if (!roomId) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Join voice room via Socket.IO
      socketService.joinVoiceRoom(roomId);
      
      // Wait for LiveKit token or fallback
      setTimeout(() => {
        if (!isConnected) {
          // If LiveKit doesn't connect, activate fallback
          socketService.activateVoiceFallback(roomId);
        }
      }, 5000);

    } catch (error) {
      console.error('Failed to initialize voice chat:', error);
      setError('Failed to initialize voice chat');
      setIsVoiceEnabled(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const updateParticipants = () => {
    const liveKitParticipants = Array.from(getParticipants().values()).map(participant => ({
      id: participant.identity,
      name: participant.identity,
      avatar: participant.metadata ? JSON.parse(participant.metadata).avatar : undefined,
      isMuted: participant.isMicrophoneMuted,
      isSpeaking: participant.isSpeaking,
      isLocal: participant === liveKitService.getLocalParticipant(),
      volume: 100, // Default volume
    }));

    setParticipants(liveKitParticipants);
  };

  const handleVoiceToggle = async () => {
    if (isVoiceEnabled) {
      // Disconnect voice
      await disconnect();
      socketService.leaveVoiceRoom(roomId);
      setIsVoiceEnabled(false);
      setConnectionMode('disconnected');
              toast('Voice chat disabled');
    } else {
      // Enable voice
      setIsVoiceEnabled(true);
    }
  };

  const handleMuteToggle = async () => {
    try {
      await setMuted(!isMuted);
      toast.success(isMuted ? 'Unmuted' : 'Muted');
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      toast.error('Failed to toggle mute');
    }
  };

  const handlePushToTalkToggle = async () => {
    try {
      await setPushToTalk(!isPushToTalkEnabled);
      setIsPushToTalkEnabled(!isPushToTalkEnabled);
      toast.success(isPushToTalkEnabled ? 'Push-to-talk disabled' : 'Push-to-talk enabled');
    } catch (error) {
      console.error('Failed to toggle push-to-talk:', error);
      toast.error('Failed to toggle push-to-talk');
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionMode) {
      case 'livekit':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'webrtc-fallback':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionMode) {
      case 'livekit':
        return 'LiveKit';
      case 'webrtc-fallback':
        return 'WebRTC';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Voice Chat</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            {getConnectionStatusIcon()}
            {getConnectionStatusText()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Users className="w-4 h-4" />
            <span className="ml-1 text-xs">{participants.length}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
        >
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
        </motion.div>
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-3 mb-4">
        {/* Voice Toggle */}
        <Button
          onClick={handleVoiceToggle}
          disabled={isConnecting}
          className={`flex-1 ${
            isVoiceEnabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isConnecting ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : isVoiceEnabled ? (
            <Phone className="w-4 h-4" />
          ) : (
            <PhoneOff className="w-4 h-4" />
          )}
          <span className="ml-2">
            {isConnecting ? 'Connecting...' : isVoiceEnabled ? 'Connected' : 'Connect'}
          </span>
        </Button>

        {/* Mute Toggle */}
        <Button
          onClick={handleMuteToggle}
          disabled={!isVoiceEnabled}
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          className="w-12 h-12"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-md"
          >
            <div className="space-y-3">
              {/* Push-to-Talk Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Push-to-Talk</span>
                </div>
                <Switch
                  checked={isPushToTalkEnabled}
                  onCheckedChange={handlePushToTalkToggle}
                  disabled={!isVoiceEnabled}
                />
              </div>

              {/* Voice Activity Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Voice Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isSpeaking ? 'Speaking' : 'Silent'}
                  </span>
                </div>
              </div>

              {/* Connection Info */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Connection</span>
                <div className="flex items-center gap-1">
                  {getConnectionStatusIcon()}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {getConnectionStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants Panel */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Participants</h4>
            {participants.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                No participants
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {participants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {participant.avatar ? (
                            <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full" />
                          ) : (
                            participant.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {participant.isSpeaking && (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"
                          />
                        )}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {participant.name}
                        {participant.isLocal && (
                          <Badge variant="secondary" className="ml-1 text-xs">You</Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {participant.isMuted ? (
                        <MicOff className="w-3 h-3 text-red-500" />
                      ) : (
                        <Mic className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push-to-Talk Indicator */}
      {isPushToTalkEnabled && isVoiceEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
        >
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
            <Zap className="w-4 h-4" />
            <span>Push-to-Talk enabled (Hold Spacebar)</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceChat; 