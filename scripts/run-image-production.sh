#!/bin/bash

# 🚀 Orb Game Image Production Pipeline
# Orchestrates the complete process from mock data to production-ready images

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/image_production.log"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error "Must be run from the project root directory"
        exit 1
    fi
    
    # Check for required files
    if [[ ! -f "OrbGameInfluentialPeopleSeeds" ]]; then
        error "OrbGameInfluentialPeopleSeeds file not found"
        exit 1
    fi
    
    # Check for required environment variables
    if [[ -z "$MONGO_URI" ]]; then
        error "MONGO_URI environment variable not set"
        exit 1
    fi
    
    # Check Python dependencies
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check Node.js dependencies
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Install Python dependencies
install_python_deps() {
    log "📦 Installing Python dependencies..."
    
    # Check if requirements.txt exists, if not create it
    if [[ ! -f "requirements.txt" ]]; then
        cat > requirements.txt << EOF
requests>=2.25.1
Pillow>=8.0.0
EOF
        log "Created requirements.txt"
    fi
    
    # Install dependencies
    if pip3 install -r requirements.txt; then
        success "Python dependencies installed"
    else
        error "Failed to install Python dependencies"
        exit 1
    fi
}

# Step 1: Real Image Retrieval
step1_real_image_retrieval() {
    log "🖼️ Step 1: Real Image Retrieval"
    
    if [[ ! -f "scripts/real-image-retrieval.py" ]]; then
        error "Real image retrieval script not found"
        exit 1
    fi
    
    log "Running real image retrieval..."
    if python3 scripts/real-image-retrieval.py; then
        success "Real image retrieval completed"
        
        # Check if results file was created
        if [[ -f "real_image_results.json" ]]; then
            log "Results saved to real_image_results.json"
        else
            warning "No results file created - this may indicate no images were found"
        fi
    else
        error "Real image retrieval failed"
        exit 1
    fi
}

# Step 2: Image Validation
step2_image_validation() {
    log "✅ Step 2: Image Validation"
    
    if [[ ! -f "real_image_results.json" ]]; then
        warning "No image results found, skipping validation"
        return
    fi
    
    log "Validating image URLs..."
    
    # Create a simple validation script
    cat > validate_images.py << 'EOF'
#!/usr/bin/env python3
import json
import requests
from PIL import Image
from io import BytesIO

def validate_images():
    with open('real_image_results.json', 'r') as f:
        data = json.load(f)
    
    valid_count = 0
    invalid_count = 0
    
    for figure in data.get('figures', []):
        for image_type in ['portraits', 'achievements', 'inventions', 'artifacts']:
            for image in figure['images'].get(image_type, []):
                try:
                    response = requests.get(image['url'], timeout=10)
                    response.raise_for_status()
                    
                    # Check if it's actually an image
                    content_type = response.headers.get('content-type', '')
                    if content_type.startswith('image/'):
                        valid_count += 1
                        image['validated'] = True
                    else:
                        invalid_count += 1
                        image['validated'] = False
                except Exception:
                    invalid_count += 1
                    image['validated'] = False
    
    # Save validated results
    with open('validated_image_results.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Validated {valid_count} images, {invalid_count} invalid")
    return valid_count > 0

if __name__ == "__main__":
    validate_images()
EOF
    
    if python3 validate_images.py; then
        success "Image validation completed"
    else
        warning "Image validation failed or no valid images found"
    fi
}

# Step 3: Database Population
step3_database_population() {
    log "🗄️ Step 3: Database Population"
    
    if [[ ! -f "scripts/database-population.js" ]]; then
        error "Database population script not found"
        exit 1
    fi
    
    log "Populating database with validated images..."
    if node scripts/database-population.js; then
        success "Database population completed"
    else
        error "Database population failed"
        exit 1
    fi
}

# Step 4: Validation Dashboard
step4_validation_dashboard() {
    log "📊 Step 4: Validation Dashboard"
    
    if [[ ! -f "scripts/image-validation-dashboard.js" ]]; then
        error "Validation dashboard script not found"
        exit 1
    fi
    
    log "Generating validation dashboard..."
    if node scripts/image-validation-dashboard.js; then
        success "Validation dashboard generated"
    else
        error "Validation dashboard failed"
        exit 1
    fi
}

# Step 5: Quality Assurance
step5_quality_assurance() {
    log "🔍 Step 5: Quality Assurance"
    
    log "Running quality checks..."
    
    # Check database connection
    if node -e "
        const { MongoClient } = require('mongodb');
        MongoClient.connect(process.env.MONGO_URI)
            .then(client => {
                console.log('✅ Database connection successful');
                client.close();
            })
            .catch(err => {
                console.error('❌ Database connection failed:', err);
                process.exit(1);
            });
    "; then
        success "Database connection verified"
    else
        error "Database connection failed"
        exit 1
    fi
    
    # Check API endpoints
    log "Testing API endpoints..."
    if curl -s "https://api.orbgame.us/api/orb/historical-figures/Technology?count=1&epoch=Modern&language=en" > /dev/null; then
        success "API endpoints responding"
    else
        warning "API endpoints may not be responding"
    fi
}

# Main execution function
main() {
    log "🚀 Starting Orb Game Image Production Pipeline"
    log "Project root: $PROJECT_ROOT"
    
    # Create log file
    touch "$LOG_FILE"
    log "Log file: $LOG_FILE"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_python_deps
    
    # Execute steps
    step1_real_image_retrieval
    step2_image_validation
    step3_database_population
    step4_validation_dashboard
    step5_quality_assurance
    
    # Final summary
    log "🎉 Image Production Pipeline Completed!"
    log "Next steps:"
    log "  1. Review image-validation-report.json"
    log "  2. Test the application with real images"
    log "  3. Monitor for any issues"
    log "  4. Consider implementing CDN integration"
    
    success "Pipeline completed successfully"
}

# Handle command line arguments
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "step1")
        check_prerequisites
        step1_real_image_retrieval
        ;;
    "step2")
        step2_image_validation
        ;;
    "step3")
        check_prerequisites
        step3_database_population
        ;;
    "step4")
        check_prerequisites
        step4_validation_dashboard
        ;;
    "step5")
        step5_quality_assurance
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check   - Check prerequisites only"
        echo "  step1   - Run real image retrieval only"
        echo "  step2   - Run image validation only"
        echo "  step3   - Run database population only"
        echo "  step4   - Run validation dashboard only"
        echo "  step5   - Run quality assurance only"
        echo "  help    - Show this help message"
        echo ""
        echo "If no command is provided, runs the complete pipeline."
        ;;
    "")
        main
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac 