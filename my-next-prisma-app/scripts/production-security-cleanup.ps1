# Production Security Cleanup Script for Windows
# Run this script before deploying to production

Write-Host "🔒 Starting QuizMania Production Security Cleanup..." -ForegroundColor Yellow

# 1. Remove development-only components
Write-Host "📁 Removing development-only files..." -ForegroundColor Cyan
if (Test-Path "src\components\dev") {
    Remove-Item -Recurse -Force "src\components\dev"
    Write-Host "✅ Removed src\components\dev\" -ForegroundColor Green
}

# 2. Remove test payment APIs
Write-Host "💳 Removing test payment endpoints..." -ForegroundColor Cyan
if (Test-Path "src\app\api\test-razorpay\route.ts") {
    Remove-Item -Force "src\app\api\test-razorpay\route.ts"
    Write-Host "✅ Removed test-razorpay API" -ForegroundColor Green
}

if (Test-Path "src\app\api\test\razorpay\route.ts") {
    Remove-Item -Force "src\app\api\test\razorpay\route.ts"
    Write-Host "✅ Removed test razorpay API" -ForegroundColor Green
}

# 3. Remove load testing infrastructure
Write-Host "🧪 Removing load testing files..." -ForegroundColor Cyan
if (Test-Path "tests\load") {
    Remove-Item -Recurse -Force "tests\load"
    Write-Host "✅ Removed load testing infrastructure" -ForegroundColor Green
}

# 4. Clean up compiled WebSocket files
Write-Host "🧹 Cleaning WebSocket compiled files..." -ForegroundColor Cyan
if (Test-Path "ws-server\dist") {
    Remove-Item -Recurse -Force "ws-server\dist"
    Write-Host "✅ Removed WebSocket dist\ (will rebuild without debug)" -ForegroundColor Green
}

# 5. Check for remaining security issues
Write-Host "🔍 Checking for remaining security issues..." -ForegroundColor Cyan

# Check for console.log statements
$consoleFiles = Get-ChildItem -Recurse -Include "*.ts","*.tsx" src\,ws-server\ | Select-String "console\." | Measure-Object
if ($consoleFiles.Count -gt 0) {
    Write-Host "⚠️  Warning: Found $($consoleFiles.Count) console statements in source code" -ForegroundColor Yellow
    Write-Host "   Run: Get-ChildItem -Recurse -Include '*.ts','*.tsx' src\,ws-server\ | Select-String 'console\.'" -ForegroundColor Yellow
}

# Check for TODO/FIXME comments
$todoFiles = Get-ChildItem -Recurse -Include "*.ts","*.tsx" src\,ws-server\ | Select-String "TODO|FIXME" | Measure-Object
if ($todoFiles.Count -gt 0) {
    Write-Host "⚠️  Warning: Found $($todoFiles.Count) TODO/FIXME comments" -ForegroundColor Yellow
    Write-Host "   Review these before production deployment" -ForegroundColor Yellow
}

# Check for development keywords
$devFiles = Get-ChildItem -Recurse -Include "*.ts","*.tsx" src\ | Select-String "test.*mode|development|localhost" | Measure-Object
if ($devFiles.Count -gt 0) {
    Write-Host "⚠️  Warning: Found $($devFiles.Count) development references" -ForegroundColor Yellow
    Write-Host "   Review for production readiness" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Security cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Manual review required:" -ForegroundColor Cyan
Write-Host "   1. Update src\app\admin\ routes with proper authentication" -ForegroundColor White
Write-Host "   2. Remove test card data from src\services\razorpayService.ts" -ForegroundColor White
Write-Host "   3. Update environment variables with production credentials" -ForegroundColor White
Write-Host "   4. Review and remove debug console statements" -ForegroundColor White
Write-Host "   5. Verify admin dashboard has proper role-based access" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Next steps:" -ForegroundColor Cyan
Write-Host "   1. npm run build (to verify build works)" -ForegroundColor White
Write-Host "   2. Review SECURITY_AUDIT_FIXES.md for detailed fixes" -ForegroundColor White
Write-Host "   3. Test in staging environment" -ForegroundColor White
Write-Host "   4. Deploy to production" -ForegroundColor White
