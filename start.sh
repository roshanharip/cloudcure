#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

header()  { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }
ok()      { echo -e "${GREEN}[OK]${NC} $1"; }
info()    { echo -e "${YELLOW}[INFO]${NC} $1"; }
fail()    { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step()    { echo -e "${CYAN}[$1]${NC} $2"; }

# ---- Check Node.js ----
header "CloudCure - Start Script"

if ! command -v node &>/dev/null; then
    fail "Node.js is not installed or not in PATH. Download from: https://nodejs.org"
fi
ok "Node.js found: $(node --version)"

# ---- Check / Install pnpm ----
if ! command -v pnpm &>/dev/null; then
    info "pnpm not found. Installing via npm..."
    npm install -g pnpm || fail "Failed to install pnpm."
    ok "pnpm installed successfully."
else
    ok "pnpm found: v$(pnpm --version)"
fi

# ---- Install dependencies ----
header "Installing Dependencies"

step "BACKEND" "Running pnpm install..."
(cd "$ROOT_DIR/cloudcure-backend" && pnpm install) || fail "Backend pnpm install failed."
ok "Backend dependencies installed."

step "FRONTEND" "Running pnpm install..."
(cd "$ROOT_DIR/cloudcure-frontend" && pnpm install) || fail "Frontend pnpm install failed."
ok "Frontend dependencies installed."

# ---- Start services ----
header "Starting Services"

step "BACKEND"  "Starting NestJS dev server..."
(cd "$ROOT_DIR/cloudcure-backend"  && pnpm start:dev) &
BACKEND_PID=$!

step "FRONTEND" "Starting Vite dev server..."
(cd "$ROOT_DIR/cloudcure-frontend" && pnpm dev) &
FRONTEND_PID=$!

echo ""
ok "Both services are running."
echo -e "     Backend  : http://localhost:3000"
echo -e "     Frontend : http://localhost:5173"
echo ""
info "Press Ctrl+C to stop both services."

trap "echo ''; info 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; ok 'Services stopped.'; exit 0" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
