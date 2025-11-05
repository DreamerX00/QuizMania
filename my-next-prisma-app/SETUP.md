# QuizMania Setup Guide

Complete setup instructions for QuizMania - A Next.js quiz platform with real-time multiplayer, voice chat, and premium features.

## 📋 Prerequisites

### Required Software
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 20+ and **npm** 9+
- **Git** for version control
- **PostgreSQL** 15+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

### Required Accounts
- **Clerk** - For authentication ([clerk.com](https://clerk.com))
- **LiveKit** - For voice chat ([livekit.io](https://livekit.io))
- **Razorpay** - For payments ([razorpay.com](https://razorpay.com))
- **Cloudinary** - For media storage ([cloudinary.com](https://cloudinary.com))

## 🚀 Quick Start (Docker - Recommended)

### 1. Repository Setup
```bash
git clone <your-repository-url>
cd my-next-prisma-app
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp env.example .env.local
```

### 3. Configure Environment Variables
Edit `.env.local` with your credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://quizmania:secure_password@localhost:5432/quizmania"
POSTGRES_USER=quizmania
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=quizmania

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
CLERK_SECRET_KEY=sk_live_YOUR_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Real-time Services
NEXT_PUBLIC_WS_URL=ws://localhost:3001
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-livekit-server.com

# Caching & Sessions
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# Payment Processing
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY

# Security
ADMIN_SECRET_KEY=your_32_character_admin_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 4. Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# Check service health
docker-compose ps
```

### 5. Verify Deployment
```bash
# Application health
curl http://localhost:3000/api/health

# Admin access (requires authentication)
open http://localhost:3000/admin

# Monitoring dashboards
open http://localhost:3001  # Grafana (admin/admin)
open http://localhost:9090  # Prometheus
```

For development, you can generate LiveKit keys using:

```bash
# Generate API key and secret
LIVEKIT_API_KEY=$(openssl rand -hex 32)
LIVEKIT_API_SECRET=$(openssl rand -hex 32)

echo "LIVEKIT_API_KEY=$LIVEKIT_API_KEY"
echo "LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET"
```

Add these to your `.env.local` file.

### 4. Start Services with Docker

```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up -d postgres redis livekit ws-server
```

### 5. Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 6. Start the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Manual Setup (without Docker)

### 1. Install Dependencies

```bash
npm install
cd ws-server && npm install && cd ..
```

### 2. Setup PostgreSQL

Install PostgreSQL and create a database:

```sql
CREATE DATABASE quizmania;
CREATE USER quizmania WITH PASSWORD 'quizmania';
GRANT ALL PRIVILEGES ON DATABASE quizmania TO quizmania;
```

### 3. Setup Redis

Install Redis and start the server:

```bash
# On macOS
brew install redis
brew services start redis

# On Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 4. Setup LiveKit (Optional)

For voice chat functionality, you need a LiveKit server:

```bash
# Using Docker
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  -e LIVEKIT_KEYS="your_api_key:your_api_secret" \
  livekit/livekit-server --dev

# Or install locally
go install github.com/livekit/livekit-server@latest
livekit-server --dev
```

### 5. Start WebSocket Server

```bash
cd ws-server
npm run dev
```

### 6. Start Application

```bash
npm run dev
```

## Troubleshooting

### Voice Chat Issues

1. **LiveKit not connecting**: Check that LiveKit server is running and credentials are correct
2. **WebSocket errors**: Ensure the WebSocket server is running on port 4000
3. **Environment variables**: Verify all LiveKit environment variables are set

### Host Controls Issues

1. **Buttons not working**: Check browser console for API errors
2. **Permission denied**: Ensure user has HOST role in the room
3. **Database errors**: Run Prisma migrations and check database connection

### Docker Issues

1. **Port conflicts**: Stop other services using ports 3000, 4000, 5432, 6379, 7880-7882
2. **Volume permissions**: Ensure Docker has permission to create volumes
3. **Network issues**: Check Docker network configuration

## Development

### API Endpoints

- `POST /api/rooms` - Create room
- `GET /api/rooms/[id]` - Get room details
- `PATCH /api/rooms/[id]/lock` - Lock/unlock room
- `PATCH /api/rooms/[id]/quiz-type` - Set quiz type
- `POST /api/rooms/[id]/start-match` - Start match
- `POST /api/rooms/voice/mute` - Mute voice chat

### WebSocket Events

- `room:join` - Join room
- `room:leave` - Leave room
- `voice:join` - Join voice chat
- `voice:leave` - Leave voice chat
- `game:start` - Start game
- `game:vote` - Cast vote

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `LIVEKIT_API_KEY` | LiveKit API key | For voice chat |
| `LIVEKIT_API_SECRET` | LiveKit API secret | For voice chat |
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit server URL | For voice chat |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |

## Production Deployment

For production deployment:

1. Use a production PostgreSQL database
2. Set up Redis cluster or managed Redis service
3. Use LiveKit Cloud or self-hosted LiveKit server
4. Configure proper SSL certificates
5. Set up monitoring and logging
6. Use environment-specific configuration files

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console and server logs
4. Verify environment configuration 