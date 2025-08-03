#!/bin/bash

# Set TTS Secrets Script
# This script manually sets the TTS environment variables in the container app

set -e

echo "🔧 Setting TTS Environment Variables..."

# Configuration
RESOURCE_GROUP="orb-game-rg-eastus2"
CONTAINER_APP_NAME="orb-game-backend-eastus2"

echo "📋 Current Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Container App: $CONTAINER_APP_NAME"

# Check if we're logged into Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged into Azure. Please run 'az login' first."
    exit 1
fi

echo "✅ Azure CLI authenticated"

# Set the environment variables manually
echo "🔄 Setting environment variables..."

az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="https://aimcs-foundry.cognitiveservices.azure.com/" \
    AZURE_OPENAI_DEPLOYMENT="o4-mini" \
    AZURE_OPENAI_TTS_DEPLOYMENT="gpt-4o-mini-tts" \
    AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY" \
    PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY" \
    MONGO_URI="$MONGO_URI"

echo "✅ Environment variables set successfully"

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Verify the environment variables
echo "🔍 Verifying environment variables..."
az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.template.containers[0].env[?name=='AZURE_OPENAI_ENDPOINT'].value" \
  --output tsv

echo "🎉 TTS secrets configuration completed!"
echo ""
echo "📋 Summary:"
echo "  ✅ AZURE_OPENAI_ENDPOINT: https://aimcs-foundry.cognitiveservices.azure.com/"
echo "  ✅ AZURE_OPENAI_TTS_DEPLOYMENT: gpt-4o-mini-tts"
echo "  ✅ Environment variables updated"
echo ""
echo "🔗 Test the TTS functionality at: https://orbgame.us" 