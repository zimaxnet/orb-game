#!/bin/bash

# 📚 Sync README to Wiki Script
# This script automatically syncs important content from README.md and .cursorrules to the wiki

set -e

echo "📚 Syncing README to Wiki"
echo "========================="

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

# Check if files exist
check_files() {
    print_info "Checking source files..."
    
    if [ -f "README.md" ]; then
        print_status "README.md found"
    else
        print_error "README.md not found"
        exit 1
    fi
    
    if [ -f ".cursorrules" ]; then
        print_status ".cursorrules found"
    else
        print_warning ".cursorrules not found"
    fi
    
    echo ""
}

# Extract README sections
extract_readme_sections() {
    print_info "Extracting README sections..."
    
    # Create docs directory if it doesn't exist
    mkdir -p docs/getting-started
    mkdir -p docs/developer
    
    # Extract project overview
    if grep -q "## 🎮 Project Overview" README.md; then
        awk '/## 🎮 Project Overview/,/## 🏗️ Architecture/' README.md > docs/getting-started/project-overview.md
        print_status "Project overview extracted"
    else
        print_warning "Project overview section not found in README"
    fi
    
    # Extract deployment patterns
    if grep -q "## 🚀 Deployment Patterns" README.md; then
        awk '/## 🚀 Deployment Patterns/,/## 🔧 Development Guidelines/' README.md > docs/developer/deployment-patterns.md
        print_status "Deployment patterns extracted"
    else
        print_warning "Deployment patterns section not found in README"
    fi
    
    # Extract development guidelines
    if grep -q "## 🔧 Development Guidelines" README.md; then
        awk '/## 🔧 Development Guidelines/,/## 🚨 Critical Notes/' README.md > docs/developer/development-guidelines.md
        print_status "Development guidelines extracted"
    else
        print_warning "Development guidelines section not found in README"
    fi
    
    # Extract critical notes
    if grep -q "## 🚨 Critical Notes" README.md; then
        awk '/## 🚨 Critical Notes/,/^$/' README.md > docs/developer/critical-notes.md
        print_status "Critical notes extracted"
    else
        print_warning "Critical notes section not found in README"
    fi
    
    echo ""
}

# Extract .cursorrules content
extract_cursorrules() {
    print_info "Extracting .cursorrules content..."
    
    if [ -f ".cursorrules" ]; then
        # Create a formatted version for the wiki
        cat > docs/developer/cursor-rules.md << 'EOF'
# Cursor Rules

This document contains the development rules and guidelines for the Orb Game project.

EOF
        cat .cursorrules >> docs/developer/cursor-rules.md
        print_status ".cursorrules content extracted"
    else
        print_warning ".cursorrules not found, skipping"
    fi
    
    echo ""
}

# Create sync summary
create_sync_summary() {
    print_info "Creating sync summary..."
    
    cat > docs/getting-started/readme-sync.md << 'EOF'
# README Sync

This page contains content automatically synced from the main README.md file.

## Last Sync

EOF
    echo "Last sync: $(date)" >> docs/getting-started/readme-sync.md
    echo "" >> docs/getting-started/readme-sync.md
    echo "## Synced Sections" >> docs/getting-started/readme-sync.md
    echo "" >> docs/getting-started/readme-sync.md
    echo "- Project Overview → [Project Overview](project-overview.md)" >> docs/getting-started/readme-sync.md
    echo "- Deployment Patterns → [Deployment Patterns](../developer/deployment-patterns.md)" >> docs/getting-started/readme-sync.md
    echo "- Development Guidelines → [Development Guidelines](../developer/development-guidelines.md)" >> docs/getting-started/readme-sync.md
    echo "- Critical Notes → [Critical Notes](../developer/critical-notes.md)" >> docs/getting-started/readme-sync.md
    echo "- Cursor Rules → [Cursor Rules](../developer/cursor-rules.md)" >> docs/getting-started/readme-sync.md
    
    print_status "Sync summary created"
    echo ""
}

# Build documentation
build_docs() {
    print_info "Building documentation..."
    
    # Check if virtual environment exists
    if [ -d "wiki-env" ]; then
        source wiki-env/bin/activate
    else
        print_warning "Virtual environment not found, creating..."
        python3 -m venv wiki-env
        source wiki-env/bin/activate
        pip install mkdocs-material mkdocs-git-revision-date-localized-plugin pymdown-extensions
    fi
    
    # Build documentation
    if mkdocs build; then
        print_status "Documentation built successfully"
        SITE_SIZE=$(du -sh site | cut -f1)
        echo "   Site size: $SITE_SIZE"
    else
        print_error "Documentation build failed"
        exit 1
    fi
    
    echo ""
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
    COMMIT_MESSAGE="docs: sync from README and .cursorrules $(date '+%Y-%m-%d %H:%M:%S')"
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
    
    echo ""
}

# Show sync summary
show_sync_summary() {
    print_info "Sync Summary"
    echo ""
    echo "📋 What was synced:"
    echo "==================="
    echo ""
    echo "✅ README.md sections:"
    echo "   • Project Overview → docs/getting-started/project-overview.md"
    echo "   • Deployment Patterns → docs/developer/deployment-patterns.md"
    echo "   • Development Guidelines → docs/developer/development-guidelines.md"
    echo "   • Critical Notes → docs/developer/critical-notes.md"
    echo ""
    echo "✅ .cursorrules content:"
    echo "   • Cursor Rules → docs/developer/cursor-rules.md"
    echo ""
    echo "✅ Documentation built and deployed"
    echo ""
    echo "🌐 Wiki URLs:"
    echo "   HTTP:  http://wiki.orbgame.us"
    echo "   HTTPS: https://wiki.orbgame.us"
    echo ""
    echo "⏱️  Timeline:"
    echo "   • Immediate: Site deployed to gh-pages"
    echo "   • 1-5 minutes: GitHub Pages should update"
    echo "   • 5-30 minutes: Full DNS propagation"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting README to Wiki sync..."
    echo ""
    
    # Run all steps
    check_files
    extract_readme_sections
    extract_cursorrules
    create_sync_summary
    build_docs
    deploy_to_gh_pages
    test_wiki
    show_sync_summary
    
    echo ""
    print_status "Sync completed successfully!"
    echo ""
    print_info "Your wiki has been updated with content from README.md and .cursorrules"
    echo "Check: https://wiki.orbgame.us"
    echo ""
}

# Run main function
main "$@" 