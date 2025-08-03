#!/bin/bash

# 🎮 Orb Game Wiki - Configure and Test Script
# This script helps configure GitHub Pages and test the results

set -e

echo "🚀 Orb Game Wiki - Configure and Test"
echo "====================================="

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

# Check current status
check_current_status() {
    print_info "Checking current status..."
    
    echo ""
    echo "📋 Current Status:"
    echo "=================="
    
    # Check DNS
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "DNS: wiki.orbgame.us resolves"
    else
        print_error "DNS: wiki.orbgame.us does not resolve"
    fi
    
    # Check gh-pages branch
    if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
        print_status "GitHub: gh-pages branch exists"
    else
        print_error "GitHub: gh-pages branch missing"
    fi
    
    # Check CNAME file
    if git show gh-pages:site/CNAME 2>/dev/null | grep -q wiki.orbgame.us; then
        print_status "CNAME: wiki.orbgame.us configured"
    else
        print_error "CNAME: Not configured correctly"
    fi
    
    # Check website status
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "Website: HTTP 200 - Working!"
    elif [ "$HTTP_STATUS" = "404" ]; then
        print_warning "Website: HTTP 404 - GitHub Pages not configured"
    else
        print_error "Website: HTTP $HTTP_STATUS - Unexpected status"
    fi
    
    echo ""
}

# Show configuration steps
show_configuration_steps() {
    print_info "GitHub Pages Configuration Steps"
    echo ""
    echo "📋 Follow These Exact Steps:"
    echo "============================"
    echo ""
    echo "1. Open GitHub Pages Settings:"
    echo "   🔗 https://github.com/zimaxnet/orb-game/settings/pages"
    echo ""
    echo "2. Configure Source:"
    echo "   • Source: Deploy from a branch"
    echo "   • Branch: gh-pages"
    echo "   • Folder: / (root)"
    echo ""
    echo "3. Add Custom Domain:"
    echo "   • Custom domain: wiki.orbgame.us"
    echo "   • Enforce HTTPS: ✓ (check this box)"
    echo ""
    echo "4. Save Configuration:"
    echo "   • Click 'Save' button"
    echo "   • Wait 1-2 minutes for processing"
    echo ""
    echo "5. Verify Success:"
    echo "   • Should show: 'Your site is live at https://wiki.orbgame.us'"
    echo "   • Green checkmark next to custom domain"
    echo ""
}

# Test website after configuration
test_website() {
    print_info "Testing website..."
    
    echo ""
    echo "🔍 Website Tests:"
    echo "================"
    
    # Test HTTP
    echo "1. Testing HTTP access..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "HTTP: 200 - Site is working!"
    elif [ "$HTTP_STATUS" = "404" ]; then
        print_warning "HTTP: 404 - GitHub Pages not configured yet"
    else
        print_error "HTTP: $HTTP_STATUS - Unexpected status"
    fi
    
    # Test HTTPS
    echo "2. Testing HTTPS access..."
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wiki.orbgame.us 2>/dev/null || echo "SSL_ERROR")
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_status "HTTPS: 200 - Site is working with SSL!"
    elif [ "$HTTPS_STATUS" = "SSL_ERROR" ]; then
        print_warning "HTTPS: SSL error - Certificate not generated yet"
        echo "   This is normal for the first 1-24 hours"
    else
        print_warning "HTTPS: $HTTPS_STATUS"
    fi
    
    # Test DNS
    echo "3. Testing DNS resolution..."
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "DNS: Resolves successfully"
        WIKI_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   IP: $WIKI_IP"
    else
        print_error "DNS: Does not resolve"
    fi
    
    echo ""
}

# Show success indicators
show_success_indicators() {
    print_info "Success Indicators"
    echo ""
    echo "📋 What to Look For:"
    echo "===================="
    echo ""
    echo "✅ GitHub Pages Settings:"
    echo "   • 'Your site is live at https://wiki.orbgame.us'"
    echo "   • Green checkmark next to custom domain"
    echo "   • 'Enforce HTTPS' is checked"
    echo ""
    echo "✅ Website Access:"
    echo "   • http://wiki.orbgame.us returns 200 (not 404)"
    echo "   • https://wiki.orbgame.us works (after SSL)"
    echo "   • Orb Game documentation loads"
    echo ""
    echo "✅ Content Verification:"
    echo "   • Navigation menu works"
    echo "   • Search functionality works"
    echo "   • All documentation sections accessible"
    echo ""
}

# Show timeline
show_timeline() {
    print_info "Expected Timeline"
    echo ""
    echo "📋 After Configuration:"
    echo "======================"
    echo ""
    echo "⏱️  Immediate (0-5 minutes):"
    echo "   • Site accessible via HTTP"
    echo "   • GitHub Pages status shows 'live'"
    echo ""
    echo "⏱️  Short term (5-30 minutes):"
    echo "   • Full DNS propagation"
    echo "   • Site fully accessible"
    echo ""
    echo "⏱️  Medium term (1-24 hours):"
    echo "   • SSL certificate generated"
    echo "   • HTTPS access enabled"
    echo ""
    echo "⏱️  Long term (24-48 hours):"
    echo "   • Complete global optimization"
    echo "   • Full SSL certificate validation"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting configuration and testing..."
    echo ""
    
    # Check current status
    check_current_status
    
    # Show configuration steps
    show_configuration_steps
    
    # Ask user if they want to proceed
    echo ""
    print_info "Ready to configure GitHub Pages?"
    echo ""
    echo "1. Go to: https://github.com/zimaxnet/orb-game/settings/pages"
    echo "2. Configure the settings as shown above"
    echo "3. Click 'Save'"
    echo "4. Come back and run this script again to test"
    echo ""
    
    read -p "Have you configured GitHub Pages? (y/n): " configured
    
    if [ "$configured" = "y" ] || [ "$configured" = "Y" ]; then
        echo ""
        print_info "Testing configuration..."
        test_website
        show_success_indicators
        show_timeline
        
        echo ""
        print_status "Configuration testing completed!"
        echo ""
        print_info "If tests show success, your wiki is live at:"
        echo "   🌐 https://wiki.orbgame.us"
        echo ""
    else
        echo ""
        print_info "Please configure GitHub Pages first, then run this script again."
        echo ""
    fi
}

# Run main function
main "$@" 