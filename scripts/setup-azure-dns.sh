#!/bin/bash

# 🎮 Orb Game Wiki Azure DNS Setup Script
# This script helps set up DNS for wiki.orbgame.us using Azure DNS

set -e

echo "🌐 Setting up Azure DNS for wiki.orbgame.us"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Azure CLI installation
check_azure_cli() {
    print_info "Checking Azure CLI installation..."
    
    if command -v az &> /dev/null; then
        print_status "Azure CLI is installed"
        AZ_VERSION=$(az version --output tsv --query '"azure-cli"')
        echo "   Version: $AZ_VERSION"
    else
        print_error "Azure CLI is not installed"
        echo ""
        echo "📋 Install Azure CLI:"
        echo "   macOS: brew install azure-cli"
        echo "   Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
        echo "   Windows: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows"
        echo ""
        return 1
    fi
    
    echo ""
}

# Check Azure login status
check_azure_login() {
    print_info "Checking Azure login status..."
    
    if az account show &> /dev/null; then
        print_status "Logged into Azure"
        SUBSCRIPTION=$(az account show --query "name" --output tsv)
        echo "   Subscription: $SUBSCRIPTION"
    else
        print_warning "Not logged into Azure"
        echo ""
        echo "📋 Login to Azure:"
        echo "   az login"
        echo ""
        return 1
    fi
    
    echo ""
}

# Show Azure Portal DNS Configuration
show_azure_portal_dns() {
    print_info "Azure Portal DNS Configuration"
    echo ""
    echo "📋 Azure Portal Steps:"
    echo "======================"
    echo ""
    echo "1. Go to Azure Portal:"
    echo "   https://portal.azure.com/#@zimax.net/resource/subscriptions/490a597e-95d5-454c-bd0c-3e7b349f1e87/resourceGroups/dns-rg/providers/Microsoft.Network/dnszones/orbgame.us/resourceOverviewId"
    echo ""
    echo "2. Navigate to DNS Zone:"
    echo "   - Resource Group: dns-rg"
    echo "   - DNS Zone: orbgame.us"
    echo ""
    echo "3. Add CNAME Record:"
    echo "   - Click 'Record set' or 'Add record set'"
    echo "   - Type: CNAME"
    echo "   - Name: wiki"
    echo "   - Alias: zimaxnet.github.io"
    echo "   - TTL: 3600"
    echo "   - Click 'OK' to save"
    echo ""
}

# Show Azure CLI DNS Configuration
show_azure_cli_dns() {
    print_info "Azure CLI DNS Configuration"
    echo ""
    echo "📋 Azure CLI Commands:"
    echo "======================"
    echo ""
    echo "# Add CNAME record for wiki subdomain"
    echo "az network dns record-set cname create \\"
    echo "  --resource-group dns-rg \\"
    echo "  --zone-name orbgame.us \\"
    echo "  --name wiki \\"
    echo "  --ttl 3600"
    echo ""
    echo "# Set the CNAME target"
    echo "az network dns record-set cname set-record \\"
    echo "  --resource-group dns-rg \\"
    echo "  --zone-name orbgame.us \\"
    echo "  --record-set-name wiki \\"
    echo "  --cname zimaxnet.github.io"
    echo ""
}

# Execute Azure CLI DNS setup
execute_azure_cli_setup() {
    print_info "Executing Azure CLI DNS setup..."
    
    echo ""
    echo "🔧 Adding CNAME record..."
    
    # Create CNAME record set
    if az network dns record-set cname create \
        --resource-group dns-rg \
        --zone-name orbgame.us \
        --name wiki \
        --ttl 3600; then
        print_status "CNAME record set created"
    else
        print_error "Failed to create CNAME record set"
        return 1
    fi
    
    # Set the CNAME target
    if az network dns record-set cname set-record \
        --resource-group dns-rg \
        --zone-name orbgame.us \
        --record-set-name wiki \
        --cname zimaxnet.github.io; then
        print_status "CNAME target set to zimaxnet.github.io"
    else
        print_error "Failed to set CNAME target"
        return 1
    fi
    
    echo ""
}

# Verify DNS records
verify_dns_records() {
    print_info "Verifying DNS records..."
    
    echo ""
    echo "🔍 Current DNS Records:"
    echo "======================="
    
    # List all records in the zone
    echo "All records in orbgame.us zone:"
    az network dns record-set list \
        --resource-group dns-rg \
        --zone-name orbgame.us \
        --output table
    
    echo ""
    
    # Check specific CNAME record
    echo "Wiki CNAME record:"
    az network dns record-set cname show \
        --resource-group dns-rg \
        --zone-name orbgame.us \
        --name wiki \
        --output table
    
    echo ""
}

# Test DNS resolution
test_dns_resolution() {
    print_info "Testing DNS resolution..."
    
    echo ""
    echo "🔍 DNS Resolution Tests:"
    echo "========================"
    
    # Test main domain
    echo "1. Testing orbgame.us..."
    if nslookup orbgame.us > /dev/null 2>&1; then
        print_status "orbgame.us resolves successfully"
        ORB_DOMAIN_IP=$(nslookup orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   IP Address: $ORB_DOMAIN_IP"
    else
        print_error "orbgame.us does not resolve"
    fi
    
    # Test wiki subdomain
    echo "2. Testing wiki.orbgame.us..."
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "wiki.orbgame.us resolves successfully"
        WIKI_DOMAIN_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   Resolved to: $WIKI_DOMAIN_IP"
    else
        print_warning "wiki.orbgame.us does not resolve yet"
        echo "   This is expected if DNS is not configured yet"
    fi
    
    echo ""
}

# Create Azure DNS configuration file
create_azure_dns_config() {
    print_info "Creating Azure DNS configuration file..."
    
    cat > azure-dns-config.txt << 'EOF'
# 🎮 Orb Game Wiki Azure DNS Configuration
# Domain: orbgame.us
# Subdomain: wiki.orbgame.us
# Target: GitHub Pages (zimaxnet.github.io)

## Azure DNS Zone Information
Resource Group: dns-rg
Zone Name: orbgame.us
Subscription: 490a597e-95d5-454c-bd0c-3e7b349f1e87

## Required DNS Record

### CNAME Record
Type: CNAME
Name: wiki
Value: zimaxnet.github.io
TTL: 3600
Description: Points wiki.orbgame.us to GitHub Pages

## Azure Portal Configuration

### Portal URL
https://portal.azure.com/#@zimax.net/resource/subscriptions/490a597e-95d5-454c-bd0c-3e7b349f1e87/resourceGroups/dns-rg/providers/Microsoft.Network/dnszones/orbgame.us/resourceOverviewId

### Steps in Azure Portal
1. Navigate to the DNS zone orbgame.us
2. Click "Record set" or "Add record set"
3. Select "CNAME" as the record type
4. Enter "wiki" as the name
5. Enter "zimaxnet.github.io" as the alias
6. Set TTL to 3600
7. Click "OK" to save

## Azure CLI Commands

### Add CNAME Record
az network dns record-set cname create \
  --resource-group dns-rg \
  --zone-name orbgame.us \
  --name wiki \
  --ttl 3600

### Set CNAME Target
az network dns record-set cname set-record \
  --resource-group dns-rg \
  --zone-name orbgame.us \
  --record-set-name wiki \
  --cname zimaxnet.github.io

### List All Records
az network dns record-set list \
  --resource-group dns-rg \
  --zone-name orbgame.us \
  --output table

### Show Wiki CNAME Record
az network dns record-set cname show \
  --resource-group dns-rg \
  --zone-name orbgame.us \
  --name wiki \
  --output table

## Verification Commands

### DNS Resolution
nslookup wiki.orbgame.us

### Website Access
curl -I https://wiki.orbgame.us

### SSL Certificate
openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us

## Troubleshooting

### If Azure CLI is not installed:
# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Windows
# Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows

### If not logged into Azure:
az login

### If DNS doesn't resolve:
1. Check Azure DNS zone configuration
2. Verify CNAME record is added correctly
3. Wait for DNS propagation (5-30 minutes)
4. Check GitHub Pages is enabled

### If HTTPS doesn't work:
1. Ensure "Enforce HTTPS" is enabled in GitHub
2. Wait for SSL certificate generation (up to 24 hours)
3. Check DNS propagation is complete
EOF

    print_status "Azure DNS configuration file created: azure-dns-config.txt"
}

# Main execution
main() {
    echo ""
    print_info "Starting Azure DNS setup for wiki.orbgame.us..."
    echo ""
    
    # Check prerequisites
    if ! check_azure_cli; then
        echo "Please install Azure CLI and run this script again."
        exit 1
    fi
    
    if ! check_azure_login; then
        echo "Please login to Azure with 'az login' and run this script again."
        exit 1
    fi
    
    # Show configuration options
    show_azure_portal_dns
    show_azure_cli_dns
    create_azure_dns_config
    
    # Ask user preference
    echo ""
    print_info "Choose your preferred method:"
    echo "1. Azure Portal (manual)"
    echo "2. Azure CLI (automated)"
    echo "3. Both"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            print_info "Using Azure Portal method"
            echo "Follow the portal instructions above."
            ;;
        2)
            print_info "Using Azure CLI method"
            execute_azure_cli_setup
            verify_dns_records
            ;;
        3)
            print_info "Using both methods"
            execute_azure_cli_setup
            verify_dns_records
            echo ""
            echo "Also follow the portal instructions for verification."
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    test_dns_resolution
    
    echo ""
    print_status "Azure DNS setup completed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Configure GitHub Pages with custom domain"
    echo "  2. Wait for DNS propagation (5-30 minutes)"
    echo "  3. Test the wiki at https://wiki.orbgame.us"
    echo ""
    print_info "Configuration details saved to: azure-dns-config.txt"
    echo ""
}

# Run main function
main "$@" 