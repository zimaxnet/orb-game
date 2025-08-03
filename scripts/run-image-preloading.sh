#!/bin/bash

# Image Preloading Script for Orb Game
# This script preloads all historical figure images into MongoDB

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the orb-game root directory"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the preload script exists
if [ ! -f "scripts/preload-all-images.js" ]; then
    log_error "preload-all-images.js script not found"
    exit 1
fi

# Function to check Azure credentials
check_azure_credentials() {
    log_info "Checking Azure credentials..."
    
    if ! command -v az &> /dev/null; then
        log_warning "Azure CLI not found. Please install Azure CLI for automatic credential management."
        return 1
    fi
    
    # Check if logged in
    if ! az account show &> /dev/null; then
        log_warning "Not logged into Azure. Please run 'az login' first."
        return 1
    fi
    
    log_success "Azure credentials verified"
    return 0
}

# Function to check MongoDB connection
check_mongodb_connection() {
    log_info "Testing MongoDB connection..."
    
    if node scripts/test-mongodb-connection.js; then
        log_success "MongoDB connection successful"
        return 0
    else
        log_error "MongoDB connection failed"
        return 1
    fi
}

# Function to check existing images
check_existing_images() {
    log_info "Checking existing images in MongoDB..."
    
    if node scripts/preload-all-images.js stats &> /dev/null; then
        log_success "Image statistics retrieved successfully"
        return 0
    else
        log_warning "Could not retrieve image statistics (this is normal if no images exist yet)"
        return 1
    fi
}

# Function to run preloading
run_preloading() {
    log_info "Starting image preloading process..."
    
    # Run the preloading script
    if node scripts/preload-all-images.js preload; then
        log_success "Image preloading completed successfully"
        return 0
    else
        log_error "Image preloading failed"
        return 1
    fi
}

# Function to verify preloaded images
verify_images() {
    log_info "Verifying preloaded images..."
    
    if node scripts/preload-all-images.js verify; then
        log_success "Image verification completed"
        return 0
    else
        log_error "Image verification failed"
        return 1
    fi
}

# Function to show final statistics
show_final_stats() {
    log_info "Generating final statistics..."
    
    if node scripts/preload-all-images.js stats; then
        log_success "Statistics generated successfully"
        return 0
    else
        log_error "Failed to generate statistics"
        return 1
    fi
}

# Main execution function
main() {
    echo "🚀 Orb Game Image Preloading Script"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    
    # Check Azure credentials (optional)
    check_azure_credentials || log_warning "Azure credentials check skipped"
    
    # Check MongoDB connection
    if ! check_mongodb_connection; then
        log_error "Cannot proceed without MongoDB connection"
        exit 1
    fi
    
    # Check existing images
    check_existing_images || log_info "No existing images found (this is normal for first run)"
    
    echo ""
    log_info "Starting comprehensive image preloading..."
    echo ""
    
    # Run preloading
    if run_preloading; then
        echo ""
        log_success "Image preloading process completed!"
        echo ""
        
        # Verify images
        verify_images
        
        echo ""
        # Show final statistics
        show_final_stats
        
        echo ""
        log_success "🎉 All done! Historical figure images have been preloaded into MongoDB."
        echo ""
        log_info "The images are now available for immediate use in the Orb Game."
        log_info "Users will see images instantly when viewing historical figure stories."
        
    else
        log_error "Image preloading process failed"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Orb Game Image Preloading Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verify   Only verify existing images (skip preloading)"
    echo "  -s, --stats    Only show statistics"
    echo "  -c, --check    Only check prerequisites"
    echo ""
    echo "Examples:"
    echo "  $0              # Run full preloading process"
    echo "  $0 --verify     # Only verify existing images"
    echo "  $0 --stats      # Only show statistics"
    echo "  $0 --check      # Only check prerequisites"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--verify)
        log_info "Running verification only..."
        verify_images
        show_final_stats
        exit 0
        ;;
    -s|--stats)
        log_info "Showing statistics only..."
        show_final_stats
        exit 0
        ;;
    -c|--check)
        log_info "Running prerequisite checks only..."
        check_azure_credentials || true
        check_mongodb_connection
        check_existing_images || true
        log_success "Prerequisite checks completed"
        exit 0
        ;;
    "")
        # No arguments, run full process
        main
        ;;
    *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 