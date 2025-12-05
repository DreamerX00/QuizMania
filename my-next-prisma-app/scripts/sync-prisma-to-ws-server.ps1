# Sync Prisma schema from parent directory to ws-server
# Run this after making changes to the main Prisma schema

Write-Host "🔄 Syncing Prisma schema to ws-server..." -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$WsServerDir = Join-Path $RootDir "ws-server"
$PrismaSource = Join-Path $RootDir "prisma"

# Create ws-server/prisma if it doesn't exist
$WsServerPrismaDir = Join-Path $WsServerDir "prisma"
if (-not (Test-Path $WsServerPrismaDir)) {
    New-Item -ItemType Directory -Path $WsServerPrismaDir | Out-Null
}

# Copy schema.prisma
Copy-Item -Path (Join-Path $PrismaSource "schema.prisma") -Destination (Join-Path $WsServerPrismaDir "schema.prisma") -Force

Write-Host "✅ Prisma schema synced successfully!" -ForegroundColor Green
Write-Host "📦 Don't forget to regenerate Prisma Client in ws-server:" -ForegroundColor Yellow
Write-Host "   cd ws-server && npx prisma generate" -ForegroundColor Gray
