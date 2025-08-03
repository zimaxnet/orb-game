#!/bin/bash

# Fix TTS Authorization Headers Script
# This script fixes all TTS-related Authorization headers to use 'api-key' instead of 'Authorization: Bearer'

echo "🔧 Fixing TTS Authorization Headers..."

# Fix the main chat endpoint TTS
echo "Fixing chat endpoint TTS headers..."
sed -i '' 's/'\''Authorization'\'': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`/'\''api-key'\'': process.env.AZURE_OPENAI_API_KEY/g' backend/backend-server.js

# Fix the Grok story generation TTS
echo "Fixing Grok story generation TTS headers..."
sed -i '' 's/'\''Authorization'\'': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`/'\''api-key'\'': process.env.AZURE_OPENAI_API_KEY/g' backend/backend-server.js

# Fix the Perplexity story generation TTS
echo "Fixing Perplexity story generation TTS headers..."
sed -i '' 's/'\''Authorization'\'': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`/'\''api-key'\'': process.env.AZURE_OPENAI_API_KEY/g' backend/backend-server.js

# Fix the Azure OpenAI story generation TTS
echo "Fixing Azure OpenAI story generation TTS headers..."
sed -i '' 's/'\''Authorization'\'': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`/'\''api-key'\'': process.env.AZURE_OPENAI_API_KEY/g' backend/backend-server.js

# Fix the direct fallback story TTS
echo "Fixing direct fallback story TTS headers..."
sed -i '' 's/'\''Authorization'\'': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`/'\''api-key'\'': process.env.AZURE_OPENAI_API_KEY/g' backend/backend-server.js

echo "✅ TTS Authorization headers fixed!"

# Verify the changes
echo "🔍 Verifying changes..."
grep -n "api-key.*AZURE_OPENAI_API_KEY" backend/backend-server.js

echo "🎉 TTS headers fix completed!" 