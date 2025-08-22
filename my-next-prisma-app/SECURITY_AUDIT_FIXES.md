# Security Audit - Production Fixes Required

## Critical Actions Before Production Deployment

### 1. Remove Development Components (IMMEDIATE)

```bash
# Delete development-only files
rm -rf src/components/dev/
rm -f src/app/api/test-razorpay/route.ts
rm -f src/app/api/test/razorpay/route.ts
```

### 2. Secure Admin Interface

Add authentication to admin routes:
- `src/app/admin/moderation/page.tsx` - Add Clerk admin role check
- `src/app/admin/game-mode-preview/page.tsx` - Add admin authentication

### 3. Remove Debug Logging

Files requiring console.log removal:
- `ws-server/events/voiceEvents.ts` (17 console statements)
- `ws-server/events/gameEvents.ts` (4 TODO comments)
- `ws-server/events/chatEvents.ts` (1 TODO comment)
- `ws-server/middleware/rateLimiter.ts` (1 console.warn)

### 4. Secure Payment Service

Update `src/services/razorpayService.ts`:
- Remove or secure `getTestCards()` method
- Add production mode checks
- Remove test card hardcoded data

### 5. Environment Security

- Change all default passwords in documentation
- Use secure random passwords in production
- Remove localhost references in production builds

### 6. Remove Load Testing

```bash
# Remove load testing from production
rm -rf tests/load/
```

## Production Environment Variables

```env
# Secure these before deployment
DATABASE_URL="postgresql://quizmania:SECURE_RANDOM_PASSWORD@postgres:5432/quizmania"
GRAFANA_ADMIN_PASSWORD="SECURE_RANDOM_PASSWORD"
POSTGRES_PASSWORD="SECURE_RANDOM_PASSWORD"

# Ensure these are production keys
RAZORPAY_KEY_ID="rzp_live_..." # NOT rzp_test_
RAZORPAY_KEY_SECRET="LIVE_SECRET"
CLERK_SECRET_KEY="PRODUCTION_SECRET"
```

## Automated Security Check Script

Create a pre-deployment security verification script to ensure all dev helpers are removed.

## Risk Assessment

- **HIGH RISK:** Development components, test APIs, admin interfaces
- **MEDIUM RISK:** Debug logging, test credentials, load testing
- **LOW RISK:** Documentation passwords, localhost references

## Next Steps

1. Implement these fixes immediately
2. Create production environment configuration
3. Test deployment in staging environment
4. Run security verification before going live
