#!/bin/bash

# 🎮 Orb Game Wiki Setup Script
# This script sets up the complete wiki documentation system

set -e

echo "🚀 Setting up Orb Game Wiki Documentation System..."
echo "=================================================="

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

# Check if Python is installed
check_python() {
    print_info "Checking Python installation..."
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_status "Python found: $PYTHON_VERSION"
    else
        print_error "Python 3 is required but not installed"
        print_info "Please install Python 3.8+ and try again"
        exit 1
    fi
}

# Install MkDocs and dependencies
install_mkdocs() {
    print_info "Installing MkDocs and dependencies..."
    
    # Upgrade pip
    python3 -m pip install --upgrade pip
    
    # Install MkDocs Material
    pip install mkdocs-material
    
    # Install additional plugins
    pip install mkdocs-git-revision-date-localized-plugin
    pip install pymdown-extensions
    
    print_status "MkDocs and dependencies installed successfully"
}

# Create documentation structure
create_docs_structure() {
    print_info "Creating documentation structure..."
    
    # Create main docs directory if it doesn't exist
    mkdir -p docs
    
    # Create subdirectories
    mkdir -p docs/getting-started
    mkdir -p docs/gameplay
    mkdir -p docs/developer
    mkdir -p docs/ai-integration
    mkdir -p docs/database
    mkdir -p docs/deployment
    mkdir -p docs/performance
    
    print_status "Documentation structure created"
}

# Create placeholder files
create_placeholder_files() {
    print_info "Creating placeholder documentation files..."
    
    # Getting Started
    if [ ! -f "docs/getting-started/quick-start.md" ]; then
        cat > docs/getting-started/quick-start.md << 'EOF'
# Quick Start Guide

## 🚀 Getting Started with Orb Game

### For Players
1. Visit [https://orbgame.us](https://orbgame.us)
2. Drag orbs to the center to explore categories
3. Select historical epochs to travel through time
4. Enjoy immersive stories with audio narration

### For Developers
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Read the [Architecture Guide](../developer/architecture.md)

---
*More detailed guides coming soon...*
EOF
    fi
    
    # Gameplay
    if [ ! -f "docs/gameplay/how-to-play.md" ]; then
        cat > docs/gameplay/how-to-play.md << 'EOF'
# How to Play Orb Game

## 🎮 Basic Controls

### Orb Interaction
- **Drag orbs** to the center of the screen
- **Click orbs** to activate story discovery
- **Hover over orbs** to see category information

### Epoch Selection
- Use the **epoch selector** to travel through time
- Choose from: Ancient, Medieval, Industrial, Modern, Future
- Each epoch contains different historical figures and stories

### Audio Controls
- **Mute/Unmute**: Click the audio button
- **Auto-play**: Stories automatically play audio narration
- **Language**: Switch between English and Spanish

---
*Detailed gameplay guide coming soon...*
EOF
    fi
    
    # Developer
    if [ ! -f "docs/developer/architecture.md" ]; then
        cat > docs/developer/architecture.md << 'EOF'
# Architecture Overview

## 🏗️ System Architecture

### Frontend Architecture
- **React 19.x** with modern hooks
- **Three.js** for 3D graphics
- **Vite** for build system
- **CSS Modules** for styling

### Backend Architecture
- **Node.js** with Express
- **Azure OpenAI** integration
- **Azure Cosmos DB** for storage
- **Azure Key Vault** for secrets

### Deployment Architecture
- **Azure Web App** for frontend
- **Azure Container Apps** for backend
- **GitHub Actions** for CI/CD

---
*Detailed architecture documentation coming soon...*
EOF
    fi
    
    print_status "Placeholder files created"
}

# Test MkDocs build
test_mkdocs_build() {
    print_info "Testing MkDocs build..."
    
    if mkdocs build --strict; then
        print_status "MkDocs build successful"
        print_info "You can now run 'mkdocs serve' to preview locally"
    else
        print_error "MkDocs build failed"
        print_info "Please check the mkdocs.yml configuration"
        exit 1
    fi
}

# Create GitHub Actions secrets guide
create_secrets_guide() {
    print_info "Creating GitHub Actions secrets guide..."
    
    cat > docs/deployment/github-actions-secrets.md << 'EOF'
# GitHub Actions Secrets Setup

## 🔐 Required Secrets

### For Wiki Deployment
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Azure Static Web Apps deployment token

### For Main Application
- `AZURE_CREDENTIALS`: Azure service principal credentials
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `PERPLEXITY_API_KEY`: Perplexity API key
- `MONGO_URI`: MongoDB connection string

## 📋 Setup Instructions

1. Go to your GitHub repository settings
2. Navigate to Secrets and variables > Actions
3. Add each secret with the appropriate value
4. Ensure the secrets are properly configured for deployment

---
*Contact the development team for specific secret values*
EOF
    
    print_status "Secrets guide created"
}

# Create deployment instructions
create_deployment_instructions() {
    print_info "Creating deployment instructions..."
    
    cat > docs/deployment/wiki-deployment.md << 'EOF'
# Wiki Deployment Guide

## 🚀 Automated Deployment

The wiki is automatically deployed when changes are pushed to the main branch.

### Deployment Triggers
- Changes to `docs/` folder
- Changes to `mkdocs.yml`
- Changes to `.github/workflows/deploy-wiki.yml`

### Deployment Targets
1. **GitHub Pages**: Primary hosting
2. **Azure Static Web Apps**: Backup hosting
3. **Custom Domain**: wiki.orbgame.us

## 🔧 Manual Deployment

### Local Development
```bash
# Install dependencies
pip install mkdocs-material

# Serve locally
mkdocs serve

# Build for production
mkdocs build
```

### Manual Deployment
```bash
# Build the site
mkdocs build

# Deploy to GitHub Pages
mkdocs gh-deploy
```

## 📊 Deployment Status

- ✅ **GitHub Actions**: Automated CI/CD
- ✅ **Preview Builds**: PR-based previews
- ✅ **Version Control**: Git-based documentation
- ✅ **Search**: Full-text search enabled

---
*The wiki is automatically updated with every push to main*
EOF
    
    print_status "Deployment instructions created"
}

# Main execution
main() {
    echo ""
    print_info "Starting Orb Game Wiki Setup..."
    echo ""
    
    # Run setup steps
    check_python
    install_mkdocs
    create_docs_structure
    create_placeholder_files
    test_mkdocs_build
    create_secrets_guide
    create_deployment_instructions
    
    echo ""
    print_status "Wiki setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Add your GitHub secrets for deployment"
    echo "  2. Customize the documentation content"
    echo "  3. Push changes to trigger automatic deployment"
    echo "  4. Visit https://wiki.orbgame.us (after first deployment)"
    echo ""
    print_info "Local development:"
    echo "  mkdocs serve  # Start local server"
    echo "  mkdocs build  # Build for production"
    echo ""
}

# Run main function
main "$@" 