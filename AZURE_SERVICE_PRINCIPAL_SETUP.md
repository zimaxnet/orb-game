# Azure Service Principal Setup for Orb Game

This guide helps you set up the Azure service principal `orb-game-sp` with the correct privileges for GitHub Actions deployment.

## Overview

The service principal will have:
- **Contributor** role on the `orb-game-rg-eastus2` resource group
- **Cognitive Services User** role on Azure OpenAI resources (if found)
- 2-year expiration for security
- Proper scoping to limit access to only necessary resources

## Prerequisites

1. **Azure CLI** installed and logged in
2. **GitHub CLI** installed and logged in
3. **jq** installed for JSON parsing
4. Resource group `orb-game-rg-eastus2` exists in your Azure subscription

## Quick Setup

### Step 1: Create the Service Principal

```bash
# Run the automated setup script
./scripts/setup-azure-service-principal.sh
```

This script will:
- Check if you're logged into Azure
- Verify the resource group exists
- Create the `orb-game-sp` service principal
- Assign appropriate roles
- Output the credentials for GitHub secrets

### Step 2: Set Up GitHub Secrets

```bash
# Run the GitHub secrets setup script
./scripts/setup-github-secrets.sh
```

When prompted for Azure Credentials, paste the JSON output from Step 1.

## Manual Setup (Alternative)

If you prefer to create the service principal manually:

### 1. Create Service Principal

```bash
# Login to Azure
az login

# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create service principal
az ad sp create-for-rbac \
    --name "orb-game-sp" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/orb-game-rg-eastus2" \
    --sdk-auth \
    --years 2
```

### 2. Add OpenAI Permissions (if needed)

```bash
# Get the client ID from the previous command output
CLIENT_ID="your-client-id"

# Add Cognitive Services User role for OpenAI access
az role assignment create \
    --assignee "$CLIENT_ID" \
    --role "Cognitive Services User" \
    --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/orb-game-rg-eastus2/providers/Microsoft.CognitiveServices/accounts/YOUR_OPENAI_RESOURCE_NAME"
```

## Required GitHub Secrets

After creating the service principal, you'll need these GitHub secrets:

1. **AZURE_CREDENTIALS** - The JSON output from the service principal creation
2. **AZURE_WEBAPP_PUBLISH_PROFILE** - Web App publish profile
3. **AZURE_OPENAI_ENDPOINT** - Your Azure OpenAI endpoint
4. **AZURE_OPENAI_API_KEY** - Your Azure OpenAI API key
5. **AZURE_OPENAI_DEPLOYMENT** - Your Azure OpenAI deployment name
6. **AZURE_OPENAI_TTS_DEPLOYMENT** - Your Azure OpenAI TTS deployment name
7. **PERPLEXITY_API_KEY** - Your Perplexity API key for web search

## Security Best Practices

### Role Assignment
- The service principal has **Contributor** access only to the specific resource group
- This limits the scope of potential damage if credentials are compromised
- For production, consider using more restrictive roles like **Reader** + specific **Contributor** roles

### Credential Management
- Service principal credentials expire in 2 years
- Store the client secret securely - it's only shown once during creation
- Rotate credentials regularly
- Use Azure Key Vault for storing sensitive information in production

### Monitoring
- Monitor service principal usage in Azure AD
- Set up alerts for unusual activity
- Review role assignments regularly

## Troubleshooting

### Common Issues

1. **"Resource group does not exist"**
   - Create the resource group first: `az group create --name orb-game-rg-eastus2 --location eastus2`

2. **"Insufficient privileges"**
   - Ensure you have Global Administrator or User Administrator role in Azure AD
   - Or have Owner role on the subscription

3. **"Service principal already exists"**
   - The script will offer to delete and recreate it
   - Or manually delete: `az ad sp delete --display-name "orb-game-sp"`

4. **GitHub Actions deployment fails**
   - Verify the AZURE_CREDENTIALS secret is correctly formatted JSON
   - Check that the service principal has access to the resource group
   - Ensure the Web App exists and is accessible

### Verification Commands

```bash
# Check if service principal exists
az ad sp list --display-name "orb-game-sp"

# Check role assignments
az role assignment list --assignee "orb-game-sp"

# Test authentication
az login --service-principal -u CLIENT_ID -p CLIENT_SECRET --tenant TENANT_ID
```

## Azure Portal Links

After setup, you can manage the service principal at:
- **Service Principal**: `https://portal.azure.com/#@TENANT_ID/resource/Microsoft_AAD_RegisteredApps/Applications/CLIENT_ID`
- **Resource Group**: `https://portal.azure.com/#@TENANT_ID/resource/subscriptions/SUBSCRIPTION_ID/resourceGroups/orb-game-rg-eastus2`

## Next Steps

1. ✅ Create service principal with `./scripts/setup-azure-service-principal.sh`
2. ✅ Set up GitHub secrets with `./scripts/setup-github-secrets.sh`
3. ✅ Test deployment by pushing to GitHub
4. ✅ Monitor deployment logs in GitHub Actions
5. ✅ Verify the application is working correctly

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Azure AD audit logs
3. Check GitHub Actions logs for deployment errors
4. Verify all required secrets are set correctly 