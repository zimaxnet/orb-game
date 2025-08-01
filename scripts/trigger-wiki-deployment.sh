#!/bin/bash

# 🎮 Orb Game Wiki - Trigger Manual Deployment
# This script helps trigger a manual wiki deployment

set -e

echo "🚀 Triggering Wiki Deployment"
echo "============================="

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

# Check GitHub Actions workflow
check_github_actions() {
    print_info "Checking GitHub Actions workflow..."
    
    echo ""
    echo "📋 GitHub Actions Status:"
    echo "========================"
    
    # Check if workflow file exists
    if [ -f ".github/workflows/deploy-wiki.yml" ]; then
        print_status "Wiki deployment workflow exists"
    else
        print_error "Wiki deployment workflow missing"
        return 1
    fi
    
    echo ""
}

# Show manual deployment steps
show_manual_deployment() {
    print_info "Manual Deployment Steps"
    echo ""
    echo "📋 If GitHub Pages is not working, try these steps:"
    echo "=================================================="
    echo ""
    echo "1. Trigger Manual GitHub Actions Run:"
    echo "   • Go to: https://github.com/zimaxnet/orb-game/actions"
    echo "   • Find 'Deploy Wiki Documentation' workflow"
    echo "   • Click 'Run workflow' button"
    echo "   • Select 'main' branch"
    echo "   • Click 'Run workflow'"
    echo ""
    echo "2. Check GitHub Pages Settings:"
    echo "   • Go to: https://github.com/zimaxnet/orb-game/settings/pages"
    echo "   • Ensure source is set to 'gh-pages' branch"
    echo "   • Verify custom domain is 'wiki.orbgame.us'"
    echo "   • Check 'Enforce HTTPS' is enabled"
    echo ""
    echo "3. Wait for Processing:"
    echo "   • GitHub Actions can take 2-5 minutes"
    echo "   • GitHub Pages can take 1-5 minutes"
    echo "   • DNS propagation can take 5-30 minutes"
    echo ""
}

# Test website status
test_website_status() {
    print_info "Testing website status..."
    
    echo ""
    echo "🔍 Website Tests:"
    echo "================"
    
    # Test HTTP
    echo "1. Testing HTTP access..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "HTTP: 200 - Site is working!"
    elif [ "$HTTP_STATUS" = "404" ]; then
        print_warning "HTTP: 404 - GitHub Pages not configured"
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
    else
        print_warning "HTTPS: $HTTPS_STATUS"
    fi
    
    echo ""
}

# Show troubleshooting steps
show_troubleshooting() {
    print_info "Troubleshooting Steps"
    echo ""
    echo "📋 If site still shows 404:"
    echo "==========================="
    echo ""
    echo "1. Check GitHub Pages Settings:"
    echo "   • Source should be 'Deploy from a branch'"
    echo "   • Branch should be 'gh-pages'"
    echo "   • Custom domain should be 'wiki.orbgame.us'"
    echo ""
    echo "2. Check GitHub Actions:"
    echo "   • Go to Actions tab"
    echo "   • Look for 'Deploy Wiki Documentation'"
    echo "   • Ensure it completed successfully"
    echo ""
    echo "3. Check gh-pages Branch:"
    echo "   • Verify branch exists on GitHub"
    echo "   • Check that site/ directory has content"
    echo "   • Verify CNAME file is present"
    echo ""
    echo "4. Check DNS:"
    echo "   • Verify CNAME record in Azure DNS"
    echo "   • Wait for DNS propagation"
    echo "   • Test with different DNS servers"
    echo ""
}

# Show alternative deployment methods
show_alternative_methods() {
    print_info "Alternative Deployment Methods"
    echo ""
    echo "📋 If GitHub Pages still doesn't work:"
    echo "====================================="
    echo ""
    echo "1. Manual gh-pages Deployment:"
    echo "   • Build site locally: mkdocs build"
    echo "   • Push to gh-pages: git push origin gh-pages"
    echo ""
    echo "2. Check Repository Settings:"
    echo "   • Ensure Pages feature is enabled"
    echo "   • Check repository permissions"
    echo "   • Verify branch protection rules"
    echo ""
    echo "3. Contact GitHub Support:"
    echo "   • If all else fails, contact GitHub"
    echo "   • Provide repository URL and issue details"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting manual deployment trigger..."
    echo ""
    
    # Check current status
    check_github_actions
    test_website_status
    
    # Show deployment steps
    show_manual_deployment
    show_troubleshooting
    show_alternative_methods
    
    echo ""
    print_status "Manual deployment guide completed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Try triggering GitHub Actions manually"
    echo "  2. Check GitHub Pages settings"
    echo "  3. Wait for processing (5-10 minutes)"
    echo "  4. Test the site again"
    echo ""
    print_info "Quick links:"
    echo "  • GitHub Actions: https://github.com/zimaxnet/orb-game/actions"
    echo "  • GitHub Pages: https://github.com/zimaxnet/orb-game/settings/pages"
    echo ""
}

# Run main function
main "$@" 