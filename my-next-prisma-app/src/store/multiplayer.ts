import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { socketService, SocketUser, ChatMessage, VoteData, RoomEvent, VoiceEvent } from '@/lib/socket';
import { liveKitService, VoiceState } from '@/lib/livekit';

// Types for multiplayer state
export interface Room {
  id: string;
  name: string;
  type: 'match' | 'clan' | 'custom';
  participants: SocketUser[];
  maxParticipants: number;
  isPrivate: boolean;
  createdAt: Date;
  gameMode?: string;
  difficulty?: string;
  region?: string;
}

export interface Participant extends SocketUser {
  isLeader: boolean;
  isReady: boolean;
  isInVoice: boolean;
  isVoiceMuted: boolean;
  isSpeaking: boolean;
  joinTime: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  typingUsers: string[];
}

export interface VoteState {
  activeVote: {
    id: string;
    roomId: string;
    type: string;
    options: string[];
    votes: Record<string, number>;
    endTime: Date;
    isActive: boolean;
  } | null;
  userVote: string | null;
}

export interface GameState {
  isInGame: boolean;
  gameMode: string;
  currentQuestion?: any;
  scores: Record<string, number>;
  timeRemaining: number;
  phase: 'waiting' | 'voting' | 'playing' | 'results';
}

// Main multiplayer store interface
interface MultiplayerState {
  // Connection state
  isConnected: boolean;
  currentRoom: Room | null;
  currentUserId: string | null;
  
  // Rooms and participants
  rooms: Map<string, Room>;
  participants: Map<string, Participant>;
  
  // Chat state
  chat: ChatState;
  
  // Voting state
  voting: VoteState;
  
  // Game state
  game: GameState;
  
  // Voice state
  voice: VoiceState;
  
  // UI state
  ui: {
    showVoiceChat: boolean;
    showParticipants: boolean;
    showChat: boolean;
    showVoting: boolean;
  };
  
  // Actions
  actions: {
    // Connection
    connect: (userId: string, token?: string) => void;
    disconnect: () => void;
    
    // Room management
    joinRoom: (roomId: string, roomType: string) => void;
    leaveRoom: (roomId: string) => void;
    createRoom: (roomData: Partial<Room>) => void;
    updateRoom: (roomId: string, updates: Partial<Room>) => void;
    
    // Participant management
    addParticipant: (participant: Participant) => void;
    removeParticipant: (participantId: string) => void;
    updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
    
    // Chat management
    sendMessage: (message: string, type: ChatMessage['type'], roomId?: string, clanId?: string, receiverId?: string) => void;
    addMessage: (message: ChatMessage) => void;
    setTyping: (isTyping: boolean) => void;
    addTypingUser: (userId: string) => void;
    removeTypingUser: (userId: string) => void;
    
    // Voting management
    startVote: (voteData: VoteState['activeVote']) => void;
    castVote: (voteType: string) => void;
    endVote: () => void;
    updateVoteCount: (voteType: string, count: number) => void;
    
    // Game management
    startGame: (gameMode: string) => void;
    endGame: () => void;
    updateScore: (userId: string, score: number) => void;
    setGamePhase: (phase: GameState['phase']) => void;
    setCurrentQuestion: (question: any) => void;
    setTimeRemaining: (time: number) => void;
    
    // Voice management
    joinVoice: (roomId: string) => void;
    leaveVoice: (roomId: string) => void;
    muteVoice: (muted: boolean) => void;
    setVoiceMode: (mode: VoiceState['mode']) => void;
    setVoiceError: (error: string | null) => void;
    
    // UI management
    toggleVoiceChat: () => void;
    toggleParticipants: () => void;
    toggleChat: () => void;
    toggleVoting: () => void;
    
    // Socket event handlers
    handleUserJoined: (data: RoomEvent) => void;
    handleUserLeft: (data: RoomEvent) => void;
    handleChatMessage: (data: ChatMessage) => void;
    handleVoteUpdate: (data: VoteData) => void;
    handleVoiceEvent: (data: VoiceEvent) => void;
  };
}

// Create the multiplayer store
export const useMultiplayerStore = create<MultiplayerState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isConnected: false,
    currentRoom: null,
    currentUserId: null,
    rooms: new Map(),
    participants: new Map(),
    chat: {
      messages: [],
      isTyping: false,
      typingUsers: [],
    },
    voting: {
      activeVote: null,
      userVote: null,
    },
    game: {
      isInGame: false,
      gameMode: '',
      scores: {},
      timeRemaining: 0,
      phase: 'waiting',
    },
    voice: {
      isConnected: false,
      isMuted: false,
      isSpeaking: false,
      participants: new Map(),
      localParticipant: null,
      room: null,
      mode: 'disconnected',
      error: null,
    },
    ui: {
      showVoiceChat: false,
      showParticipants: false,
      showChat: true,
      showVoting: false,
    },
    
    // Actions
    actions: {
      // Connection
      connect: (userId: string, token?: string) => {
        socketService.connect(userId, token);
        set({ currentUserId: userId, isConnected: true });
      },
      
      disconnect: () => {
        socketService.disconnect();
        set({ 
          isConnected: false, 
          currentRoom: null, 
          currentUserId: null,
          rooms: new Map(),
          participants: new Map(),
          chat: { messages: [], isTyping: false, typingUsers: [] },
          voting: { activeVote: null, userVote: null },
          game: { isInGame: false, gameMode: '', scores: {}, timeRemaining: 0, phase: 'waiting' },
          voice: { isConnected: false, isMuted: false, isSpeaking: false, participants: new Map(), localParticipant: null, room: null, mode: 'disconnected', error: null },
        });
      },
      
      // Room management
      joinRoom: (roomId: string, roomType: string) => {
        socketService.joinRoom(roomId, roomType);
        const room: Room = {
          id: roomId,
          name: `Room ${roomId}`,
          type: roomType as any,
          participants: [],
          maxParticipants: 10,
          isPrivate: false,
          createdAt: new Date(),
        };
        set({ currentRoom: room });
      },
      
      leaveRoom: (roomId: string) => {
        socketService.leaveRoom(roomId);
        set({ currentRoom: null });
      },
      
      createRoom: (roomData: Partial<Room>) => {
        const room: Room = {
          id: roomData.id || `room_${Date.now()}`,
          name: roomData.name || 'New Room',
          type: roomData.type || 'custom',
          participants: roomData.participants || [],
          maxParticipants: roomData.maxParticipants || 10,
          isPrivate: roomData.isPrivate || false,
          createdAt: new Date(),
          gameMode: roomData.gameMode,
          difficulty: roomData.difficulty,
          region: roomData.region,
        };
        set(state => ({
          rooms: new Map(state.rooms).set(room.id, room),
          currentRoom: room,
        }));
      },
      
      updateRoom: (roomId: string, updates: Partial<Room>) => {
        set(state => {
          const room = state.rooms.get(roomId);
          if (room) {
            const updatedRoom = { ...room, ...updates };
            const newRooms = new Map(state.rooms).set(roomId, updatedRoom);
            return { rooms: newRooms };
          }
          return state;
        });
      },
      
      // Participant management
      addParticipant: (participant: Participant) => {
        set(state => ({
          participants: new Map(state.participants).set(participant.id, participant),
        }));
      },
      
      removeParticipant: (participantId: string) => {
        set(state => {
          const newParticipants = new Map(state.participants);
          newParticipants.delete(participantId);
          return { participants: newParticipants };
        });
      },
      
      updateParticipant: (participantId: string, updates: Partial<Participant>) => {
        set(state => {
          const participant = state.participants.get(participantId);
          if (participant) {
            const updatedParticipant = { ...participant, ...updates };
            const newParticipants = new Map(state.participants).set(participantId, updatedParticipant);
            return { participants: newParticipants };
          }
          return state;
        });
      },
      
      // Chat management
      sendMessage: (message: string, type: ChatMessage['type'], roomId?: string, clanId?: string, receiverId?: string) => {
        socketService.sendChatMessage({ type, message, roomId, clanId, receiverId });
      },
      
      addMessage: (message: ChatMessage) => {
        set(state => ({
          chat: {
            ...state.chat,
            messages: [...state.chat.messages, message],
          },
        }));
      },
      
      setTyping: (isTyping: boolean) => {
        set(state => ({
          chat: { ...state.chat, isTyping },
        }));
      },
      
      addTypingUser: (userId: string) => {
        set(state => ({
          chat: {
            ...state.chat,
            typingUsers: [...state.chat.typingUsers.filter(id => id !== userId), userId],
          },
        }));
      },
      
      removeTypingUser: (userId: string) => {
        set(state => ({
          chat: {
            ...state.chat,
            typingUsers: state.chat.typingUsers.filter(id => id !== userId),
          },
        }));
      },
      
      // Voting management
      startVote: (voteData: VoteState['activeVote']) => {
        set(state => ({
          voting: { ...state.voting, activeVote: voteData },
        }));
      },
      
      castVote: (voteType: string) => {
        const { currentRoom } = get();
        if (currentRoom) {
          socketService.castVote({
            roomId: currentRoom.id,
            vote: { type: voteType },
            mode: currentRoom.gameMode || 'default',
            type: voteType,
          });
        }
        set(state => ({
          voting: { ...state.voting, userVote: voteType },
        }));
      },
      
      endVote: () => {
        set(state => ({
          voting: { ...state.voting, activeVote: null, userVote: null },
        }));
      },
      
      updateVoteCount: (voteType: string, count: number) => {
        set(state => {
          if (state.voting.activeVote) {
            const updatedVote = {
              ...state.voting.activeVote,
              votes: { ...state.voting.activeVote.votes, [voteType]: count },
            };
            return {
              voting: { ...state.voting, activeVote: updatedVote },
            };
          }
          return state;
        });
      },
      
      // Game management
      startGame: (gameMode: string) => {
        const { currentRoom } = get();
        if (currentRoom) {
          socketService.startGame(currentRoom.id, gameMode);
        }
        set(state => ({
          game: { ...state.game, isInGame: true, gameMode, phase: 'playing' },
        }));
      },
      
      endGame: () => {
        const { currentRoom } = get();
        if (currentRoom) {
          socketService.endGame(currentRoom.id, { scores: get().game.scores });
        }
        set(state => ({
          game: { ...state.game, isInGame: false, phase: 'waiting' },
        }));
      },
      
      updateScore: (userId: string, score: number) => {
        set(state => ({
          game: {
            ...state.game,
            scores: { ...state.game.scores, [userId]: score },
          },
        }));
      },
      
      setGamePhase: (phase: GameState['phase']) => {
        set(state => ({
          game: { ...state.game, phase },
        }));
      },
      
      setCurrentQuestion: (question: any) => {
        set(state => ({
          game: { ...state.game, currentQuestion: question },
        }));
      },
      
      setTimeRemaining: (time: number) => {
        set(state => ({
          game: { ...state.game, timeRemaining: time },
        }));
      },
      
      // Voice management
      joinVoice: (roomId: string) => {
        socketService.joinVoiceRoom(roomId);
      },
      
      leaveVoice: (roomId: string) => {
        socketService.leaveVoiceRoom(roomId);
        liveKitService.disconnect();
        set(state => ({
          voice: { ...state.voice, isConnected: false, mode: 'disconnected' },
        }));
      },
      
      muteVoice: (muted: boolean) => {
        liveKitService.setMuted(muted);
        set(state => ({
          voice: { ...state.voice, isMuted: muted },
        }));
      },
      
      setVoiceMode: (mode: VoiceState['mode']) => {
        set(state => ({
          voice: { ...state.voice, mode },
        }));
      },
      
      setVoiceError: (error: string | null) => {
        set(state => ({
          voice: { ...state.voice, error },
        }));
      },
      
      // UI management
      toggleVoiceChat: () => {
        set(state => ({
          ui: { ...state.ui, showVoiceChat: !state.ui.showVoiceChat },
        }));
      },
      
      toggleParticipants: () => {
        set(state => ({
          ui: { ...state.ui, showParticipants: !state.ui.showParticipants },
        }));
      },
      
      toggleChat: () => {
        set(state => ({
          ui: { ...state.ui, showChat: !state.ui.showChat },
        }));
      },
      
      toggleVoting: () => {
        set(state => ({
          ui: { ...state.ui, showVoting: !state.ui.showVoting },
        }));
      },
      
      // Socket event handlers
      handleUserJoined: (data: RoomEvent) => {
        const participant: Participant = {
          ...data.user,
          isLeader: false,
          isReady: false,
          isInVoice: false,
          isVoiceMuted: false,
          isSpeaking: false,
          joinTime: new Date(),
        };
        get().actions.addParticipant(participant);
      },
      
      handleUserLeft: (data: RoomEvent) => {
        get().actions.removeParticipant(data.user.id);
      },
      
      handleChatMessage: (data: ChatMessage) => {
        get().actions.addMessage(data);
      },
      
      handleVoteUpdate: (data: VoteData) => {
        // Update vote counts based on the vote data
        const voteType = data.type;
        const currentVote = get().voting.activeVote;
        if (currentVote && currentVote.votes[voteType] !== undefined) {
          get().actions.updateVoteCount(voteType, currentVote.votes[voteType] + 1);
        }
      },
      
      handleVoiceEvent: (data: VoiceEvent) => {
        const { actions } = get();
        const participantId = data.user.id;
        
        switch (data.action) {
          case 'joined':
            actions.updateParticipant(participantId, { isInVoice: true });
            break;
          case 'left':
            actions.updateParticipant(participantId, { isInVoice: false });
            break;
          case 'muted':
            actions.updateParticipant(participantId, { isVoiceMuted: true });
            break;
          case 'unmuted':
            actions.updateParticipant(participantId, { isVoiceMuted: false });
            break;
          case 'speaking':
            actions.updateParticipant(participantId, { isSpeaking: true });
            break;
          case 'stopped-speaking':
            actions.updateParticipant(participantId, { isSpeaking: false });
            break;
        }
      },
    },
  }))
);

// Subscribe to socket events
socketService.setCallbacks({
  onUserJoined: (data) => useMultiplayerStore.getState().actions.handleUserJoined(data),
  onUserLeft: (data) => useMultiplayerStore.getState().actions.handleUserLeft(data),
  onChatMessage: (data) => useMultiplayerStore.getState().actions.handleChatMessage(data),
  onVoteUpdate: (data) => useMultiplayerStore.getState().actions.handleVoteUpdate(data),
  onVoiceUserJoined: (data) => useMultiplayerStore.getState().actions.handleVoiceEvent(data),
  onVoiceUserLeft: (data) => useMultiplayerStore.getState().actions.handleVoiceEvent(data),
  onVoiceUserMuted: (data) => useMultiplayerStore.getState().actions.handleVoiceEvent(data),
  onVoiceUserSpeaking: (data) => useMultiplayerStore.getState().actions.handleVoiceEvent(data),
});

// Subscribe to LiveKit events
liveKitService.setCallbacks({
  onConnectionStateChanged: (state) => {
    const mode = state === 'connected' ? 'livekit' : 'disconnected';
    useMultiplayerStore.getState().actions.setVoiceMode(mode);
  },
  onError: (error) => {
    useMultiplayerStore.getState().actions.setVoiceError(error.message);
  },
});

// Export selectors for common state access
export const useCurrentRoom = () => useMultiplayerStore((state) => state.currentRoom);
export const useParticipants = () => useMultiplayerStore((state) => state.participants);
export const useChat = () => useMultiplayerStore((state) => state.chat);
export const useVoting = () => useMultiplayerStore((state) => state.voting);
export const useGame = () => useMultiplayerStore((state) => state.game);
export const useVoice = () => useMultiplayerStore((state) => state.voice);
export const useUI = () => useMultiplayerStore((state) => state.ui);
export const useMultiplayerActions = () => useMultiplayerStore((state) => state.actions); 
