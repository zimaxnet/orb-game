#!/bin/bash

# Fix TTS Configuration Script
# This script updates the Azure Container App with the correct TTS environment variables

set -e

echo "🔧 Fixing TTS Configuration..."

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

# Update the container app with the correct TTS configuration
echo "🔄 Updating container app with TTS configuration..."

az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    AZURE_OPENAI_ENDPOINT="https://aimcs-foundry.cognitiveservices.azure.com/" \
    AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY" \
    AZURE_OPENAI_DEPLOYMENT="o4-mini" \
    AZURE_OPENAI_TTS_DEPLOYMENT="gpt-4o-mini-tts" \
    PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY" \
    MONGO_URI="$MONGO_URI"

echo "✅ Container app updated successfully"

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Test the TTS functionality
echo "🧪 Testing TTS functionality..."

# Test 1: Check if the container app is running
CONTAINER_STATUS=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.runningStatus" \
  --output tsv)

echo "📊 Container Status: $CONTAINER_STATUS"

# Test 2: Test TTS endpoint
echo "🔍 Testing TTS endpoint..."
TTS_TEST_RESPONSE=$(curl -s -X POST https://api.orbgame.us/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test TTS functionality", "userId": "tts-test"}' \
  --max-time 30)

if echo "$TTS_TEST_RESPONSE" | grep -q "audioData"; then
    echo "✅ TTS audio data found in response"
else
    echo "⚠️ No audio data found in response"
    echo "Response preview: ${TTS_TEST_RESPONSE:0:200}..."
fi

echo "🎉 TTS configuration fix completed!"
echo ""
echo "📋 Summary:"
echo "  ✅ Container app updated with TTS environment variables"
echo "  ✅ AZURE_OPENAI_ENDPOINT set to: https://aimcs-foundry.cognitiveservices.azure.com/"
echo "  ✅ AZURE_OPENAI_TTS_DEPLOYMENT set to: gpt-4o-mini-tts"
echo "  ✅ Container status: $CONTAINER_STATUS"
echo ""
echo "🔗 Test the TTS functionality at: https://orbgame.us" 