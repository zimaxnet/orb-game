# 🖼️ Orb Game Image Retrieval & Storage Implementation Plan

## 📅 **Phase-by-Phase Implementation**

### **PHASE 1: Discovery & Preparation** ✅ *Ready to Start*

#### 1. **Define Image Targets**
- **Portrait**: Artistic or photographic likeness
- **Achievement**: Depiction of major achievement  
- **Invention**: Photo/diagram of created device/patent/process
- **Artifact**: Related historical object/document/memorabilia

#### 2. **Catalog Search Terms**
```python
# Example search terms for Archimedes
search_terms = {
    "portrait": ["Archimedes portrait", "Archimedes bust", "Archimedes statue"],
    "achievement": ["Archimedes principle", "Archimedes buoyancy", "Archimedes mathematics"],
    "invention": ["Archimedes screw", "Archimedes lever", "Archimedes pulley"],
    "artifact": ["Archimedes artifacts", "ancient Greek tools", "classical mechanics"]
}
```

---

### **PHASE 2: Source Integration & Query Automation** 🚀 *Implementation Ready*

#### 1. **API Sources & Tools**
```python
# Required Python libraries
pip install requests beautifulsoup4 wikipedia pillow pymongo tqdm

# API Endpoints
APIS = {
    "wikimedia": "https://commons.wikimedia.org/api/rest_v1/",
    "smithsonian": "https://api.si.edu/openaccess/api/v1.0/",
    "met": "https://collectionapi.metmuseum.org/public/collection/v1/",
    "europeana": "https://api.europeana.eu/record/v2/search.json",
    "nasa": "https://images-api.nasa.gov/search"
}
```

#### 2. **Search Script Structure**
```python
class ImageRetriever:
    def __init__(self):
        self.session = requests.Session()
        self.mongo_client = pymongo.MongoClient(MONGO_URI)
        self.db = self.mongo_client.orbgame
        self.images_collection = self.db.historical_figure_images
    
    def search_wikimedia(self, figure_name, search_type):
        # Wikimedia Commons API implementation
        pass
    
    def search_smithsonian(self, figure_name, search_type):
        # Smithsonian API implementation
        pass
    
    def download_and_validate(self, url, figure_name, image_type):
        # Download, resize, hash, and validate
        pass
```

---

### **PHASE 3: Image Validation & Categorization** 🔍 *Quality Control*

#### 1. **Automated Validation**
```python
def validate_image(image_path):
    """Validate image quality and relevance"""
    with Image.open(image_path) as img:
        # Check dimensions (min 200x200, max 1024x1024)
        width, height = img.size
        if width < 200 or height < 200:
            return False, "Too small"
        if width > 1024 or height > 1024:
            return False, "Too large"
        
        # Check aspect ratio (not too extreme)
        ratio = width / height
        if ratio < 0.3 or ratio > 3.0:
            return False, "Poor aspect ratio"
        
        return True, "Valid"

def deduplicate_images(image_list):
    """Remove duplicate images using perceptual hashing"""
    # Implementation using imagehash library
    pass
```

#### 2. **Category Assignment**
```python
def categorize_image(figure_name, image_type, url, metadata):
    """Assign image to correct category with confidence score"""
    return {
        "figureName": figure_name,
        "type": image_type,  # portrait, achievement, invention, artifact
        "url": url,
        "source": metadata.get("source"),
        "license": metadata.get("license"),
        "attribution": metadata.get("attribution"),
        "confidence": calculate_confidence(image_type, metadata),
        "retrieved": datetime.now().isoformat()
    }
```

---

### **PHASE 4: MongoDB Storage** 💾 *Database Integration*

#### 1. **Schema Design**
```javascript
// MongoDB Schema for historical_figure_images
{
  "_id": ObjectId,
  "figureName": "Archimedes",
  "category": "Technology", 
  "epoch": "Ancient",
  "images": [
    {
      "type": "portrait",
      "url": "https://commons.wikimedia.org/wiki/File:Archimedes.jpg",
      "localPath": "/images/archimedes_portrait_7a8b6c.jpg",
      "license": "public domain",
      "source": "Wikimedia Commons",
      "attribution": "Michelangelo",
      "retrieved": "2025-01-13T10:30:00Z",
      "confidence": 0.95,
      "width": 800,
      "height": 600,
      "fileSize": 125000
    },
    {
      "type": "invention", 
      "url": "https://commons.wikimedia.org/wiki/File:Archimedes_screw.jpg",
      "localPath": "/images/archimedes_screw_6c5d3f.jpg",
      "license": "public domain",
      "source": "Wikimedia Commons", 
      "attribution": "Unknown",
      "retrieved": "2025-01-13T10:30:00Z",
      "confidence": 0.92,
      "width": 1024,
      "height": 768,
      "fileSize": 180000
    }
  ],
  "lastUpdated": "2025-01-13T10:30:00Z",
  "totalImages": 2,
  "coverage": {
    "portrait": 1,
    "achievement": 0,
    "invention": 1,
    "artifact": 0
  }
}
```

#### 2. **MongoDB Operations**
```python
def store_figure_images(figure_name, category, epoch, images):
    """Store or update images for a figure"""
    filter_query = {
        "figureName": figure_name,
        "category": category,
        "epoch": epoch
    }
    
    update_data = {
        "$set": {
            "lastUpdated": datetime.now(),
            "totalImages": len(images),
            "coverage": calculate_coverage(images)
        },
        "$push": {
            "images": {"$each": images}
        }
    }
    
    result = db.historical_figure_images.update_one(
        filter_query, update_data, upsert=True
    )
    return result.modified_count > 0 or result.upserted_id
```

---

### **PHASE 5: Maintenance & Expansion** 🔄 *Ongoing Process*

#### 1. **Automated Update Cycle**
```python
# Cron job script
def scheduled_image_update():
    """Monthly update of image collection"""
    figures = load_historical_figures()
    
    for figure in figures:
        # Check for new/better images
        new_images = search_for_new_images(figure)
        if new_images:
            update_figure_images(figure, new_images)
    
    # Generate report
    generate_coverage_report()
```

#### 2. **User Feedback System**
```python
def flag_image_issue(figure_name, image_url, issue_type, user_comment):
    """Allow users to flag problematic images"""
    flag_data = {
        "figureName": figure_name,
        "imageUrl": image_url,
        "issueType": issue_type,  # wrong_person, low_quality, inappropriate
        "userComment": user_comment,
        "flaggedAt": datetime.now(),
        "status": "pending_review"
    }
    
    db.image_flags.insert_one(flag_data)
```

---

## 🚀 **Implementation Files to Create**

### **1. Core Scripts**
- `scripts/image-retriever.py` - Main image retrieval engine
- `scripts/image-validator.py` - Image quality validation
- `scripts/mongodb-storage.py` - Database operations
- `scripts/coverage-report.py` - Progress tracking

### **2. Configuration Files**
- `config/image-sources.json` - API endpoints and credentials
- `config/search-terms.json` - Figure-specific search terms
- `config/validation-rules.json` - Image quality rules

### **3. Utility Scripts**
- `scripts/batch-image-retrieval.py` - Process all figures
- `scripts/image-cleanup.py` - Remove duplicates/low quality
- `scripts/coverage-analysis.py` - Generate statistics

---

## 📊 **Success Metrics**

### **Target Coverage (After Implementation)**
- **Portraits**: 95%+ (114/120 figures)
- **Achievements**: 80%+ (96/120 figures)  
- **Inventions**: 70%+ (84/120 figures)
- **Artifacts**: 60%+ (72/120 figures)

### **Quality Standards**
- **Minimum Resolution**: 200x200 pixels
- **Maximum Resolution**: 1024x1024 pixels
- **License**: Public Domain or Creative Commons
- **Attribution**: Clear source attribution required
- **Relevance**: Must be related to the specific figure

---

## 🎯 **Next Steps**

1. **Start with Phase 1**: Define search terms for all 120 figures
2. **Implement Phase 2**: Create the image retriever script
3. **Test with 5 figures**: Validate the process works
4. **Scale to all figures**: Batch process remaining figures
5. **Monitor and maintain**: Set up automated updates

This plan provides a systematic approach to transform the current 7% image coverage to 95%+ coverage with high-quality, properly attributed images for all historical figures in the Orb Game. 