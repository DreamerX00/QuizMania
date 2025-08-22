# QuizMania Production Security Verification

Write-Host "=== QuizMania Production Security Check ===" -ForegroundColor Yellow

$issues = @()
$passed = @()

# Check if development components are removed
if (Test-Path "src\components\dev") {
    $issues += "Development components still exist"
} else {
    $passed += "Development components removed"
}

# Check for test APIs
if (Test-Path "src\app\api\test-razorpay") {
    $issues += "Test Razorpay API still exists"
} else {
    $passed += "Test Razorpay API removed"
}

if (Test-Path "src\app\api\test\razorpay") {
    $issues += "Test Razorpay endpoint still exists"  
} else {
    $passed += "Test Razorpay endpoint removed"
}

# Check for load testing
if (Test-Path "tests\load") {
    $issues += "Load testing infrastructure still exists"
} else {
    $passed += "Load testing infrastructure removed"
}

# Results
Write-Host ""
Write-Host "PASSED CHECKS:" -ForegroundColor Green
foreach ($pass in $passed) {
    Write-Host "  + $pass" -ForegroundColor White
}

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "CRITICAL ISSUES:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "DEPLOYMENT BLOCKED - Fix issues first!" -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "SECURITY CHECK PASSED - Ready for production!" -ForegroundColor Green
}
