#!/bin/bash

# 🎮 Orb Game Wiki GitHub Pages Configuration Script
# This script helps configure GitHub Pages for wiki.orbgame.us

set -e

echo "📚 Configuring GitHub Pages for wiki.orbgame.us"
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

# Check if gh-pages branch exists
check_gh_pages_branch() {
    print_info "Checking for gh-pages branch..."
    
    if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
        print_status "gh-pages branch exists on remote"
        return 0
    else
        print_warning "gh-pages branch does not exist on remote"
        return 1
    fi
}

# Check if site directory exists
check_site_directory() {
    print_info "Checking for site directory..."
    
    if [ -d "site" ]; then
        print_status "site directory exists"
        SITE_SIZE=$(du -sh site | cut -f1)
        echo "   Size: $SITE_SIZE"
        return 0
    else
        print_warning "site directory does not exist"
        return 1
    fi
}

# Show GitHub Pages configuration steps
show_github_pages_steps() {
    print_info "GitHub Pages Configuration Steps"
    echo ""
    echo "📋 Manual Configuration Steps:"
    echo "=============================="
    echo ""
    echo "1. Go to GitHub Repository Settings:"
    echo "   https://github.com/zimaxnet/orb-game/settings/pages"
    echo ""
    echo "2. Configure GitHub Pages:"
    echo "   - Source: Deploy from a branch"
    echo "   - Branch: gh-pages"
    echo "   - Folder: / (root)"
    echo ""
    echo "3. Add Custom Domain:"
    echo "   - Custom domain: wiki.orbgame.us"
    echo "   - Enforce HTTPS: ✓ (check this box)"
    echo ""
    echo "4. Save Configuration:"
    echo "   - Click 'Save' to apply changes"
    echo ""
}

# Show GitHub Actions workflow status
show_github_actions_status() {
    print_info "GitHub Actions Workflow Status"
    echo ""
    echo "📋 Current Workflows:"
    echo "===================="
    echo ""
    echo "1. Wiki Deployment Workflow:"
    echo "   - File: .github/workflows/deploy-wiki.yml"
    echo "   - Status: Should be running on push to main"
    echo "   - Branch: Deploys to gh-pages branch"
    echo ""
    echo "2. Check Workflow Runs:"
    echo "   https://github.com/zimaxnet/orb-game/actions"
    echo ""
}

# Create CNAME file for custom domain
create_cname_file() {
    print_info "Creating CNAME file for custom domain..."
    
    if [ -d "site" ]; then
        echo "wiki.orbgame.us" > site/CNAME
        print_status "CNAME file created in site directory"
    else
        print_warning "site directory does not exist, cannot create CNAME file"
    fi
}

# Show verification steps
show_verification_steps() {
    print_info "Verification Steps"
    echo ""
    echo "📋 After GitHub Pages Configuration:"
    echo "===================================="
    echo ""
    echo "1. Check GitHub Pages Status:"
    echo "   - Go to: https://github.com/zimaxnet/orb-game/settings/pages"
    echo "   - Should show 'Your site is live at https://wiki.orbgame.us'"
    echo ""
    echo "2. Test Website Access:"
    echo "   curl -I https://wiki.orbgame.us"
    echo ""
    echo "3. Check SSL Certificate:"
    echo "   openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us"
    echo ""
    echo "4. Test DNS Resolution:"
    echo "   nslookup wiki.orbgame.us"
    echo ""
}

# Test current website status
test_website_status() {
    print_info "Testing current website status..."
    
    echo ""
    echo "🔍 Website Status Tests:"
    echo "========================"
    
    # Test DNS resolution
    echo "1. Testing DNS resolution..."
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "wiki.orbgame.us resolves successfully"
        WIKI_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   Resolved to: $WIKI_IP"
    else
        print_error "wiki.orbgame.us does not resolve"
    fi
    
    # Test HTTP access
    echo "2. Testing HTTP access..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "404" ]; then
        print_warning "HTTP returns 404 (expected without GitHub Pages config)"
        echo "   Status: $HTTP_STATUS"
    elif [ "$HTTP_STATUS" = "200" ]; then
        print_status "HTTP returns 200 (site is working)"
        echo "   Status: $HTTP_STATUS"
    else
        print_error "HTTP returns unexpected status: $HTTP_STATUS"
    fi
    
    # Test HTTPS access
    echo "3. Testing HTTPS access..."
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wiki.orbgame.us 2>/dev/null || echo "SSL_ERROR")
    if [ "$HTTPS_STATUS" = "SSL_ERROR" ]; then
        print_warning "HTTPS SSL error (expected without GitHub Pages config)"
    elif [ "$HTTPS_STATUS" = "200" ]; then
        print_status "HTTPS returns 200 (site is working with SSL)"
        echo "   Status: $HTTPS_STATUS"
    else
        print_warning "HTTPS returns status: $HTTPS_STATUS"
    fi
    
    echo ""
}

# Create GitHub Pages configuration file
create_github_pages_config() {
    print_info "Creating GitHub Pages configuration file..."
    
    cat > github-pages-config.txt << 'EOF'
# 🎮 Orb Game Wiki GitHub Pages Configuration
# Domain: wiki.orbgame.us
# Repository: zimaxnet/orb-game

## GitHub Pages Settings URL
https://github.com/zimaxnet/orb-game/settings/pages

## Required Configuration

### Source Settings
- Source: Deploy from a branch
- Branch: gh-pages
- Folder: / (root)

### Custom Domain Settings
- Custom domain: wiki.orbgame.us
- Enforce HTTPS: ✓ (check this box)

### Build Settings
- Build source: GitHub Actions workflow
- Workflow file: .github/workflows/deploy-wiki.yml
- Output directory: site/

## GitHub Actions Workflow

### Workflow File
File: .github/workflows/deploy-wiki.yml
Trigger: Push to main branch
Actions:
1. Build MkDocs documentation
2. Deploy to gh-pages branch
3. Configure custom domain

### Manual Deployment Commands
```bash
# Build documentation locally
mkdocs build

# Push to gh-pages branch
git add site/
git commit -m "Update wiki documentation"
git push origin gh-pages
```

## Verification Steps

### 1. Check GitHub Pages Status
- Go to: https://github.com/zimaxnet/orb-game/settings/pages
- Should show: "Your site is live at https://wiki.orbgame.us"

### 2. Test Website Access
```bash
# Test HTTP
curl -I http://wiki.orbgame.us

# Test HTTPS
curl -I https://wiki.orbgame.us
```

### 3. Check SSL Certificate
```bash
openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us
```

### 4. Test DNS Resolution
```bash
nslookup wiki.orbgame.us
```

## Troubleshooting

### If GitHub Pages is not working:
1. Check gh-pages branch exists
2. Verify site/ directory has content
3. Check GitHub Actions workflow ran successfully
4. Ensure custom domain is configured correctly

### If SSL certificate is not working:
1. Wait up to 24 hours for certificate generation
2. Ensure "Enforce HTTPS" is enabled
3. Check DNS propagation is complete

### If site shows 404:
1. Verify gh-pages branch has content
2. Check GitHub Actions deployment succeeded
3. Ensure custom domain is set correctly

## Expected Timeline

### Immediate (0-5 minutes):
- GitHub Pages configuration saved
- Custom domain added

### Short term (5-30 minutes):
- DNS propagation completes
- Site accessible via HTTP

### Medium term (1-24 hours):
- SSL certificate generated
- HTTPS access enabled

### Long term (24-48 hours):
- Full global DNS propagation
- Complete SSL certificate validation
EOF

    print_status "GitHub Pages configuration file created: github-pages-config.txt"
}

# Main execution
main() {
    echo ""
    print_info "Starting GitHub Pages configuration for wiki.orbgame.us..."
    echo ""
    
    # Check current status
    check_gh_pages_branch
    check_site_directory
    test_website_status
    
    # Show configuration steps
    show_github_pages_steps
    show_github_actions_status
    create_cname_file
    show_verification_steps
    create_github_pages_config
    
    echo ""
    print_status "GitHub Pages configuration guide completed!"
    echo ""
    print_info "Next steps:"
    echo "  1. Go to GitHub Pages settings and configure custom domain"
    echo "  2. Wait for GitHub Actions to deploy the wiki"
    echo "  3. Test the wiki at https://wiki.orbgame.us"
    echo ""
    print_info "Configuration details saved to: github-pages-config.txt"
    echo ""
}

# Run main function
main "$@" 