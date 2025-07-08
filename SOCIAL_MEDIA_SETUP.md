# Social Media Preview Setup for AIMCS

This document explains how to set up and generate social media previews for AIMCS when sharing on platforms like X (Twitter), Facebook, LinkedIn, etc.

## 🎯 What's Been Implemented

### Meta Tags Added to `index.html`
- **Open Graph tags** for Facebook, LinkedIn, and general social sharing
- **Twitter Card tags** optimized for X (Twitter)
- **SEO meta tags** for better search engine visibility
- **Theme color** and canonical URL

### Preview Dimensions
- **Size**: 1200x630 pixels (optimal for all major platforms)
- **Aspect Ratio**: ~1.91:1
- **Format**: PNG with high quality

## 🖼️ Preview Image Generation

### Option 1: Manual Screenshot (Recommended)
1. Open `public/generate-preview.html` in your browser
2. Use browser dev tools to set viewport to exactly 1200x630
3. Take a screenshot of the preview card
4. Save as `public/social-preview.png`

### Option 2: Automated Generation (Advanced)
```bash
# Install puppeteer if not already installed
npm install puppeteer

# Run the generation script
node scripts/generate-social-preview.js
```

### Option 3: Online Tools
Use tools like:
- [Meta Tags](https://metatags.io/)
- [Social Media Preview](https://www.bannerbear.com/tools/social-media-preview/)
- [Canva](https://www.canva.com/) with 1200x630 template

## 📱 Social Media Preview Features

### Content Included
- **AIMCS Logo**: Robot emoji + brand name
- **Tagline**: "AI Multimodal Customer System"
- **Description**: Key value proposition
- **Feature Badges**: 
  - 🧠 Smart Memory
  - 🌐 Web Search
  - 🔊 Text-to-Speech
  - ⚡ GPT-4o-mini
- **Chat Interface Preview**: Shows actual UI elements
- **Website URL**: aimcs.net prominently displayed

### Visual Design
- **Background**: Purple gradient (#667eea to #764ba2)
- **Glass morphism effects**: Backdrop blur and transparency
- **Professional typography**: System fonts for consistency
- **High contrast**: White text on colored background
- **Brand consistency**: Matches main application design

## 🔍 Testing Your Previews

### X (Twitter)
1. Post your URL: `https://aimcs.net`
2. Wait for preview to load
3. Check image, title, and description

### Facebook/LinkedIn
1. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your URL: `https://aimcs.net`
3. Click "Debug" to see preview

### General Testing
Use [OpenGraph.xyz](https://www.opengraph.xyz/) to test multiple platforms at once.

## 📋 Meta Tags Included

```html
<!-- Primary Meta Tags -->
<meta name="title" content="AIMCS - AI Multimodal Customer System" />
<meta name="description" content="Experience the future of AI conversation..." />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://aimcs.net/" />
<meta property="og:title" content="AIMCS - AI Multimodal Customer System" />
<meta property="og:description" content="Experience the future of AI conversation..." />
<meta property="og:image" content="https://aimcs.net/social-preview.png" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://aimcs.net/" />
<meta property="twitter:title" content="AIMCS - AI Multimodal Customer System" />
<meta property="twitter:description" content="Experience the future of AI conversation..." />
<meta property="twitter:image" content="https://aimcs.net/social-preview.png" />
```

## 🚀 Deployment

The meta tags are automatically deployed with your application. The preview image needs to be:

1. **Generated** using one of the methods above
2. **Placed** in the `public/` directory as `social-preview.png`
3. **Deployed** along with your application

### Auto-Deployment
The GitHub Actions workflow will automatically deploy the preview image when you push changes to the main branch.

## 🎨 Customization

### Updating the Preview
1. **Edit** `public/generate-preview.html` to modify design
2. **Regenerate** the image using your preferred method
3. **Replace** `public/social-preview.png`
4. **Deploy** your changes

### Changing Meta Tags
Edit the meta tags in `index.html` to update:
- Descriptions
- Titles
- Twitter handle
- Author information

## 📊 Analytics

Monitor social media engagement through:
- **Azure Application Insights** (already integrated)
- **Google Analytics** (if added)
- **Social platform analytics** (Twitter Analytics, Facebook Insights, etc.)

## ✅ Verification Checklist

- [ ] Meta tags added to `index.html`
- [ ] Social preview image generated (`public/social-preview.png`)
- [ ] Preview tested on X (Twitter)
- [ ] Preview tested on Facebook/LinkedIn
- [ ] Image displays correctly (1200x630)
- [ ] Text is readable and accurate
- [ ] URL points to correct domain
- [ ] Changes deployed to production

## 🆘 Troubleshooting

### Preview Not Showing
1. Clear social media cache using platform debug tools
2. Check image URL is accessible: `https://aimcs.net/social-preview.png`
3. Verify meta tags are in `<head>` section
4. Ensure image is exactly 1200x630 pixels

### Image Quality Issues
1. Use high DPI settings when generating screenshots
2. Ensure PNG format for best quality
3. Check file size (should be under 1MB for best performance)

### Meta Tags Not Working
1. Validate HTML using [W3C Validator](https://validator.w3.org/)
2. Check for duplicate or conflicting meta tags
3. Ensure proper Open Graph format

---

**Created**: January 2025  
**Last Updated**: January 2025  
**Status**: ✅ Active 