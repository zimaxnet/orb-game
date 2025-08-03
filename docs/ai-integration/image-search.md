# Image Search System

## Overview

The Orb Game uses Google Custom Search API for retrieving high-quality images of historical figures. This system provides comprehensive image coverage for all 120 historical figures across 8 categories and 5 epochs.

## Google Custom Search API Migration

### Migration Summary

- **From**: Bing Image Search API (deprecated August 2025)
- **To**: Google Custom Search API
- **Status**: ✅ Complete
- **Date**: January 2025

### Key Features

- **409 Curated Sites**: Comprehensive list of museums, educational institutions, and historical archives
- **Multiple Image Types**: Portraits, achievements, inventions, and artifacts
- **Rate Limit Management**: 100 free queries/day with intelligent fallback
- **Quality Control**: Licensing compliance and historical accuracy verification
- **Automated Download**: Scripts for bulk image retrieval and processing

## Configuration

### API Setup

1. **Google Cloud Console**
   - Enable Custom Search API
   - Create API key with no restrictions
   - Configure billing (required for API access)

2. **Custom Search Engine**
   - Create at https://cse.google.com/
   - Enable "Search the entire web"
   - Add 409 curated sites for optimal results
   - Note the Search Engine ID (CX)

3. **Azure Key Vault Storage**
   ```bash
   az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-API-KEY" --value "YOUR_API_KEY"
   az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-CX" --value "YOUR_SEARCH_ENGINE_ID"
   ```

### Environment Variables

```bash
GOOGLE_CSE_API_KEY=your-api-key
GOOGLE_CSE_CX=your-search-engine-id
```

## Implementation

### Core Scripts

#### `scripts/google-custom-search.py`
Main script for searching and retrieving images:

```python
class GoogleCustomSearchService:
    def __init__(self, api_key=None, cx=None):
        self.api_key = api_key
        self.cx = cx
        self.endpoint = 'https://www.googleapis.com/customsearch/v1'
    
    def search_google_images(self, query, count=1):
        # Performs Google Custom Search API calls
        # Returns list of image URLs
    
    def generate_search_queries(self, figure_name, category, image_type):
        # Generates optimized search queries
        # Returns list of search terms
    
    def fill_image_gaps(self, figures_data):
        # Main method to process all figures
        # Returns complete image data structure
```

#### `scripts/download-google-cse-images.py`
Downloads images from search results:

```python
def download_image(url, filename, folder="downloaded_images"):
    # Downloads image with proper headers
    # Handles Wikimedia compliance requirements

def download_all_images():
    # Processes JSON results file
    # Downloads all found images
    # Provides progress tracking and error handling
```

#### `scripts/inventory-images.py`
Analyzes image coverage:

```python
def analyze_inventory():
    # Compares existing images vs required figures
    # Provides detailed coverage statistics
    # Identifies missing images by category
```

### Search Strategy

#### Query Generation

For each historical figure, the system generates multiple search queries:

1. **Portrait Queries**
   - `"Figure Name" portrait`
   - `"Figure Name" historical portrait`

2. **Achievement Queries**
   - `"Figure Name" category achievement`
   - `"Figure Name" famous work`

3. **Invention Queries**
   - `"Figure Name" invention`
   - `"Figure Name" discovery`

4. **Artifact Queries**
   - `"Figure Name" artifact`
   - `"Figure Name" historical object`

#### Fallback System

When API calls fail or return no results:

1. **Rate Limit Fallback**: Uses placeholder images when 429 errors occur
2. **No Results Fallback**: Uses generic historical images
3. **Error Fallback**: Uses SVG placeholders for missing images

## Image Inventory

### Current Status

- **Total Images**: 201
- **Required Figures**: 120
- **Coverage**: 15.0% (18/120 figures have complete image sets)
- **Success Rate**: 26.5% download success rate

### Image Types

1. **Portraits**: Historical figure portraits and paintings
2. **Achievements**: Images of their key accomplishments
3. **Inventions**: Images of their discoveries and creations
4. **Artifacts**: Historical objects and artifacts

### Categories Covered

- **Technology**: 15 figures
- **Science**: 15 figures
- **Art**: 15 figures
- **Nature**: 15 figures
- **Sports**: 15 figures
- **Music**: 15 figures
- **Space**: 15 figures
- **Innovation**: 15 figures

## Usage

### Testing the Setup

```bash
# Test API configuration
python3 scripts/test-google-cse-setup.py

# Run full image search
python3 scripts/google-custom-search.py

# Download found images
python3 scripts/download-google-cse-images.py

# Check inventory status
python3 scripts/inventory-images.py
```

### API Limits

- **Free Tier**: 100 queries/day
- **Paid Tier**: $5 per 1000 queries
- **Rate Limiting**: Intelligent fallback when limits reached

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check API key restrictions
   - Verify Custom Search API is enabled
   - Ensure "Search the entire web" is enabled

2. **404 Not Found Errors**
   - Verify Search Engine ID (CX) is correct
   - Check Custom Search Engine configuration
   - Ensure sites are properly added to CSE

3. **429 Too Many Requests**
   - API rate limit reached
   - System automatically uses fallback images
   - Wait for daily reset or upgrade to paid tier

4. **Download Failures**
   - Check User-Agent headers for Wikimedia compliance
   - Verify network connectivity
   - Check file permissions for download directory

### Debugging Commands

```bash
# Test API credentials
python3 scripts/test-cse-simple.py

# Check Key Vault secrets
az keyvault secret show --name "GOOGLE-CSE-API-KEY" --vault-name "orb-game-kv-eastus2"
az keyvault secret show --name "GOOGLE-CSE-CX" --vault-name "orb-game-kv-eastus2"

# Fix malformed credentials
./scripts/fix-google-cse-credentials.sh
```

## Performance

### Optimization Strategies

1. **Caching**: Images are cached locally after download
2. **Batch Processing**: Multiple figures processed in single run
3. **Error Recovery**: Graceful handling of failed downloads
4. **Progress Tracking**: Real-time status updates during processing

### Metrics

- **Search Success Rate**: 100% (all figures processed)
- **Download Success Rate**: 26.5% (127/480 images)
- **Processing Time**: ~5 minutes for full dataset
- **Storage**: ~50MB for 201 images

## Future Improvements

1. **Enhanced Query Optimization**: Better search term generation
2. **Quality Filtering**: Automatic image quality assessment
3. **Batch Download**: Parallel download processing
4. **Alternative Sources**: Integration with additional image APIs
5. **Manual Curation**: Interface for manual image selection

## Related Files

- `scripts/google-custom-search.py`: Main search implementation
- `scripts/download-google-cse-images.py`: Image download system
- `scripts/inventory-images.py`: Coverage analysis
- `scripts/test-google-cse-setup.py`: Configuration testing
- `GOOGLE_CSE_MIGRATION_SUMMARY.md`: Migration documentation
- `google_custom_search_results.json`: Search results data 