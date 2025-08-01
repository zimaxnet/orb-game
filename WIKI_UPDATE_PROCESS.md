# 📚 Wiki Update Process Guide

## 🎯 Overview

The Orb Game wiki is now deployed at https://wiki.orbgame.us and can be updated through multiple methods. This guide explains how to keep it synchronized with your README and .cursorrules updates.

## 🔄 Update Methods

### **Method 1: Automatic Updates (Recommended)**

The wiki automatically updates when you push changes to the `main` branch:

1. **Edit Documentation Files:**
   - Update files in `docs/` directory
   - Modify `mkdocs.yml` configuration
   - Update README.md or .cursorrules

2. **Commit and Push:**
   ```bash
   git add .
   git commit -m "docs: update wiki documentation"
   git push origin main
   ```

3. **Automatic Deployment:**
   - GitHub Actions workflow triggers automatically
   - Builds new documentation with MkDocs
   - Deploys to gh-pages branch
   - Updates live wiki within 5-10 minutes

### **Method 2: Manual Updates**

For immediate updates or when automatic deployment fails:

1. **Build Locally:**
   ```bash
   # Activate virtual environment
   source wiki-env/bin/activate
   
   # Build documentation
   mkdocs build
   ```

2. **Deploy to gh-pages:**
   ```bash
   # Switch to gh-pages branch
   git checkout gh-pages
   
   # Copy built site
   cp -r site/* .
   
   # Commit and push
   git add .
   git commit -m "docs: manual wiki update"
   git push origin gh-pages
   
   # Return to main branch
   git checkout main
   ```

## 📋 Synchronization Workflow

### **Keeping Wiki in Sync with README/.cursorrules**

#### **Option 1: Automatic Sync (Recommended)**

1. **Update README.md:**
   ```bash
   # Edit README.md with important updates
   nano README.md
   ```

2. **Update .cursorrules:**
   ```bash
   # Edit .cursorrules with new rules
   nano .cursorrules
   ```

3. **Sync to Wiki:**
   ```bash
   # Create/update corresponding wiki page
   nano docs/getting-started/readme-sync.md
   ```

4. **Commit All Changes:**
   ```bash
   git add README.md .cursorrules docs/getting-started/readme-sync.md
   git commit -m "docs: sync README and .cursorrules to wiki"
   git push origin main
   ```

#### **Option 2: Automated Sync Script**

Create a script to automatically sync important content:

```bash
#!/bin/bash
# scripts/sync-to-wiki.sh

# Extract important sections from README
grep -A 20 "## 🎮 Project Overview" README.md > docs/getting-started/project-overview.md

# Extract .cursorrules content
cp .cursorrules docs/developer/cursor-rules.md

# Build and deploy
mkdocs build
git checkout gh-pages
cp -r site/* .
git add .
git commit -m "docs: auto-sync from README and .cursorrules"
git push origin gh-pages
git checkout main
```

## 📁 Wiki Structure

### **Current Documentation Sections:**

```
docs/
├── index.md                    # Main landing page
├── getting-started/
│   ├── introduction.md         # Project overview
│   ├── quick-start.md         # Quick start guide
│   └── installation.md        # Setup instructions
├── gameplay/
│   ├── how-to-play.md         # Game instructions
│   ├── categories-epochs.md   # Game categories
│   ├── historical-figures.md  # Historical figures
│   └── audio-accessibility.md # Accessibility features
├── developer/
│   ├── architecture.md        # System architecture
│   ├── api-reference.md       # API documentation
│   ├── deployment.md          # Deployment guide
│   └── contributing.md        # Contributing guidelines
├── ai-integration/
│   ├── models.md              # AI models overview
│   ├── prompts.md             # Prompt management
│   ├── story-generation.md    # Story generation
│   └── tts.md                 # Text-to-speech
├── database/
│   ├── mongodb.md             # MongoDB integration
│   ├── cache-system.md        # Caching system
│   └── story-prepopulation.md # Story prepopulation
├── deployment/
│   ├── azure-resources.md     # Azure resources
│   ├── github-actions.md      # CI/CD pipeline
│   └── monitoring.md          # Monitoring & logs
└── performance/
    ├── metrics.md             # Performance metrics
    ├── caching.md             # Caching strategy
    └── cost-optimization.md   # Cost optimization
```

## 🔄 Update Workflows

### **Daily Updates:**

1. **README Changes:**
   - Update README.md with new features/bug fixes
   - Add corresponding wiki page updates
   - Commit and push to trigger auto-deployment

2. **.cursorrules Changes:**
   - Update .cursorrules with new development rules
   - Sync important rules to wiki documentation
   - Update developer guidelines

### **Weekly Updates:**

1. **Content Review:**
   - Review wiki for outdated information
   - Update architecture diagrams
   - Add new features to documentation

2. **Performance Updates:**
   - Update performance metrics
   - Add new optimization strategies
   - Update deployment procedures

### **Monthly Updates:**

1. **Major Version Updates:**
   - Update API documentation
   - Add new AI model information
   - Update deployment procedures

2. **Content Audit:**
   - Review all wiki pages for accuracy
   - Update broken links
   - Add missing documentation

## 🛠️ Maintenance Scripts

### **Quick Update Script:**

```bash
#!/bin/bash
# scripts/quick-wiki-update.sh

echo "🚀 Quick Wiki Update"
echo "===================="

# Build documentation
source wiki-env/bin/activate
mkdocs build

# Deploy to gh-pages
git checkout gh-pages
cp -r site/* .
git add .
git commit -m "docs: quick wiki update $(date)"
git push origin gh-pages
git checkout main

echo "✅ Wiki updated successfully!"
echo "🌐 Live at: https://wiki.orbgame.us"
```

### **Sync Script:**

```bash
#!/bin/bash
# scripts/sync-readme-to-wiki.sh

echo "📚 Syncing README to Wiki"
echo "========================="

# Extract README sections to wiki
awk '/## 🎮 Project Overview/,/## 🏗️ Architecture/' README.md > docs/getting-started/project-overview.md
awk '/## 🚀 Deployment Patterns/,/## 🔧 Development Guidelines/' README.md > docs/developer/deployment-patterns.md

# Extract .cursorrules
cp .cursorrules docs/developer/cursor-rules.md

# Build and deploy
mkdocs build
git checkout gh-pages
cp -r site/* .
git add .
git commit -m "docs: sync from README and .cursorrules"
git push origin gh-pages
git checkout main

echo "✅ Sync completed!"
```

## 📊 Monitoring

### **Check Wiki Status:**

```bash
# Test wiki accessibility
curl -I https://wiki.orbgame.us

# Check deployment status
git log --oneline gh-pages -5

# Verify GitHub Actions
# Go to: https://github.com/zimaxnet/orb-game/actions
```

### **Common Issues:**

1. **Wiki Not Updating:**
   - Check GitHub Actions workflow
   - Verify gh-pages branch has latest content
   - Ensure GitHub Pages is configured correctly

2. **Build Failures:**
   - Check MkDocs configuration
   - Verify all markdown files are valid
   - Check for missing dependencies

3. **Content Not Syncing:**
   - Ensure changes are committed to main branch
   - Check GitHub Actions workflow completion
   - Verify deployment to gh-pages branch

## 🎯 Best Practices

### **Documentation Standards:**

1. **Keep README.md Updated:**
   - Add new features to README first
   - Include important technical details
   - Update installation instructions

2. **Sync Important Changes:**
   - Architecture changes → wiki/developer/architecture.md
   - Deployment updates → wiki/deployment/
   - AI model changes → wiki/ai-integration/
   - Performance updates → wiki/performance/

3. **Regular Maintenance:**
   - Weekly content review
   - Monthly full audit
   - Quarterly major updates

### **Update Frequency:**

- **README/.cursorrules**: Update as needed
- **Wiki Sync**: After each README/.cursorrules change
- **Full Review**: Monthly
- **Major Updates**: Quarterly

## 🔗 Quick Commands

```bash
# Quick wiki update
./scripts/quick-wiki-update.sh

# Sync from README
./scripts/sync-readme-to-wiki.sh

# Test wiki status
curl -I https://wiki.orbgame.us

# Check deployment
git log --oneline gh-pages -3
```

---

**Your wiki is now live and ready for regular updates!** 🌐📚 