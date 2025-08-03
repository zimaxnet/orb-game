#!/bin/bash

# Google Custom Search API Setup Script for Orb Game
# This script helps configure Google Custom Search API to replace deprecated Bing Image Search

echo "🔧 Google Custom Search API Setup for Orb Game"
echo "=============================================="
echo ""
echo "This script will help you set up Google Custom Search API to replace"
echo "the deprecated Bing Image Search API."
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged into Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged into Azure. Please run: az login"
    exit 1
fi

echo "📋 Prerequisites:"
echo "1. Google Cloud Platform account"
echo "2. Google Custom Search API enabled"
echo "3. Custom Search Engine created"
echo "4. API key and Custom Search Engine ID (CX)"
echo ""

echo "🔗 Setup Steps:"
echo "==============="
echo ""
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Custom Search API:"
echo "   - Go to APIs & Services > Library"
echo "   - Search for 'Custom Search API'"
echo "   - Click Enable"
echo ""
echo "4. Create API Key:"
echo "   - Go to APIs & Services > Credentials"
echo "   - Click 'Create Credentials' > 'API Key'"
echo "   - Copy the API key"
echo ""
echo "5. Create Custom Search Engine:"
echo "   - Go to https://cse.google.com/"
echo "   - Click 'Add' to create new search engine"
echo "   - Enter any site (e.g., google.com)"
echo "   - In Settings, enable 'Search the entire web'"
echo "   - Copy the Search Engine ID (CX)"
echo ""

read -p "Do you have your Google CSE API key ready? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the setup steps above and run this script again."
    exit 1
fi

read -p "Do you have your Google CSE Search Engine ID (CX) ready? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the setup steps above and run this script again."
    exit 1
fi

echo ""
echo "🔐 Storing credentials in Azure Key Vault..."
echo ""

# Get credentials from user
read -s -p "Enter your Google CSE API Key: " GOOGLE_CSE_API_KEY
echo
read -s -p "Enter your Google CSE Search Engine ID (CX): " GOOGLE_CSE_CX
echo

# Store in Azure Key Vault
echo "Storing API key in Azure Key Vault..."
az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-API-KEY" --value "$GOOGLE_CSE_API_KEY"

if [ $? -eq 0 ]; then
    echo "✅ Google CSE API key stored successfully"
else
    echo "❌ Failed to store API key. Please check your Azure permissions."
    exit 1
fi

echo "Storing Search Engine ID in Azure Key Vault..."
az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-CX" --value "$GOOGLE_CSE_CX"

if [ $? -eq 0 ]; then
    echo "✅ Google CSE Search Engine ID stored successfully"
else
    echo "❌ Failed to store Search Engine ID. Please check your Azure permissions."
    exit 1
fi

echo ""
echo "🧪 Testing the configuration..."
echo ""

# Test the configuration
cd scripts
python3 google-custom-search.py --test

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Google Custom Search API is configured and working!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Run the full image search: python3 scripts/google-custom-search.py"
    echo "2. Update your backend to use Google CSE instead of Bing"
    echo "3. Test the integration in your Orb Game"
    echo ""
    echo "📊 Usage limits:"
    echo "- Free tier: 100 queries/day"
    echo "- Paid tier: $5 per 1000 queries"
    echo "- Rate limit: 10 queries/second"
    echo ""
else
    echo ""
    echo "❌ Configuration test failed. Please check your credentials."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Verify your API key is correct"
    echo "2. Verify your Search Engine ID (CX) is correct"
    echo "3. Make sure Custom Search API is enabled"
    echo "4. Check that 'Search the entire web' is enabled in CSE settings"
    echo ""
fi

echo "Setup complete! 🎉" 