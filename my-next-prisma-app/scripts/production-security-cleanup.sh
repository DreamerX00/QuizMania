#!/bin/bash

# Production Security Cleanup Script
# Run this script before deploying to production

set -e

echo "🔒 Starting QuizMania Production Security Cleanup..."

# 1. Remove development-only components
echo "📁 Removing development-only files..."
if [ -d "src/components/dev" ]; then
    rm -rf src/components/dev/
    echo "✅ Removed src/components/dev/"
fi

# 2. Remove test payment APIs
echo "💳 Removing test payment endpoints..."
if [ -f "src/app/api/test-razorpay/route.ts" ]; then
    rm -f src/app/api/test-razorpay/route.ts
    echo "✅ Removed test-razorpay API"
fi

if [ -f "src/app/api/test/razorpay/route.ts" ]; then
    rm -f src/app/api/test/razorpay/route.ts
    echo "✅ Removed test razorpay API"
fi

# 3. Remove load testing infrastructure
echo "🧪 Removing load testing files..."
if [ -d "tests/load" ]; then
    rm -rf tests/load/
    echo "✅ Removed load testing infrastructure"
fi

# 4. Clean up compiled WebSocket files (they'll be rebuilt without debug)
echo "🧹 Cleaning WebSocket compiled files..."
if [ -d "ws-server/dist" ]; then
    rm -rf ws-server/dist/
    echo "✅ Removed WebSocket dist/ (will rebuild without debug)"
fi

# 5. Check for remaining security issues
echo "🔍 Checking for remaining security issues..."

# Check for console.log statements
CONSOLE_COUNT=$(grep -r "console\." src/ ws-server/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
    echo "⚠️  Warning: Found $CONSOLE_COUNT console statements in source code"
    echo "   Run: grep -r 'console\.' src/ ws-server/ --include='*.ts' --include='*.tsx'"
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ ws-server/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    echo "⚠️  Warning: Found $TODO_COUNT TODO/FIXME comments"
    echo "   Review these before production deployment"
fi

# Check for test/development keywords
DEV_COUNT=$(grep -r "test.*mode\|development\|localhost" src/ --include="*.ts" --include="*.tsx" | wc -l)
if [ $DEV_COUNT -gt 0 ]; then
    echo "⚠️  Warning: Found $DEV_COUNT development references"
    echo "   Review for production readiness"
fi

echo ""
echo "🎉 Security cleanup completed!"
echo ""
echo "📋 Manual review required:"
echo "   1. Update src/app/admin/ routes with proper authentication"
echo "   2. Remove test card data from src/services/razorpayService.ts"
echo "   3. Update environment variables with production credentials"
echo "   4. Review and remove debug console statements"
echo "   5. Verify admin dashboard has proper role-based access"
echo ""
echo "⚡ Next steps:"
echo "   1. npm run build (to verify build works)"
echo "   2. Review SECURITY_AUDIT_FIXES.md for detailed fixes"
echo "   3. Test in staging environment"
echo "   4. Deploy to production"
