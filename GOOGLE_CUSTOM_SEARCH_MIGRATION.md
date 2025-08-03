# Google Custom Search API Migration Guide

## 🚨 **Bing Image Search API Deprecation**

Microsoft is retiring Bing Search APIs (including Bing Image Search) in Azure Cognitive Services. **No new Bing Search deployments are allowed as of now.** The official retirement date is **August 11, 2025.**

## 🔄 **Migration to Google Custom Search API**

This guide helps you migrate from the deprecated Bing Image Search to Google Custom Search API for your Orb Game project.

---

## 📋 **Prerequisites**

1. **Google Cloud Platform Account**
   - Sign up at https://console.cloud.google.com/
   - Create a new project or use existing one

2. **Google Custom Search API**
   - Enable Custom Search API in Google Cloud Console
   - Create API credentials

3. **Custom Search Engine**
   - Create at https://cse.google.com/
   - Enable "Search the entire web" option

---

## 🚀 **Quick Setup**

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
./scripts/setup-google-custom-search.sh
```

This script will:
- Guide you through the setup process
- Store credentials in Azure Key Vault
- Test the configuration
- Provide troubleshooting steps

### Option 2: Manual Setup

#### Step 1: Enable Google Custom Search API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services > Library**
4. Search for "Custom Search API"
5. Click **Enable**

#### Step 2: Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key (you'll need this later)

#### Step 3: Create Custom Search Engine

1. Go to [Google Custom Search Engine](https://cse.google.com/)
2. Click **Add** to create new search engine
3. Enter any site (e.g., `google.com`)
4. In **Settings**, enable **"Search the entire web"**
5. Copy the **Search Engine ID (CX)**

#### Step 4: Store Credentials in Azure Key Vault

```bash
# Store API key
az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-API-KEY" --value "YOUR_API_KEY"

# Store Search Engine ID
az keyvault secret set --vault-name "orb-game-kv-eastus2" --name "GOOGLE-CSE-CX" --value "YOUR_SEARCH_ENGINE_ID"
```

---

## 🧪 **Testing the Configuration**

```bash
# Test the Google Custom Search API
python3 scripts/google-custom-search.py --test
```

Expected output:
```
🧪 Testing Google Custom Search API configuration...
Testing with query: Albert Einstein portrait
✅ Test successful! Found image: https://example.com/einstein.jpg
```

---

## 📊 **Usage and Limits**

### Google Custom Search API Limits

| Plan | Queries/Day | Cost |
|------|-------------|------|
| Free | 100 | $0 |
| Paid | 1000+ | $5 per 1000 queries |

### Rate Limits
- **Free tier**: 100 queries/day
- **Paid tier**: 10,000 queries/day
- **Rate limit**: 10 queries/second

### Cost Optimization
- Use fallback images for non-critical searches
- Cache results to reduce API calls
- Implement smart query strategies

---

## 🔧 **Implementation Details**

### New Script: `scripts/google-custom-search.py`

This script replaces `scripts/bing-image-search-fixed.py` with:

- **Google Custom Search API integration**
- **Guaranteed fallback images**
- **Azure Key Vault integration**
- **Comprehensive error handling**
- **Rate limiting and cost optimization**

### Key Features

1. **Multi-query Strategy**: Tries multiple search queries for each image type
2. **Fallback System**: Always provides at least one image per type
3. **Rate Limiting**: Respects Google API limits
4. **Error Handling**: Graceful degradation on API failures
5. **Cost Optimization**: Efficient query strategies

### Image Types Supported

- **Portraits**: Historical figure portraits and paintings
- **Achievements**: Notable accomplishments and discoveries
- **Inventions**: Created devices and machines
- **Artifacts**: Historical objects and artifacts

---

## 📈 **Performance Comparison**

| Feature | Bing Image Search | Google Custom Search |
|---------|-------------------|---------------------|
| **Status** | ❌ Deprecated | ✅ Active |
| **Free Tier** | 1000 queries/month | 100 queries/day |
| **Paid Tier** | $3 per 1000 queries | $5 per 1000 queries |
| **Image Quality** | High | High |
| **Search Accuracy** | Good | Excellent |
| **API Reliability** | Deprecated | Stable |

---

## 🔄 **Migration Steps**

### Step 1: Configure Google Custom Search

```bash
# Run automated setup
./scripts/setup-google-custom-search.sh
```

### Step 2: Test Configuration

```bash
# Test the API
python3 scripts/google-custom-search.py --test
```

### Step 3: Run Full Image Search

```bash
# Generate images for all historical figures
python3 scripts/google-custom-search.py
```

### Step 4: Update Backend (if needed)

If you have backend code using Bing Image Search, update it to use Google Custom Search:

```python
# Old Bing implementation
# endpoint = 'https://api.bing.microsoft.com/v7.0/images/search'

# New Google implementation
endpoint = 'https://www.googleapis.com/customsearch/v1'
params = {
    'key': api_key,
    'cx': cx,
    'q': query,
    'searchType': 'image',
    'num': count
}
```

---

## 🛠️ **Troubleshooting**

### Common Issues

#### 1. "API key not valid" error
- Verify your API key is correct
- Check that Custom Search API is enabled
- Ensure you're using the right project

#### 2. "No results found" error
- Verify your Search Engine ID (CX) is correct
- Check that "Search the entire web" is enabled
- Try different search queries

#### 3. "Quota exceeded" error
- Check your daily quota usage
- Consider upgrading to paid tier
- Implement better caching

#### 4. "Rate limit exceeded" error
- Add delays between requests
- Implement exponential backoff
- Use batch processing

### Debug Commands

```bash
# Check Azure Key Vault secrets
az keyvault secret show --name "GOOGLE-CSE-API-KEY" --vault-name "orb-game-kv-eastus2"
az keyvault secret show --name "GOOGLE-CSE-CX" --vault-name "orb-game-kv-eastus2"

# Test with verbose logging
python3 scripts/google-custom-search.py --test --verbose

# Check quota usage
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CX&q=test"
```

---

## 📚 **Additional Resources**

### Documentation
- [Google Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Custom Search Engine Setup](https://cse.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

### Migration Tools
- `scripts/google-custom-search.py` - Main implementation
- `scripts/setup-google-custom-search.sh` - Automated setup
- `GOOGLE_CUSTOM_SEARCH_MIGRATION.md` - This guide

### Support
- [Google Cloud Support](https://cloud.google.com/support)
- [Custom Search API Forum](https://groups.google.com/forum/#!forum/custom-search-api)

---

## ✅ **Migration Checklist**

- [ ] Create Google Cloud Platform account
- [ ] Enable Custom Search API
- [ ] Create API key
- [ ] Create Custom Search Engine
- [ ] Enable "Search the entire web"
- [ ] Store credentials in Azure Key Vault
- [ ] Test configuration
- [ ] Run full image search
- [ ] Update backend code (if needed)
- [ ] Monitor usage and costs
- [ ] Implement caching strategy

---

## 🎯 **Next Steps**

1. **Run the setup script**: `./scripts/setup-google-custom-search.sh`
2. **Test the configuration**: `python3 scripts/google-custom-search.py --test`
3. **Generate images**: `python3 scripts/google-custom-search.py`
4. **Monitor usage**: Check Google Cloud Console for quota usage
5. **Optimize costs**: Implement caching and efficient query strategies

---

**Need help?** The setup script will guide you through the entire process, or you can refer to the troubleshooting section above. 