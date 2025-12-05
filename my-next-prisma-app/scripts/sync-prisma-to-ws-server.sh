#!/bin/bash
# Sync Prisma schema from parent directory to ws-server
# Run this after making changes to the main Prisma schema

echo "🔄 Syncing Prisma schema to ws-server..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WS_SERVER_DIR="$SCRIPT_DIR/ws-server"
PRISMA_SOURCE="$SCRIPT_DIR/prisma"

# Copy schema.prisma
cp "$PRISMA_SOURCE/schema.prisma" "$WS_SERVER_DIR/prisma/schema.prisma"

echo "✅ Prisma schema synced successfully!"
echo "📦 Don't forget to regenerate Prisma Client in ws-server:"
echo "   cd ws-server && npx prisma generate"
