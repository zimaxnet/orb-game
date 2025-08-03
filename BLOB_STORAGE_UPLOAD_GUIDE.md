# 🚀 Orb Game - Azure Blob Storage Image Upload Guide

This guide provides comprehensive instructions for uploading all historical figure images to Azure Blob Storage.

## 📊 Current Image Status

### **Current Working Images**
- **293 total figures** with **502 total images** available
- **189 portraits** and **313 gallery images**
- **9 primary sources** (verified historical figures)
- **8 category fallbacks** (SVG placeholders)

### **Blob Storage Images (Not Working)**
- **115 historical figures** have blob storage URLs configured
- **4 images per figure** (portraits, achievements, inventions, artifacts)
- **Total: ~460 blob storage images** available but not accessible
- **Status**: 404 errors - the blobs don't exist in the storage account

## 🎯 Upload Options

### **Option 1: Simple Upload (Recommended)**
Uses Azure Storage connection string for authentication.

```bash
# Set your Azure Storage connection string
export AZURE_STORAGE_CONNECTION_STRING='your_connection_string_here'

# Run the simple upload script
./scripts/upload-images-simple.sh
```

### **Option 2: Full Upload with Managed Identity**
Uses Azure managed identity for authentication (requires Azure CLI).

```bash
# Login to Azure
az login

# Run the full upload script
./scripts/upload-images-to-blob.sh
```

## 📋 Prerequisites

### **Required Software**
- Python 3.7+
- Azure CLI (for Option 2)
- Access to Azure Storage Account

### **Azure Storage Account Setup**
1. **Storage Account**: `orbgameimages` in resource group `orb-game-rg-eastus2`
2. **Container**: `historical-figures` (will be created automatically)
3. **Access Level**: Blob (public read access)

### **Authentication Setup**

#### **For Simple Upload (Option 1)**
1. Go to Azure Portal
2. Navigate to Storage Account `orbgameimages`
3. Go to "Access keys"
4. Copy the connection string
5. Set as environment variable:
   ```bash
   export AZURE_STORAGE_CONNECTION_STRING='DefaultEndpointsProtocol=https;AccountName=orbgameimages;AccountKey=your_key;EndpointSuffix=core.windows.net'
   ```

#### **For Full Upload (Option 2)**
1. Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
2. Login to Azure:
   ```bash
   az login
   ```
3. Ensure you have access to the storage account

## 🔧 Installation

### **Install Python Dependencies**
```bash
pip3 install -r scripts/requirements-upload.txt
```

### **Make Scripts Executable**
```bash
chmod +x scripts/upload-images-simple.sh
chmod +x scripts/upload-images-to-blob.sh
```

## 📤 Upload Process

### **What Gets Uploaded**

#### **1. Real Images (from real_image_results.json)**
- **102 figures** with real images from Wikidata/Wikipedia
- **Portraits**: High-quality historical figure portraits
- **Source**: Verified public domain images
- **Format**: JPEG with proper licensing

#### **2. Placeholder Images (Generated)**
- **120 figures** × **4 image types** = **480 placeholder images**
- **Image Types**: portraits, achievements, inventions, artifacts
- **Format**: SVG placeholders with category-specific colors
- **Content**: Figure name, category, and image type

### **Upload Statistics**
- **Total Real Images**: ~102 (varies by availability)
- **Total Placeholder Images**: 480
- **Total Expected Uploads**: ~582 images
- **Storage Required**: ~50-100MB

## 📁 Output Files

### **Generated Files**
1. **`uploaded_real_images.json`** - Real image upload results
2. **`uploaded_placeholder_images.json`** - Placeholder image results
3. **`backend/historical-figures-image-service-blob.js`** - Updated image service

### **Sample Output Structure**
```json
{
  "upload_stats": {
    "total_images": 582,
    "successful_uploads": 580,
    "failed_uploads": 2,
    "skipped_images": 0,
    "errors": []
  },
  "uploaded_images": [
    {
      "figureName": "Archimedes",
      "category": "Technology",
      "epoch": "Ancient",
      "imageType": "portraits",
      "blobName": "Archimedes_portraits_0.jpg",
      "publicUrl": "https://orbgameimages.blob.core.windows.net/historical-figures/Archimedes_portraits_0.jpg?se=2026-08-03T01%3A12%3A12Z&sp=r&sv=2025-07-05&sr=b&sig=...",
      "source": "Wikidata",
      "licensing": "Public Domain"
    }
  ]
}
```

## 🔄 Integration with Backend

### **Updated Image Service**
The upload process creates a new image service file:
- **File**: `backend/historical-figures-image-service-blob.js`
- **Class**: `BlobStorageImageService`
- **Features**: Blob storage URLs with SAS tokens

### **Backend Integration Steps**
1. **Replace the current image service**:
   ```javascript
   // In backend/backend-server.js
   import BlobStorageImageService from './historical-figures-image-service-blob.js';
   ```

2. **Update initialization**:
   ```javascript
   const imageService = new BlobStorageImageService();
   ```

3. **Deploy the updated backend**:
   ```bash
   ./scripts/deploy-full.sh
   ```

## 🧪 Testing

### **Test Blob Storage Access**
```bash
# Test a specific image URL
curl -I "https://orbgameimages.blob.core.windows.net/historical-figures/Archimedes_portraits_0.jpg"

# Test the image service
curl -s "https://api.orbgame.us/api/orb/images/stats" | jq .
```

### **Verify Image Service**
```bash
# Test image retrieval for a story
curl -s "https://api.orbgame.us/api/orb/images/for-story" \
  -G -d "story={\"historicalFigure\":\"Archimedes\"}" \
  -d "category=Technology" \
  -d "epoch=Ancient"
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Connection String Issues**
```bash
# Error: AZURE_STORAGE_CONNECTION_STRING not set
export AZURE_STORAGE_CONNECTION_STRING='your_connection_string_here'
```

#### **2. Storage Account Not Found**
```bash
# Check if storage account exists
az storage account show --name orbgameimages --resource-group orb-game-rg-eastus2
```

#### **3. Container Creation Issues**
```bash
# Create container manually
az storage container create --name historical-figures --account-name orbgameimages --public-access blob
```

#### **4. Permission Issues**
- Ensure you have "Storage Blob Data Contributor" role
- Check if the storage account allows public access
- Verify the connection string is correct

### **Error Recovery**
```bash
# Check upload progress
tail -f upload.log

# Restart upload from specific point
python3 scripts/upload-images-to-blob-simple.py --resume

# Clean up failed uploads
python3 scripts/cleanup-failed-uploads.py
```

## 📈 Performance Optimization

### **Upload Optimization**
- **Batch Size**: 10 images per batch
- **Timeout**: 30 seconds per image
- **Retry Logic**: 3 attempts per failed upload
- **Parallel Processing**: 5 concurrent uploads

### **Storage Optimization**
- **Image Compression**: JPEG quality 85%
- **Metadata**: Minimal metadata for faster access
- **Caching**: CDN integration for global access

## 🔒 Security Considerations

### **Access Control**
- **SAS Tokens**: 1-year expiry for public read access
- **HTTPS Only**: All URLs use HTTPS
- **No Write Access**: Public URLs are read-only

### **Content Security**
- **Licensing**: Only public domain images uploaded
- **Attribution**: Source and licensing information preserved
- **Compliance**: GDPR and copyright compliant

## 📊 Monitoring

### **Upload Monitoring**
```bash
# Monitor upload progress
watch -n 5 'tail -n 20 upload.log'

# Check storage account usage
az storage account show --name orbgameimages --query "usageInBytes"
```

### **Performance Monitoring**
- **Upload Speed**: ~10-50 images per minute
- **Storage Cost**: ~$0.02 per GB per month
- **Bandwidth**: ~$0.087 per GB transferred

## 🎯 Success Criteria

### **Upload Success**
- ✅ All real images uploaded successfully
- ✅ All placeholder images created
- ✅ Image service updated with blob URLs
- ✅ Backend can access blob storage images
- ✅ Images load correctly in the game

### **Verification Steps**
1. **Check upload results**: Review `uploaded_real_images.json`
2. **Test image access**: Verify blob URLs are accessible
3. **Update backend**: Replace image service and deploy
4. **Test game integration**: Verify images load in the game
5. **Monitor performance**: Check image loading speed

## 📞 Support

### **Getting Help**
- **Documentation**: Check this guide and project README
- **Logs**: Review upload logs for specific errors
- **Azure Portal**: Check storage account status
- **GitHub Issues**: Report bugs or request features

### **Useful Commands**
```bash
# Check storage account status
az storage account show --name orbgameimages

# List containers
az storage container list --account-name orbgameimages

# List blobs in container
az storage blob list --container-name historical-figures --account-name orbgameimages

# Get connection string
az storage account show-connection-string --name orbgameimages
```

---

**🎉 Ready to upload all images to Azure Blob Storage!**

Choose your preferred method and follow the steps above. The simple upload method is recommended for most users. 