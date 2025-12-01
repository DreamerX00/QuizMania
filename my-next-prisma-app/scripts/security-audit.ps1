#!/usr/bin/env pwsh
# Security Audit Script for QuizMania
# Run this before deploying to production

Write-Host "🔒 Running Security Audit for QuizMania..." -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# Check 1: Verify no .env files in git
Write-Host "✓ Checking for .env files in git..." -ForegroundColor Yellow
$envFiles = git ls-files | Select-String -Pattern "\.env$|\.env\.local$|\.env\.production$"
if ($envFiles) {
    $issues += "❌ CRITICAL: .env files found in git repository!"
    $envFiles | ForEach-Object { $issues += "  - $_" }
}

# Check 2: Search for hardcoded secrets
Write-Host "✓ Checking for hardcoded secrets..." -ForegroundColor Yellow
$secretPatterns = @(
    'sk-[a-zA-Z0-9]{48}',
    'AIza[a-zA-Z0-9-_]{35}',
    'rzp_(test|live)_[a-zA-Z0-9]{14}',
    'postgres://.*:.*@',
    'mongodb://.*:.*@',
    'Bearer [a-zA-Z0-9]{20,}'
)

foreach ($pattern in $secretPatterns) {
    $secretMatches = Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
        Select-String -Pattern $pattern
    if ($secretMatches) {
        $issues += "❌ CRITICAL: Potential hardcoded secret found matching pattern: $pattern"
        $secretMatches | ForEach-Object { $issues += "  - $($_.Path):$($_.LineNumber)" }
    }
}

# Check 3: Check for debug console.logs
Write-Host "✓ Checking for debug console statements..." -ForegroundColor Yellow
$consoleLogs = Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
    Select-String -Pattern "console\.log\(" |
    Where-Object { $_.Line -notmatch "//.*console\.log" }

if ($consoleLogs.Count -gt 0) {
    $warnings += "⚠️  WARNING: Found $($consoleLogs.Count) console.log statements"
    $warnings += "  Consider removing or replacing with proper logging"
    if ($consoleLogs.Count -le 10) {
        $consoleLogs | ForEach-Object { $warnings += "  - $($_.Path):$($_.LineNumber)" }
    } else {
        $warnings += "  Run: git grep -n 'console.log' src/"
    }
}

# Check 4: Check for TODO/FIXME comments
Write-Host "✓ Checking for TODO/FIXME comments..." -ForegroundColor Yellow
$todos = Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
    Select-String -Pattern "// TODO|// FIXME|// HACK"

if ($todos.Count -gt 0) {
    $warnings += "⚠️  INFO: Found $($todos.Count) TODO/FIXME comments"
    if ($todos.Count -le 5) {
        $todos | ForEach-Object { $warnings += "  - $($_.Path):$($_.LineNumber) - $($_.Line.Trim())" }
    }
}

# Check 5: Verify environment variables
Write-Host "✓ Checking environment variable setup..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $warnings += "⚠️  WARNING: .env.local exists (ensure it's in .gitignore)"
}

if (!(Test-Path "env.example")) {
    $issues += "❌ ERROR: env.example file not found"
}

# Check 6: Check for exposed API endpoints
Write-Host "✓ Checking for debug/test API endpoints..." -ForegroundColor Yellow
$debugEndpoints = Get-ChildItem -Path "src/app/api" -Recurse -Include route.ts,route.js |
    Select-String -Pattern "test|debug|dev|mock" -CaseSensitive:$false

if ($debugEndpoints) {
    $warnings += "⚠️  WARNING: Potential debug/test endpoints found:"
    $debugEndpoints | ForEach-Object { $warnings += "  - $($_.Path)" }
}

# Check 7: Verify security headers
Write-Host "✓ Checking security headers configuration..." -ForegroundColor Yellow
$nextConfig = Get-Content "next.config.mjs" -Raw
if ($nextConfig -notmatch "X-Frame-Options" -or $nextConfig -notmatch "Strict-Transport-Security") {
    $issues += "❌ ERROR: Security headers not properly configured in next.config.mjs"
}

# Check 8: Check for exposed admin routes
Write-Host "✓ Checking admin route protection..." -ForegroundColor Yellow
$adminRoutes = Get-ChildItem -Path "src/app/admin" -Recurse -Include page.tsx,route.ts

foreach ($route in $adminRoutes) {
    $content = Get-Content $route.FullName -Raw
    if ($content -notmatch "requireAdmin|getCurrentUser|getSession") {
        $warnings += "⚠️  WARNING: Admin route may not be protected: $($route.FullName)"
    }
}

# Check 9: Verify Prisma schema
Write-Host "✓ Checking Prisma schema..." -ForegroundColor Yellow
if (Test-Path "prisma/schema.prisma") {
    $schema = Get-Content "prisma/schema.prisma" -Raw
    if ($schema -match 'provider\s*=\s*"sqlite"') {
        $warnings += "⚠️  WARNING: Using SQLite (consider PostgreSQL for production)"
    }
} else {
    $issues += "❌ ERROR: Prisma schema not found"
}

# Check 10: Verify middleware protection
Write-Host "✓ Checking middleware configuration..." -ForegroundColor Yellow
if (Test-Path "src/middleware.ts") {
    $middleware = Get-Content "src/middleware.ts" -Raw
    if ($middleware -notmatch "withAuth" -and $middleware -notmatch "auth\.middleware") {
        $warnings += "⚠️  WARNING: Middleware may not have authentication"
    }
} else {
    $issues += "❌ ERROR: Middleware not found"
}

# Check 11: Check for rate limiting
Write-Host "✓ Checking rate limiting implementation..." -ForegroundColor Yellow
$rateLimitFiles = Get-ChildItem -Path . -Recurse -Include *rate*limit*.ts,*rate*limit*.js
if ($rateLimitFiles.Count -eq 0) {
    $warnings += "⚠️  WARNING: No rate limiting implementation found"
}

# Check 12: Verify .gitignore
Write-Host "✓ Checking .gitignore configuration..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    $requiredPatterns = @(".env", "node_modules")
    foreach ($pattern in $requiredPatterns) {
        if ($gitignore -notmatch [regex]::Escape($pattern)) {
            $issues += "❌ ERROR: .gitignore missing entry: $pattern"
        }
    }
} else {
    $issues += "❌ CRITICAL: .gitignore file not found"
}

# Display Results
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "    SECURITY AUDIT RESULTS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "✅ No critical issues found!" -ForegroundColor Green
} else {
    Write-Host "CRITICAL ISSUES ($($issues.Count)):" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Write-Host ""
}

if ($warnings.Count -eq 0) {
    Write-Host "✅ No warnings!" -ForegroundColor Green
} else {
    Write-Host "WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan

if ($issues.Count -eq 0 -and $warnings.Count -le 5) {
    Write-Host ""
    Write-Host "🎉 Application is ready for production deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review PRODUCTION_DEPLOYMENT.md" -ForegroundColor White
    Write-Host "2. Configure environment variables in Vercel" -ForegroundColor White
    Write-Host "3. Run database migrations on production" -ForegroundColor White
    Write-Host "4. Deploy and test thoroughly" -ForegroundColor White
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  Please address the issues above before deploying to production" -ForegroundColor Yellow
    exit 1
}
