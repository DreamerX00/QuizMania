# QuizMania - Next.js Quiz Platform

A modern, scalable quiz platform built with Next.js 15, React 19, TypeScript, and Prisma. Features real-time multiplayer gameplay, voice chat, premium subscriptions, and comprehensive admin controls.

## 🚀 Key Features

- **Real-time Multiplayer Arena** - Live quiz battles with WebSocket support
- **Voice Chat Integration** - LiveKit-powered voice communication
- **Premium Subscriptions** - Razorpay payment integration
- **Admin Dashboard** - Comprehensive moderation and analytics
- **Containerized Deployment** - Docker with production optimizations
- **Security Hardened** - Enterprise-level security measures
- **Monitoring Ready** - Prometheus and Grafana integration

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.3.4, React 19, TypeScript 5
- **Database**: PostgreSQL 15.6 with Prisma 6.11.1 ORM
- **Authentication**: Clerk with role-based access control
- **Real-time**: WebSocket server with LiveKit voice integration
- **Caching**: Redis 7.2 for session management
- **Payments**: Razorpay integration
- **Deployment**: Docker containerization
- **Monitoring**: Prometheus metrics with Grafana dashboards

## 🐳 Quick Start with Docker

### Production Deployment (Recommended)
```bash
# Clone and setup
git clone <repository-url>
cd my-next-prisma-app

# Copy environment file
cp env.example .env.local

# Deploy with Docker
docker-compose up -d

# Access application
# - App: http://localhost:3000
# - Admin: http://localhost:3000/admin
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9090
```

### Development Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

## 🔧 Environment Configuration

Create a `.env.local` file with these required variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/quizmania"
POSTGRES_USER=quizmania
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=quizmania

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Real-time & Voice Chat
NEXT_PUBLIC_WS_URL=ws://localhost:3001
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-livekit-instance.com

# Caching & Sessions
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# Payment Processing (Razorpay)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...

# File Storage
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

# AI Services
OPENAI_API_KEY=sk-...

# Security & Admin
ADMIN_SECRET_KEY=your_admin_secret_key
ENCRYPTION_KEY=your_32_char_encryption_key

# Monitoring & Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔐 Security Features

### Production Security Measures
- **Admin Authentication**: Role-based access control with secure middleware
- **Rate Limiting**: API endpoint protection against abuse
- **Input Sanitization**: XSS and injection prevention
- **Audit Logging**: Comprehensive security event tracking
- **Container Security**: Isolated Docker deployment with least privilege

### Security Audit Results
- ✅ **Development helpers removed** - No debug interfaces in production
- ✅ **Admin routes secured** - Authentication required for sensitive operations
- ✅ **Input validation** - All user inputs sanitized and validated
- ✅ **Environment hardening** - Production-only security configurations

## 🎮 Core Features

### Multiplayer Arena
- Real-time quiz battles with WebSocket synchronization
- Voice chat integration with LiveKit
- Ranking system with ELO-based matchmaking
- Live spectator mode

### Quiz Management
- Dynamic quiz creation with AI assistance
- Template system for reusable content
- Premium quiz marketplace
- Advanced analytics and reporting

### User Experience
- Responsive design for all devices
- Dark/light theme support
- Progressive Web App (PWA) capabilities
- Offline mode for quiz taking

## 📊 Monitoring & Analytics

### Health Monitoring
```bash
# Check application health
curl http://localhost:3000/api/health

# LiveKit service status
curl http://localhost:3000/api/livekit/health

# WebSocket server health
curl http://localhost:3001/healthz
```

### Metrics Dashboard
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Application Metrics**: Real-time performance data
- **Business Metrics**: User engagement and revenue analytics

## 🗣️ Voice Chat Setup

### LiveKit Configuration
1. **Get LiveKit credentials:**
   - Sign up at [LiveKit Cloud](https://cloud.livekit.io/) or self-host
   - Get API key and secret from dashboard

2. **Environment setup:**
   ```env
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_secret
   LIVEKIT_URL=wss://your-livekit-instance.com
   ```

3. **WebSocket server deployment:**
   ```bash
   cd ws-server
   npm install
   npm run build
   npm start
   ```

### Voice Chat Features
- **Automatic Fallback**: WebRTC fallback when LiveKit unavailable
- **Health Monitoring**: Real-time service status checking
- **Admin Controls**: Voice channel management and moderation
- **Quality Adaptation**: Automatic audio quality adjustment

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development servers
npm run dev          # Next.js app (port 3000)
cd ws-server && npm run dev  # WebSocket server (port 3001)
```

### Build & Deploy
```bash
# Production build
npm run build

# Docker build
docker build -t quiz-mania:latest .

# Multi-service deployment
docker-compose up -d
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Load testing (admin only)
npm run test:load
```

## 📁 Project Structure

```
my-next-prisma-app/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   ├── components/             # Reusable UI components
│   ├── lib/                   # Utility libraries
│   ├── services/              # Business logic services
│   ├── middleware/            # Security & auth middleware
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema & migrations
├── ws-server/                 # WebSocket server
├── docs/                      # Documentation
├── infra/                     # Infrastructure configs
├── scripts/                   # Automation scripts
└── docker-compose.yml         # Production deployment
```

## 🚦 API Endpoints

### Public APIs
- `GET /api/health` - Application health status
- `GET /api/quizzes` - Public quiz listings
- `POST /api/auth/login` - User authentication

### Protected APIs
- `POST /api/quizzes/create` - Create new quiz
- `GET /api/users/[id]/stats` - User statistics
- `POST /api/premium/subscribe` - Premium subscription

### Admin APIs (Secured)
- `GET /api/admin/moderation` - Moderation dashboard
- `POST /api/admin/moderation/secure` - Security actions
- `GET /api/admin/moderation/logs` - Audit logs

## 🎯 Production Deployment

### Prerequisites
- Docker & Docker Compose
- PostgreSQL 15+ database
- Redis instance
- LiveKit server (optional)
- Domain with SSL certificate

### Deployment Steps
1. **Environment Setup:**
   ```bash
   cp env.example .env.local
   # Configure all environment variables
   ```

2. **Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Container Deployment:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **Health Verification:**
   ```bash
   curl https://your-domain.com/api/health
   ```

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Security Audit](./SECURITY_AUDIT_FIXES.md) - Security implementation details
- [Docker Guide](./docs/DOCKER_SETUP.md) - Container deployment guide
- [Performance Guide](./docs/PERFORMANCE.md) - Optimization strategies
- [Development Guide](./docs/DEVELOPMENT_GUIDE.md) - Developer workflow

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` directory
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Security**: Email security@your-domain.com for security issues

---

**Built with ❤️ using Next.js 15, React 19, and modern web technologies.**

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
