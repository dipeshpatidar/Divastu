#!/usr/bin/env bash

# ==============================================================================
# ==============================================================================
# Pathome - Unified Application Launcher (Your Dreams, Our Efforts)
# Starts PostgreSQL health check, Spring Boot Backend (8080) & Vite Frontend (5173)
# ==============================================================================

set -e

# ANSI Color Formatter
BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}"
echo "=========================================================================="
echo "          🏢 PATHOME - YOUR DREAMS, OUR EFFORTS (LOCAL LAUNCHER)          "
echo "=========================================================================="
echo -e "${RESET}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend-web"

# 1. PostgreSQL Database Connectivity Check
echo -e "${BOLD}${YELLOW}[1/4] Checking PostgreSQL Database Status (Port 5432)...${RESET}"
if nc -z localhost 5432 2>/dev/null || pg_isready -h localhost -p 5432 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL database is online and accepting connections on port 5432.${RESET}"
else
    echo -e "${RED}⚠️ WARNING: PostgreSQL database is NOT reachable on port 5432!${RESET}"
    echo -e "${YELLOW}Please ensure PostgreSQL service is running (e.g. 'brew services start postgresql@16')${RESET}"
    echo -e "${YELLOW}Spring Boot will attempt connection on startup.${RESET}"
fi

echo ""

# 2. Cleanup Existing Stale Port Listeners (8080 & 5173)
echo -e "${BOLD}${YELLOW}[2/4] Clearing stale processes on ports 8080 & 5173...${RESET}"
PORT_8080_PID=$(lsof -ti:8080 || true)
if [ -n "$PORT_8080_PID" ]; then
    echo -e "${CYAN}Terminating process on port 8080 (PID: ${PORT_8080_PID})...${RESET}"
    kill -9 $PORT_8080_PID 2>/dev/null || true
fi

PORT_5173_PID=$(lsof -ti:5173 || true)
if [ -n "$PORT_5173_PID" ]; then
    echo -e "${CYAN}Terminating process on port 5173 (PID: ${PORT_5173_PID})...${RESET}"
    kill -9 $PORT_5173_PID 2>/dev/null || true
fi

echo -e "${GREEN}✓ Ports 8080 & 5173 cleared.${RESET}"
echo ""

# 3. Graceful Process Cleanup Trap on Ctrl+C
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo -e "${BOLD}${RED}Shutting down Pathome services...${RESET}"
    if [ -n "$BACKEND_PID" ]; then
        echo -e "${YELLOW}Stopping Spring Boot Backend (PID: ${BACKEND_PID})...${RESET}"
        kill -15 "$BACKEND_PID" 2>/dev/null || kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}Stopping Vite Frontend (PID: ${FRONTEND_PID})...${RESET}"
        kill -15 "$FRONTEND_PID" 2>/dev/null || kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ All services stopped cleanly.${RESET}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 4. Launch Spring Boot Backend
echo -e "${BOLD}${YELLOW}[3/4] Starting Spring Boot Backend (http://localhost:8080)...${RESET}"
cd "${BACKEND_DIR}"
mvn spring-boot:run &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend process launched (PID: ${BACKEND_PID}).${RESET}"
echo ""

# 5. Launch Vite React Frontend
echo -e "${BOLD}${YELLOW}[4/4] Starting Vite React Frontend (http://localhost:5173)...${RESET}"
cd "${FRONTEND_DIR}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend process launched (PID: ${FRONTEND_PID}).${RESET}"
echo ""

echo -e "${BOLD}${GREEN}"
echo "=========================================================================="
echo "🚀 PATHOME APPLICATION IS LIVE! (Your Dreams, Our Efforts)"
echo "   - Frontend Web App:  http://localhost:5173"
echo "   - Backend REST APIs: http://localhost:8080/api/v1/properties"
echo "   - Press Ctrl+C in this terminal to stop both servers cleanly."
echo "=========================================================================="
echo -e "${RESET}"

# Keep script running to monitor background processes
wait $BACKEND_PID $FRONTEND_PID
