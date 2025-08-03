#!/bin/bash

# 🎮 Orb Game Wiki DNS Setup Script
# This script helps set up DNS for wiki.orbgame.us

set -e

echo "🌐 Setting up DNS for wiki.orbgame.us"
echo "======================================"

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

# Check current DNS status
check_dns_status() {
    print_info "Checking current DNS status..."
    
    echo ""
    echo "📋 Current DNS Status:"
    echo "======================"
    
    # Check main domain
    if nslookup orbgame.us > /dev/null 2>&1; then
        print_status "orbgame.us is accessible"
        ORB_DOMAIN_IP=$(nslookup orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   IP Address: $ORB_DOMAIN_IP"
    else
        print_error "orbgame.us is not accessible"
    fi
    
    # Check wiki subdomain
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "wiki.orbgame.us is accessible"
        WIKI_DOMAIN_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   IP Address: $WIKI_DOMAIN_IP"
    else
        print_warning "wiki.orbgame.us is not configured yet"
    fi
    
    echo ""
}

# Display DNS configuration instructions
show_dns_instructions() {
    print_info "DNS Configuration Instructions"
    echo ""
    echo "📋 DNS Records to Add:"
    echo "======================"
    echo ""
    echo "1. CNAME Record for wiki subdomain:"
    echo "   Type: CNAME"
    echo "   Name: wiki"
    echo "   Value: zimaxnet.github.io"
    echo "   TTL: 3600 (or default)"
    echo ""
    echo "2. Optional: A Record for direct IP (alternative)"
    echo "   Type: A"
    echo "   Name: wiki"
    echo "   Value: 185.199.108.153"
    echo "   TTL: 3600 (or default)"
    echo ""
    echo "3. Optional: Additional A Records for redundancy"
    echo "   Type: A"
    echo "   Name: wiki"
    echo "   Value: 185.199.109.153"
    echo "   TTL: 3600 (or default)"
    echo ""
    echo "   Type: A"
    echo "   Name: wiki"
    echo "   Value: 185.199.110.153"
    echo "   TTL: 3600 (or default)"
    echo ""
    echo "   Type: A"
    echo "   Name: wiki"
    echo "   Value: 185.199.111.153"
    echo "   TTL: 3600 (or default)"
    echo ""
}

# Show GitHub Pages configuration
show_github_pages_config() {
    print_info "GitHub Pages Configuration"
    echo ""
    echo "📋 GitHub Repository Settings:"
    echo "=============================="
    echo ""
    echo "1. Go to: https://github.com/zimaxnet/orb-game/settings/pages"
    echo ""
    echo "2. Configure GitHub Pages:"
    echo "   - Source: Deploy from a branch"
    echo "   - Branch: gh-pages"
    echo "   - Folder: / (root)"
    echo ""
    echo "3. Add Custom Domain:"
    echo "   - Custom domain: wiki.orbgame.us"
    echo "   - Check 'Enforce HTTPS'"
    echo ""
    echo "4. Save the configuration"
    echo ""
}

# Show verification steps
show_verification_steps() {
    print_info "DNS Verification Steps"
    echo ""
    echo "📋 After DNS Configuration:"
    echo "==========================="
    echo ""
    echo "1. Wait for DNS propagation (5-30 minutes)"
    echo ""
    echo "2. Test DNS resolution:"
    echo "   nslookup wiki.orbgame.us"
    echo ""
    echo "3. Test website access:"
    echo "   curl -I https://wiki.orbgame.us"
    echo ""
    echo "4. Check SSL certificate:"
    echo "   openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us"
    echo ""
}

# Create DNS configuration file
create_dns_config() {
    print_info "Creating DNS configuration file..."
    
    cat > dns-config.txt << 'EOF'
# 🎮 Orb Game Wiki DNS Configuration
# Domain: orbgame.us
# Subdomain: wiki.orbgame.us
# Target: GitHub Pages (zimaxnet.github.io)

## Required DNS Records

### 1. CNAME Record (Recommended)
Type: CNAME
Name: wiki
Value: zimaxnet.github.io
TTL: 3600
Description: Points wiki.orbgame.us to GitHub Pages

### 2. A Records (Alternative/Redundant)
Type: A
Name: wiki
Value: 185.199.108.153
TTL: 3600

Type: A
Name: wiki
Value: 185.199.109.153
TTL: 3600

Type: A
Name: wiki
Value: 185.199.110.153
TTL: 3600

Type: A
Name: wiki
Value: 185.199.111.153
TTL: 3600

## GitHub Pages Configuration

### Repository Settings
URL: https://github.com/zimaxnet/orb-game/settings/pages

### Configuration Steps
1. Source: Deploy from a branch
2. Branch: gh-pages
3. Folder: / (root)
4. Custom domain: wiki.orbgame.us
5. Enforce HTTPS: ✓

## Verification Commands

### DNS Resolution
nslookup wiki.orbgame.us

### Website Access
curl -I https://wiki.orbgame.us

### SSL Certificate
openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us

## Troubleshooting

### If DNS doesn't resolve:
1. Check DNS provider settings
2. Verify CNAME record is correct
3. Wait for propagation (up to 48 hours)
4. Check GitHub Pages is enabled

### If HTTPS doesn't work:
1. Ensure "Enforce HTTPS" is enabled in GitHub
2. Wait for SSL certificate generation (up to 24 hours)
3. Check DNS propagation

### If site doesn't load:
1. Verify GitHub Actions deployment succeeded
2. Check gh-pages branch exists
3. Verify custom domain is configured in GitHub
EOF

    print_status "DNS configuration file created: dns-config.txt"
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
    else
        print_error "orbgame.us does not resolve"
    fi
    
    # Test wiki subdomain
    echo "2. Testing wiki.orbgame.us..."
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "wiki.orbgame.us resolves successfully"
        WIKI_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   Resolved to: $WIKI_IP"
    else
        print_warning "wiki.orbgame.us does not resolve yet"
        echo "   This is expected if DNS is not configured yet"
    fi
    
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting DNS setup for wiki.orbgame.us..."
    echo ""
    
    # Run setup steps
    check_dns_status
    show_dns_instructions
    show_github_pages_config
    show_verification_steps
    create_dns_config
    test_dns_resolution
    
    echo ""
    print_status "DNS setup instructions completed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Add the DNS records to your domain provider"
    echo "  2. Configure GitHub Pages with custom domain"
    echo "  3. Wait for DNS propagation (5-30 minutes)"
    echo "  4. Test the wiki at https://wiki.orbgame.us"
    echo ""
    print_info "Configuration details saved to: dns-config.txt"
    echo ""
}

# Run main function
main "$@" 