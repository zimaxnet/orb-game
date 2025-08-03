#!/bin/bash

# Orb Game Deployment Script
echo "🚀 Deploying Orb Game..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Frontend built successfully"

# Deploy to Azure Static Web Apps (if configured)
if [ -n "$DEPLOYMENT_TOKEN" ]; then
    echo "🌐 Deploying to Azure Static Web Apps..."
    npx @azure/static-web-apps-cli deploy dist --deployment-token $DEPLOYMENT_TOKEN --env production
    echo "✅ Frontend deployed"
else
    echo "⚠️ DEPLOYMENT_TOKEN not set - skipping frontend deployment"
fi

# Deploy backend (if backend directory exists)
if [ -d "backend" ]; then
    echo "🔧 Deploying backend..."
    cd backend
    
    # Build Docker image
    docker build -t orb-game-backend:latest -f backend-Dockerfile .
    
    # Push to Azure Container Registry (if configured)
    if [ -n "$CONTAINER_REGISTRY" ]; then
        docker tag orb-game-backend:latest $CONTAINER_REGISTRY.azurecr.io/orb-game-backend:latest
        docker push $CONTAINER_REGISTRY.azurecr.io/orb-game-backend:latest
        echo "✅ Backend image pushed to registry"
    else
        echo "⚠️ CONTAINER_REGISTRY not set - skipping backend deployment"
    fi
    
    cd ..
else
    echo "⚠️ Backend directory not found - skipping backend deployment"
fi

echo "🎉 Orb Game deployment complete!"
echo "Frontend: https://orb-game.azurewebsites.net"
echo "Backend: https://api.orb-game.net" 