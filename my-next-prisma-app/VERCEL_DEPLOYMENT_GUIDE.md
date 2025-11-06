# 🚀 QuizMania - Professional Vercel Deployment Guide

**Complete Step-by-Step Guide for Production Deployment**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Architecture Overview](#architecture-overview)
3. [Required External Services](#required-external-services)
4. [Environment Configuration](#environment-configuration)
5. [Code Fixes (Critical)](#code-fixes-critical)
6. [Database Setup](#database-setup)
7. [Vercel Configuration](#vercel-configuration)
8. [External Services Setup](#external-services-setup)
9. [Deployment Steps](#deployment-steps)
10. [Post-Deployment](#post-deployment)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Pre-Deployment Checklist

Before deploying to Vercel, complete these critical fixes:

### Must-Fix Issues

- [ ] Fix 16 Prisma client instantiations
- [ ] Remove/replace console.log statements
- [ ] Add environment variable validation
- [ ] Enable TypeScript/ESLint checking
- [ ] Configure external services (Database, Redis, WebSocket, LiveKit)
- [ ] Set up monitoring (Sentry)
- [ ] Test locally with production build

### Nice-to-Have

- [ ] Add rate limiting
- [ ] Optimize images
- [ ] Set up CDN for static assets
- [ ] Configure custom domain

---

## 🏗️ Architecture Overview

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js App (SSR + API Routes)              │    │
│  │  - Frontend (React Components)                      │    │
│  │  - API Routes (/api/*)                              │    │
│  │  - Server Actions                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ↓                    ↓                    ↓
    ┌──────────┐       ┌──────────────┐    ┌────────────────┐
    │ Vercel   │       │   Clerk      │    │  Cloudinary    │
    │ Postgres │       │   Auth       │    │  (Images)      │
    └──────────┘       └──────────────┘    └────────────────┘
           ↓
    ┌──────────────────────────────────────────────────────┐
    │            EXTERNAL INFRASTRUCTURE                    │
    │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │
    │  │  Upstash │  │  Render  │  │   LiveKit       │   │
    │  │  Redis   │  │  WS      │  │   Cloud         │   │
    │  └──────────┘  │  Server  │  │   (Voice)       │   │
    │                └──────────┘  └─────────────────┘   │
    └──────────────────────────────────────────────────────┘
```

### Why This Architecture?

**Vercel Limitations**:

1. ❌ No WebSocket support (requires separate WS server)
2. ⏱️ 10-second function timeout (not ideal for long connections)
3. 💾 No persistent storage (requires external database)
4. 🚫 No stateful services (Redis must be external)

**Solution**: Hybrid architecture with Vercel + external services

---

## 🛠️ Required External Services

### 1. Database - Vercel Postgres (Recommended)

**Why Vercel Postgres?**

- ✅ Integrated with Vercel dashboard
- ✅ Auto-configures DATABASE_URL
- ✅ Connection pooling built-in
- ✅ 256 MB free tier

**Alternative**: Neon, Supabase, Railway

**Pricing**:

- Free: 256 MB storage, 60 compute hours
- Pro: $20/mo for 512 MB + more compute

---

### 2. Redis - Upstash (Recommended)

**Why Upstash?**

- ✅ Serverless Redis (perfect for Vercel)
- ✅ Pay per request (not per hour)
- ✅ REST API fallback
- ✅ 10K requests/day free

**Pricing**:

- Free: 10K requests/day
- Pay-as-you-go: $0.2 per 100K requests

---

### 3. WebSocket Server - Render (Recommended)

**Why Render?**

- ✅ Easy deployment from Git
- ✅ Free tier available
- ✅ Auto-deploys on push
- ✅ Built-in HTTPS

**Alternatives**: Railway, Fly.io, Heroku

**Pricing**:

- Free: 750 hours/month (sleeps after 15min inactivity)
- Starter: $7/mo (always on)

---

### 4. Voice Chat - LiveKit Cloud (Recommended)

**Why LiveKit Cloud?**

- ✅ Production-ready
- ✅ Global edge network
- ✅ Pay-as-you-go
- ✅ 50 hours/month free

**Pricing**:

- Free: 50 hours/month
- Pay-as-you-go: $0.02/participant-minute

---

### 5. Authentication - Clerk (Current)

**Status**: ✅ Already configured
**Action**: Ensure production keys are set

---

### 6. Payment - Razorpay (Current)

**Status**: ✅ Already configured
**Action**: Switch to live API keys for production

---

### 7. Monitoring - Sentry (Recommended)

**Why Sentry?**

- ✅ Error tracking
- ✅ Performance monitoring
- ✅ User feedback
- ✅ 5K errors/month free

**Pricing**:

- Free: 5K errors/month
- Team: $26/mo for 50K errors

---

### 8. Image Storage - Cloudinary (Current)

**Status**: ✅ Already configured
**Action**: Verify production credentials

---

## 💰 Total Monthly Cost Estimate

| Service              | Tier             | Monthly Cost   |
| -------------------- | ---------------- | -------------- |
| **Vercel**           | Pro (optional)   | $20/mo         |
| **Vercel Postgres**  | Free/Pro         | $0-20/mo       |
| **Upstash Redis**    | Free/PAYG        | $0-10/mo       |
| **Render WebSocket** | Starter          | $7/mo          |
| **LiveKit**          | PAYG             | $0-20/mo       |
| **Sentry**           | Team             | $26/mo         |
| **Clerk**            | Pro              | $25/mo         |
| **Cloudinary**       | Free             | $0             |
| **Razorpay**         | Transaction fees | Variable       |
| **Total**            | -                | **$78-128/mo** |

**Free Tier Setup**: ~$7/mo (only Render WebSocket)

---

## 🔧 Code Fixes (Critical)

### Fix 1: Replace All Prisma Clients

**Problem**: 16 files create new `PrismaClient()` instances.

**Solution**: Run this find-and-replace:

```bash
# In each affected file, replace:
const prisma = new PrismaClient();
# With:
import prisma from '@/lib/prisma';
```

**Affected Files**:

```
src/app/api/quizzes/route.ts
src/app/api/users/[id]/stats/route.ts
src/app/api/report/route.ts
src/app/api/templates/[quizId]/route.ts
src/app/api/quizzes/[quizId]/comments/route.ts
src/app/api/quizzes/published/route.ts
src/app/api/quizzes/create/route.ts
src/app/api/quizzes/templates/route.ts
src/app/api/quizzes/templates/[quizId]/route.ts
src/app/api/quizzes/templates/[quizId]/pin/route.ts
src/app/api/quizzes/templates/[quizId]/publish/route.ts
src/app/api/quizzes/templates/[quizId]/unpublish/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/register/route.ts
```

**Verification**:

```bash
# Search for remaining instances
grep -r "new PrismaClient()" src/app/api/
# Should return 0 results
```

---

### Fix 2: Create Production Logger

Create `src/lib/logger.ts`:

```typescript
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors (captured by Sentry in production)
    console.error(...args);
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

// For production, use structured logging
export const logToSentry = (message: string, context?: any) => {
  if (!isDevelopment && typeof window === "undefined") {
    // Server-side logging to Sentry
    // Sentry.captureMessage(message, { extra: context });
  }
};
```

**Replace All console.log**:

```bash
# Find all console.log statements
grep -rn "console\\.log" src/ --include="*.tsx" --include="*.ts"

# Replace with logger.log
# Do this manually or with sed:
sed -i 's/console\.log/logger.log/g' src/path/to/file.ts
```

---

### Fix 3: Enable Production Type Checking

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // ✅ Enable type checking
  typescript: {
    ignoreBuildErrors: false, // Changed from true
  },

  // ✅ Enable lint checking
  eslint: {
    ignoreDuringBuilds: false, // Changed from true
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Add Clerk images
      },
    ],
  },
};

export default nextConfig;
```

---

### Fix 4: Add Environment Validation

Create `src/lib/env.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("Invalid DATABASE_URL"),

  // Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Missing Clerk publishable key"),
  CLERK_SECRET_KEY: z.string().min(1, "Missing Clerk secret key"),

  // Redis (optional for development)
  REDIS_URL: z.string().url().optional(),

  // Payment (optional - only for premium features)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // LiveKit (optional - only for voice chat)
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_LIVEKIT_URL: z.string().url().optional(),

  // WebSocket
  NEXT_PUBLIC_WS_URL: z.string().url("Invalid WebSocket URL"),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// Validate on startup
try {
  envSchema.parse(process.env);
  console.log("✅ Environment variables validated");
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment validation failed:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }
}

export const env = process.env as z.infer<typeof envSchema>;
```

**Import in `app/layout.tsx`**:

```typescript
import "@/lib/env"; // Validates on app startup
```

---

### Fix 5: Configure Database Connection Pooling

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add direct URL for migrations (bypasses pooling)
  directUrl = env("DIRECT_DATABASE_URL")
}
```

**Update `.env.local`**:

```env
# Pooled connection for Prisma Client (used by app)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connect_timeout=10"

# Direct connection for migrations (used by prisma migrate)
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/db"
```

---

### Fix 6: Add Error Boundary

Create `app/error.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Create `app/global-error.tsx`:

```typescript
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

---

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

**Step 1: Create Database**

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose region (closest to your users)
7. Click "Create"

**Step 2: Connect Database**

Vercel automatically sets these environment variables:

```env
POSTGRES_URL="postgres://..." # Used for connection pooling
POSTGRES_PRISMA_URL="postgres://..." # For Prisma Client
POSTGRES_URL_NON_POOLING="postgres://..." # For migrations
```

**Step 3: Update Prisma Configuration**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL") // Uses pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // For migrations
}
```

**Step 4: Run Migrations**

```bash
# From your local machine
npm install
npx prisma generate
npx prisma migrate deploy

# Or from Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

---

### Option 2: Neon (Alternative)

**Why Neon?**

- ✅ Serverless Postgres
- ✅ Generous free tier (3 GB storage)
- ✅ Autoscaling
- ✅ Branching (database branches!)

**Setup**:

1. Go to [neon.tech](https://neon.tech)
2. Create account
3. Create project
4. Copy connection string

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## ⚙️ Environment Configuration

### Complete .env File for Production

Create `.env.production`:

```env
# ============================================
# DATABASE
# ============================================
# Vercel Postgres (auto-configured by Vercel)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Or use Neon/Other
# DATABASE_URL="postgresql://..."

# ============================================
# AUTHENTICATION (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# ============================================
# REDIS (Upstash)
# ============================================
REDIS_URL="redis://default:xxx@us1-relaxed-phoenix-12345.upstash.io:6379"
UPSTASH_REDIS_REST_URL="https://us1-relaxed-phoenix-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# ============================================
# WEBSOCKET SERVER (Render)
# ============================================
NEXT_PUBLIC_WS_URL="wss://quizmania-ws.onrender.com"
WS_PORT=3001

# ============================================
# VOICE CHAT (LiveKit Cloud)
# ============================================
LIVEKIT_API_KEY="APIxxxxxxxxxxxx"
LIVEKIT_API_SECRET="xxxxxxxxxxxxx"
NEXT_PUBLIC_LIVEKIT_URL="wss://quizmania-xxxxxxx.livekit.cloud"

# ============================================
# PAYMENT (Razorpay)
# ============================================
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxx"
RAZORPAY_PLATFORM_ACCOUNT_ID="acc_xxxxxxxxxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"

# ============================================
# IMAGE STORAGE (Cloudinary)
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="xxxxxxxxxxxx"
CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# MONITORING (Sentry)
# ============================================
SENTRY_DSN="https://xxxxx@xxxxxx.ingest.sentry.io/xxxxxxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxxx.ingest.sentry.io/xxxxxxx"

# ============================================
# APP CONFIGURATION
# ============================================
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://quizmania.yourdomain.com"

# ============================================
# SECURITY
# ============================================
ADMIN_SECRET_KEY="your-32-character-secret-key-here"
ENCRYPTION_KEY="your-32-character-encryption-key"

# ============================================
# OPTIONAL - ROOM CONFIGURATION
# ============================================
ROOM_TTL_MATCH=300
ROOM_TTL_CLAN=2592000
ROOM_TTL_CUSTOM=3600
VOTE_THROTTLE_WINDOW_MS=2000
```

---

## 🌐 Vercel Configuration

### Step 1: Create `vercel.json`

Create `vercel.json` in project root:

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/upload",
      "destination": "/api/upload"
    }
  ]
}
```

---

### Step 2: Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

### Step 3: Create `.vercelignore`

```
node_modules
.next
.env*
!.env.example
*.log
.DS_Store
coverage
.vscode
.idea
docker
docker-compose*.yml
Dockerfile*
docs
tests
user_resources
quiz-content*.json
temp_*.txt
*.md
!README.md
```

---

## 🛠️ External Services Setup

### 1. Upstash Redis Setup

**Step 1: Create Database**

1. Go to [upstash.com](https://upstash.com)
2. Sign up/login
3. Create new database
4. Select region (closest to Vercel deployment)
5. Copy connection details

**Step 2: Get Credentials**

```env
REDIS_URL="redis://default:xxxxx@us1-relaxed-phoenix-12345.upstash.io:6379"
UPSTASH_REDIS_REST_URL="https://us1-relaxed-phoenix-12345.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

**Step 3: Test Connection**

```typescript
// Test in a serverless function
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET() {
  await redis.set("test", "hello");
  const result = await redis.get("test");
  return Response.json({ result });
}
```

---

### 2. Render WebSocket Server Setup

**Step 1: Prepare ws-server**

Update `ws-server/package.json`:

```json
{
  "name": "quizmania-ws-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn index.ts"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Create `ws-server/render.yaml`:

```yaml
services:
  - type: web
    name: quizmania-ws
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: REDIS_URL
        sync: false
      - key: LIVEKIT_API_KEY
        sync: false
      - key: LIVEKIT_API_SECRET
        sync: false
      - key: CLERK_JWT_ISSUER
        sync: false
    healthCheckPath: /health
```

**Step 2: Deploy to Render**

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Select `ws-server` directory
4. Choose "Web Service"
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Add environment variables
8. Deploy

**Step 3: Get WebSocket URL**

```
https://quizmania-ws.onrender.com
wss://quizmania-ws.onrender.com
```

Update Vercel environment:

```env
NEXT_PUBLIC_WS_URL="wss://quizmania-ws.onrender.com"
```

---

### 3. LiveKit Cloud Setup

**Step 1: Create Project**

1. Go to [livekit.io](https://livekit.io)
2. Sign up/login
3. Create new project
4. Note your project details

**Step 2: Get Credentials**

```env
LIVEKIT_API_KEY="APIxxxxxxxxxxxx"
LIVEKIT_API_SECRET="xxxxxxxxxxxxx"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-project.livekit.cloud"
```

**Step 3: Test Connection**

```typescript
import { AccessToken } from "livekit-server-sdk";

const token = new AccessToken(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
  {
    identity: "user-123",
    name: "Test User",
  }
);

token.addGrant({ roomJoin: true, room: "test-room" });
const jwt = token.toJwt();
```

---

### 4. Sentry Setup

**Step 1: Install Sentry**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Step 2: Configure**

The wizard creates:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

Update `next.config.mjs`:

```javascript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // ... your existing config
};

export default withSentryConfig(nextConfig, {
  org: "your-org",
  project: "quizmania",
  silent: true,
});
```

**Step 3: Add Environment Variables**

```env
SENTRY_DSN="https://xxxxx@xxxxxx.ingest.sentry.io/xxxxxxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxxx.ingest.sentry.io/xxxxxxx"
SENTRY_AUTH_TOKEN="your-auth-token"
```

---

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub

```bash
# Commit all fixes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

### Step 2: Connect to Vercel

**Option A: Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub
4. Select `QuizMania` repository
5. Configure as follows:

```
Framework Preset: Next.js
Root Directory: ./my-next-prisma-app
Build Command: npm run vercel-build
Output Directory: .next
Install Command: npm install
```

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd my-next-prisma-app
vercel

# Follow prompts
```

---

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

**Add all variables from `.env.production`**:

1. Database (auto-configured if using Vercel Postgres)
2. Clerk (Authentication)
3. Redis (Upstash)
4. WebSocket URL (Render)
5. LiveKit (Voice)
6. Razorpay (Payments)
7. Cloudinary (Images)
8. Sentry (Monitoring)

**Important**: Select "Production", "Preview", and "Development" for each variable as needed.

---

### Step 4: Deploy Database

```bash
# Pull environment variables locally
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

---

### Step 5: Trigger Deployment

**Option 1**: Push to GitHub (auto-deploys)

```bash
git push origin main
```

**Option 2**: Manual deploy via CLI

```bash
vercel --prod
```

**Option 3**: Redeploy from dashboard

Click "Redeploy" button in Vercel dashboard

---

### Step 6: Verify Deployment

**Check Deployment URL**:

```
https://your-project.vercel.app
```

**Test Endpoints**:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Auth pages
curl https://your-project.vercel.app/login

# Database connection
curl https://your-project.vercel.app/api/quizzes
```

---

## ✅ Post-Deployment

### 1. Configure Custom Domain

**In Vercel Dashboard**:

1. Go to Project Settings → Domains
2. Add your domain: `quizmania.yourdomain.com`
3. Add DNS records as instructed:

```
Type: CNAME
Name: quizmania
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (up to 48 hours)

---

### 2. Set Up SSL Certificate

✅ Automatic: Vercel provides free SSL via Let's Encrypt

---

### 3. Configure Webhooks

**Razorpay Webhook**:

1. Go to Razorpay Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret to env vars

**Clerk Webhook** (if needed):

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`

---

### 4. Enable Monitoring

**Vercel Analytics**:

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Vercel Speed Insights**:

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

### 5. Set Up Cron Jobs (Optional)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Create `/api/cron/cleanup/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Cleanup logic
  // ...

  return NextResponse.json({ success: true });
}
```

---

## 📊 Monitoring & Maintenance

### 1. Vercel Dashboard Monitoring

Monitor in real-time:

- Deployments
- Function invocations
- Edge requests
- Build logs
- Error logs

---

### 2. Sentry Error Tracking

View in Sentry dashboard:

- JavaScript errors
- API errors
- Performance issues
- User feedback

---

### 3. Database Monitoring

**Vercel Postgres**:

- Connection count
- Query performance
- Storage usage

**PgBouncer**:

- Connection pooling stats
- Query queue

---

### 4. Set Up Alerts

**Vercel Alerts**:

1. Deployment failures
2. High error rate
3. Slow function execution

**Sentry Alerts**:

1. New error types
2. Error spike
3. Performance degradation

**Upstash Alerts**:

1. High request count
2. Memory usage

---

## 🐛 Troubleshooting

### Issue 1: Build Failing

**Error**: `Module not found` or `Type errors`

**Solution**:

```bash
# Check build locally first
npm run build

# If successful locally, check Vercel build logs
vercel logs
```

---

### Issue 2: Database Connection Failed

**Error**: `PrismaClient initialization error`

**Solutions**:

1. Verify DATABASE_URL is set
2. Check connection pooling config
3. Ensure migrations ran: `npx prisma migrate deploy`
4. Check Postgres logs in Vercel dashboard

---

### Issue 3: API Routes Timeout

**Error**: `Function execution timeout (10s)`

**Solutions**:

1. Increase timeout in `vercel.json` (max 30s on Pro)
2. Optimize database queries
3. Add caching with Redis
4. Use background jobs for long operations

---

### Issue 4: WebSocket Connection Failed

**Error**: `WebSocket connection to 'wss://...' failed`

**Solutions**:

1. Verify WS server is running on Render
2. Check NEXT_PUBLIC_WS_URL is correct
3. Ensure Render service is on "Starter" plan (not free tier with sleep)
4. Check CORS settings on WS server

---

### Issue 5: Environment Variables Not Working

**Error**: `process.env.XYZ is undefined`

**Solutions**:

1. Check variables are set in Vercel dashboard
2. Ensure `NEXT_PUBLIC_` prefix for client-side vars
3. Redeploy after changing env vars
4. Check variable encryption (click "Show" to verify)

---

### Issue 6: Images Not Loading

**Error**: `Image optimization error`

**Solutions**:

1. Add domain to `next.config.mjs` remotePatterns
2. Verify Cloudinary credentials
3. Check image URLs are accessible
4. Use Next.js Image component correctly

---

## 🎓 Best Practices

### 1. Use Environment-Specific Configs

```
.env.local          # Local development
.env.production     # Production (Vercel)
.env.preview        # Preview deployments
```

---

### 2. Enable Preview Deployments

Every PR automatically deploys to unique URL:

```
https://your-project-git-feature-branch.vercel.app
```

---

### 3. Use Vercel Edge Functions for Speed

Move frequently-accessed data to Edge:

```typescript
// app/api/popular-quizzes/route.ts
export const runtime = "edge";
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  // Fetch popular quizzes
  return Response.json(data);
}
```

---

### 4. Implement Caching Strategy

```typescript
// Redis caching example
import { redis } from "@/lib/redis";

export async function GET() {
  const cacheKey = "popular-quizzes";

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return Response.json(cached);

  // Fetch from database
  const data = await prisma.quiz.findMany();

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(data));

  return Response.json(data);
}
```

---

### 5. Use Incremental Static Regeneration (ISR)

```typescript
// app/quiz/[id]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function QuizPage({ params }) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: params.id },
  });

  return <QuizView quiz={quiz} />;
}
```

---

## 📈 Performance Optimization

### 1. Enable Compression

Vercel automatically enables:

- Gzip compression
- Brotli compression
- Edge caching

---

### 2. Optimize Images

```typescript
// Use Next.js Image with automatic optimization
<Image
  src={url}
  alt="Quiz"
  width={400}
  height={300}
  quality={85}
  placeholder="blur"
  loading="lazy"
/>
```

---

### 3. Use React Server Components

```typescript
// app/quizzes/page.tsx
// ✅ Server Component (default in App Router)
export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany();
  return <QuizList quizzes={quizzes} />;
}
```

---

### 4. Implement Streaming

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <RecentActivity />
      </Suspense>
    </>
  );
}
```

---

## 🎯 Deployment Checklist

### Pre-Deployment

- [ ] Fix all Prisma client instances
- [ ] Remove console.log statements
- [ ] Enable TypeScript/ESLint checks
- [ ] Add environment validation
- [ ] Set up error boundaries
- [ ] Configure connection pooling
- [ ] Test production build locally

### External Services

- [ ] Set up Vercel Postgres
- [ ] Configure Upstash Redis
- [ ] Deploy WebSocket server to Render
- [ ] Set up LiveKit Cloud
- [ ] Configure Sentry monitoring
- [ ] Verify Clerk production keys
- [ ] Update Razorpay to live keys
- [ ] Check Cloudinary production settings

### Vercel Configuration

- [ ] Create vercel.json
- [ ] Update package.json scripts
- [ ] Create .vercelignore
- [ ] Set all environment variables
- [ ] Configure custom domain
- [ ] Enable SSL certificate
- [ ] Set up webhooks

### Post-Deployment

- [ ] Verify all API endpoints
- [ ] Test authentication flow
- [ ] Test payment processing
- [ ] Test WebSocket connections
- [ ] Test voice chat
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Set up alerts

---

## 🆘 Support Resources

### Official Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Clerk on Vercel](https://clerk.com/docs/deployments/deploy-to-vercel)

### Community Support

- [Vercel Discord](https://vercel.com/discord)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [Prisma Discord](https://pris.ly/discord)

---

## 📝 Conclusion

Deploying QuizMania to Vercel requires:

1. **Critical Code Fixes** (4-6 hours)
2. **External Services Setup** (2-3 hours)
3. **Vercel Configuration** (1-2 hours)
4. **Testing & Monitoring** (2-3 hours)

**Total Estimated Time**: 9-14 hours for complete setup

**Monthly Cost**: $78-128/mo for production-ready infrastructure

**Alternative**: Use Docker deployment on VPS for ~$20/mo if you prefer single-server architecture

---

_Guide Version: 1.0_  
_Last Updated: January 2025_  
_Author: GitHub Copilot_
