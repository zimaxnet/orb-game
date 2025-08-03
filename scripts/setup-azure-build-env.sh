#!/bin/bash

# Setup Azure Container App Build Environment Variables
# This script helps you set up the required build environment variables

set -e

echo "🔧 Setting up Azure Container App Build Environment Variables"
echo "============================================================
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cliexit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo🔐 Please log in to Azure first:"
    az login
fi

# Default values
RESOURCE_GROUP="orb-game-rg-eastus2"
CONTAINER_APP_NAME="orb-game-backend"

echo 📋 Required Build Environment Variables:"
echo "========================================
echo cho "1 AZURE_OPENAI_ENDPOINT - Your Azure OpenAI endpoint"
echo "2. AZURE_OPENAI_API_KEY - Your Azure OpenAI API key"
echo 3. AZURE_OPENAI_DEPLOYMENT - Your Azure OpenAI deployment name"
echo 4. AZURE_OPENAI_TTS_DEPLOYMENT - Your Azure OpenAI TTS deployment name
echo 5.PERPLEXITY_API_KEY - Your Perplexity API key for web search"
echo "6. MONGO_URI - Your MongoDB Atlas connection string"
echo ""

echo "🚀 Setting up build environment variables..."
echo
# Function to set build environment variable
set_build_env() {
    local var_name=$1
    local var_value=$2
    local description=$3
    
    echo Setting $var_name...   az containerapp env set \
        --name "$CONTAINER_APP_NAME" \
        --resource-group$RESOURCE_GROUP" \
        --build-env-var "$var_name=$var_value" \
        --output none
    echo "✅ $var_name set successfully
    echo "
}
# Function to get Azure OpenAI details
get_azure_openai_details() {
    echo🔍 Getting Azure OpenAI details..."
    
    # List available Azure OpenAI resources
    echo "Available Azure OpenAI resources:"
    az cognitiveservices account list --resource-type OpenAI --query "[].{name:name, endpoint:properties.endpoint, resourceGroup:resourceGroup}" --output table
    
    echo ""
    read -p Enter the name of your Azure OpenAI resource: OPENAI_RESOURCE_NAME
    read -p "Enter the resource group of your Azure OpenAI resource:  OPENAI_RESOURCE_GROUP
    
    # Get the endpoint
    AZURE_OPENAI_ENDPOINT=$(az cognitiveservices account show \
        --name$OPENAI_RESOURCE_NAME" \
        --resource-group $OPENAI_RESOURCE_GROUP" \
        --query "properties.endpoint" \
        --output tsv)
    
    echo "✅ Azure OpenAI endpoint: $AZURE_OPENAI_ENDPOINT"
    
    # Get the API key
    AZURE_OPENAI_API_KEY=$(az cognitiveservices account keys list \
        --name$OPENAI_RESOURCE_NAME" \
        --resource-group $OPENAI_RESOURCE_GROUP" \
        --query "key1" \
        --output tsv)
    
    echo "✅ Azure OpenAI API key retrieved"
}

# Prompt for secrets
echo "Please provide the following values:"
echo ""

# Get Azure OpenAI details
get_azure_openai_details

# Azure OpenAI Deployment Names
read -p "Azure OpenAI Deployment Name (default: o4-mini):  AZURE_OPENAI_DEPLOYMENT
AZURE_OPENAI_DEPLOYMENT=${AZURE_OPENAI_DEPLOYMENT:-o4-mini}
read -pAzure OpenAI TTS Deployment Name (default: gpt-4mini-tts): AZURE_OPENAI_TTS_DEPLOYMENT
AZURE_OPENAI_TTS_DEPLOYMENT=${AZURE_OPENAI_TTS_DEPLOYMENT:-gpt-4o-mini-tts}

# Perplexity API Key
read -p "Perplexity API Key: " PERPLEXITY_API_KEY

# MongoDB URI
echo "
echo🔑 MongoDB Atlas Connection String:
echo "   Format: mongodb+srv://username:password@cluster.mongodb.net/"
echo "   This will be hidden when typing for security"
read -s -p "MongoDB URI:  MONGO_URI
echo 

echo "
echo🔐 Setting build environment variables in Azure Container App...

# Set all build environment variables
set_build_env AZURE_OPENAI_ENDPOINT"$AZURE_OPENAI_ENDPOINT" "Azure OpenAI endpoint"
set_build_envAZURE_OPENAI_API_KEY" $AZURE_OPENAI_API_KEY"Azure OpenAI API key"
set_build_envAZURE_OPENAI_DEPLOYMENT$AZURE_OPENAI_DEPLOYMENT" "Azure OpenAI deployment name"
set_build_envAZURE_OPENAI_TTS_DEPLOYMENT$AZURE_OPENAI_TTS_DEPLOYMENT"Azure OpenAI TTS deployment name"
set_build_env "PERPLEXITY_API_KEY PERPLEXITY_API_KEY" "Perplexity API key for web search"
set_build_envMONGO_URI" "$MONGO_URI" "MongoDB Atlas connection string"

echo "✅ All build environment variables have been set successfully!
echo ""
echo🎉 Next steps:"
echo1. Redeploy your container app to apply the new build environment variables"
echo "2. Test the backend endpoints"
echo "3. Check the container app logs for any issues
echo🔗 Azure Container App URL: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/$CONTAINER_APP_NAME
echoho "📝 Note: These are build-time environment variables. For runtime environment variables,"
echo you'll need to set them in the Container App's configuration section." 