#!/bin/bash

# This script sets the secrets in your Azure Key Vault.
# Replace the placeholder values below with your actual secrets before running.

# Your Azure Key Vault name
KEY_VAULT_NAME="orb-game-kv-eastus2"

# --- REPLACE THESE PLACEHOLDER VALUES ---
AZURE_OPENAI_API_KEY="YOUR_AZURE_OPENAI_API_KEY"
PERPLEXITY_API_KEY="YOUR_PERPLEXITY_API_KEY"
MONGO_URI="YOUR_MONGO_URI"
# -----------------------------------------

echo "Setting Azure OpenAI API Key..."
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "AZURE-OPENAI-API-KEY" --value "$AZURE_OPENAI_API_KEY"

echo "Setting Perplexity API Key..."
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "PERPLEXITY-API-KEY" --value "$PERPLEXITY_API_KEY"

echo "Setting Mongo URI..."
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "MONGO-URI" --value "$MONGO_URI"

echo "All secrets have been set in Key Vault: $KEY_VAULT_NAME" 