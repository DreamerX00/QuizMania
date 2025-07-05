import React from 'react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface VoiceChatControlsProps {
  userId: string;
  userName: string;
  roomId?: string;
  onError?: (error: string) => void;
  onModeChange?: (mode: 'livekit' | 'webrtc-fallback') => void;
}

export function VoiceChatControls({
  userId,
  userName,
  roomId,
  onError,
  onModeChange
}: VoiceChatControlsProps) {
  const {
    isConnected,
    isMuted,
    isSpeaking,
    mode,
    participants,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    setSpeaking,
    forceFallback,
    checkHealth
  } = useVoiceChat({
    userId,
    userName,
    onError,
    onModeChange
  });

  const handleJoinRoom = async () => {
    if (!roomId) {
      onError?.('No room ID provided');
      return;
    }
    await joinRoom(roomId);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handlePushToTalk = (speaking: boolean) => {
    setSpeaking(speaking);
  };

  const handleForceFallback = () => {
    forceFallback();
  };

  const handleHealthCheck = () => {
    checkHealth();
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
      {/* Status and Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Badge variant={mode === 'livekit' ? 'default' : 'secondary'}>
          {mode === 'livekit' ? 'LiveKit' : mode === 'webrtc-fallback' ? 'WebRTC' : 'Offline'}
        </Badge>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Connection Controls */}
      <div className="flex gap-2">
        {!isConnected || mode === 'disconnected' ? (
          <Button
            onClick={handleJoinRoom}
            disabled={!roomId}
            className="flex-1"
            size="sm"
          >
            <Phone className="w-4 h-4 mr-2" />
            Join Voice
          </Button>
        ) : (
          <Button
            onClick={handleLeaveRoom}
            variant="destructive"
            className="flex-1"
            size="sm"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave Voice
          </Button>
        )}
      </div>

      {/* Voice Controls */}
      {isConnected && mode !== 'disconnected' && (
        <div className="flex gap-2">
          <Button
            onClick={handleToggleMute}
            variant={isMuted ? 'destructive' : 'outline'}
            size="sm"
            className="flex-1"
          >
            {isMuted ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Unmute
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Mute
              </>
            )}
          </Button>

          <Button
            onMouseDown={() => handlePushToTalk(true)}
            onMouseUp={() => handlePushToTalk(false)}
            onMouseLeave={() => handlePushToTalk(false)}
            variant={isSpeaking ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Speaking...
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Push to Talk
              </>
            )}
          </Button>
        </div>
      )}

      {/* Participants */}
      {participants.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Participants ({participants.length})</h4>
          <div className="space-y-1">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-700 rounded text-sm"
              >
                <span className="truncate">{participant.name}</span>
                <div className="flex items-center gap-1">
                  {participant.isMuted && (
                    <MicOff className="w-3 h-3 text-red-500" />
                  )}
                  {participant.isSpeaking && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Controls (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
          <Button
            onClick={handleForceFallback}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Force Fallback
          </Button>
          <Button
            onClick={handleHealthCheck}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Health Check
          </Button>
        </div>
      )}
    </div>
  );
} 