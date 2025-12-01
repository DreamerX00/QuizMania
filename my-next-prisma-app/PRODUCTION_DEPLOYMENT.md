# Production Deployment Checklist for Vercel

This document outlines the security measures and production-ready configurations for deploying QuizMania to Vercel.

## ✅ Security Cleanup Completed

### 1. **Removed Development Debug Endpoints**

- ❌ Deleted `/clear-session` page (development-only)
- ❌ Deleted `/api/auth/clear-sessions` endpoint (development-only)
- ✅ Updated middleware to remove debug routes

### 2. **Console Statements Cleaned**

- ✅ Removed debug console.log from `multiplayer-arena/page.tsx`
- ✅ Removed debug console.logs from `create-quiz/FactoryDialog.tsx`
- ℹ️ Kept error logging with `console.error()` for production monitoring

### 3. **Security Headers Added**

Added comprehensive security headers in `next.config.mjs`:

- ✅ Strict-Transport-Security (HSTS)
- ✅ X-Frame-Options (SAMEORIGIN)
- ✅ X-Content-Type-Options (nosniff)
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 4. **Environment Variables Secured**

- ✅ Verified `env.example` contains only placeholder values
- ✅ No real API keys, secrets, or credentials in codebase
- ✅ All sensitive data uses environment variables

### 5. **Admin Routes Protected**

- ✅ All `/admin/*` routes require authentication via middleware
- ✅ Admin API endpoints use `requireAdmin()` helper
- ✅ Role-based access control (ADMIN/OWNER roles)

### 6. **Rate Limiting Implemented**

- ✅ WebSocket rate limiting via Redis
- ✅ Vote throttling with configurable windows
- ✅ Admin action rate limiting

## 🚀 Vercel Deployment Steps

### 1. **Environment Variables Setup**

In your Vercel project settings, add these environment variables:

#### Database (Prisma Accelerate)

```
# Prisma Accelerate URL (required for caching and connection pooling)
DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=your_accelerate_api_key

# Direct Database URL (required for migrations)
DIRECT_DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Important**: Get your Accelerate API key from [Prisma Data Platform](https://console.prisma.io/)

See [`PRISMA_ACCELERATE_GUIDE.md`](./PRISMA_ACCELERATE_GUIDE.md) for detailed caching strategies.

#### NextAuth

```
NEXTAUTH_SECRET=your_secure_random_secret_here
NEXTAUTH_URL=https://your-domain.com
```

#### Clerk (Authentication)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER=https://your-clerk-instance.clerk.accounts.dev
CLERK_AUTHORIZED_PARTIES=https://your-domain.com
```

#### AI Providers (Optional - for AI Quiz Generation)

```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
```

#### Payment (Razorpay)

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PLATFORM_ACCOUNT_ID=your_platform_account_id
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### WebSocket Server

```
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com
WS_PORT=3001
```

#### LiveKit (Voice Chat)

```
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

#### Redis

```
REDIS_URL=your_redis_instance_url
REDIS_PORT=6379
```

#### Cron Jobs Security

```
CRON_SECRET=your_secure_random_cron_secret
```

Generate with: `openssl rand -base64 32`

This secret protects your cron endpoints from unauthorized access.

#### Configuration

```
VOTE_THROTTLE_WINDOW_MS=2000
ROOM_TTL_MATCH=300
NODE_ENV=production
```

### 2. **Build Configuration**

The project includes a `vercel.json` configuration file with:

- **Build Command**: `prisma generate --no-engine && next build`
- **Framework Preset**: Next.js
- **Regions**: US East (IAD1) - adjust based on your target audience
- **Function Timeouts**:
  - Default API routes: 30 seconds
  - AI quiz generation: 60 seconds (longer for AI processing)
  - Webhooks: 25 seconds
- **Security Headers**: Automatically applied to all routes
- **Cron Jobs**:
  - Session cleanup: Daily at 2:00 AM UTC
  - Weekly leaderboard reset: Sundays at 11:59 PM UTC

**Important**: Update the WebSocket rewrite URL in `vercel.json`:

```json
"rewrites": [
  {
    "source": "/api/ws/:path*",
    "destination": "https://your-ws-server.railway.app/:path*"
  }
]
```

### 3. **Database Setup**

Before deployment:

```bash
# Run migrations on production database
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 4. **WebSocket Server Deployment**

The WebSocket server (`ws-server/`) needs to be deployed separately:

- Deploy to a platform that supports WebSockets (Railway, Render, DigitalOcean App Platform)
- Update `NEXT_PUBLIC_WS_URL` with the deployed WebSocket server URL
- Ensure it has access to the same Redis instance and database

### 5. **Domain Configuration**

1. Add your custom domain in Vercel project settings
2. Update DNS records as instructed by Vercel
3. Update these environment variables with your production domain:
   - `NEXTAUTH_URL=https://your-domain.com`
   - `CLERK_AUTHORIZED_PARTIES=https://your-domain.com`

### 6. **Post-Deployment Verification**

After deployment, verify:

✅ **Authentication Works**

- Test sign in/sign up flows
- Verify JWT tokens are properly issued

✅ **Database Connections**

- Check that API routes can query the database
- Verify Prisma Client is properly initialized

✅ **API Endpoints**

- Test critical API routes (quiz creation, attempts, payments)
- Verify rate limiting is working

✅ **Security Headers**

- Use [Security Headers](https://securityheaders.com/) to verify headers
- Check CSP, HSTS, and other security policies

✅ **WebSocket Connection**

- Test real-time multiplayer features
- Verify voice chat functionality

✅ **Payment Integration**

- Test Razorpay webhook delivery
- Verify payment verification flow

## 🔒 Security Best Practices

### 1. **Secrets Management**

- ✅ Never commit `.env` or `.env.local` files
- ✅ Use Vercel environment variables for all secrets
- ✅ Rotate secrets periodically (especially webhook secrets)

### 2. **Database Security**

- ✅ Use connection pooling (Prisma default)
- ✅ Enable SSL/TLS for database connections
- ✅ Use read replicas for heavy read operations (optional)

### 3. **API Security**

- ✅ All sensitive routes require authentication
- ✅ Admin routes have role-based access control
- ✅ Rate limiting on all public endpoints
- ✅ Input validation on all POST/PUT/PATCH endpoints

### 4. **Content Security**

- ✅ User-generated content is sanitized
- ✅ Image uploads are validated and scanned
- ✅ Quiz content is validated before saving

### 5. **Monitoring**

Set up monitoring for:

- Error tracking (Sentry, LogRocket, etc.)
- Performance monitoring (Vercel Analytics)
- Database query performance (Prisma Pulse)
- Uptime monitoring (UptimeRobot, Pingdom)

## 📊 Performance Optimization

### Already Implemented:

- ✅ Image optimization via Next.js Image component
- ✅ Code splitting and lazy loading
- ✅ API route caching where appropriate
- ✅ Database query optimization with proper indexes
- ✅ Bundle analysis available (`ANALYZE=true npm run build`)

### Recommended for Production:

- Consider enabling ISR (Incremental Static Regeneration) for public pages
- Use CDN for static assets
- Implement Redis caching for frequently accessed data
- Enable Prisma query caching

## 🐛 Known Considerations

### WebSocket Limitations on Vercel

- Vercel serverless functions have a 10-second timeout
- WebSocket connections require a separate server (already implemented in `ws-server/`)
- Consider using Vercel Edge Functions for better WebSocket support (future enhancement)

### Prisma Client Bundle Size

- Prisma Client is bundled with the application
- Consider using `output: 'standalone'` for Docker deployments (already configured)

### LiveKit Voice Chat

- Requires a separate LiveKit server deployment
- Consider using LiveKit Cloud for managed infrastructure

### Monitoring Infrastructure

**Note**: Prometheus/Grafana monitoring has been removed as it's Docker-specific and not compatible with Vercel serverless deployment.

**Recommended Production Monitoring Solutions:**

- **Vercel Analytics** - Built-in, automatic performance monitoring
- **Sentry** - Error tracking, performance monitoring, and release health
  - Install: `npm install @sentry/nextjs`
  - Configure in `sentry.config.js`
- **LogRocket** - Session replay and error tracking
  - Install: `npm install logrocket`
- **Datadog** - Full-stack observability (enterprise option)
- **New Relic** - Application performance monitoring
- **Prisma Pulse** - Real-time database change tracking (optional)

For WebSocket server monitoring (deployed separately):

- Use platform-specific monitoring (Railway, Render, etc.)
- Implement custom metrics endpoint exposing key stats
- Use uptime monitoring services (UptimeRobot, Pingdom)

## 📝 Deployment Commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build for production
npm run build

# Start production server (for testing locally)
npm run start
```

## 🔄 Continuous Deployment

Vercel automatically deploys:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and pushes to other branches

Configure branch protection rules in GitHub:

- Require pull request reviews
- Require status checks to pass
- Enable automatic merge when checks pass

## 📞 Support & Monitoring

### Error Monitoring

Consider integrating:

- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance insights

### Health Checks

Available endpoints:

- `GET /api/health` - Basic health check
- Monitor database connection
- Check Redis connectivity
- Verify WebSocket server status

## ✅ Final Pre-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied to production database
- [ ] WebSocket server deployed and accessible
- [ ] Redis instance provisioned and accessible
- [ ] Custom domain configured (optional)
- [ ] Payment webhooks configured in Razorpay dashboard
- [ ] Clerk production instance configured
- [ ] LiveKit server deployed (if using voice chat)
- [ ] Monitoring and error tracking set up
- [ ] Security headers verified
- [ ] SSL certificate active (Vercel automatic)
- [ ] DNS propagated (if using custom domain)

## 🎉 Post-Deployment

After successful deployment:

1. Test all critical user flows
2. Monitor error rates and performance
3. Set up alerts for downtime or errors
4. Document any production-specific configurations
5. Create runbook for common issues

---

**Last Updated**: November 16, 2025
**Status**: Production Ready ✅
