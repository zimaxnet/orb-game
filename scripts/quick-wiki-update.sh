#!/bin/bash

# 🚀 Quick Wiki Update Script
# This script quickly updates the wiki with current documentation

set -e

echo "🚀 Quick Wiki Update"
echo "===================="

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

# Check if virtual environment exists
check_virtual_env() {
    print_info "Checking virtual environment..."
    
    if [ -d "wiki-env" ]; then
        print_status "Virtual environment exists"
        return 0
    else
        print_warning "Virtual environment not found"
        echo "Creating virtual environment..."
        python3 -m venv wiki-env
        print_status "Virtual environment created"
        return 0
    fi
}

# Activate virtual environment and install dependencies
setup_environment() {
    print_info "Setting up environment..."
    
    # Activate virtual environment
    source wiki-env/bin/activate
    
    # Install MkDocs if not already installed
    if ! pip show mkdocs-material > /dev/null 2>&1; then
        print_info "Installing MkDocs dependencies..."
        pip install mkdocs-material
        pip install mkdocs-git-revision-date-localized-plugin
        pip install pymdown-extensions
        print_status "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Build documentation
build_docs() {
    print_info "Building documentation..."
    
    # Activate virtual environment
    source wiki-env/bin/activate
    
    # Build documentation
    if mkdocs build; then
        print_status "Documentation built successfully"
        SITE_SIZE=$(du -sh site | cut -f1)
        echo "   Site size: $SITE_SIZE"
    else
        print_error "Documentation build failed"
        exit 1
    fi
}

# Deploy to gh-pages branch
deploy_to_gh_pages() {
    print_info "Deploying to gh-pages branch..."
    
    # Store current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Switch to gh-pages branch
    if git checkout gh-pages; then
        print_status "Switched to gh-pages branch"
    else
        print_error "Failed to switch to gh-pages branch"
        exit 1
    fi
    
    # Copy built site
    if cp -r site/* .; then
        print_status "Site files copied"
    else
        print_error "Failed to copy site files"
        git checkout $CURRENT_BRANCH
        exit 1
    fi
    
    # Add all files
    git add .
    
    # Commit changes
    COMMIT_MESSAGE="docs: quick wiki update $(date '+%Y-%m-%d %H:%M:%S')"
    if git commit -m "$COMMIT_MESSAGE"; then
        print_status "Changes committed"
    else
        print_warning "No changes to commit"
    fi
    
    # Push to remote
    if git push origin gh-pages; then
        print_status "Deployed to gh-pages branch"
    else
        print_error "Failed to push to gh-pages branch"
        git checkout $CURRENT_BRANCH
        exit 1
    fi
    
    # Return to original branch
    git checkout $CURRENT_BRANCH
    print_status "Returned to $CURRENT_BRANCH branch"
}

# Test wiki accessibility
test_wiki() {
    print_info "Testing wiki accessibility..."
    
    # Wait a moment for deployment
    sleep 5
    
    # Test HTTP access
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://wiki.orbgame.us)
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "Wiki is accessible via HTTP"
    else
        print_warning "Wiki returns HTTP $HTTP_STATUS"
    fi
    
    # Test HTTPS access
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wiki.orbgame.us 2>/dev/null || echo "SSL_ERROR")
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_status "Wiki is accessible via HTTPS"
    elif [ "$HTTPS_STATUS" = "SSL_ERROR" ]; then
        print_warning "HTTPS SSL error (certificate may not be ready)"
    else
        print_warning "HTTPS returns status: $HTTPS_STATUS"
    fi
}

# Show deployment summary
show_summary() {
    print_info "Deployment Summary"
    echo ""
    echo "📋 What was updated:"
    echo "===================="
    echo ""
    echo "✅ Documentation built with MkDocs"
    echo "✅ Site deployed to gh-pages branch"
    echo "✅ Changes pushed to GitHub"
    echo ""
    echo "🌐 Wiki URLs:"
    echo "   HTTP:  http://wiki.orbgame.us"
    echo "   HTTPS: https://wiki.orbgame.us"
    echo ""
    echo "⏱️  Timeline:"
    echo "   • Immediate: Site deployed to gh-pages"
    echo "   • 1-5 minutes: GitHub Pages should update"
    echo "   • 5-30 minutes: Full DNS propagation"
    echo "   • 1-24 hours: SSL certificate (if not ready)"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting quick wiki update..."
    echo ""
    
    # Run all steps
    check_virtual_env
    setup_environment
    build_docs
    deploy_to_gh_pages
    test_wiki
    show_summary
    
    echo ""
    print_status "Quick wiki update completed!"
    echo ""
    print_info "Your wiki should be updated within 5-10 minutes."
    echo "Check: https://wiki.orbgame.us"
    echo ""
}

# Run main function
main "$@" 