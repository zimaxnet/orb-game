#!/bin/bash

# Script to add MongoDB URI as a GitHub secret
# This script helps you add the MongoDB URI to GitHub Secrets without exposing it in the repository

echo "🔐 Adding MongoDB URI to GitHub Secrets"
echo "========================================"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

# Get the MongoDB URI from user
echo ""
echo "Please enter your MongoDB URI (it will be hidden when typing):"
read -s MONGO_URI

if [ -z "$MONGO_URI" ]; then
    echo "❌ MongoDB URI cannot be empty"
    exit 1
fi

echo ""
echo "Adding MongoDB URI to GitHub Secrets..."

# Add the secret to GitHub
if gh secret set MONGO_URI --body "$MONGO_URI"; then
    echo "✅ MongoDB URI successfully added to GitHub Secrets!"
    echo ""
    echo "The secret is now available in your GitHub Actions workflows as:"
    echo "  \${{ secrets.MONGO_URI }}"
    echo ""
    echo "⚠️  Important: Make sure to never commit the MongoDB URI to your repository!"
    echo "   The URI should only exist in GitHub Secrets."
else
    echo "❌ Failed to add MongoDB URI to GitHub Secrets"
    exit 1
fi 