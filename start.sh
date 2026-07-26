#!/bin/bash

# Workers-Choice Startup Script
# This script starts all services for the Workers-Choice platform

echo "==================================="
echo "  Workers-Choice Platform Startup"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${YELLOW}Warning: Running as root. Consider running as a regular user.${NC}"
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
service_running() {
  systemctl is-active --quiet "$1" 2>/dev/null
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
  echo -e "${RED}Error: Node.js is not installed.${NC}"
  echo "Please install Node.js v18 or higher."
  echo "Run: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Check PostgreSQL
echo ""
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if service_running postgresql; then
  echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  sudo systemctl start postgresql
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
  else
    echo -e "${RED}Failed to start PostgreSQL${NC}"
    exit 1
  fi
fi

# Check Redis
echo ""
echo -e "${YELLOW}Checking Redis...${NC}"
if service_running redis; then
  echo -e "${GREEN}✓ Redis is running${NC}"
else
  echo -e "${YELLOW}Starting Redis...${NC}"
  sudo systemctl start redis
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Redis started${NC}"
  else
    echo -e "${YELLOW}⚠ Redis not found or failed to start (optional)${NC}"
  fi
fi

# Navigate to project directory
cd /home/mpanshak/workers-choice || {
  echo -e "${RED}Error: Project directory not found${NC}"
  exit 1
}

# Check if dependencies are installed
echo ""
echo -e "${YELLOW}Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
  echo "Installing root dependencies..."
  npm install
fi

if [ ! -d "client/node_modules" ]; then
  echo "Installing client dependencies..."
  cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
  echo "Installing server dependencies..."
  cd server && npm install && cd ..
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check if .env file exists
echo ""
echo -e "${YELLOW}Checking configuration...${NC}"

if [ ! -f ".env" ]; then
  echo "Creating .env file from template..."
  cp .env.example .env
  echo -e "${YELLOW}⚠ Please edit .env file with your settings${NC}"
fi

echo -e "${GREEN}✓ Configuration ready${NC}"

# Check if database needs setup
echo ""
echo -e "${YELLOW}Checking database...${NC}"

cd server

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate 2>/dev/null

# Check if database exists and has tables
if ! npx prisma db push --accept-data-loss 2>/dev/null; then
  echo "Setting up database..."
  npx prisma db push
fi

# Check if we need to seed
echo "Seeding database with sample data..."
npx prisma db seed 2>/dev/null || npx ts-node prisma/seed.ts

cd ..

echo -e "${GREEN}✓ Database ready${NC}

# Start the application
echo ""
echo -e "${YELLOW}Starting Workers-Choice...${NC}"
echo ""

# Function to start server
start_server() {
  echo "Starting API server..."
  cd server
  npm run dev &
  SERVER_PID=$!
  cd ..
  echo -e "${GREEN}✓ API server starting on port 4000${NC}"
}

# Function to start client
start_client() {
  echo "Starting web client..."
  cd client
  npm run dev &
  CLIENT_PID=$!
  cd ..
  echo -e "${GREEN}✓ Web client starting on port 3000${NC}"
}

# Start services
start_server
sleep 2
start_client

echo ""
echo "==================================="
echo -e "${GREEN}  Workers-Choice is running!${NC}"
echo "==================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "API:      http://localhost:4000"
echo "Health:   http://localhost:4000/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping services...${NC}"
  if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    echo -e "${GREEN}✓ API server stopped${NC}"
  fi
  if [ ! -z "$CLIENT_PID" ]; then
    kill $CLIENT_PID 2>/dev/null
    echo -e "${GREEN}✓ Web client stopped${NC}"
  fi
  echo -e "${GREEN}All services stopped${NC}"
  exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
