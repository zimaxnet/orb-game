#!/bin/bash

# AIMCS MongoDB Connection Test Runner
# This script reliably tests the MongoDB Atlas connection.

set -e

# --- Environment and Path Setup ---
# Ensures the script runs from its own directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- Console Output Helper ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Prerequisite Checks ---
# Verify .env file exists and is correctly configured.
if [ ! -f "../.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
    cp ../env.example ../.env
    echo -e "${RED}ACTION REQUIRED: Please edit the new .env file with your MongoDB password.${NC}"
    exit 1
fi

if grep -q "YOUR_ACTUAL_PASSWORD" ../.env || ! grep -q "MONGO_URI=" ../.env; then
    echo -e "${RED}ACTION REQUIRED: MONGO_URI is not configured in .env. Please add your password.${NC}"
    exit 1
fi

# Install local script dependencies if node_modules is missing.
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing required script dependencies...${NC}"
    npm install
fi

# --- Test Execution ---
echo -e "${BLUE}🔧 Running MongoDB connection test...${NC}"
echo ""

# Execute the .mjs script with node.
if node test-mongodb.mjs; then
    echo ""
    echo -e "${GREEN}✅ All tests passed! Your connection is healthy.${NC}"
else
    echo ""
    echo -e "${RED}❌ Test failed. Please check the errors above.${NC}"
    exit 1
fi 