#!/bin/bash

# Backend Setup Script for Orb Game
# This script sets up the backend environment for deployment

set -e

echo "🚀 Backend Setup Script for Orb Game"
echo "===================================="
echo ""

# Configuration variables
RESOURCE_GROUP=${RESOURCE_GROUP:-"orb-game-rg-eastus2"}
BACKEND_APP_NAME=${BACKEND_APP_NAME:-"orb-game-backend-eastus2"}
REGISTRY_NAME=${REGISTRY_NAME:-"orbgameregistry"}
LOCATION=${LOCATION:-"eastus2"}

echo "📋 Backend Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Backend App: $BACKEND_APP_NAME"
echo "   Registry: $REGISTRY_NAME"
echo "   Location: $LOCATION"
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

# Check if resource group exists
if ! az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "❌ Resource group '$RESOURCE_GROUP' does not exist."
    echo "   Please create it first or update the resource group name."
    exit 1
fi

# Check if Container Registry exists
if ! az acr show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "❌ Container Registry '$REGISTRY_NAME' does not exist in resource group '$RESOURCE_GROUP'."
    echo "   Available registries in this resource group:"
    az acr list --resource-group $RESOURCE_GROUP --query "[].{name:name, loginServer:loginServer}" --output table
    exit 1
fi

# Check if Container App Environment exists
ENV_NAME="${BACKEND_APP_NAME%-*}-env"
if ! az containerapp env show --name $ENV_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "🏗️  Creating Container App Environment..."
    az containerapp env create \
        --name $ENV_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --output none
    echo "✅ Container App Environment created"
else
    echo "✅ Container App Environment already exists"
fi

# Check if Container App exists
if ! az containerapp show --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "🚀 Creating Container App..."
    az containerapp create \
        --name $BACKEND_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --environment $ENV_NAME \
        --image $REGISTRY_NAME.azurecr.io/orb-game-backend:latest \
        --target-port 3000 \
        --ingress external \
        --registry-server $REGISTRY_NAME.azurecr.io \
        --registry-username $(az acr credential show --name $REGISTRY_NAME --query username -o tsv) \
        --registry-password $(az acr credential show --name $REGISTRY_NAME --query passwords[0].value -o tsv) \
        --min-replicas 0 \
        --max-replicas 3 \
        --output none
    echo "✅ Container App created"
else
    echo "✅ Container App already exists"
fi

echo ""
echo "✅ Backend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Build and push the Docker image:"
echo "      docker build -f backend/backend-Dockerfile -t $REGISTRY_NAME.azurecr.io/orb-game-backend:latest ./backend"
echo "      docker push $REGISTRY_NAME.azurecr.io/orb-game-backend:latest"
echo ""
echo "   2. Deploy the updated image:"
echo "      az containerapp update --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP --image $REGISTRY_NAME.azurecr.io/orb-game-backend:latest"
echo ""
echo "🔗 Azure Portal: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/$BACKEND_APP_NAME" 