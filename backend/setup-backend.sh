#!/bin/bash

# AIMCS Backend Setup Script
# This script helps set up the backend environment correctly to avoid confusion with frontend files

echo "🚀 AIMCS Backend Setup Script"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend-server.js" ]; then
    echo "❌ ERROR: backend-server.js not found!"
    echo "   Make sure you're in the backend repository directory."
    echo "   Current directory: $(pwd)"
    exit 1
fi

if [ ! -f "backend-package.json" ]; then
    echo "❌ ERROR: backend-package.json not found!"
    echo "   Make sure you're in the backend repository directory."
    exit 1
fi

echo "✅ Found backend files:"
echo "   - backend-server.js"
echo "   - backend-package.json"
echo ""

# Backup existing package.json if it exists
if [ -f "package.json" ]; then
    echo "📦 Found existing package.json (frontend)"
    echo "   Backing up to package.json.frontend"
    cp package.json package.json.frontend
fi

# Copy backend package.json
echo "📦 Setting up backend package.json..."
cp backend-package.json package.json

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🚀 To start the backend server:"
echo "   node backend-server.js"
echo ""
echo "🐳 To build Docker image:"
echo "   docker build -f backend-Dockerfile -t aimcs-backend:latest ."
echo ""
echo "📝 To restore frontend package.json:"
echo "   cp package.json.frontend package.json"
echo ""
echo "⚠️  REMEMBER: Always use backend-server.js for backend operations!" 