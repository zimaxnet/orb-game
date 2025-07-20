#!/bin/bash

# Script to get Azure Cosmos DB for MongoDB connection string
# This script helps you retrieve the connection string from Azure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Azure Cosmos DB Connection String Setup${NC}"
echo -e "${BLUE}==========================================${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed.${NC}"
    echo -e "${YELLOW}Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli${NC}"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure CLI.${NC}"
    echo -e "${YELLOW}Please run: az login${NC}"
    exit 1
fi

# Azure Cosmos DB details
RESOURCE_GROUP="orb-game-rg-eastus2"
ACCOUNT_NAME="orb-game-mongodb-eastus2"

echo -e "${BLUE}📋 Azure Cosmos DB Details:${NC}"
echo -e "  Resource Group: ${RESOURCE_GROUP}"
echo -e "  Account Name: ${ACCOUNT_NAME}"
echo ""

echo -e "${YELLOW}🔍 Retrieving connection string from Azure...${NC}"

# Get the connection string
CONNECTION_STRING=$(az cosmosdb keys list \
    --name "$ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --type connection-strings \
    --query "connectionStrings[0].connectionString" \
    --output tsv)

if [ $? -eq 0 ] && [ ! -z "$CONNECTION_STRING" ]; then
    echo -e "${GREEN}✅ Successfully retrieved connection string!${NC}"
    echo ""
    echo -e "${BLUE}📋 Connection String:${NC}"
    echo -e "${YELLOW}$CONNECTION_STRING${NC}"
    echo ""
    
    # Update the .env file
    echo -e "${YELLOW}📝 Updating .env file...${NC}"
    
    # Create backup of current .env
    if [ -f ".env" ]; then
        cp .env .env.backup
        echo -e "${BLUE}📦 Created backup: .env.backup${NC}"
    fi
    
    # Update MONGO_URI in .env file
    if [ -f ".env" ]; then
        # Replace the existing MONGO_URI line
        sed -i.bak "s|MONGO_URI=.*|MONGO_URI=$CONNECTION_STRING|" .env
        echo -e "${GREEN}✅ Updated .env file with Azure Cosmos DB connection string${NC}"
    else
        echo -e "${RED}❌ .env file not found${NC}"
        echo -e "${YELLOW}Please create .env file first${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Azure Cosmos DB connection string configured!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "  1. Test the connection: ${YELLOW}node test-mongodb-connection.js${NC}"
    echo -e "  2. Test memory system: ${YELLOW}bash scripts/test-memory.sh${NC}"
    echo -e "  3. Deploy to production: ${YELLOW}bash scripts/deploy-memory.sh${NC}"
    
else
    echo -e "${RED}❌ Failed to retrieve connection string${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  - Azure CLI is logged in"
    echo -e "  - Resource group and account name are correct"
    echo -e "  - You have permissions to access the Cosmos DB account"
    exit 1
fi 