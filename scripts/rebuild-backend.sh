#!/bin/bash

# Orb Game Backend Rebuild Script
# This script rebuilds and deploys the backend to Azure Container Registry

set -e

RESOURCE_GROUP="orb-game-rg-eastus2"
ACR_NAME="orbgameregistry"
IMAGE_NAME="orb-game-backend"
IMAGE_TAG="latest"
CONTAINER_APP_NAME="orb-game-backend-eastus2"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  ACR Name: $ACR_NAME"
echo "  Image Name: $IMAGE_NAME"
echo "  Image Tag: $IMAGE_TAG"
echo "  Container App: $CONTAINER_APP_NAME"

echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first:${NC}"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first:${NC}"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Azure...${NC}"
    az login
fi

echo -e "${YELLOW}🔑 Logging into Azure Container Registry...${NC}"
az acr login --name $ACR_NAME

echo -e "${YELLOW}📁 Building backend Docker image...${NC}"
cd backend
npm install --production

docker build -t $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG --platform linux/amd64 -f backend-Dockerfile .

echo -e "${YELLOW}📤 Pushing image to Azure Container Registry...${NC}"
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG
cd ..

echo -e "${YELLOW}🚀 Deploying to Azure Container App...${NC}"
if az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    # Get current revision before update
    OLD_REVISION=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.latestRevisionName" -o tsv)
    echo -e "${BLUE}📋 Current revision: $OLD_REVISION${NC}"
    
    # Update the container app with new image and force new revision
    az containerapp update \
      --name $CONTAINER_APP_NAME \
      --resource-group $RESOURCE_GROUP \
      --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG \
      --set-env-vars DEPLOYMENT_VERSION="$(date +%s)"
    
    echo -e "${GREEN}✅ Container App updated successfully${NC}"
    
    # Wait for new revision to be ready
    echo -e "${YELLOW}⏳ Waiting for new revision to be ready...${NC}"
    sleep 10
    
    # Get the new revision
    NEW_REVISION=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.latestRevisionName" -o tsv)
    echo -e "${BLUE}📋 New revision: $NEW_REVISION${NC}"
    
    # Send 100% traffic to new revision
    echo -e "${YELLOW}🚦 Sending 100% traffic to new revision...${NC}"
    
    # Check if in single revision mode
    REVISION_MODE=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.activeRevisionsMode" -o tsv)
    
    if [ "$REVISION_MODE" = "Single" ]; then
        echo -e "${BLUE}📋 Container App is in single revision mode - traffic automatically goes to new revision${NC}"
    else
        az containerapp revision set-mode \
          --name $CONTAINER_APP_NAME \
          --resource-group $RESOURCE_GROUP \
          --mode single
        
        az containerapp ingress traffic set \
          --name $CONTAINER_APP_NAME \
          --resource-group $RESOURCE_GROUP \
          --revision-weight $NEW_REVISION=100
    fi
    
    echo -e "${GREEN}✅ Traffic redirected to new revision${NC}"
    
    # Wait for new revision to be fully ready
    echo -e "${YELLOW}⏳ Waiting for new revision to be fully ready...${NC}"
    sleep 15
    
    # Verify the new revision is receiving traffic
    CURRENT_TRAFFIC=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.traffic[0].revisionName" -o tsv)
    echo -e "${BLUE}📋 Current traffic revision: $CURRENT_TRAFFIC${NC}"
    
    if [ "$CURRENT_TRAFFIC" = "$NEW_REVISION" ]; then
        echo -e "${GREEN}✅ New revision is receiving traffic${NC}"
    else
        echo -e "${YELLOW}⚠️  Traffic may not be fully redirected yet${NC}"
    fi
    
else
    echo -e "${YELLOW}⚠️  Container App '$CONTAINER_APP_NAME' does not exist. You may need to create it manually.${NC}"
    echo -e "${BLUE}📋 The image is available at: $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG${NC}"
fi

echo -e "${GREEN}🎉 Backend Rebuild Complete!${NC}"
echo -e "${BLUE}🔗 Azure Portal: https://portal.azure.com/#@zimax.net/resource/subscriptions/490a597e-95d5-454c-bd0c-3e7b349f1e87/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME/overview${NC}"
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Verify the deployment in Azure Portal"
echo "2. Test the backend endpoints"
echo "3. Update any environment variables if needed"
echo "4. Monitor the application logs" 