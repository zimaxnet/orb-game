#!/bin/bash

# Orb Game - Upload Images to Azure Blob Storage
# This script uploads all historical figure images to Azure Blob Storage

set -e

echo "🚀 Starting Orb Game Image Upload to Azure Blob Storage..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "scripts/upload-images-to-blob.py" ]; then
    echo -e "${RED}❌ Error: Please run this script from the orb-game root directory${NC}"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if Azure CLI is available and logged in
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Error: Azure CLI is required but not installed${NC}"
    echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged into Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️ Not logged into Azure. Please run: az login${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Prerequisites Check:${NC}"
echo "  ✅ Python 3 available"
echo "  ✅ Azure CLI available"
echo "  ✅ Azure login verified"

# Install Python dependencies
echo -e "\n${YELLOW}📦 Installing Python dependencies...${NC}"
pip3 install -r scripts/requirements-upload.txt

# Check if storage account exists
echo -e "\n${YELLOW}🔍 Checking Azure Blob Storage account...${NC}"
STORAGE_ACCOUNT="orbgameimages"
RESOURCE_GROUP="orb-game-rg-eastus2"

if ! az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${RED}❌ Storage account '$STORAGE_ACCOUNT' not found in resource group '$RESOURCE_GROUP'${NC}"
    echo "Please create the storage account first or update the script with the correct account name."
    exit 1
fi

echo -e "${GREEN}✅ Storage account '$STORAGE_ACCOUNT' found${NC}"

# Check if container exists, create if not
echo -e "\n${YELLOW}🔍 Checking blob container...${NC}"
CONTAINER_NAME="historical-figures"

if ! az storage container show --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT &> /dev/null; then
    echo -e "${YELLOW}⚠️ Container '$CONTAINER_NAME' not found. Creating...${NC}"
    az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT --public-access blob
    echo -e "${GREEN}✅ Container '$CONTAINER_NAME' created${NC}"
else
    echo -e "${GREEN}✅ Container '$CONTAINER_NAME' exists${NC}"
fi

# Run the upload script
echo -e "\n${YELLOW}📤 Starting image upload...${NC}"
cd scripts
python3 upload-images-to-blob.py

# Check results
if [ -f "../uploaded_images_results.json" ]; then
    echo -e "\n${GREEN}✅ Upload completed successfully!${NC}"
    echo -e "${BLUE}📊 Results saved to: uploaded_images_results.json${NC}"
    
    # Show summary
    echo -e "\n${BLUE}📈 Upload Summary:${NC}"
    python3 -c "
import json
with open('../uploaded_images_results.json', 'r') as f:
    data = json.load(f)
    stats = data['upload_stats']
    print(f'  ✅ Successful uploads: {stats[\"successful_uploads\"]}')
    print(f'  ❌ Failed uploads: {stats[\"failed_uploads\"]}')
    print(f'  📁 Total images processed: {stats[\"total_images\"]}')
"
else
    echo -e "\n${RED}❌ Upload failed or no results file generated${NC}"
    exit 1
fi

# Check if placeholder images were created
if [ -f "../placeholder_images_results.json" ]; then
    echo -e "\n${GREEN}✅ Placeholder images created successfully!${NC}"
    echo -e "${BLUE}📊 Results saved to: placeholder_images_results.json${NC}"
fi

# Check if updated image service was created
if [ -f "../backend/historical-figures-image-service-updated.js" ]; then
    echo -e "\n${GREEN}✅ Updated image service created!${NC}"
    echo -e "${BLUE}📁 File: backend/historical-figures-image-service-updated.js${NC}"
    echo -e "${YELLOW}💡 To use the updated service, replace the current image service file${NC}"
fi

echo -e "\n${GREEN}🎉 Image upload process completed!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Review the upload results in uploaded_images_results.json"
echo "  2. Test the updated image service"
echo "  3. Deploy the updated backend with new image service"
echo "  4. Verify images are accessible via blob storage URLs" 