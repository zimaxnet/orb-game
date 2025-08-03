#!/bin/bash
set -e

echo "🚀 Starting Real Image Fetch for Placeholder Figures"
echo "=================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "OrbGameInfluentialPeopleSeeds" ]; then
    echo -e "${RED}❌ Error: Please run this script from the orb-game root directory${NC}"
    exit 1
fi

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Error: Azure CLI is required but not installed${NC}"
    exit 1
fi

# Check if logged into Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️ Not logged into Azure. Please run: az login${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Prerequisites check passed${NC}"

# Install Python dependencies if needed
echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
pip3 install requests azure-identity azure-keyvault-secrets

# Check if Google CSE credentials exist in Key Vault
echo -e "${BLUE}🔐 Checking Google Custom Search API credentials...${NC}"

# Try to get credentials from Key Vault
API_KEY=$(az keyvault secret show --vault-name orb-game-kv-eastus2 --name google-custom-search-api-key --query value -o tsv 2>/dev/null || echo "")
CX=$(az keyvault secret show --vault-name orb-game-kv-eastus2 --name google-custom-search-cx --query value -o tsv 2>/dev/null || echo "")

if [ -z "$API_KEY" ] || [ -z "$CX" ]; then
    echo -e "${YELLOW}⚠️ Google CSE credentials not found in Key Vault${NC}"
    echo -e "${BLUE}💡 You can add them with:${NC}"
    echo "   az keyvault secret set --vault-name orb-game-kv-eastus2 --name google-custom-search-api-key --value 'your-api-key'"
    echo "   az keyvault secret set --vault-name orb-game-kv-eastus2 --name google-custom-search-cx --value 'your-cx-id'"
    echo ""
    echo -e "${BLUE}💡 Or set environment variables:${NC}"
    echo "   export GOOGLE_CUSTOM_SEARCH_API_KEY='your-api-key'"
    echo "   export GOOGLE_CUSTOM_SEARCH_CX='your-cx-id'"
    echo ""
    echo -e "${YELLOW}⚠️ Please configure Google CSE credentials before running the script${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Google CSE credentials found in Key Vault${NC}"
fi

# Run the Python script
echo -e "${BLUE}🚀 Running real image fetch script...${NC}"
cd scripts
python3 fetch-real-images-for-placeholders.py

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Real image fetch completed successfully!${NC}"
    
    # Find the results file
    RESULTS_FILE=$(ls -t real_images_for_placeholders_*.json 2>/dev/null | head -1)
    if [ -n "$RESULTS_FILE" ]; then
        echo -e "${BLUE}📁 Results saved to: $RESULTS_FILE${NC}"
        
        # Show summary
        echo -e "${BLUE}📊 Summary:${NC}"
        python3 -c "
import json
try:
    with open('$RESULTS_FILE', 'r') as f:
        data = json.load(f)
    metadata = data['metadata']
    summary = data['summary_stats']
    print(f'Total Figures: {metadata[\"total_figures\"]}')
    print(f'Successful: {metadata[\"successful\"]}')
    print(f'Failed: {metadata[\"failed\"]}')
    print(f'Total Images Found: {summary[\"total_images_found\"]}')
    print(f'Success Rate: {(summary[\"successful_searches\"] / summary[\"total_queries\"] * 100):.1f}%')
except Exception as e:
    print(f'Error reading results: {e}')
"
    fi
else
    echo -e "${RED}❌ Real image fetch failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Real image fetch process completed!${NC}" 