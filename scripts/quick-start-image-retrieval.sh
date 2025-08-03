#!/bin/bash

# Orb Game Image Retrieval - Quick Start Script
# This script sets up the environment and runs the image retriever

set -e

echo "🚀 Orb Game Image Retrieval - Quick Start"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "historical-figures-achievements.json" ]; then
    echo "❌ Error: historical-figures-achievements.json not found"
    echo "Please run this script from the orb-game root directory"
    exit 1
fi

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ Error: pip3 is required but not installed"
    exit 1
fi

echo "📦 Installing Python dependencies..."
pip3 install -r scripts/requirements-image-retrieval.txt

# Get MongoDB URI
echo "🔧 Setting up MongoDB connection..."
if [ -z "$MONGO_URI" ]; then
    echo "Please enter your MongoDB connection string:"
    echo "Example: mongodb://username:password@host:port/database"
    read -p "MongoDB URI: " MONGO_URI
fi

if [ -z "$MONGO_URI" ]; then
    echo "❌ Error: MongoDB URI is required"
    exit 1
fi

# Create images directory
echo "📁 Creating images directory..."
mkdir -p images

# Test mode first
echo "🧪 Running in test mode (first 5 figures)..."
python3 scripts/image-retriever.py --mongo-uri "$MONGO_URI" --test

echo ""
echo "✅ Test completed successfully!"
echo ""
echo "🎯 To run the full image retrieval process:"
echo "python3 scripts/image-retriever.py --mongo-uri \"$MONGO_URI\""
echo ""
echo "📊 To check current image coverage:"
echo "curl -s \"https://api.orbgame.us/api/orb/images/stats\" | jq ."
echo ""
echo "🔍 To test image retrieval for a specific figure:"
echo "curl -s \"https://api.orbgame.us/api/orb/images/best?figureName=Archimedes&category=Technology&epoch=Ancient\" | jq ." 