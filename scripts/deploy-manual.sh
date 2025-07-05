#!/bin/bash

# AIMCS Manual Deployment Script
# This script deploys both frontend and backend to Azure

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP_FRONTEND="aimcs-rg"
RESOURCE_GROUP_BACKEND="aimcs-rg-eastus2"
CONTAINER_APP_NAME="aimcs-backend-eastus2"
CONTAINER_REGISTRY="aimcsregistry"
IMAGE_NAME="aimcs-backend"
FRONTEND_URL="https://aimcs.net"
BACKEND_URL="https://api.aimcs.net"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Function to check Azure login
check_azure_login() {
    if ! az account show &> /dev/null; then
        print_error "Not logged into Azure. Please run 'az login' first."
        exit 1
    fi
}

# Function to deploy backend
deploy_backend() {
    print_status "Starting backend deployment..."
    
    # Check if backend files exist
    if [ ! -f "backend-server.js" ] || [ ! -f "backend-Dockerfile" ]; then
        print_error "Backend files not found. Make sure you're in the correct directory."
        exit 1
    fi
    
    # Build and push Docker image
    print_status "Building Docker image..."
    docker buildx build \
        --platform linux/amd64 \
        --tag ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE_NAME}:$(git rev-parse --short HEAD) \
        --tag ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE_NAME}:latest \
        --file backend-Dockerfile \
        --push \
        .
    
    print_success "Docker image built and pushed successfully"
    
    # Update container app
    print_status "Updating Azure Container App..."
    az containerapp update \
        --name ${CONTAINER_APP_NAME} \
        --resource-group ${RESOURCE_GROUP_BACKEND} \
        --image ${CONTAINER_REGISTRY}.azurecr.io/${IMAGE_NAME}:$(git rev-parse --short HEAD)
    
    print_success "Backend deployment completed"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Starting frontend deployment..."
    
    # Check if frontend files exist
    if [ ! -d "src" ] || [ ! -f "src/package.json" ]; then
        print_error "Frontend files not found. Make sure you're in the correct directory."
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    cd src && npm ci && cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd src
    npm run build
    cd ..
    
    # Verify build output
    if [ ! -f "src/dist/index.html" ]; then
        print_error "Frontend build failed. Check the build output."
        exit 1
    fi
    
    print_success "Frontend built successfully"
    
    # Deploy to Azure Static Web App
    print_status "Deploying to Azure Static Web App..."
    
    # Get deployment token
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name aimcs --resource-group ${RESOURCE_GROUP_FRONTEND} --query "properties.apiKey" --output tsv)
    
    # Deploy using Static Web Apps CLI
    swa deploy src/dist --deployment-token $DEPLOYMENT_TOKEN --env production
    
    print_success "Frontend deployed to Azure Static Web App"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait for services to be ready
    sleep 30
    
    # Test backend health
    print_status "Testing backend health..."
    for i in {1..10}; do
        if curl -f ${BACKEND_URL}/health &> /dev/null; then
            print_success "Backend is healthy!"
            break
        else
            print_warning "Backend not responding, attempt $i/10..."
            sleep 30
        fi
    done
    
    # Test frontend
    print_status "Testing frontend..."
    if curl -f ${FRONTEND_URL} &> /dev/null; then
        print_success "Frontend is accessible!"
    else
        print_error "Frontend is not accessible"
        exit 1
    fi
    
    # Test API functionality
    print_status "Testing API functionality..."
    RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "Deployment test"}')
    
    if echo "$RESPONSE" | grep -q "response"; then
        print_success "API is working correctly!"
    else
        print_error "API test failed"
        echo "Response: $RESPONSE"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-only    Deploy only the backend"
    echo "  --frontend-only   Deploy only the frontend"
    echo "  --verify-only     Only verify the current deployment"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                 # Deploy both frontend and backend"
    echo "  $0 --backend-only  # Deploy only backend"
    echo "  $0 --verify-only   # Only verify deployment"
}

# Main script
main() {
    print_status "AIMCS Deployment Script"
    print_status "========================"
    
    # Check prerequisites
    check_command "az"
    check_command "docker"
    check_command "npm"
    check_command "git"
    
    check_azure_login
    
    # Parse command line arguments
    BACKEND_ONLY=false
    FRONTEND_ONLY=false
    VERIFY_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                BACKEND_ONLY=true
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --verify-only)
                VERIFY_ONLY=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Execute deployment
    if [ "$VERIFY_ONLY" = true ]; then
        verify_deployment
    elif [ "$BACKEND_ONLY" = true ]; then
        deploy_backend
        verify_deployment
    elif [ "$FRONTEND_ONLY" = true ]; then
        deploy_frontend
        verify_deployment
    else
        deploy_backend
        deploy_frontend
        verify_deployment
    fi
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "Frontend: ${FRONTEND_URL}"
    echo "Backend: ${BACKEND_URL}"
    echo "Health Check: ${BACKEND_URL}/health"
}

# Run main function
main "$@" 