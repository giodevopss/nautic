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

if [ -z "${DATABASE_URL:-}" ] || [[ "${DATABASE_URL}" != mongodb* ]]; then
  warn "Defina DATABASE_URL com uma URI MongoDB (ex.: mongodb://127.0.0.1:27017/nautic ou Atlas)."
  exit 1
fi

# Railway às vezes omite /dbname — o Prisma exige; normaliza antes de qualquer prisma *
export DATABASE_URL="$(npx tsx scripts/print-normalized-database-url.ts)" || {
  warn "Falha ao normalizar DATABASE_URL (Mongo com /dbname)."
  exit 1
}

# ── 1. Prisma ──────────────────────────────────────────────
log "DB" "Generating Prisma client..."
npx prisma generate

ok "Prisma client generated"

log "DB" "Synchronizing schema (prisma db push)…"
npx tsx scripts/prisma-db-push.ts

ok "MongoDB schema applied"

log "DB" "Seeding demo data (frota inicial)…"
npx tsx prisma/seed.ts || warn "Seed skipped or failed."

ok "Database ready"

# ── 2. Start API + Frontend ───────────────────────────────
echo ""
log "APP" "Starting API server (port ${API_PORT:-3001}) and Frontend (port 3000)..."
echo ""

./node_modules/.bin/concurrently \
  --names "API,WEB" \
  --prefix "[{name}]" \
  --prefix-colors "blue,green" \
  --kill-others \
  "node --import tsx server/index.ts" \
  "./node_modules/.bin/next dev"
