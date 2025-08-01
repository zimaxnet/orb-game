#!/bin/bash

# 🚀 Configure GitHub Pages Step-by-Step
# This script guides you through configuring GitHub Pages

set -e

echo "🚀 GitHub Pages Configuration Guide"
echo "=================================="

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

# Show step-by-step instructions
show_instructions() {
    print_info "Step-by-Step GitHub Pages Configuration"
    echo ""
    echo "📋 Follow These Exact Steps:"
    echo "============================"
    echo ""
    echo "1. Open GitHub Repository Settings:"
    echo "   🔗 https://github.com/zimaxnet/orb-game/settings/pages"
    echo ""
    echo "2. Configure Source Settings:"
    echo "   • Click 'Deploy from a branch' (if not already selected)"
    echo "   • Branch: Select 'gh-pages' from dropdown"
    echo "   • Folder: Leave as '/ (root)'"
    echo ""
    echo "3. Add Custom Domain:"
    echo "   • In 'Custom domain' field, type: wiki.orbgame.us"
    echo "   • Check the box: 'Enforce HTTPS'"
    echo ""
    echo "4. Save Configuration:"
    echo "   • Click 'Save' button"
    echo "   • Wait for GitHub to process (1-2 minutes)"
    echo ""
    echo "5. Verify Configuration:"
    echo "   • Should show: 'Your site is live at https://wiki.orbgame.us'"
    echo "   • Green checkmark should appear next to custom domain"
    echo "   • 'Enforce HTTPS' should be checked"
    echo ""
}

# Show what to look for
show_success_indicators() {
    print_info "Success Indicators"
    echo ""
    echo "📋 What You Should See After Configuration:"
    echo "=========================================="
    echo ""
    echo "✅ GitHub Pages Settings Page:"
    echo "   • 'Your site is live at https://wiki.orbgame.us'"
    echo "   • Green checkmark next to custom domain"
    echo "   • 'Enforce HTTPS' is checked"
    echo "   • Source shows 'Deploy from a branch'"
    echo "   • Branch shows 'gh-pages'"
    echo ""
    echo "✅ No Error Messages:"
    echo "   • No red error messages"
    echo "   • No DNS configuration errors"
    echo "   • No branch not found errors"
    echo ""
}

# Show troubleshooting
show_troubleshooting() {
    print_info "Troubleshooting"
    echo ""
    echo "📋 Common Issues & Solutions:"
    echo "============================="
    echo ""
    echo "❌ If 'gh-pages' branch is not in dropdown:"
    echo "   • The branch exists, try refreshing the page"
    echo "   • Check that gh-pages branch exists on GitHub"
    echo "   • Wait a moment and try again"
    echo ""
    echo "❌ If custom domain shows error:"
    echo "   • DNS is already configured correctly"
    echo "   • Try typing the domain again: wiki.orbgame.us"
    echo "   • Wait for DNS propagation (up to 30 minutes)"
    echo ""
    echo "❌ If 'Save' button is grayed out:"
    echo "   • Ensure all fields are filled correctly"
    echo "   • Check that branch is selected"
    echo "   • Try refreshing the page"
    echo ""
    echo "❌ If site still shows 404 after configuration:"
    echo "   • Wait 5-10 minutes for GitHub Pages to process"
    echo "   • Check GitHub Actions for any build errors"
    echo "   • Verify gh-pages branch has content"
    echo ""
}

# Test configuration after setup
test_configuration() {
    print_info "Testing Configuration"
    echo ""
    echo "📋 After Configuration, Test These:"
    echo "=================================="
    echo ""
    echo "1. Test HTTP access:"
    echo "   curl -I http://wiki.orbgame.us"
    echo ""
    echo "2. Test HTTPS access:"
    echo "   curl -I https://wiki.orbgame.us"
    echo ""
    echo "3. Run verification script:"
    echo "   ./scripts/verify-wiki-status.sh"
    echo ""
    echo "4. Check GitHub Actions:"
    echo "   https://github.com/zimaxnet/orb-game/actions"
    echo ""
}

# Show timeline expectations
show_timeline() {
    print_info "Expected Timeline"
    echo ""
    echo "📋 After Configuration:"
    echo "======================"
    echo ""
    echo "⏱️  Immediate (0-5 minutes):"
    echo "   • GitHub Pages configuration saved"
    echo "   • Site should be accessible via HTTP"
    echo "   • Status shows 'live'"
    echo ""
    echo "⏱️  Short term (5-30 minutes):"
    echo "   • Full DNS propagation"
    echo "   • Site fully accessible"
    echo "   • GitHub Pages status stable"
    echo ""
    echo "⏱️  Medium term (1-24 hours):"
    echo "   • SSL certificate generated"
    echo "   • HTTPS access enabled"
    echo "   • Full security implementation"
    echo ""
}

# Show next steps after configuration
show_next_steps() {
    print_info "Next Steps After Configuration"
    echo ""
    echo "📋 Once GitHub Pages is Configured:"
    echo "==================================="
    echo ""
    echo "1. Test the wiki:"
    echo "   • Visit: https://wiki.orbgame.us"
    echo "   • Verify all documentation loads"
    echo "   • Test navigation and search"
    echo ""
    echo "2. Test automatic updates:"
    echo "   • Edit a file in docs/ directory"
    echo "   • Commit and push to main"
    echo "   • Wait 5-10 minutes for auto-deployment"
    echo "   • Check that changes appear on wiki"
    echo ""
    echo "3. Test manual updates:"
    echo "   • Run: ./scripts/quick-wiki-update.sh"
    echo "   • Run: ./scripts/sync-readme-to-wiki.sh"
    echo ""
    echo "4. Monitor deployment:"
    echo "   • Check GitHub Actions for build status"
    echo "   • Monitor gh-pages branch for updates"
    echo "   • Test wiki accessibility regularly"
    echo ""
}

# Main execution
main() {
    echo ""
    print_info "Starting GitHub Pages configuration guide..."
    echo ""
    
    # Show all instructions
    show_instructions
    show_success_indicators
    show_troubleshooting
    test_configuration
    show_timeline
    show_next_steps
    
    echo ""
    print_status "Configuration guide completed!"
    echo ""
    print_info "Ready to configure GitHub Pages!"
    echo ""
    print_info "Next action:"
    echo "  1. Go to: https://github.com/zimaxnet/orb-game/settings/pages"
    echo "  2. Follow the step-by-step instructions above"
    echo "  3. Configure the settings as shown"
    echo "  4. Click 'Save'"
    echo "  5. Test the wiki at https://wiki.orbgame.us"
    echo ""
    print_info "After configuration, run this script again to test the results."
    echo ""
}

# Run main function
main "$@" 