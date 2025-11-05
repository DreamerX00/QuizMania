# Voice Chat & WebSocket Integration

This document describes the implementation of real-time voice chat and WebSocket communication in the QuizMania Multiplayer Arena.

## 🏗️ Architecture Overview

### Components
1. **Socket.IO Client** (`src/lib/socket.ts`) - Handles all real-time communication
2. **LiveKit Client** (`src/lib/livekit.ts`) - Manages voice chat with WebRTC fallback
3. **Voice Chat UI** (`src/components/voice/VoiceChat.tsx`) - User interface for voice controls
4. **Multiplayer Store** (`src/store/multiplayer.ts`) - Zustand state management
5. **WebSocket Server** (`ws-server/`) - Backend real-time server

## 🔌 Socket.IO Integration

### Features
- **Real-time room management** - Join/leave rooms, participant updates
- **Chat system** - Public, private, clan, and friend messaging
- **Voting system** - Real-time vote casting and results
- **Game state sync** - Game start/end, score updates, phase changes
- **Voice signaling** - LiveKit token exchange, fallback activation
- **Moderation tools** - Mute, block, report users
- **Heartbeat system** - Connection health monitoring

### Usage
```typescript
import { useSocket } from '@/lib/socket';

const { socketService, connect, disconnect, isConnected } = useSocket();

// Connect to WebSocket server
await connect(userId, token);

// Join a room
socketService.joinRoom(roomId, 'public');

// Send a chat message
socketService.sendChatMessage({
  type: 'public',
  message: 'Hello everyone!',
  roomId: 'room-123'
});

// Cast a vote
socketService.castVote({
  roomId: 'room-123',
  vote: { type: 'option-a' },
  mode: 'default',
  type: 'option-a'
});
```

## 🎤 LiveKit Voice Integration

### Features
- **Crystal-clear voice** - LiveKit Cloud with WebRTC fallback
- **Push-to-talk** - Spacebar activation with visual feedback
- **Participant management** - See who's speaking, muted status
- **Connection monitoring** - Health checks, automatic fallback
- **Noise suppression** - Built-in audio processing
- **Cross-platform** - Works on web, mobile, desktop

### Usage
```typescript
import { useLiveKit } from '@/lib/livekit';

const { 
  connect, 
  disconnect, 
  setMuted, 
  setPushToTalk,
  isConnected,
  isMuted,
  isSpeaking 
} = useLiveKit();

// Connect to voice room
await connect(token, roomName);

// Toggle mute
await setMuted(true);

// Enable push-to-talk
await setPushToTalk(true);
```

## 🎮 Voice Chat UI Component

### Features
- **Connection status** - LiveKit/WebRTC/Disconnected indicators
- **Participant list** - Real-time voice activity, mute status
- **Settings panel** - Push-to-talk toggle, voice activity indicator
- **Error handling** - Graceful fallback, user notifications
- **Responsive design** - Works on all screen sizes

### Props
```typescript
interface VoiceChatProps {
  roomId: string;
  className?: string;
}
```

### Usage
```tsx
import VoiceChat from '@/components/voice/VoiceChat';

<VoiceChat roomId="room-123" className="w-80" />
```

## 📊 State Management (Zustand)

### Store Structure
```typescript
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
}
```

### Usage
```typescript
import { 
  useCurrentRoom, 
  useParticipants, 
  useChat, 
  useVoice,
  useMultiplayerActions 
} from '@/store/multiplayer';

const currentRoom = useCurrentRoom();
const participants = useParticipants();
const chat = useChat();
const voice = useVoice();
const actions = useMultiplayerActions();

// Send a message
actions.sendMessage('Hello!', 'public', roomId);

// Join voice
actions.joinVoice(roomId);

// Cast a vote
actions.castVote('option-a');
```

## ⚙️ Configuration

### Environment Variables
```bash
# WebSocket Server
NEXT_PUBLIC_WS_URL=http://localhost:3001

# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# Room Configuration
ROOM_TTL_MATCH=300
ROOM_TTL_CLAN=2592000
ROOM_TTL_CUSTOM=3600
```

### Dependencies
```json
{
  "socket.io-client": "^4.7.4",
  "livekit-client": "^1.15.5",
  "zustand": "^4.4.7",
  "@types/socket.io-client": "^3.0.0"
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install socket.io-client livekit-client zustand @types/socket.io-client
```

### 2. Set Environment Variables
Copy the example environment variables and configure your services.

### 3. Start WebSocket Server
```bash
cd ws-server
npm install
npm run dev
```

### 4. Start LiveKit Server
Set up LiveKit Cloud or run locally following their documentation.

### 5. Initialize in Component
```tsx
import { useSocket } from '@/lib/socket';
import { useMultiplayerStore } from '@/store/multiplayer';

const { connect } = useSocket();
const actions = useMultiplayerStore(state => state.actions);

useEffect(() => {
  if (userId) {
    connect(userId, token);
  }
}, [userId]);
```

## 🔧 WebSocket Server Setup

### Features
- **TypeScript** - Full type safety
- **Redis adapter** - Multi-instance scaling
- **Rate limiting** - DDoS protection
- **Authentication** - Clerk integration
- **Health monitoring** - Prometheus metrics
- **Docker support** - Easy deployment

### Events Handled
- `room:join` / `room:leave` - Room management
- `chat:send` - Message broadcasting
- `game:vote` - Vote casting
- `game:start` / `game:end` - Game state
- `voice:join` / `voice:leave` - Voice signaling
- `webrtc:signaling` - Fallback communication

## 🎯 Voice Features

### LiveKit Integration
- **Automatic fallback** - WebRTC if LiveKit fails
- **Push-to-talk** - Spacebar activation
- **Voice activity** - Real-time speaking indicators
- **Participant list** - Mute status, speaking indicators
- **Connection health** - Automatic reconnection

### WebRTC Fallback
- **Peer-to-peer** - Direct connections
- **Signaling** - Via Socket.IO
- **Audio only** - Optimized for voice
- **Automatic switching** - Seamless transition

## 🔒 Security & Performance

### Security
- **Authentication** - Clerk token validation
- **Rate limiting** - Per-user message limits
- **Input validation** - Message sanitization
- **E2EE support** - Optional encryption

### Performance
- **Connection pooling** - Efficient resource usage
- **Message batching** - Reduced network overhead
- **Lazy loading** - Components load on demand
- **Memory management** - Automatic cleanup

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check WebSocket server is running
   - Verify environment variables
   - Check network connectivity

2. **Voice Not Working**
   - Ensure microphone permissions
   - Check LiveKit credentials
   - Verify browser WebRTC support

3. **Messages Not Sending**
   - Check Socket.IO connection
   - Verify room membership
   - Check rate limiting

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'socket.io-client,livekit-client');

// Check connection status
console.log('Socket connected:', socketService.isConnected());
console.log('Voice connected:', liveKitService.isConnected());
```

## 📈 Monitoring

### Metrics
- **Connection count** - Active users
- **Message rate** - Chat activity
- **Voice quality** - Latency, packet loss
- **Error rates** - Failed operations

### Health Checks
- **WebSocket ping** - Connection latency
- **LiveKit health** - Voice service status
- **Redis connectivity** - Cache health

## 🔄 Future Enhancements

### Planned Features
- **Video support** - Screen sharing, webcam
- **Recording** - Match replays
- **AI moderation** - Content filtering
- **Advanced audio** - Spatial audio, 3D positioning
- **Mobile optimization** - Native app integration

### Scalability
- **Horizontal scaling** - Multiple WebSocket servers
- **Load balancing** - Geographic distribution
- **CDN integration** - Global voice servers
- **Database sharding** - Chat history scaling 