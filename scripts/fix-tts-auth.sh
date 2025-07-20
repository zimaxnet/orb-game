#!/bin/bash

# Fix TTS Authorization Script
# This script updates all TTS calls to use Authorization: Bearer header

echo "🔧 Fixing TTS Authorization Headers..."

# Update all TTS calls to use Authorization: Bearer instead of api-key
echo "Updating TTS authorization headers..."

# Fix the authorization header
sed -i '' 's/'\''api-key'\'': azureOpenAIApiKey/'\''Authorization'\'': `Bearer ${azureOpenAIApiKey}`/g' backend/backend-server.js

# Fix the response_format and speed parameters (remove them as they're not needed)
sed -i '' 's/, response_format: '\''mp3'\''//g' backend/backend-server.js
sed -i '' 's/, speed: 1.0//g' backend/backend-server.js

echo "✅ TTS authorization headers updated successfully!"

# Verify the changes
echo "🔍 Verifying changes..."
grep -n "Authorization.*Bearer" backend/backend-server.js

echo "🎉 TTS authorization fix completed!" 