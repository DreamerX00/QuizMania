<div align="center">

# 🎯 QuizMania

### *Next-Generation Interactive Quiz Platform*

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.11-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**A modern, scalable, and feature-rich quiz platform with real-time multiplayer battles, voice chat, AI-powered quiz generation, and enterprise-grade security.**

[🚀 Quick Start](#-quick-start-with-docker) • [📖 Documentation](#-documentation) • [🎮 Features](#-core-features) • [🛠️ Development](#️-development)

</div>

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎮 **Gaming Experience**
- 🏆 Real-time multiplayer quiz battles
- 🎯 15+ question types with animations
- 🗣️ Voice chat powered by LiveKit
- 🌐 WebSocket for live synchronization
- 📊 ELO-based ranking system
- 🎨 Beautiful UI with Tailwind CSS

</td>
<td width="50%">

### 💎 **Premium Features**
- 💳 Razorpay payment integration
- 🔒 Premium quiz marketplace
- 🎁 Subscription management
- 💰 Creator monetization
- 📈 Revenue analytics
- 🔄 Auto-renewal system

</td>
</tr>
<tr>
<td width="50%">

### 🤖 **AI-Powered**
- 🧠 Quiz generation with AI (OpenAI, DeepSeek, Gemini)
- 📝 Smart question suggestions
- 🎓 Difficulty level adaptation
- ✅ Auto-grading system
- 📊 Performance analytics
- 🎯 Personalized recommendations

</td>
<td width="50%">

### 🔐 **Security & Admin**
- 🛡️ Enterprise-grade security
- 👥 Role-based access control
- 📋 Comprehensive audit logs
- 🚫 Anti-cheat mechanisms
- 🔒 Data encryption
- 📊 Admin dashboard with analytics

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

<div align="center">

### **Frontend**
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer)

### **Backend & Database**
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.6-336791?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.11.1-2D3748?style=flat-square&logo=prisma)
![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=flat-square&logo=redis)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-010101?style=flat-square)

### **Authentication & Payments**
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0066CC?style=flat-square)

### **Infrastructure & Monitoring**
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=flat-square&logo=prometheus)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?style=flat-square&logo=grafana)

</div>

---

## � Quick Start with Docker

### 🐳 **Production Deployment** (Recommended)

```bash
# 1️⃣ Clone the repository
git clone https://github.com/DreamerX00/QuizMania.git
cd QuizMania/my-next-prisma-app

# 2️⃣ Configure environment
cp env.example .env
# Edit .env with your credentials

# 3️⃣ Deploy with Docker Compose
docker-compose up -d

# 4️⃣ Run database migrations
docker-compose exec app npx prisma migrate deploy

# 5️⃣ Seed initial data (optional)
docker-compose exec app npm run seed
```

**🌐 Access Your Application:**
- 🎯 **Main App**: http://localhost:3000
- 👨‍💼 **Admin Dashboard**: http://localhost:3000/admin
- 📊 **Grafana Monitoring**: http://localhost:3001 (admin/admin)
- 📈 **Prometheus Metrics**: http://localhost:9090

---

### 💻 **Local Development Setup**

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Configure environment
cp env.example .env
# Update .env with your local credentials

# 3️⃣ Setup database
npx prisma generate
npx prisma migrate dev

# 4️⃣ Seed database (optional)
npm run seed

# 5️⃣ Start development server
npm run dev
```

**Development servers will run on:**
- Next.js App: http://localhost:3000
- WebSocket Server: http://localhost:3001

---

## ⚙️ Environment Configuration

### 📋 **Required Environment Variables**

Create a `.env` file in the root directory with the following configuration:

<details>
<summary><b>🗄️ Database Configuration</b></summary>

```env
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:mydb123@localhost:5432/jeevanDB?schema=public"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mydb123
POSTGRES_DB=jeevanDB
```
</details>

<details>
<summary><b>🔐 Authentication (Clerk)</b></summary>

```env
# Get keys from: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```
</details>

<details>
<summary><b>💳 Payment Gateway (Razorpay)</b></summary>

```env
# Get keys from: https://dashboard.razorpay.com
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PLATFORM_ACCOUNT_ID=acc_xxxx
```
</details>

<details>
<summary><b>🗣️ Real-time & Voice Chat</b></summary>

```env
# WebSocket Server
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_WS_SERVER_URL=http://localhost:4000

# LiveKit (Get from: https://cloud.livekit.io)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-instance.com
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
```
</details>

<details>
<summary><b>🔴 Redis Cache</b></summary>

```env
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379
```
</details>

<details>
<summary><b>🤖 AI Services</b></summary>

```env
# OpenAI (Get from: https://platform.openai.com)
OPENAI_API_KEY=sk-xxxx

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_key

# Google Gemini
GEMINI_API_KEY=your_gemini_key
```
</details>

<details>
<summary><b>☁️ File Storage (Cloudinary)</b></summary>

```env
# Get from: https://cloudinary.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```
</details>

<details>
<summary><b>🛡️ Security & Monitoring</b></summary>

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
WEBHOOK_SECRET=your_webhook_secret
ADMIN_SECRET_KEY=your_admin_secret
```
</details>

> 📝 **Note**: Copy `env.example` to `.env` and update with your actual credentials.

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

---

## �️ Security Features

<table>
<tr>
<td width="50%" valign="top">

### 🔒 **Authentication & Authorization**
- ✅ Clerk-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Session management with Redis
- ✅ JWT token validation
- ✅ Multi-factor authentication support
- ✅ Secure password hashing (bcrypt)

### 🚫 **Attack Prevention**
- ✅ XSS protection with input sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CSRF token validation
- ✅ Rate limiting on API endpoints
- ✅ DDoS protection
- ✅ Content Security Policy (CSP)

</td>
<td width="50%" valign="top">

### 📋 **Audit & Compliance**
- ✅ Comprehensive audit logging
- ✅ Admin action tracking
- ✅ Security event monitoring
- ✅ Data encryption at rest
- ✅ GDPR compliance ready
- ✅ Privacy policy integration

### 🎮 **Anti-Cheat System**
- ✅ Tab switch detection
- ✅ Copy-paste monitoring
- ✅ Time-based validation
- ✅ Browser fingerprinting
- ✅ IP-based fraud detection
- ✅ Manual review queue

</td>
</tr>
</table>

### 🔍 **Security Audit Results**
| Feature | Status | Description |
|---------|--------|-------------|
| 🛡️ Admin Authentication | ✅ Secured | Role-based middleware protection |
| 🚫 Rate Limiting | ✅ Active | API endpoint abuse prevention |
| 🧹 Input Sanitization | ✅ Implemented | XSS and injection prevention |
| 📊 Audit Logging | ✅ Complete | Security event tracking |
| 🐳 Container Security | ✅ Hardened | Isolated Docker deployment |
| 🔐 Data Encryption | ✅ Enabled | At-rest and in-transit |

---

## 🎮 Core Features

### 🏆 **Multiplayer Arena**

<table>
<tr>
<td width="33%">

#### ⚡ Real-time Battles
- Live quiz synchronization
- WebSocket-based gameplay
- Instant score updates
- Turn-based questions
- Live leaderboards

</td>
<td width="33%">

#### 🗣️ Voice Chat
- LiveKit integration
- Push-to-talk support
- Auto-fallback to WebRTC
- Mute/unmute controls
- Voice quality adaptation

</td>
<td width="33%">

#### 📊 Ranking System
- ELO-based matchmaking
- Skill-level progression
- XP and rewards
- Achievement badges
- Global leaderboards

</td>
</tr>
</table>

---

### 📝 **Quiz Management**

<table>
<tr>
<td width="50%">

#### 🤖 **AI-Powered Creation**
- 🧠 OpenAI GPT-4 integration
- 🌟 DeepSeek AI support
- 💎 Google Gemini AI
- 🎯 Smart difficulty adaptation
- ✨ Auto-generated explanations
- 📚 Subject-based categorization

#### 📊 **Advanced Analytics**
- 📈 Performance tracking
- 🎯 Success rate analysis
- ⏱️ Time-to-complete metrics
- 👥 User engagement stats
- 💰 Revenue analytics
- 📉 Difficulty distribution

</td>
<td width="50%">

#### ✏️ **Rich Question Types**
- 📌 Multiple Choice (Single/Multiple)
- ✅ True/False
- 📝 Fill in the Blanks
- 🔢 Ordering/Sequencing
- 💻 Code Output Questions
- 🖼️ Image-based Questions
- 🧩 Matrix Matching
- 🎯 Drag & Drop
- 📄 Paragraph/Essay
- 🎤 Audio/Video Questions
- 📊 Poll Questions
- ⚙️ And more...

#### 💎 **Premium Features**
- 🔒 Locked quiz marketplace
- 💰 Creator monetization
- 🎁 Subscription tiers
- 📊 Revenue sharing
- 🏆 Exclusive content
- ✨ Premium badges

</td>
</tr>
</table>

---

### 🎨 **User Experience**

| Feature | Description |
|---------|-------------|
| 📱 **Responsive Design** | Optimized for mobile, tablet, and desktop |
| 🌓 **Theme Support** | Dark/Light mode with smooth transitions |
| ⚡ **Performance** | Optimized with Next.js 15 and React 19 |
| 🎭 **Animations** | Smooth transitions with Framer Motion |
| ♿ **Accessibility** | WCAG 2.1 AA compliant |
| 🌐 **i18n Ready** | Multi-language support structure |
| 📴 **Offline Support** | PWA capabilities for offline access |
| 🔔 **Notifications** | Real-time push notifications |

---

## 📊 Monitoring & Analytics

### 🏥 **Health Monitoring**

```bash
# 🎯 Check application health
curl http://localhost:3000/api/health

# 🗣️ LiveKit service status
curl http://localhost:3000/api/livekit/health

# 🌐 WebSocket server health
curl http://localhost:3001/healthz

# 🔴 Redis connection status
curl http://localhost:3000/api/redis/health
```

### 📈 **Metrics Dashboard**

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| 📊 **Grafana** | http://localhost:3001 | admin/admin | Visual dashboards |
| 📈 **Prometheus** | http://localhost:9090 | - | Metrics collection |
| 🎯 **App Metrics** | http://localhost:3000/api/metrics | - | Application stats |
| 💰 **Business Analytics** | Admin Dashboard | Admin only | Revenue & engagement |

### 🔍 **Available Metrics**

- ⚡ **Performance**: Response time, throughput, error rates
- 👥 **User Metrics**: Active users, sign-ups, retention
- 🎮 **Game Stats**: Matches played, questions answered, accuracy
- 💰 **Revenue**: Subscriptions, purchases, creator earnings
- 🗣️ **Voice Chat**: Connection quality, active rooms, participants
- 🔐 **Security**: Failed logins, suspicious activity, violations

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

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 📋 **Contribution Process**

1. 🍴 **Fork the repository**
2. 🌿 **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. ✍️ **Make your changes**
   - Follow the coding standards
   - Add tests for new features
   - Update documentation
4. ✅ **Commit your changes**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
5. 🚀 **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. 🎉 **Open a Pull Request**

### � **Coding Standards**

- ✅ Use TypeScript for type safety
- ✅ Follow ESLint and Prettier configurations
- ✅ Write meaningful commit messages (Conventional Commits)
- ✅ Add tests for new features
- ✅ Update documentation as needed

### 🐛 **Reporting Bugs**

Found a bug? Please create an issue with:
- 📝 Clear description of the bug
- 🔄 Steps to reproduce
- 🖥️ Environment details (OS, Browser, Node version)
- 📸 Screenshots if applicable

---

## �📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Free to use, modify, and distribute with attribution
```

---

## 🆘 Support & Resources

<table>
<tr>
<td width="50%">

### 📚 **Documentation**
- 📖 [Setup Guide](./SETUP.md)
- 🔐 [Security Audit](./SECURITY_AUDIT_FIXES.md)
- 🐳 [Docker Setup](./docs/DOCKER_SETUP.md)
- ⚡ [Performance Guide](./docs/PERFORMANCE.md)
- 💻 [Development Guide](./docs/DEVELOPMENT_GUIDE.md)

</td>
<td width="50%">

### 💬 **Community**
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/DreamerX00/QuizMania/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/DreamerX00/QuizMania/discussions)
- 🔒 **Security Issues**: Create private security advisory
- 📧 **Email Support**: support@quizmania.com
- 💬 **Discord Community**: Coming soon!

</td>
</tr>
</table>

---

## 🌟 Acknowledgements

Special thanks to:
- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment tools
- **Prisma Team** for the excellent ORM
- **Clerk** for authentication solutions
- **LiveKit** for real-time voice infrastructure
- All **open-source contributors** who made this possible

---

## 🚀 Deployment Options

<table>
<tr>
<td align="center" width="33%">

### ▲ Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DreamerX00/QuizMania)

**✅ Recommended for:**
- Production deployments
- Auto-scaling
- Zero configuration
- CDN included

</td>
<td align="center" width="33%">

### 🐳 Docker
```bash
docker-compose up -d
```

**✅ Recommended for:**
- Self-hosted solutions
- Full control
- Custom infrastructure
- Private networks

</td>
<td align="center" width="33%">

### ☁️ AWS/GCP/Azure
[Deployment Guide →](./docs/CLOUD_DEPLOYMENT.md)

**✅ Recommended for:**
- Enterprise deployments
- High availability
- Custom requirements
- Compliance needs

</td>
</tr>
</table>

---

<div align="center">

## 💝 Built With Love

**QuizMania** is crafted with passion using cutting-edge technologies

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js) ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

### ⭐ Star us on GitHub — it motivates us a lot!

[Report Bug](https://github.com/DreamerX00/QuizMania/issues) • [Request Feature](https://github.com/DreamerX00/QuizMania/issues) • [Documentation](./docs/)

---

**Made with ❤️ by the QuizMania Team**

Copyright © 2025 QuizMania. All rights reserved.

</div>
