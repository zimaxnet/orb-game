#!/bin/bash

# AIMCS MongoDB Connection Test Runner
# This script tests the MongoDB Atlas connection

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AIMCS MongoDB Connection Test${NC}"
echo -e "${BLUE}================================${NC}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ Warning: .env file not found${NC}"
    echo -e "${YELLOW}Creating .env from env.example...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}📝 Please edit .env file and replace <db_password> with your actual MongoDB password${NC}"
        echo -e "${YELLOW}Then run this script again.${NC}"
        exit 1
    else
        echo -e "${RED}❌ env.example file not found. Please create a .env file manually.${NC}"
        exit 1
    fi
fi

# Check if MONGO_URI is set
if ! grep -q "^MONGO_URI=" .env || grep -q "<db_password>" .env; then
    echo -e "${RED}❌ Error: MONGO_URI not properly configured in .env file${NC}"
    echo -e "${YELLOW}Please edit .env and replace <db_password> with your actual MongoDB password${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js not found. Please install Node.js${NC}"
    exit 1
fi

# Check if we're in the backend directory context or need to install dependencies
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

echo -e "${BLUE}🔧 Running MongoDB connection test...${NC}"
echo ""

# Run the test script
if node scripts/test-mongodb.js; then
    echo ""
    echo -e "${GREEN}✅ MongoDB test completed successfully!${NC}"
    echo -e "${GREEN}Your MongoDB Atlas connection is working properly.${NC}"
else
    echo ""
    echo -e "${RED}❌ MongoDB test failed!${NC}"
    echo -e "${YELLOW}Please check the error messages above and verify your configuration.${NC}"
    exit 1
fi 