# 🔐 Google Custom Search API Setup Guide

## 🎯 **Quick Setup for Real Image Fetch**

To fetch real images for the 480 placeholder figures, you need to set up Google Custom Search API credentials.

## 📋 **Step-by-Step Setup**

### **Step 1: Create Google Custom Search Engine**

1. **Go to Google Custom Search**: https://cse.google.com/cse/
2. **Click "Add"** to create a new search engine
3. **Configure Settings**:
   - **Name**: "Orb Game Historical Figures"
   - **Search the entire web**: ✓ (Check this box)
   - **Image search**: ✓ (Check this box)
   - **SafeSearch**: High
   - **Language**: English
4. **Click "Create"**
5. **Copy the Search Engine ID (cx)** - It looks like: `012345678901234567890:abcdefghijk`

### **Step 2: Get Google API Key**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable Custom Search API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API Key
5. **Restrict the API Key** (Optional but recommended):
   - Click on the API Key
   - Under "Application restrictions": Select "HTTP referrers"
   - Under "API restrictions": Select "Custom Search API"

### **Step 3: Store Credentials in Azure Key Vault**

```bash
# Store the API Key
az keyvault secret set --vault-name orb-game-kv-eastus2 --name google-custom-search-api-key --value 'YOUR_API_KEY_HERE'

# Store the Search Engine ID (cx)
az keyvault secret set --vault-name orb-game-kv-eastus2 --name google-custom-search-cx --value 'YOUR_CX_ID_HERE'
```

### **Step 4: Verify Setup**

```bash
# Check if credentials are stored
az keyvault secret show --vault-name orb-game-kv-eastus2 --name google-custom-search-api-key --query value -o tsv
az keyvault secret show --vault-name orb-game-kv-eastus2 --name google-custom-search-cx --query value -o tsv
```

## 🚀 **Run the Real Image Fetch**

Once credentials are set up:

```bash
# Activate virtual environment
source real-images-env/bin/activate

# Run the fetch script
./scripts/fetch-real-images.sh
```

## 📊 **Expected Results**

- **Total Figures**: 120 historical figures
- **Image Types**: Portraits, achievements, inventions, artifacts
- **Expected Images**: 1,500+ real images
- **Processing Time**: 10-15 minutes
- **Success Rate**: 70-80%

## 🔗 **Useful Links**

- **Google Custom Search**: https://cse.google.com/cse/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Custom Search API Documentation**: https://developers.google.com/custom-search/v1/overview

## ⚠️ **Important Notes**

- **Free Tier**: 10,000 queries per day
- **Rate Limit**: 10 queries per second
- **Cost**: Free within limits, $5 per 1,000 queries after
- **Processing**: ~1,920 queries for all figures (within free tier)

## 🎯 **Ready to Start**

Once you have your API Key and Search Engine ID, run the commands above to store them in Key Vault, then execute the fetch script to get real images for all 480 placeholder figures! 