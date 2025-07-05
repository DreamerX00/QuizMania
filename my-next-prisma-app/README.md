This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/quizmania"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# WebSocket Server
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# LiveKit Configuration (for VOIP)
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_URL=wss://your-livekit-instance.com

# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id_here

# Cloudinary (for media)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
```

## LiveKit Setup

For voice chat functionality, you need to set up LiveKit:

1. **Get LiveKit credentials:**
   - Sign up at [LiveKit Cloud](https://cloud.livekit.io/) or self-host
   - Get your API key and secret from the dashboard

2. **Configure environment variables:**
   ```env
   LIVEKIT_API_KEY=your_livekit_api_key_here
   LIVEKIT_API_SECRET=your_livekit_api_secret_here
   LIVEKIT_URL=wss://your-livekit-instance.com
   ```

3. **Start the WebSocket server:**
   ```bash
   cd ws-server
   npm install
   npm run dev
   ```

4. **Test voice functionality:**
   - The system automatically falls back to WebRTC if LiveKit is unavailable
   - Check health status at `/api/livekit/health`
   - Force fallback mode for testing: `POST /api/livekit/health` with `{"action": "force-fallback"}`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
