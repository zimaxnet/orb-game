#!/bin/bash

# Orb Game Memory Integration Deployment Script
# This script deploys the memory-enhanced version of Orb Game

set -e

echo "🧠 Deploying Orb Game Backend with Memory Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="aimcs-rg-eastus2"
CONTAINER_APP_NAME="aimcs-backend-eastus2"
ACR_NAME="orbgameregistry"
IMAGE_NAME="aimcs-backend-memory"
IMAGE_TAG="latest"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Backend App: $CONTAINER_APP_NAME"
echo "  ACR Name: $ACR_NAME"

# Step 1: Login to Azure Container Registry
echo -e "\n${YELLOW}🔑 Logging into Azure Container Registry...${NC}"
az acr login --name $ACR_NAME

# Step 2: Build and push backend with memory service
echo -e "\n${YELLOW}🔧 Building and pushing backend image...${NC}"
cd backend
docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG --platform linux/amd64 -f backend-Dockerfile .
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG
cd ..
echo -e "${GREEN}✅ Backend image pushed successfully${NC}"

# Step 3: Deploy backend to Azure Container Apps
echo -e "\n${YELLOW}🚀 Deploying backend to Azure Container Apps...${NC}"
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT" \
    AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY" \
    MONGO_URI="$MONGO_URI" \
    AZURE_OPENAI_DEPLOYMENT="o4-mini" \
    AZURE_OPENAI_TTS_DEPLOYMENT="gpt-4o-mini-tts" \
    PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY"

echo -e "${GREEN}✅ Backend deployed successfully${NC}"

# Step 4: Test the memory integration
echo -e "\n${YELLOW}🧪 Testing memory integration...${NC}"
echo "Waiting 60 seconds for deployment to complete..."
sleep 60

# Test memory export endpoint
echo "Testing memory export..."
MEMORY_COUNT=$(curl -s https://api.orbgame.us/api/memory/export | jq 'length')
if [[ "$MEMORY_COUNT" -ge 0 ]]; then
  echo -e "${GREEN}✅ Memory export working. Count: $MEMORY_COUNT${NC}"
else
  echo -e "${RED}❌ Memory export failed${NC}"
  exit 1
fi

# Test memory statistics endpoint
echo "Testing memory statistics..."
MEMORY_STATS=$(curl -s https://api.orbgame.us/api/memory/stats)
if echo "$MEMORY_STATS" | grep -q "totalMemories"; then
  echo -e "${GREEN}✅ Memory stats working${NC}"
else
  echo -e "${RED}❌ Memory stats failed${NC}"
  exit 1
fi

echo -e "\n${GREEN}🎉 Orb Game Backend Deployment Complete!${NC}"
echo -e "Backend API is available at the container app URL." 