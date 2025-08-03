#!/bin/bash

# Orb Game - Simple Image Upload to Azure Blob Storage
# This script uploads all historical figure images to Azure Blob Storage using connection string

set -e

echo "🚀 Starting Orb Game Simple Image Upload to Azure Blob Storage..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "scripts/upload-images-to-blob-simple.py" ]; then
    echo -e "${RED}❌ Error: Please run this script from the orb-game root directory${NC}"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if connection string is set
if [ -z "$AZURE_STORAGE_CONNECTION_STRING" ]; then
    echo -e "${RED}❌ Error: AZURE_STORAGE_CONNECTION_STRING environment variable not set${NC}"
    echo -e "${YELLOW}💡 Please set the connection string:${NC}"
    echo "   export AZURE_STORAGE_CONNECTION_STRING='your_connection_string_here'"
    echo ""
    echo -e "${BLUE}📋 To get the connection string:${NC}"
    echo "   1. Go to Azure Portal"
    echo "   2. Navigate to your storage account (orbgameimages)"
    echo "   3. Go to 'Access keys'"
    echo "   4. Copy the connection string"
    echo "   5. Set it as environment variable"
    exit 1
fi

echo -e "${BLUE}📋 Prerequisites Check:${NC}"
echo "  ✅ Python 3 available"
echo "  ✅ Azure Storage connection string set"

# Install Python dependencies
echo -e "\n${YELLOW}📦 Installing Python dependencies...${NC}"
pip3 install -r scripts/requirements-upload.txt

# Run the upload script
echo -e "\n${YELLOW}📤 Starting image upload...${NC}"
cd scripts
python3 upload-images-to-blob-simple.py

# Check results
if [ -f "../uploaded_real_images.json" ]; then
    echo -e "\n${GREEN}✅ Real images upload completed successfully!${NC}"
    echo -e "${BLUE}📊 Results saved to: uploaded_real_images.json${NC}"
    
    # Show summary
    echo -e "\n${BLUE}📈 Real Images Upload Summary:${NC}"
    python3 -c "
import json
with open('../uploaded_real_images.json', 'r') as f:
    data = json.load(f)
    stats = data['upload_stats']
    print(f'  ✅ Successful uploads: {stats[\"successful_uploads\"]}')
    print(f'  ❌ Failed uploads: {stats[\"failed_uploads\"]}')
    print(f'  📁 Total images processed: {stats[\"total_images\"]}')
"
else
    echo -e "\n${RED}❌ Real images upload failed or no results file generated${NC}"
fi

# Check if placeholder images were created
if [ -f "../uploaded_placeholder_images.json" ]; then
    echo -e "\n${GREEN}✅ Placeholder images created successfully!${NC}"
    echo -e "${BLUE}📊 Results saved to: uploaded_placeholder_images.json${NC}"
    
    # Show placeholder summary
    echo -e "\n${BLUE}📈 Placeholder Images Summary:${NC}"
    python3 -c "
import json
with open('../uploaded_placeholder_images.json', 'r') as f:
    data = json.load(f)
    print(f'  🎨 Placeholder images created: {len(data[\"placeholder_images\"])}')
"
fi

# Check if updated image service was created
if [ -f "../backend/historical-figures-image-service-blob.js" ]; then
    echo -e "\n${GREEN}✅ Updated image service created!${NC}"
    echo -e "${BLUE}📁 File: backend/historical-figures-image-service-blob.js${NC}"
    echo -e "${YELLOW}💡 To use the blob storage service:${NC}"
    echo "   1. Replace the current image service in backend-server.js"
    echo "   2. Update the import to use BlobStorageImageService"
    echo "   3. Deploy the updated backend"
fi

echo -e "\n${GREEN}🎉 Image upload process completed!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Review the upload results in uploaded_real_images.json"
echo "  2. Review placeholder images in uploaded_placeholder_images.json"
echo "  3. Test the updated image service"
echo "  4. Deploy the updated backend with new image service"
echo "  5. Verify images are accessible via blob storage URLs" 