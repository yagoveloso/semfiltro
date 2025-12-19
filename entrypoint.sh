#!/bin/sh
set -e

echo "🔄 Running database migrations..."
bun run db:migrate

echo "✅ Migrations completed successfully"
echo "🚀 Starting application..."
exec bun run .output/server/index.mjs
