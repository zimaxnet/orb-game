#!/bin/bash

# Fix TTS Secrets Script
# This script updates all TTS calls to use secrets from Key Vault

echo "🔧 Fixing TTS Secrets in Backend..."

# Update all TTS calls to use the global variables instead of process.env
echo "Updating TTS calls to use Key Vault secrets..."

# Fix the Grok story generation TTS call
sed -i '' 's/process\.env\.AZURE_OPENAI_ENDPOINT/AZURE_OPENAI_ENDPOINT/g' backend/backend-server.js
sed -i '' 's/process\.env\.AZURE_OPENAI_TTS_DEPLOYMENT/AZURE_OPENAI_TTS_DEPLOYMENT/g' backend/backend-server.js
sed -i '' 's/process\.env\.AZURE_OPENAI_API_KEY/azureOpenAIApiKey/g' backend/backend-server.js

# Fix the Perplexity API key in story generation
sed -i '' 's/process\.env\.PERPLEXITY_API_KEY/perplexityApiKey/g' backend/backend-server.js

# Fix the Azure OpenAI deployment in story generation
sed -i '' 's/process\.env\.AZURE_OPENAI_DEPLOYMENT/AZURE_OPENAI_DEPLOYMENT/g' backend/backend-server.js

echo "✅ TTS secrets updated successfully!"

# Verify the changes
echo "🔍 Verifying changes..."
grep -n "azureOpenAIApiKey" backend/backend-server.js

echo "🎉 TTS secrets fix completed!" 