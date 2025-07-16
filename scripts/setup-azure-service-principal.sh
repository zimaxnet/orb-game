#!/bin/bash

# Setup Azure Service Principal for Orb Game Deployment
# This script creates the orb-game-sp service principal with correct privileges

set -e

echo "🔧 Setting up Azure Service Principal for Orb Game Deployment"
echo "============================================================"
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

# Get current subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
echo "📦 Current Subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
echo ""

# Check if resource group exists
RESOURCE_GROUP="orb-game-rg-eastus2"
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Resource group '$RESOURCE_GROUP' does not exist."
    echo "   Please create it first or update the resource group name in this script."
    exit 1
fi

echo "🔍 Checking for existing service principal 'orb-game-sp'..."
EXISTING_SP=$(az ad sp list --display-name "orb-game-sp" --query "[].appId" -o tsv)

if [ -n "$EXISTING_SP" ]; then
    echo "⚠️  Service principal 'orb-game-sp' already exists."
    read -p "Do you want to delete the existing one and create a new one? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting existing service principal..."
        az ad sp delete --id "$EXISTING_SP"
        echo "✅ Existing service principal deleted"
    else
        echo "❌ Aborting. Please use the existing service principal or delete it manually."
        exit 1
    fi
fi

echo ""
echo "🚀 Creating new service principal 'orb-game-sp'..."

# Create service principal with contributor role on the resource group
SP_OUTPUT=$(az ad sp create-for-rbac \
    --name "orb-game-sp" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
    --sdk-auth \
    --years 2)

echo "✅ Service principal created successfully!"
echo ""

# Extract values from the output
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.clientSecret')
TENANT_ID=$(echo "$SP_OUTPUT" | jq -r '.tenantId')
SUBSCRIPTION_ID_OUTPUT=$(echo "$SP_OUTPUT" | jq -r '.subscriptionId')

echo "📋 Service Principal Details:"
echo "============================="
echo "Display Name: orb-game-sp"
echo "Client ID: $CLIENT_ID"
echo "Tenant ID: $TENANT_ID"
echo "Subscription ID: $SUBSCRIPTION_ID_OUTPUT"
echo "Resource Group: $RESOURCE_GROUP"
echo "Role: Contributor"
echo ""

# Create the AZURE_CREDENTIALS JSON for GitHub secrets
AZURE_CREDENTIALS=$(echo "$SP_OUTPUT" | jq -c '.')

echo "🔐 AZURE_CREDENTIALS for GitHub Secrets:"
echo "========================================="
echo "$AZURE_CREDENTIALS"
echo ""

# Additional permissions for Azure OpenAI (if needed)
echo "🔍 Checking for Azure OpenAI resource..."
OPENAI_RESOURCE=$(az cognitiveservices account list --resource-group "$RESOURCE_GROUP" --query "[?kind=='OpenAI'].name" -o tsv)

if [ -n "$OPENAI_RESOURCE" ]; then
    echo "✅ Found Azure OpenAI resource: $OPENAI_RESOURCE"
    echo "📝 Adding Cognitive Services User role for Azure OpenAI access..."
    
    # Add Cognitive Services User role for OpenAI access
    az role assignment create \
        --assignee "$CLIENT_ID" \
        --role "Cognitive Services User" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.CognitiveServices/accounts/$OPENAI_RESOURCE"
    
    echo "✅ Cognitive Services User role assigned successfully!"
else
    echo "⚠️  No Azure OpenAI resource found in resource group '$RESOURCE_GROUP'"
    echo "   You may need to manually assign permissions to your OpenAI resource"
fi

echo ""
echo "🎉 Service Principal Setup Complete!"
echo "==================================="
echo ""
echo "📋 Next Steps:"
echo "1. Copy the AZURE_CREDENTIALS JSON above"
echo "2. Run the setup-github-secrets.sh script"
echo "3. Paste the AZURE_CREDENTIALS when prompted"
echo ""
echo "🔗 Azure Portal URL: https://portal.azure.com/#@$TENANT_ID/resource/subscriptions/$SUBSCRIPTION_ID_OUTPUT/resourceGroups/$RESOURCE_GROUP"
echo "🔗 Service Principal URL: https://portal.azure.com/#@$TENANT_ID/resource/Microsoft_AAD_RegisteredApps/Applications/$CLIENT_ID"
echo ""
echo "⚠️  Important Security Notes:"
echo "- The client secret is only shown once. Store it securely."
echo "- The service principal has Contributor access to the resource group."
echo "- Consider using more restrictive roles for production environments."
echo "- The service principal will expire in 2 years." 