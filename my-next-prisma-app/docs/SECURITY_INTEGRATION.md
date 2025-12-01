# Security Implementation Guide

Complete integration guide for all security utilities in your Next.js 15 + Prisma + Clerk application.

---

## 📦 Required Packages

```bash
npm install sanitize-html dompurify validator rate-limiter-flexible redis file-type
npm install -D @types/sanitize-html @types/dompurify @types/validator
```

---

## 1️⃣ XSS Protection

### Backend Sanitization (`src/utils/sanitize.ts`)

```typescript
import {
  sanitizeText,
  sanitizeRichText,
  sanitizeUrl,
  sanitizeObject,
} from "@/utils/sanitize";

// API route example
export async function POST(request: Request) {
  const body = await request.json();

  // Sanitize all user inputs
  const sanitized = sanitizeObject({
    title: body.title, // Strips ALL HTML
    description: body.description, // Allows safe formatting
    url: body.url, // Validates URL protocol
  });

  // Save sanitized data to database
  const quiz = await prisma.quiz.create({
    data: sanitized,
  });

  return Response.json(quiz);
}
```

### Frontend Sanitization (`src/utils/sanitize-client.ts`)

```tsx
import { SafeHtml, sanitizeHtml } from "@/utils/sanitize-client";

export function QuizCard({ description }: { description: string }) {
  return (
    <div>
      {/* Safe HTML rendering */}
      <SafeHtml html={description} />

      {/* Or manual sanitization */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
    </div>
  );
}
```

---

## 2️⃣ CSRF Protection

### Setup in API Routes

```typescript
import { withCsrfProtection } from "@/lib/csrf";

export const POST = withCsrfProtection(async (request: Request) => {
  // Your protected logic here
  const body = await request.json();

  // Process POST/PUT/DELETE request
  return Response.json({ success: true });
});
```

### Client-Side Usage

```tsx
"use client";

import { useEffect, useState } from "react";

export function CreateQuizForm() {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // Include token
      },
      body: JSON.stringify({ title: "My Quiz" }),
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 3️⃣ Rate Limiting

### Apply to API Routes

```typescript
import { withRateLimit } from "@/lib/rate-limit";

// Protect authentication endpoints
export const POST = withRateLimit("auth")(async (request: Request) => {
  // Login logic - limited to 5 attempts/15min
  return Response.json({ success: true });
});

// Protect AI generation
export const POST = withRateLimit("aiQuiz")(async (request: Request) => {
  // AI quiz generation - limited to 10/hour
  return Response.json({ quiz: generatedQuiz });
});

// Protect file uploads
export const POST = withRateLimit("upload")(async (request: Request) => {
  // File upload - limited to 20/hour
  return Response.json({ uploadedFile });
});
```

### Custom Rate Limit

```typescript
import { createRateLimiter } from "@/lib/rate-limit";

const customLimiter = createRateLimiter({
  points: 50,
  duration: 3600, // 1 hour
  blockDuration: 7200, // 2 hours
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await customLimiter.consume(ip);
    // Process request
  } catch {
    return new Response("Too many requests", { status: 429 });
  }
}
```

---

## 4️⃣ IDOR Protection

### Verify Resource Ownership

```typescript
import { withOwnership } from "@/lib/authorization";
import { auth } from "@clerk/nextjs";

export const PUT = withOwnership(
  "quiz",
  "quizId"
)(async (request: Request) => {
  // User can only edit their own quizzes
  const { userId } = auth();
  const { quizId } = await request.json();

  await prisma.quiz.update({
    where: { id: quizId },
    data: { title: "Updated" },
  });

  return Response.json({ success: true });
});
```

### Role-Based Access Control

```typescript
import { withRole } from "@/lib/authorization";

// Admin-only endpoint
export const DELETE = withRole(["ADMIN"])(async (request: Request) => {
  // Only admins can delete
  return Response.json({ deleted: true });
});
```

### Manual Ownership Check

```typescript
import { verifyResourceOwnership } from "@/lib/authorization";
import { auth } from "@clerk/nextjs";

export async function PUT(request: Request) {
  const { userId } = auth();
  const { quizId } = await request.json();

  const hasAccess = await verifyResourceOwnership(userId, "quiz", quizId);

  if (!hasAccess) {
    return new Response("Forbidden", { status: 403 });
  }

  // Proceed with update
}
```

---

## 5️⃣ File Upload Security

### Validate Uploaded Files

```typescript
import {
  validateUploadedFile,
  generateUploadPath,
} from "@/lib/file-upload-security";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // Validate file
  const validation = await validateUploadedFile(file, "images");

  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  // Save file with safe filename
  const uploadPath = generateUploadPath("images", validation.safeFilename!);

  // Save to storage (example with filesystem)
  // In production, use S3/Cloudinary

  return Response.json({
    path: uploadPath,
    mimeType: validation.detectedMimeType,
  });
}
```

---

## 6️⃣ Open Redirect Protection

### Validate Redirect URLs

```typescript
import { getSafeRedirectUrl } from "@/lib/open-redirect-protection";

export async function POST(request: Request) {
  const { redirect } = await request.json();

  // Sanitize redirect parameter
  const safeRedirect = getSafeRedirectUrl(redirect, "/dashboard");

  // Perform login
  // ...

  return Response.json({ redirectTo: safeRedirect });
}
```

### Server-Side Redirects

```typescript
import { createSafeRedirect } from "@/lib/open-redirect-protection";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirect");

  // Validate and create safe redirect
  return Response.redirect(getSafeRedirectUrl(redirectUrl), 302);
}
```

---

## 7️⃣ SSRF Protection

### Safe External Requests

```typescript
import { safeFetch } from "@/lib/ssrf-protection";

export async function POST(request: Request) {
  const { webhookUrl } = await request.json();

  try {
    // Only allows whitelisted domains
    const response = await safeFetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify({ event: "quiz.completed" }),
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Invalid webhook URL" }, { status: 400 });
  }
}
```

### Validate Webhook URLs

```typescript
import { isValidWebhookUrl } from "@/lib/ssrf-protection";

export async function POST(request: Request) {
  const { webhookUrl } = await request.json();

  const validation = isValidWebhookUrl(webhookUrl);

  if (!validation.valid) {
    return Response.json({ error: validation.reason }, { status: 400 });
  }

  // Save webhook
}
```

---

## 8️⃣ Sensitive Data Protection

### Safe Logging

```typescript
import { safeLog, redactSensitiveData } from "@/lib/sensitive-data-protection";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Safe logging (redacts passwords, tokens, emails)
    safeLog("info", "Quiz creation attempt", { userId: body.userId });

    // Process request
  } catch (error) {
    // Sanitize error before logging
    safeLog("error", "Quiz creation failed", { error });
  }
}
```

### Mask PII in Analytics

```typescript
import { maskPII } from "@/lib/sensitive-data-protection";

export async function trackEvent(user: User) {
  // Mask PII before sending to analytics
  const maskedUser = maskPII({
    email: user.email,
    phone: user.phone,
    name: user.name,
  });

  // Send to analytics service
  analytics.track("quiz.completed", maskedUser);
}
```

---

## 9️⃣ CORS Configuration

### Apply to API Routes

```typescript
import { withCors } from "@/lib/cors-config";

export async function GET(request: Request) {
  return withCors(request, async () => {
    const data = await fetchData();
    return Response.json(data);
  });
}
```

### Restrict to Same-Origin

```typescript
import { requireSameOrigin } from "@/lib/cors-config";

export async function POST(request: Request) {
  // Block cross-origin requests
  const corsError = requireSameOrigin(request);
  if (corsError) return corsError;

  // Process request
}
```

---

## 🔒 Environment Variables

Add to `.env.local`:

```env
# Redis (optional for rate limiting)
REDIS_URL=redis://localhost:6379

# Clerk (authentication)
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Database (Prisma)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Payment
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://quizmania.com
```

---

## ✅ Security Checklist

Before deploying to production:

- [ ] All API routes use `force-dynamic` export
- [ ] CSRF protection on POST/PUT/DELETE routes
- [ ] Rate limiting on auth/AI/upload endpoints
- [ ] IDOR checks on user-owned resources
- [ ] Input sanitization on all user data
- [ ] File uploads validated (MIME type, size)
- [ ] CORS restricted to allowed origins
- [ ] Security headers applied globally
- [ ] Sensitive data redacted from logs
- [ ] HTTPS enforced in production
- [ ] Environment variables secured
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] OWASP ZAP scan completed

---

## 🧪 Testing

```bash
# Check for vulnerabilities
npm audit

# Run security scan (install OWASP ZAP)
zap-cli quick-scan http://localhost:3000

# Test CSRF protection
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  # Should return 403

# Test rate limiting
for i in {1..10}; do curl http://localhost:3000/api/ai-quiz; done
# Should return 429 after threshold
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Clerk Security](https://clerk.com/docs/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
