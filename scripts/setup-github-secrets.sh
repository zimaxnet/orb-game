#!/bin/bash

# Setup GitHub Secrets for AIMCS Deployment
# This script helps you set up the required GitHub secrets

set -e

echo "🔧 Setting up GitHub Secrets for AIMCS Deployment"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Please log in to GitHub first:"
    gh auth login
fi

echo "📋 Required GitHub Secrets:"
echo "==========================="
echo ""
echo "1. AZURE_CREDENTIALS - Azure service principal credentials"
echo "2. AZURE_OPENAI_ENDPOINT - Your Azure OpenAI endpoint"
echo "3. AZURE_OPENAI_API_KEY - Your Azure OpenAI API key"
echo "4. AZURE_OPENAI_DEPLOYMENT - Your Azure OpenAI deployment name"
echo "5. AZURE_OPENAI_TTS_DEPLOYMENT - Your Azure OpenAI TTS deployment name"
echo "6. PERPLEXITY_API_KEY - Your Perplexity API key for web search"
echo ""

echo "🚀 Setting up secrets..."
echo ""

# Get current repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo "Setting $secret_name..."
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    echo "✅ $secret_name set successfully"
    echo ""
}

# Prompt for secrets
echo "Please provide the following values:"
echo ""

# Azure Credentials
echo "🔑 Azure Service Principal Credentials (JSON format):"
echo "   Run: az ad sp create-for-rbac --name aimcs-deploy --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID --sdk-auth"
echo "   Copy the entire JSON output:"
read -p "Azure Credentials JSON: " AZURE_CREDENTIALS

# Azure OpenAI
read -p "Azure OpenAI Endpoint (e.g., https://aimcs-foundry.cognitiveservices.azure.com/): " AZURE_OPENAI_ENDPOINT
read -p "Azure OpenAI API Key: " AZURE_OPENAI_API_KEY
read -p "Azure OpenAI Deployment Name (default: o4-mini): " AZURE_OPENAI_DEPLOYMENT
AZURE_OPENAI_DEPLOYMENT=${AZURE_OPENAI_DEPLOYMENT:-o4-mini}
read -p "Azure OpenAI TTS Deployment Name (default: gpt-4o-mini-tts): " AZURE_OPENAI_TTS_DEPLOYMENT
AZURE_OPENAI_TTS_DEPLOYMENT=${AZURE_OPENAI_TTS_DEPLOYMENT:-gpt-4o-mini-tts}

# Perplexity API Key
read -p "Perplexity API Key: " PERPLEXITY_API_KEY

echo ""
echo "🔐 Setting secrets in GitHub..."

# Set all secrets
set_secret "AZURE_CREDENTIALS" "$AZURE_CREDENTIALS" "Azure service principal credentials"
set_secret "AZURE_OPENAI_ENDPOINT" "$AZURE_OPENAI_ENDPOINT" "Azure OpenAI endpoint"
set_secret "AZURE_OPENAI_API_KEY" "$AZURE_OPENAI_API_KEY" "Azure OpenAI API key"
set_secret "AZURE_OPENAI_DEPLOYMENT" "$AZURE_OPENAI_DEPLOYMENT" "Azure OpenAI deployment name"
set_secret "AZURE_OPENAI_TTS_DEPLOYMENT" "$AZURE_OPENAI_TTS_DEPLOYMENT" "Azure OpenAI TTS deployment name"
set_secret "PERPLEXITY_API_KEY" "$PERPLEXITY_API_KEY" "Perplexity API key for web search"

echo "✅ All secrets have been set successfully!"
echo ""
echo "🎉 Next steps:"
echo "1. Push your code to trigger the deployment workflow"
echo "2. Or manually run the 'Update Backend Secrets' workflow"
echo "3. Test the web search functionality"
echo ""
echo "🔗 GitHub Secrets URL: https://github.com/$REPO/settings/secrets/actions" 