#!/bin/bash

set -e

echo "🎮 Orb Game Story Prepopulation Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the orb-game root directory"
    exit 1
fi

# Check if required files exist
if [ ! -f "EpochalCategoryStoryMap.md" ]; then
    echo "❌ Error: EpochalCategoryStoryMap.md not found"
    exit 1
fi

if [ ! -f "OrbGameInfluentialPeopleSeeds" ]; then
    echo "❌ Error: OrbGameInfluentialPeopleSeeds not found"
    exit 1
fi

# Check if environment variables are set
if [ -z "$AZURE_OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: AZURE_OPENAI_API_KEY not set"
    echo "   The script will try to load it from .env file"
fi

if [ -z "$AZURE_OPENAI_ENDPOINT" ]; then
    echo "⚠️  Warning: AZURE_OPENAI_ENDPOINT not set"
    echo "   The script will try to load it from .env file"
fi

if [ -z "$MONGO_URI" ]; then
    echo "⚠️  Warning: MONGO_URI not set"
    echo "   The script will try to load it from .env file"
fi

# Load environment variables from .env if it exists
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if required dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Make the prepopulation script executable
chmod +x scripts/prepopulate-all-stories.js

echo ""
echo "🚀 Starting story prepopulation..."
echo "This will generate stories for all categories, epochs, and languages"
echo "using the EpochalCategoryStoryMap and historical figures data."
echo ""
echo "📊 Expected story count:"
echo "   - 8 categories (Technology, Science, Art, Nature, Sports, Music, Space, Innovation)"
echo "   - 5 epochs (Ancient, Medieval, Industrial, Modern, Future)"
echo "   - 2 languages (English, Spanish)"
echo "   - 2 story types (Topic stories, Historical figure stories)"
echo "   - 3 stories per topic/figure"
echo ""
echo "📈 Total expected stories: ~480 stories"
echo "⏱️  Estimated time: 30-60 minutes"
echo ""

# Ask for confirmation
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Prepopulation cancelled"
    exit 0
fi

echo ""
echo "🎯 Running prepopulation script..."
echo ""

# Run the prepopulation script
node scripts/prepopulate-all-stories.js

echo ""
echo "🎉 Prepopulation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the game to ensure stories are loading correctly"
echo "2. Check MongoDB to verify all stories were stored"
echo "3. Deploy the updated backend to production"
echo ""
echo "🔗 Useful commands:"
echo "   - Check MongoDB stories: node scripts/check-database-stories.js"
echo "   - Test story loading: node scripts/test-story-api.js"
echo "   - Deploy backend: ./scripts/deploy-full.sh" 