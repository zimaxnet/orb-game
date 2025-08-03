#!/bin/bash

# Set Azure Container App Build Environment Variables

set -e

RESOURCE_GROUP="orb-game-rg-eastus2"
CONTAINER_APP_NAME="orb-game-backend"

echo "🔧 Setting Azure Container App Build Environment Variables"
echo "========================================================="
echo ""

# Check prerequisites
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "❌ Please log in to Azure first: az login"
    exit 1
fi

# Function to set build environment variable
set_build_env() {
    local var_name=$1
    local var_value=$2
    echo "Setting $var_name..."
    az containerapp update \
        --name "$CONTAINER_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --set-env-vars "$var_name=$var_value" \
        --output none
    echo "✅ $var_name set successfully"
}

# Prompt for Azure OpenAI values (same as GitHub secrets script)
echo "Please provide the following values:"
read -p "Azure OpenAI Endpoint (e.g., https://aimcs-foundry.cognitiveservices.azure.com/): " AZURE_OPENAI_ENDPOINT
read -p "Azure OpenAI API Key: " AZURE_OPENAI_API_KEY
read -p "Azure OpenAI Deployment Name (default: o4-mini): " AZURE_OPENAI_DEPLOYMENT
AZURE_OPENAI_DEPLOYMENT=${AZURE_OPENAI_DEPLOYMENT:-o4-mini}
read -p "Azure OpenAI TTS Deployment Name (default: gpt-4mini-tts): " AZURE_OPENAI_TTS_DEPLOYMENT
AZURE_OPENAI_TTS_DEPLOYMENT=${AZURE_OPENAI_TTS_DEPLOYMENT:-gpt-4o-mini-tts}

# Check for required environment variables
if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo "⚠️  PERPLEXITY_API_KEY not set in environment. Please set it and rerun."
    exit 1
fi

if [ -z "$MONGO_URI" ]; then
    echo "⚠️  MONGO_URI not set in environment. Please set it and rerun."
    exit 1
fi

echo ""
echo "Setting build environment variables..."

set_build_env AZURE_OPENAI_ENDPOINT "$AZURE_OPENAI_ENDPOINT"
set_build_env AZURE_OPENAI_API_KEY "$AZURE_OPENAI_API_KEY"
set_build_env AZURE_OPENAI_DEPLOYMENT "$AZURE_OPENAI_DEPLOYMENT"
set_build_env AZURE_OPENAI_TTS_DEPLOYMENT "$AZURE_OPENAI_TTS_DEPLOYMENT"
set_build_env PERPLEXITY_API_KEY "$PERPLEXITY_API_KEY"
set_build_env MONGO_URI "$MONGO_URI"

echo ""
echo "✅ All build environment variables have been set successfully!"
echo ""
echo "🎉 Next steps:"
echo "1. Redeploy your container app to apply the new build environment variables"
echo "2. Test the backend endpoints"
echo "3. Check the container app logs for any issues"
echo "🔗 Azure Container App URL: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/$CONTAINER_APP_NAME" 