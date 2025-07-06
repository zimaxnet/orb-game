#!/bin/bash

# AIMCS Memory Integration Deployment Script
# This script deploys the memory-enhanced version of AIMCS

set -e

echo "🧠 Deploying AIMCS with Memory Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="aimcs-rg-eastus2"
CONTAINER_APP_NAME="aimcs-backend-eastus2"
FRONTEND_APP_NAME="aimcs-frontend"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Backend App: $CONTAINER_APP_NAME"
echo "  Frontend App: $FRONTEND_APP_NAME"

# Step 1: Build and deploy backend with memory service
echo -e "\n${YELLOW}🔧 Building backend with memory service...${NC}"

# Build the backend Docker image with memory service
cd backend
docker build -t aimcs-backend-memory:latest -f backend-Dockerfile .

# Tag for Azure Container Registry (if using ACR)
# docker tag aimcs-backend-memory:latest yourregistry.azurecr.io/aimcs-backend-memory:latest
# docker push yourregistry.azurecr.io/aimcs-backend-memory:latest

echo -e "${GREEN}✅ Backend image built successfully${NC}"

# Step 2: Deploy backend to Azure Container Apps
echo -e "\n${YELLOW}🚀 Deploying backend to Azure Container Apps...${NC}"

# Update the container app with the new image
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image aimcs-backend-memory:latest \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="https://aimcs-foundry.cognitiveservices.azure.com/" \
    AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY" \
    AZURE_OPENAI_DEPLOYMENT="o4-mini" \
    AZURE_OPENAI_TTS_DEPLOYMENT="gpt-4o-mini-tts" \
    PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY"

echo -e "${GREEN}✅ Backend deployed successfully${NC}"

# Step 3: Deploy frontend with memory panel
echo -e "\n${YELLOW}🎨 Deploying frontend with memory panel...${NC}"

# Build the frontend
cd ..
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name $FRONTEND_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source . \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --api-location "backend" \
  --output-location "dist"

echo -e "${GREEN}✅ Frontend deployed successfully${NC}"

# Step 4: Test the memory integration
echo -e "\n${YELLOW}🧪 Testing memory integration...${NC}"

# Wait for deployment to complete
echo "Waiting for services to be ready..."
sleep 30

# Test basic chat functionality
echo "Testing basic chat..."
CHAT_RESPONSE=$(curl -s -X POST https://api.aimcs.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is a memory test", "userId": "test-user"}')

if echo "$CHAT_RESPONSE" | grep -q "response"; then
  echo -e "${GREEN}✅ Chat API working${NC}"
else
  echo -e "${RED}❌ Chat API failed${NC}"
  echo "Response: $CHAT_RESPONSE"
  exit 1
fi

# Test memory statistics endpoint
echo "Testing memory statistics..."
MEMORY_STATS=$(curl -s https://api.aimcs.net/api/memory/stats)

if echo "$MEMORY_STATS" | grep -q "totalMemories"; then
  echo -e "${GREEN}✅ Memory API working${NC}"
else
  echo -e "${RED}❌ Memory API failed${NC}"
  echo "Response: $MEMORY_STATS"
  exit 1
fi

# Test memory search endpoint
echo "Testing memory search..."
MEMORY_SEARCH=$(curl -s -X POST https://api.aimcs.net/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{"query": "memory test", "userId": "test-user"}')

if echo "$MEMORY_SEARCH" | grep -q "memories"; then
  echo -e "${GREEN}✅ Memory search working${NC}"
else
  echo -e "${RED}❌ Memory search failed${NC}"
  echo "Response: $MEMORY_SEARCH"
  exit 1
fi

# Step 5: Verify frontend accessibility
echo -e "\n${YELLOW}🌐 Testing frontend accessibility...${NC}"

if curl -f https://aimcs.net > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend accessible${NC}"
else
  echo -e "${RED}❌ Frontend not accessible${NC}"
  exit 1
fi

echo -e "\n${GREEN}🎉 AIMCS Memory Integration Deployment Complete!${NC}"
echo -e "\n${BLUE}📊 Memory Features Available:${NC}"
echo "  • 🧠 Automatic response caching"
echo "  • 🔍 Memory-based response retrieval"
echo "  • 📈 Memory statistics dashboard"
echo "  • 🔎 Memory search functionality"
echo "  • 💾 Memory export/import capabilities"
echo -e "\n${BLUE}🌐 Access Points:${NC}"
echo "  • Frontend: https://aimcs.net"
echo "  • Backend API: https://api.aimcs.net"
echo "  • Memory Stats: https://api.aimcs.net/api/memory/stats"
echo -e "\n${YELLOW}💡 Next Steps:${NC}"
echo "  1. Test the memory panel by clicking the 🧠 Memory button"
echo "  2. Ask the same question twice to see memory in action"
echo "  3. Search your conversation history in the memory panel"
echo "  4. Monitor memory statistics for usage patterns" 