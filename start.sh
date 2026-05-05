#!/usr/bin/env bash
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${BLUE}[$1]${NC} $2"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   CLUBE NAUTICO - Starting services    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ── 1. Prisma generate ────────────────────────────────────
log "DB" "Generating Prisma client..."
npx prisma generate --no-hints 2>/dev/null

ok "Prisma client generated"

# ── 2. Database migrations ────────────────────────────────
log "DB" "Running migrations (SQLite)..."
npx prisma migrate dev --skip-generate --name init 2>/dev/null || npx prisma migrate deploy 2>/dev/null

ok "Database schema is up to date"

# ── 3. Seed if empty ─────────────────────────────────────
log "DB" "Checking for seed data..."
npx tsx prisma/seed.ts 2>/dev/null

ok "Database ready"

# ── 4. Start API + Frontend ──────────────────────────────
echo ""
log "APP" "Starting API server (port ${API_PORT:-3001}) and Frontend (port 3000)..."
echo ""

# API: use `node --import tsx` (not the tsx CLI). The tsx CLI spawns a child
# that can exit with 0 right away under concurrently, killing both processes.
./node_modules/.bin/concurrently \
  --names "API,WEB" \
  --prefix "[{name}]" \
  --prefix-colors "blue,green" \
  --kill-others \
  "node --import tsx server/index.ts" \
  "./node_modules/.bin/next dev"
