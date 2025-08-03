# 🖼️ Real Images Fetch Guide - Replace 480 Placeholders

## 🎯 **Overview**

This guide helps you replace the 480 placeholder images with real images using Google Custom Search API. The script will fetch real images for all historical figures across 8 categories and 5 epochs.

## 📊 **Current Status**

### **Current Images**
- **Real Images**: 71 historical figure portraits (from Wikidata/Wikipedia)
- **Placeholder Images**: 480 SVG placeholders for all figures
- **Total Images**: 551 images in blob storage

### **Target After Real Image Fetch**
- **Real Images**: 480+ real images from Google Custom Search
- **Total Expected**: 1,000+ real images
- **Coverage**: All 120 historical figures with real images

## 🚀 **Quick Start**

### **Option 1: Automated Script (Recommended)**
```bash
# Run the automated script
./scripts/fetch-real-images.sh
```

### **Option 2: Manual Setup**
```bash
# Install dependencies
pip3 install requests azure-identity azure-keyvault-secrets

# Set environment variables
export GOOGLE_CUSTOM_SEARCH_API_KEY='your-api-key'
export GOOGLE_CUSTOM_SEARCH_CX='your-cx-id'

# Run the Python script
cd scripts
python3 fetch-real-images-for-placeholders.py
```

## 🔐 **Google Custom Search API Setup**

### **1. Create Google Custom Search Engine**
1. Go to: https://cse.google.com/cse/
2. Click "Add" to create a new search engine
3. Configure settings:
   - **Name**: "Orb Game Historical Figures"
   - **Search the entire web**: ✓
   - **Image search**: ✓
   - **SafeSearch**: High
4. Copy the **Search Engine ID (cx)**

### **2. Get API Key**
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Custom Search API"
4. Create credentials (API Key)
5. Copy the **API Key**

### **3. Store Credentials Securely**

#### **Option A: Azure Key Vault (Recommended)**
```bash
# Store API key
az keyvault secret set --vault-name orb-game-kv-eastus2 --name google-custom-search-api-key --value 'your-api-key'

# Store Search Engine ID
az keyvault secret set --vault-name orb-game-kv-eastus2 --name google-custom-search-cx --value 'your-cx-id'
```

#### **Option B: Environment Variables**
```bash
export GOOGLE_CUSTOM_SEARCH_API_KEY='your-api-key'
export GOOGLE_CUSTOM_SEARCH_CX='your-cx-id'
```

## 📋 **What Gets Fetched**

### **Figures Covered**
- **Total Figures**: 120 historical figures
- **Categories**: Technology, Science, Art, Nature, Sports, Music, Space, Innovation
- **Epochs**: Ancient, Medieval, Industrial, Modern, Future

### **Image Types Fetched**
For each figure, the script fetches:
1. **Portraits**: Historical portraits, paintings, busts, statues
2. **Achievements**: Work, contributions, discoveries in their field
3. **Inventions**: Creations, inventions, innovations
4. **Artifacts**: Works, artifacts, creations

### **Search Queries Generated**
- **Portraits**: `"Figure Name" portrait`, `"Figure Name" painting`, etc.
- **Achievements**: `"Figure Name" category achievement`, `"Figure Name" category work`
- **Inventions**: `"Figure Name" invention`, `"Figure Name" creation`
- **Artifacts**: `"Figure Name" artifact`, `"Figure Name" work`

## ⚡ **Performance & Limits**

### **Google CSE API Limits**
- **Queries per day**: 10,000 (free tier)
- **Queries per second**: 10
- **Images per query**: 10 max
- **Rate limiting**: Built into script

### **Expected Results**
- **Total Queries**: ~1,920 (120 figures × 4 image types × 4 queries each)
- **Processing Time**: ~10-15 minutes
- **Success Rate**: ~70-80% (based on historical data)
- **Images Found**: ~1,500+ real images

### **Cost Estimation**
- **Google CSE API**: Free tier (10,000 queries/day)
- **Azure Blob Storage**: ~$0.02 per GB per month
- **Total Cost**: Minimal (within free tiers)

## 📁 **Output Files**

### **Generated Files**
1. **`real_images_for_placeholders_YYYYMMDD_HHMMSS.json`** - Complete results
2. **`fetch_real_images_placeholders.log`** - Detailed execution log

### **Results Structure**
```json
{
  "metadata": {
    "total_figures": 120,
    "processed": 120,
    "successful": 95,
    "failed": 25,
    "processing_time": 900.5,
    "api_key_configured": true
  },
  "summary_stats": {
    "total_images_found": 1520,
    "total_queries": 1920,
    "successful_searches": 1344,
    "failed_searches": 576
  },
  "figures": [
    {
      "figureName": "Archimedes",
      "category": "Technology",
      "epoch": "Ancient",
      "images": {
        "portraits": ["url1", "url2"],
        "achievements": ["url3"],
        "inventions": ["url4"],
        "artifacts": ["url5"]
      },
      "search_stats": {
        "total_queries": 16,
        "successful_searches": 12,
        "failed_searches": 4
      }
    }
  ]
}
```

## 🔄 **Integration with Blob Storage**

### **Next Steps After Fetch**
1. **Upload Real Images**: Use the results to upload real images to blob storage
2. **Update Image Service**: Modify the image service to use real images
3. **Deploy Updates**: Deploy the updated backend with real images
4. **Test Integration**: Verify all images load correctly

### **Upload Script Integration**
```bash
# After fetching real images, upload them to blob storage
python3 scripts/upload-real-images-to-blob.py real_images_for_placeholders_YYYYMMDD_HHMMSS.json
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. API Credentials Not Found**
```bash
# Check if credentials exist in Key Vault
az keyvault secret show --vault-name orb-game-kv-eastus2 --name google-custom-search-api-key
az keyvault secret show --vault-name orb-game-kv-eastus2 --name google-custom-search-cx
```

#### **2. Rate Limiting**
- The script includes built-in rate limiting (10 requests/second)
- If you hit daily limits, wait 24 hours or upgrade to paid tier

#### **3. No Results for Some Figures**
- Some historical figures may have limited image availability
- The script will continue with other figures
- Check the log file for specific failures

#### **4. Network Issues**
- Script includes timeout handling (10 seconds per request)
- Retry failed requests manually if needed

### **Debug Mode**
```bash
# Run with verbose logging
python3 scripts/fetch-real-images-for-placeholders.py --debug
```

## 📈 **Expected Results**

### **Success Metrics**
- **Figures with Images**: 90-95% (108-114 out of 120)
- **Total Images Found**: 1,200-1,600 real images
- **Success Rate**: 70-80% of queries return results
- **Processing Time**: 10-15 minutes

### **Sample Results**
```
🎉 REAL IMAGE FETCH COMPLETE
============================================================
📊 Total Figures: 120
✅ Successful: 108
❌ Failed: 12
⏱️ Processing Time: 892.3 seconds
🖼️ Total Images Found: 1,456
🔍 Total Queries: 1,920
✅ Successful Searches: 1,344
❌ Failed Searches: 576
📈 Success Rate: 70.0%
```

## 🎯 **Benefits**

### **User Experience**
- **Real Images**: Authentic historical portraits and works
- **Visual Richness**: Diverse images for each figure
- **Educational Value**: Real artifacts and achievements
- **Professional Quality**: High-quality historical images

### **Technical Benefits**
- **Reduced Placeholders**: From 480 to ~50 placeholders
- **Better Coverage**: Real images for 90%+ of figures
- **Performance**: Fast blob storage access
- **Scalability**: Easy to add more images later

## 🚀 **Ready to Start**

The script is ready to fetch real images for all 480 placeholder figures. This will significantly enhance the visual experience of the Orb Game with authentic historical images!

**Run the script**: `./scripts/fetch-real-images.sh` 