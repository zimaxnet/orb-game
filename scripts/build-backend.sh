#!/bin/bash

# Orb Game Backend Build Script
# This script builds the backend Docker image

set -e

ACR_NAME="orbgameregistry"
IMAGE_NAME="orb-game-backend"
IMAGE_TAG="latest"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  ACR Name: $ACR_NAME"
echo "  Image Name: $IMAGE_NAME"
echo "  Image Tag: $IMAGE_TAG"

echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first:${NC}"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${YELLOW}📁 Building backend Docker image...${NC}"
cd backend
npm install --production

docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG --platform linux/amd64 -f backend-Dockerfile ..
cd ..

echo -e "${GREEN}🎉 Backend Build Complete!${NC}"
echo -e "${BLUE}🖼️  Image is available locally as: $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG${NC}" 