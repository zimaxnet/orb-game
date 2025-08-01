#!/bin/bash

# 🎮 Orb Game Wiki - Final GitHub Pages Setup
# This script provides the final steps to configure GitHub Pages

set -e

echo "🚀 Final GitHub Pages Setup for wiki.orbgame.us"
echo "================================================"

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

# Show final configuration steps
show_final_steps() {
    print_info "Final GitHub Pages Configuration Steps"
    echo ""
    echo "📋 Step-by-Step Instructions:"
    echo "=============================="
    echo ""
    echo "1. Open GitHub Repository Settings:"
    echo "   🔗 https://github.com/zimaxnet/orb-game/settings/pages"
    echo ""
    echo "2. Configure Source Settings:"
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
    echo "   • Wait for GitHub to process"
    echo ""
    echo "5. Verify Configuration:"
    echo "   • Should show: 'Your site is live at https://wiki.orbgame.us'"
    echo "   • Green checkmark should appear"
    echo ""
}

# Test website after configuration
test_website_after_config() {
    print_info "Testing website after GitHub Pages configuration..."
    
    echo ""
    echo "🔍 Website Tests:"
    echo "================"
    
    # Test HTTP access
    echo "1. Testing HTTP access..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "HTTP returns 200 - Site is working!"
        echo "   Status: $HTTP_STATUS"
    elif [ "$HTTP_STATUS" = "404" ]; then
        print_warning "HTTP returns 404 - GitHub Pages not configured yet"
        echo "   Status: $HTTP_STATUS"
    else
        print_error "HTTP returns unexpected status: $HTTP_STATUS"
    fi
    
    # Test HTTPS access
    echo "2. Testing HTTPS access..."
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wiki.orbgame.us 2>/dev/null || echo "SSL_ERROR")
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_status "HTTPS returns 200 - Site is working with SSL!"
        echo "   Status: $HTTPS_STATUS"
    elif [ "$HTTPS_STATUS" = "SSL_ERROR" ]; then
        print_warning "HTTPS SSL error - Certificate not generated yet"
        echo "   This is normal for the first 1-24 hours"
    else
        print_warning "HTTPS returns status: $HTTPS_STATUS"
    fi
    
    # Test DNS resolution
    echo "3. Testing DNS resolution..."
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "DNS resolution working"
        WIKI_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   Resolved to: $WIKI_IP"
    else
        print_error "DNS resolution failed"
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
    echo "✅ GitHub Pages Settings Page:"
    echo "   • Shows 'Your site is live at https://wiki.orbgame.us'"
    echo "   • Green checkmark next to custom domain"
    echo "   • 'Enforce HTTPS' is checked"
    echo ""
    echo "✅ Website Access:"
    echo "   • http://wiki.orbgame.us returns 200 (not 404)"
    echo "   • https://wiki.orbgame.us works (after SSL generation)"
    echo "   • Wiki documentation loads properly"
    echo ""
    echo "✅ Content Verification:"
    echo "   • Orb Game documentation appears"
    echo "   • Navigation menu works"
    echo "   • Search functionality works"
    echo "   • All documentation sections accessible"
    echo ""
}

# Show troubleshooting steps
show_troubleshooting() {
    print_info "Troubleshooting Steps"
    echo ""
    echo "📋 Common Issues & Solutions:"
    echo "=============================="
    echo ""
    echo "❌ If GitHub Pages shows 404:"
    echo "   • Check that gh-pages branch exists"
    echo "   • Verify site/ directory has content"
    echo "   • Ensure custom domain is set correctly"
    echo ""
    echo "❌ If HTTPS doesn't work:"
    echo "   • Wait up to 24 hours for SSL certificate"
    echo "   • Ensure 'Enforce HTTPS' is checked"
    echo "   • Check DNS propagation is complete"
    echo ""
    echo "❌ If site shows wrong content:"
    echo "   • Verify gh-pages branch has latest content"
    echo "   • Check GitHub Actions deployment succeeded"
    echo "   • Ensure custom domain is set correctly"
    echo ""
    echo "❌ If DNS doesn't resolve:"
    echo "   • Check Azure DNS CNAME record exists"
    echo "   • Wait for DNS propagation (up to 48 hours)"
    echo "   • Verify custom domain in GitHub Pages"
    echo ""
}

# Show timeline expectations
show_timeline() {
    print_info "Expected Timeline"
    echo ""
    echo "📋 Timeline After Configuration:"
    echo "================================"
    echo ""
    echo "⏱️  Immediate (0-5 minutes):"
    echo "   • GitHub Pages configuration saved"
    echo "   • Custom domain added to repository"
    echo "   • Site accessible via HTTP"
    echo ""
    echo "⏱️  Short term (5-30 minutes):"
    echo "   • DNS propagation completes"
    echo "   • Site fully accessible via HTTP"
    echo "   • GitHub Pages status shows 'live'"
    echo ""
    echo "⏱️  Medium term (1-24 hours):"
    echo "   • SSL certificate generated"
    echo "   • HTTPS access enabled"
    echo "   • Full security implementation"
    echo ""
    echo "⏱️  Long term (24-48 hours):"
    echo "   • Complete global DNS propagation"
    echo "   • Full SSL certificate validation"
    echo "   • Optimal performance achieved"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting final GitHub Pages setup..."
    echo ""
    
    # Show all steps
    show_final_steps
    show_success_indicators
    show_troubleshooting
    show_timeline
    
    echo ""
    print_status "Final setup guide completed!"
    echo ""
    print_info "Ready to configure GitHub Pages!"
    echo ""
    print_info "Next action:"
    echo "  1. Go to: https://github.com/zimaxnet/orb-game/settings/pages"
    echo "  2. Configure the settings as shown above"
    echo "  3. Click 'Save'"
    echo "  4. Test the wiki at https://wiki.orbgame.us"
    echo ""
    print_info "After configuration, run this script again to test the results."
    echo ""
}

# Run main function
main "$@" 