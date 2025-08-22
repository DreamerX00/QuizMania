#!/usr/bin/env pwsh
# Final Security Verification Script for QuizMania Production

Write-Host "🔐 QuizMania Production Security Verification" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

$issues = @()
$warnings = @()
$passed = @()

# 1. Check if development components are removed
Write-Host "📁 Checking for development components..." -ForegroundColor Cyan
if (Test-Path "src\components\dev") {
    $issues += "❌ Development components still exist: src\components\dev"
} else {
    $passed += "✅ Development components removed"
}

# 2. Check for test APIs
Write-Host "🧪 Checking for test APIs..." -ForegroundColor Cyan
if (Test-Path "src\app\api\test-razorpay") {
    $issues += "❌ Test Razorpay API still exists"
} else {
    $passed += "✅ Test Razorpay API removed"
}

if (Test-Path "src\app\api\test\razorpay") {
    $issues += "❌ Test Razorpay endpoint still exists"
} else {
    $passed += "✅ Test Razorpay endpoint removed"
}

# 3. Check for load testing infrastructure
Write-Host "🚀 Checking for load testing files..." -ForegroundColor Cyan
if (Test-Path "tests\load") {
    $issues += "❌ Load testing infrastructure still exists"
} else {
    $passed += "✅ Load testing infrastructure removed"
}

# 4. Check for console.log statements in source code
Write-Host "🔍 Checking for debug statements..." -ForegroundColor Cyan
$consoleCount = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" src\,ws-server\ | Select-String "console\." | Measure-Object).Count
if ($consoleCount -gt 10) {
    $warnings += "⚠️  Found $consoleCount console statements (review recommended)"
} else {
    $passed += "✅ Console statements within acceptable range ($consoleCount)"
}

# 5. Check for admin authentication
Write-Host "👑 Checking admin security..." -ForegroundColor Cyan
if (Test-Path "src\lib\adminAuth.ts") {
    $passed += "✅ Admin authentication middleware created"
} else {
    $warnings += "⚠️  Admin authentication middleware not found"
}

# 6. Check for production environment template
Write-Host "🌍 Checking production configuration..." -ForegroundColor Cyan
if (Test-Path ".env.production.example") {
    $passed += "✅ Production environment template created"
} else {
    $warnings += "⚠️  Production environment template missing"
}

# 7. Check for hardcoded credentials
Write-Host "🔑 Checking for hardcoded credentials..." -ForegroundColor Cyan
$credentialPatterns = @("password", "secret", "key", "token")
$credentialCount = 0
foreach ($pattern in $credentialPatterns) {
    $count = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" src\ | Select-String "= ['\"]$pattern" | Measure-Object).Count
    $credentialCount += $count
}
if ($credentialCount -gt 0) {
    $warnings += "⚠️  Found $credentialCount potential hardcoded credentials"
} else {
    $passed += "✅ No obvious hardcoded credentials found"
}

# 8. Check Docker configuration
Write-Host "🐳 Checking Docker configuration..." -ForegroundColor Cyan
if ((Test-Path "Dockerfile") -and (Test-Path "docker-compose.yml")) {
    $passed += "✅ Docker configuration present"
} else {
    $warnings += "⚠️  Docker configuration incomplete"
}

# Display Results
Write-Host ""
Write-Host "📋 SECURITY VERIFICATION RESULTS" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ PASSED CHECKS:" -ForegroundColor Green
foreach ($pass in $passed) {
    Write-Host "   $pass" -ForegroundColor White
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  WARNINGS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   $warning" -ForegroundColor White
    }
}

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ CRITICAL ISSUES:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "🚨 PRODUCTION DEPLOYMENT BLOCKED!" -ForegroundColor Red
    Write-Host "   Fix all critical issues before deploying to production." -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "🎉 PRODUCTION SECURITY CHECK PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Pre-deployment checklist:" -ForegroundColor Cyan
    Write-Host "   1. Update .env.production with real credentials" -ForegroundColor White
    Write-Host "   2. Test in staging environment" -ForegroundColor White
    Write-Host "   3. Run npm run build to verify production build" -ForegroundColor White
    Write-Host "   4. Deploy with production environment variables" -ForegroundColor White
    Write-Host "   5. Monitor logs for any issues" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 Security status: READY FOR PRODUCTION" -ForegroundColor Green
}
