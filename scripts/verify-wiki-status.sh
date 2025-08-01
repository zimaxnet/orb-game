#!/bin/bash

# 🔍 Wiki Status Verification Script
# This script comprehensively tests the wiki deployment status

set -e

echo "🔍 Wiki Status Verification"
echo "=========================="

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

# Check DNS status
check_dns() {
    print_info "Checking DNS status..."
    
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        print_status "DNS: wiki.orbgame.us resolves"
        WIKI_IP=$(nslookup wiki.orbgame.us | grep "Address:" | tail -1 | awk '{print $2}')
        echo "   IP: $WIKI_IP"
    else
        print_error "DNS: wiki.orbgame.us does not resolve"
    fi
    
    echo ""
}

# Check GitHub Pages status
check_github_pages() {
    print_info "Checking GitHub Pages status..."
    
    # Test HTTP access
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "GitHub Pages: HTTP 200 - Working!"
    elif [ "$HTTP_STATUS" = "404" ]; then
        print_error "GitHub Pages: HTTP 404 - Not configured"
    else
        print_warning "GitHub Pages: HTTP $HTTP_STATUS - Unexpected status"
    fi
    
    # Test HTTPS access
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wiki.orbgame.us 2>/dev/null || echo "SSL_ERROR")
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_status "GitHub Pages: HTTPS 200 - Working with SSL!"
    elif [ "$HTTPS_STATUS" = "SSL_ERROR" ]; then
        print_warning "GitHub Pages: HTTPS SSL error - Certificate not ready"
    else
        print_warning "GitHub Pages: HTTPS $HTTPS_STATUS"
    fi
    
    echo ""
}

# Check gh-pages branch
check_gh_pages_branch() {
    print_info "Checking gh-pages branch..."
    
    if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
        print_status "gh-pages branch exists on remote"
        
        # Check if branch has content
        if git show gh-pages:index.html > /dev/null 2>&1; then
            print_status "gh-pages branch has content"
        else
            print_error "gh-pages branch is empty"
        fi
    else
        print_error "gh-pages branch does not exist"
    fi
    
    echo ""
}

# Check GitHub Actions workflow
check_github_actions() {
    print_info "Checking GitHub Actions workflow..."
    
    if [ -f ".github/workflows/deploy-wiki.yml" ]; then
        print_status "Wiki deployment workflow exists"
        
        # Check workflow triggers
        if grep -q "docs/\*\*" .github/workflows/deploy-wiki.yml; then
            print_status "Workflow triggers on docs/ changes"
        else
            print_warning "Workflow may not trigger on docs/ changes"
        fi
    else
        print_error "Wiki deployment workflow missing"
    fi
    
    echo ""
}

# Check site content
check_site_content() {
    print_info "Checking site content..."
    
    if [ -d "site" ]; then
        print_status "Site directory exists"
        SITE_SIZE=$(du -sh site | cut -f1)
        echo "   Size: $SITE_SIZE"
        
        if [ -f "site/index.html" ]; then
            print_status "Site has index.html"
        else
            print_error "Site missing index.html"
        fi
        
        if [ -f "site/CNAME" ]; then
            print_status "Site has CNAME file"
            CNAME_CONTENT=$(cat site/CNAME)
            echo "   CNAME: $CNAME_CONTENT"
        else
            print_error "Site missing CNAME file"
        fi
    else
        print_error "Site directory does not exist"
    fi
    
    echo ""
}

# Check docs content
check_docs_content() {
    print_info "Checking docs content..."
    
    if [ -d "docs" ]; then
        print_status "Docs directory exists"
        DOCS_COUNT=$(find docs -name "*.md" | wc -l)
        echo "   Markdown files: $DOCS_COUNT"
        
        if [ -f "docs/index.md" ]; then
            print_status "Docs has index.md"
        else
            print_error "Docs missing index.md"
        fi
    else
        print_error "Docs directory does not exist"
    fi
    
    echo ""
}

# Check mkdocs configuration
check_mkdocs_config() {
    print_info "Checking MkDocs configuration..."
    
    if [ -f "mkdocs.yml" ]; then
        print_status "mkdocs.yml exists"
        
        if grep -q "site_name" mkdocs.yml; then
            print_status "mkdocs.yml has site_name configured"
        else
            print_error "mkdocs.yml missing site_name"
        fi
        
        if grep -q "wiki.orbgame.us" mkdocs.yml; then
            print_status "mkdocs.yml has custom domain configured"
        else
            print_warning "mkdocs.yml may not have custom domain"
        fi
    else
        print_error "mkdocs.yml does not exist"
    fi
    
    echo ""
}

# Show current status summary
show_status_summary() {
    print_info "Current Status Summary"
    echo ""
    echo "📋 What's Working:"
    echo "=================="
    
    # DNS
    if nslookup wiki.orbgame.us > /dev/null 2>&1; then
        echo "✅ DNS resolution"
    else
        echo "❌ DNS resolution"
    fi
    
    # GitHub Pages
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ GitHub Pages (HTTP)"
    else
        echo "❌ GitHub Pages (HTTP)"
    fi
    
    # gh-pages branch
    if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
        echo "✅ gh-pages branch"
    else
        echo "❌ gh-pages branch"
    fi
    
    # GitHub Actions
    if [ -f ".github/workflows/deploy-wiki.yml" ]; then
        echo "✅ GitHub Actions workflow"
    else
        echo "❌ GitHub Actions workflow"
    fi
    
    # Site content
    if [ -d "site" ] && [ -f "site/index.html" ]; then
        echo "✅ Site content"
    else
        echo "❌ Site content"
    fi
    
    echo ""
}

# Show what needs to be done
show_next_steps() {
    print_info "Next Steps Required"
    echo ""
    echo "📋 To Complete Wiki Setup:"
    echo "=========================="
    echo ""
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" != "200" ]; then
        echo "1. Configure GitHub Pages:"
        echo "   • Go to: https://github.com/zimaxnet/orb-game/settings/pages"
        echo "   • Set Source: Deploy from a branch"
        echo "   • Set Branch: gh-pages"
        echo "   • Add Custom domain: wiki.orbgame.us"
        echo "   • Check 'Enforce HTTPS'"
        echo ""
    fi
    
    if ! git ls-remote --heads origin gh-pages | grep -q gh-pages; then
        echo "2. Create gh-pages branch:"
        echo "   • Build site: mkdocs build"
        echo "   • Create branch: git checkout -b gh-pages"
        echo "   • Copy site: cp -r site/* ."
        echo "   • Push: git push origin gh-pages"
        echo ""
    fi
    
    if [ ! -d "site" ] || [ ! -f "site/index.html" ]; then
        echo "3. Build site content:"
        echo "   • Install MkDocs: pip install mkdocs-material"
        echo "   • Build: mkdocs build"
        echo "   • Deploy: ./scripts/quick-wiki-update.sh"
        echo ""
    fi
    
    echo "4. Test after configuration:"
    echo "   • Run: ./scripts/verify-wiki-status.sh"
    echo "   • Check: https://wiki.orbgame.us"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting comprehensive wiki status verification..."
    echo ""
    
    # Run all checks
    check_dns
    check_github_pages
    check_gh_pages_branch
    check_github_actions
    check_site_content
    check_docs_content
    check_mkdocs_config
    
    # Show summaries
    show_status_summary
    show_next_steps
    
    echo ""
    print_status "Verification completed!"
    echo ""
    print_info "The wiki is NOT automatically updating yet."
    echo "GitHub Pages needs to be configured first."
    echo ""
}

# Run main function
main "$@" 