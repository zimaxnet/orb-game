#!/bin/bash

# Add Voice Live Key to Azure Key Vault
# This script adds the voice live key to the Azure Key Vault for TTS functionality

set -e

echo "🎵 Adding Voice Live Key to Azure Key Vault..."

# Configuration
KEY_VAULT_NAME="orb-game-kv-eastus2"
VOICE_LIVE_KEY="YOUR_VOICE_LIVE_KEY_HERE"

echo "📋 Configuration:"
echo "  Key Vault Name: $KEY_VAULT_NAME"
echo "  Secret Name: VOICE-LIVE-KEY"
echo "  Key Value: ${VOICE_LIVE_KEY:0:8}..."

# Check if we're logged into Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged into Azure. Please run 'az login' first."
    exit 1
fi

echo "✅ Azure CLI authenticated"

# Add the voice live key to Key Vault
echo "🔐 Adding VOICE-LIVE-KEY secret to Key Vault..."
az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "VOICE-LIVE-KEY" \
  --value "$VOICE_LIVE_KEY"

echo "✅ Voice Live Key added successfully!"

# Verify the secret was added
echo "🔍 Verifying secret was added..."
SECRET_VALUE=$(az keyvault secret show \
  --vault-name "$KEY_VAULT_NAME" \
  --name "VOICE-LIVE-KEY" \
  --query value \
  --output tsv)

if [ "$SECRET_VALUE" = "$VOICE_LIVE_KEY" ]; then
    echo "✅ Secret verified successfully"
    echo "   Value preview: ${SECRET_VALUE:0:8}..."
else
    echo "❌ Secret verification failed"
    exit 1
fi

echo "🎉 Voice Live Key successfully added to Key Vault!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your backend code to use this key for TTS"
echo "2. Add VOICE-LIVE-KEY to your environment variables"
echo "3. Test TTS functionality with the new key"
echo ""
echo "🔗 Key Vault URL: https://$KEY_VAULT_NAME.vault.azure.net/" 