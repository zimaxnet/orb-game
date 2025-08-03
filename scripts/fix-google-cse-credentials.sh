#!/bin/bash

# Fix Google Custom Search API Credentials
echo "🔧 Fixing Google Custom Search API Credentials"
echo "=============================================="
echo ""

echo "The current credentials appear to be malformed. Let's fix them."
echo ""

echo "📋 What you need:"
echo "1. Your Google CSE API Key (should look like: AIzaSy...)"
echo "2. Your Google CSE Search Engine ID (should look like: 62e102b2e2b5f47c3)"
echo ""

read -p "Do you have the correct credentials ready? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please get your correct credentials and run this script again."
    exit 1
fi

echo ""
echo "🔐 Enter the correct credentials:"
echo ""

# Get correct API key
read -s -p "Enter your Google CSE API Key (should start with 'AIzaSy'): " CORRECT_API_KEY
echo

# Validate API key format
if [[ ! $CORRECT_API_KEY =~ ^AIzaSy ]]; then
    echo "❌ API key doesn't look correct. It should start with 'AIzaSy'"
    exit 1
fi

# Get correct Search Engine ID
read -s -p "Enter your Google CSE Search Engine ID (just the ID, not the full script tag): " CORRECT_CX
echo

# Validate CX format (should be alphanumeric)
if [[ ! $CORRECT_CX =~ ^[a-zA-Z0-9]+$ ]]; then
    echo "❌ Search Engine ID doesn't look correct. It should be alphanumeric only."
    exit 1
fi

echo ""
echo "🔄 Updating credentials in Azure Key Vault..."
echo ""

# Update API key
echo "Updating API key..."
az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-API-KEY" --value "$CORRECT_API_KEY"

if [ $? -eq 0 ]; then
    echo "✅ API key updated successfully"
else
    echo "❌ Failed to update API key"
    exit 1
fi

# Update Search Engine ID
echo "Updating Search Engine ID..."
az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-CX" --value "$CORRECT_CX"

if [ $? -eq 0 ]; then
    echo "✅ Search Engine ID updated successfully"
else
    echo "❌ Failed to update Search Engine ID"
    exit 1
fi

echo ""
echo "🧪 Testing the updated configuration..."
echo ""

# Test the configuration
python3 scripts/test-google-cse-setup.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Credentials fixed and working!"
    echo ""
    echo "Next steps:"
    echo "1. Run full image search: python3 scripts/google-custom-search.py"
    echo "2. Monitor usage in Google Cloud Console"
    echo "3. Consider implementing caching for cost optimization"
else
    echo ""
    echo "❌ Still having issues. Please check:"
    echo "1. API key is correct and active"
    echo "2. Search Engine ID is correct"
    echo "3. Custom Search API is enabled"
    echo "4. 'Search the entire web' is enabled in CSE settings"
fi

echo ""
echo "Fix complete! 🎉" 