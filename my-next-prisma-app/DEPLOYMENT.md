# QuizMania Production Deployment Guide

## Prerequisites

- [x] Vercel account created
- [x] GitHub repository connected to Vercel
- [x] Neon PostgreSQL database created
- [ ] Upstash Redis instance created
- [ ] WebSocket server deployed (Railway/Render/Fly.io)
- [ ] Google OAuth credentials obtained
- [ ] At least one AI API key (Gemini recommended)

---

## Part 1: Deploy WebSocket Server First

The WebSocket server must be deployed **before** the main Next.js app.

### Option A: Deploy to Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub repo
3. Select the `ws-server` folder as root directory
4. Set environment variables:
   ```
   PORT=3001
   REDIS_URL=rediss://...
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   ```
5. Deploy and note the URL (e.g., `https://your-ws-server.up.railway.app`)

### Option B: Deploy to Render

1. Go to [Render.com](https://render.com)
2. New Web Service → Connect repository
3. Set root directory: `ws-server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables (same as Railway)
7. Deploy and note the URL

---

## Part 2: Configure Vercel Environment Variables

Go to your Vercel project: **Settings → Environment Variables**

### Required Variables

Add these for **Production**, **Preview**, and **Development** environments:

#### Database (Neon)

```
DATABASE_URL = postgresql://user:password@host.neon.tech:5432/db?sslmode=require&pgbouncer=true
DIRECT_DATABASE_URL = postgresql://user:password@host.neon.tech:5432/db?sslmode=require
```

#### Authentication

```
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
NEXTAUTH_URL = https://your-app.vercel.app
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
GOOGLE_CLIENT_ID = your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-your-secret
```

#### Redis (Upstash)

```
REDIS_URL = rediss://:password@your-redis.upstash.io:6379
```

#### AI Services (Gemini recommended)

```
GEMINI_API_KEY = AIzaSy-your_key
DEEPSEEK_API_KEY = sk-your_key
OPENAI_API_KEY = sk-proj-your_key (optional)
```

#### WebSocket Server

```
NEXT_PUBLIC_WS_URL = https://your-ws-server.railway.app
NEXT_PUBLIC_WS_SERVER_URL = https://your-ws-server.railway.app
```

### Optional Variables

#### File Storage

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_key
CLOUDINARY_API_SECRET = your_secret
```

#### Payment (Razorpay)

```
RAZORPAY_KEY_ID = rzp_live_your_key
RAZORPAY_KEY_SECRET = your_secret
RAZORPAY_WEBHOOK_SECRET = your_webhook_secret
```

#### Voice Chat (LiveKit)

```
NEXT_PUBLIC_LIVEKIT_URL = wss://your-project.livekit.cloud
LIVEKIT_API_KEY = your_key
LIVEKIT_API_SECRET = your_secret
```

#### Other

```
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
```

---

## Part 3: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add Authorized JavaScript origins:
   ```
   https://your-app.vercel.app
   ```
5. Add Authorized redirect URIs:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
6. Copy Client ID and Secret to Vercel environment variables

---

## Part 4: Deploy to Vercel

### Method 1: Automatic Deployment (Recommended)

1. Push your code to GitHub:

   ```bash
   git add .
   git commit -m "Production configuration complete"
   git push origin main
   ```

2. Vercel will automatically:
   - Install dependencies (`npm ci`)
   - Generate Prisma client (`postinstall` script)
   - Run migrations (`prisma migrate deploy`)
   - Build Next.js app (`next build`)
   - Deploy to production

### Method 2: Manual Deployment via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Part 5: Post-Deployment Verification

### 1. Check Build Logs

- Go to Vercel project → Deployments → Latest deployment
- Verify no errors in build logs
- Confirm migrations ran successfully

### 2. Verify Database

```bash
# Run Prisma Studio to check tables
npx prisma studio
```

### 3. Test Core Features

#### Authentication

- Visit `/auth/signin`
- Test Google OAuth login
- Verify user created in database

#### AI Quiz Generation

- Go to quiz creation page
- Generate a quiz with Gemini provider
- Verify questions appear correctly

#### WebSocket Connection

- Open browser DevTools → Network tab
- Filter by WS
- Verify WebSocket connects to your deployed WS server
- Check console for connection success messages

#### Redis

- Check Upstash dashboard for connection activity
- Verify no connection errors in Vercel logs

### 4. Monitor Production

- Vercel Analytics: Check traffic and performance
- Upstash: Monitor Redis operations
- Neon: Check database queries and connections

---

## Part 6: Domain Configuration (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `quizmania.com`)
3. Update DNS records as instructed by Vercel
4. Update environment variables:
   ```
   NEXTAUTH_URL = https://quizmania.com
   NEXT_PUBLIC_APP_URL = https://quizmania.com
   ```
5. Update Google OAuth redirect URIs

---

## Part 7: Enable GitHub Actions (Optional)

If you want automated testing before deployment:

1. Add GitHub secrets:

   - Go to repository → Settings → Secrets and variables → Actions
   - Add secrets:
     ```
     VERCEL_TOKEN = (from Vercel account settings)
     VERCEL_ORG_ID = (from vercel.json or .vercel/project.json)
     VERCEL_PROJECT_ID = (from vercel.json or .vercel/project.json)
     ```

2. Uncomment deployment jobs in `.github/workflows/ci.yml`:
   ```yaml
   # Remove comments from:
   # - deploy-preview job
   # - deploy-production job
   ```

---

## Troubleshooting

### Build Fails: "Prisma Client not generated"

**Solution**: Prisma should auto-generate via `postinstall` script. If it fails, check Vercel build logs.

### Database Connection Errors

**Solution**: Verify `DATABASE_URL` uses `pgbouncer=true` and `sslmode=require` parameters.

### WebSocket Connection Refused

**Solution**:

1. Check WebSocket server is deployed and running
2. Verify `NEXT_PUBLIC_WS_URL` matches your deployed WS server URL
3. Check CORS settings in `ws-server/index.ts`

### Google OAuth Fails

**Solution**:

1. Verify redirect URI matches exactly: `https://your-app.vercel.app/api/auth/callback/google`
2. Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set correctly
3. Ensure Google OAuth credentials are for correct environment (production)

### AI Quiz Generation Fails

**Solution**:

1. Check AI provider API keys are valid
2. Verify Gemini API key has quota remaining
3. Check Vercel function logs for detailed error messages
4. Fallback providers: DeepSeek → OpenAI → Anthropic

### Redis Connection Issues

**Solution**:

1. Verify Upstash Redis URL uses `rediss://` (with SSL)
2. Check Upstash dashboard for connection errors
3. Ensure Redis is in same region as Vercel deployment (or nearby)

---

## Performance Optimization

### Database

- ✅ Connection pooling enabled via Prisma Accelerate
- ✅ Migrations run automatically on deployment
- ✅ Direct URL configured for migrations

### Caching

- ✅ Redis configured for session storage
- ✅ Next.js ISR (Incremental Static Regeneration) enabled

### API Routes

- ✅ AI endpoints have 60s timeout (configured in `vercel.json`)
- ✅ Standard endpoints have 30s timeout

### Cron Jobs

- ✅ Daily session cleanup (2:00 AM UTC)
- ✅ Weekly leaderboard reset (Sunday 23:59 UTC)

---

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is cryptographically secure (32+ characters)
- [ ] All API keys stored as Vercel environment variables (not in code)
- [ ] Google OAuth redirect URIs restricted to production domain
- [ ] Database uses SSL (`sslmode=require`)
- [ ] Redis uses TLS (`rediss://`)
- [ ] CSP headers configured (check `vercel.json`)
- [ ] `.env` files excluded from Git (check `.gitignore`)

---

## Cost Estimation (Monthly)

| Service       | Plan          | Cost                    |
| ------------- | ------------- | ----------------------- |
| Vercel        | Pro           | $20 (or Free for hobby) |
| Neon          | Launch        | $19 (or Free for 0.5GB) |
| Upstash Redis | Pay-as-you-go | ~$5-15                  |
| Railway (WS)  | Hobby         | $5                      |
| Google OAuth  | Free          | $0                      |
| Gemini API    | Pay-per-token | ~$10-50                 |
| **Total**     |               | **~$60-110/month**      |

**Free Tier Option**: ~$10-50/month (Vercel Free + Neon Free + Upstash Free + Railway Free trial)

---

## Support Resources

- **Vercel**: https://vercel.com/docs
- **Neon**: https://neon.tech/docs
- **Upstash**: https://upstash.com/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org/getting-started/introduction
- **Railway**: https://docs.railway.app

---

## Next Steps

1. ✅ Deploy WebSocket server
2. ✅ Add all environment variables to Vercel
3. ✅ Configure Google OAuth
4. ✅ Push to GitHub (triggers deployment)
5. ✅ Verify deployment successful
6. ✅ Test all core features
7. [ ] Set up monitoring (Sentry, LogRocket, etc.)
8. [ ] Configure custom domain
9. [ ] Enable GitHub Actions for CI/CD

**Deployment Complete! 🎉**
