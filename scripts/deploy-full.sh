#!/bin/bash

# Orb Game Full Deployment Script
# This script deploys both frontend and backend to Azure

set -e

echo "🚀 Orb Game Full Deployment Script"
echo "=================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure first:"
    az login
fi

# Configuration variables
RESOURCE_GROUP=${RESOURCE_GROUP:-"orb-game-rg-eastus2"}
FRONTEND_APP_NAME=${FRONTEND_APP_NAME:-"orb-game"}
BACKEND_APP_NAME=${BACKEND_APP_NAME:-"orb-game-backend-eastus2"}
LOCATION=${LOCATION:-"eastus2"}
REGISTRY_NAME=${REGISTRY_NAME:-"orbgameregistry"}

echo "📋 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Frontend App: $FRONTEND_APP_NAME"
echo "   Backend App: $BACKEND_APP_NAME"
echo "   Location: $LOCATION"
echo "   Registry: $REGISTRY_NAME"
echo ""

# Create resource group if it doesn't exist
echo "🏗️  Checking resource group..."
if ! az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "🏗️  Creating resource group..."
    az group create --name $RESOURCE_GROUP --location $LOCATION --output none
else
    echo "✅ Resource group already exists"
fi

# Deploy Frontend
echo ""
echo "🌐 Deploying Frontend..."
echo "========================"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps

# Build frontend
echo "📦 Building frontend..."
npm run build

# Deploy frontend using existing script
if [ -f "./scripts/deploy-azure.sh" ]; then
    echo "📤 Deploying frontend to Azure Web App..."
    ./scripts/deploy-azure.sh
else
    echo "❌ Frontend deployment script not found"
    exit 1
fi

# Deploy Backend
echo ""
echo "🔧 Deploying Backend..."
echo "======================="

# Setup backend environment
echo "📦 Setting up backend environment..."
if [ -f "./setup-backend.sh" ]; then
    ./setup-backend.sh
else
    echo "❌ Backend setup script not found"
    exit 1
fi

# Build backend Docker image
echo "🐳 Building backend Docker image..."
docker build -f backend/backend-Dockerfile -t $REGISTRY_NAME.azurecr.io/orb-game-backend:latest ./backend

# Login to Azure Container Registry
echo "🔐 Logging into Azure Container Registry..."
az acr login --name $REGISTRY_NAME

# Push Docker image
echo "📤 Pushing Docker image..."
docker push $REGISTRY_NAME.azurecr.io/orb-game-backend:latest

# Deploy to Azure Container Apps
echo "🚀 Deploying to Azure Container Apps..."
az containerapp update \
    --name $BACKEND_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --image $REGISTRY_NAME.azurecr.io/aimcs-backend:latest \
    --output none

echo ""
echo "✅ Full deployment completed successfully!"
echo ""
echo "🌐 Frontend URL: https://$FRONTEND_APP_NAME.azurewebsites.net"
echo "🔧 Backend URL: https://$BACKEND_APP_NAME.greenwave-bb2ac4ae.$LOCATION.azurecontainerapps.io"
echo ""
echo "📝 Next steps:"
echo "   1. Configure environment variables in Azure Portal"
echo "   2. Test the application"
echo "   3. Monitor logs and performance"
echo ""
echo "🔗 Azure Portal: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$RESOURCE_GROUP" 