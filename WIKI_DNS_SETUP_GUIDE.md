# 🌐 Wiki DNS Setup Guide

## 📋 Overview

This guide will help you set up DNS for `wiki.orbgame.us` to point to your GitHub Pages wiki documentation.

## 🎯 Current Status

- ✅ **Main Domain**: `orbgame.us` is working (IP: 13.107.253.69)
- ❌ **Wiki Subdomain**: `wiki.orbgame.us` needs DNS configuration
- ✅ **GitHub Pages**: Ready for custom domain configuration

## 🚀 Step-by-Step DNS Setup

### **Step 1: Access Your Domain Provider**

1. **Log into your domain provider** (where orbgame.us is registered)
   - Common providers: GoDaddy, Namecheap, Cloudflare, Google Domains, etc.
   - Navigate to DNS management section

2. **Find DNS Management**
   - Look for "DNS Records", "DNS Settings", or "Zone Editor"
   - You should see existing records for orbgame.us

### **Step 2: Add CNAME Record**

Add this DNS record to your domain provider:

```
Type: CNAME
Name: wiki
Value: zimaxnet.github.io
TTL: 3600 (or default)
```

**Explanation:**
- **Type**: CNAME (Canonical Name) - points one domain to another
- **Name**: `wiki` - creates the subdomain wiki.orbgame.us
- **Value**: `zimaxnet.github.io` - GitHub Pages for your repository
- **TTL**: Time to live (how long DNS servers cache the record)

### **Step 3: Alternative A Records (Optional)**

If you prefer A records instead of CNAME, add these 4 records:

```
Type: A
Name: wiki
Value: 185.199.108.153
TTL: 3600

Type: A
Name: wiki
Value: 185.199.109.153
TTL: 3600

Type: A
Name: wiki
Value: 185.199.110.153
TTL: 3600

Type: A
Name: wiki
Value: 185.199.111.153
TTL: 3600
```

**Note**: CNAME is recommended as it's simpler and automatically handles GitHub Pages IP changes.

## 🔧 GitHub Pages Configuration

### **Step 4: Configure GitHub Pages**

1. **Go to GitHub Repository Settings**
   ```
   https://github.com/zimaxnet/orb-game/settings/pages
   ```

2. **Configure GitHub Pages**
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` (or `main` if using GitHub Actions)
   - **Folder**: `/ (root)`

3. **Add Custom Domain**
   - **Custom domain**: `wiki.orbgame.us`
   - **Enforce HTTPS**: ✓ (check this box)

4. **Save Configuration**
   - Click "Save" to apply changes
   - GitHub will create a CNAME file in your repository

## ⏱️ DNS Propagation

### **Step 5: Wait for Propagation**

DNS changes take time to propagate globally:

- **Local**: 5-15 minutes
- **Global**: 30 minutes to 48 hours
- **Maximum**: Up to 48 hours for full propagation

### **Step 6: Verify DNS Resolution**

Test DNS resolution with these commands:

```bash
# Test DNS resolution
nslookup wiki.orbgame.us

# Test website access
curl -I https://wiki.orbgame.us

# Check SSL certificate
openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us
```

## 🔍 Verification Steps

### **Expected Results**

After successful setup:

1. **DNS Resolution**:
   ```bash
   nslookup wiki.orbgame.us
   # Should return GitHub Pages IP addresses
   ```

2. **Website Access**:
   ```bash
   curl -I https://wiki.orbgame.us
   # Should return HTTP 200 and redirect to HTTPS
   ```

3. **SSL Certificate**:
   ```bash
   openssl s_client -connect wiki.orbgame.us:443 -servername wiki.orbgame.us
   # Should show valid SSL certificate
   ```

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. DNS Not Resolving**
**Symptoms**: `nslookup wiki.orbgame.us` returns NXDOMAIN

**Solutions**:
- Verify CNAME record is added correctly
- Check TTL value (try 300 for faster propagation)
- Wait longer for propagation (up to 48 hours)
- Try different DNS servers: `nslookup wiki.orbgame.us 8.8.8.8`

#### **2. HTTPS Not Working**
**Symptoms**: Site loads on HTTP but not HTTPS

**Solutions**:
- Ensure "Enforce HTTPS" is enabled in GitHub Pages
- Wait for SSL certificate generation (up to 24 hours)
- Check DNS propagation is complete

#### **3. Site Not Loading**
**Symptoms**: DNS resolves but site doesn't load

**Solutions**:
- Verify GitHub Actions deployment succeeded
- Check gh-pages branch exists in repository
- Ensure custom domain is configured in GitHub
- Check GitHub Pages is enabled

#### **4. Wrong Content Loading**
**Symptoms**: Site loads but shows wrong content

**Solutions**:
- Verify GitHub Pages is pointing to correct branch
- Check GitHub Actions workflow is deploying to gh-pages
- Ensure custom domain is set correctly in GitHub

## 📊 Provider-Specific Instructions

### **GoDaddy**
1. Go to "DNS Management"
2. Click "Add" under "Records"
3. Select "CNAME" from dropdown
4. Enter "wiki" in Name field
5. Enter "zimaxnet.github.io" in Value field
6. Set TTL to 3600
7. Click "Save"

### **Namecheap**
1. Go to "Domain List" → "Manage"
2. Click "Advanced DNS"
3. Click "Add New Record"
4. Select "CNAME Record"
5. Enter "wiki" in Host field
6. Enter "zimaxnet.github.io" in Value field
7. Set TTL to Automatic
8. Click "Save Changes"

### **Cloudflare**
1. Go to "DNS" tab
2. Click "Add record"
3. Select "CNAME" type
4. Enter "wiki" in Name field
5. Enter "zimaxnet.github.io" in Target field
6. Set TTL to "Auto"
7. Click "Save"

### **Google Domains**
1. Go to "DNS" section
2. Click "Create new record"
3. Select "CNAME" type
4. Enter "wiki" in Host name
5. Enter "zimaxnet.github.io" in Data
6. Set TTL to 3600
7. Click "Save"

## 🎯 Final Checklist

- [ ] CNAME record added to domain provider
- [ ] GitHub Pages configured with custom domain
- [ ] "Enforce HTTPS" enabled in GitHub
- [ ] DNS propagation completed (tested with nslookup)
- [ ] Website accessible at https://wiki.orbgame.us
- [ ] SSL certificate working
- [ ] Wiki content loading correctly

## 🚀 Success Indicators

When setup is complete, you should see:

1. **DNS Resolution**: `wiki.orbgame.us` resolves to GitHub Pages IPs
2. **HTTPS Access**: Site loads securely at https://wiki.orbgame.us
3. **Wiki Content**: Orb Game documentation displays correctly
4. **SSL Certificate**: Valid certificate for wiki.orbgame.us
5. **Search Functionality**: Wiki search works properly

## 📞 Support

If you encounter issues:

1. **Check DNS Configuration**: Verify CNAME record is correct
2. **Test Propagation**: Use multiple DNS servers to test
3. **GitHub Status**: Check GitHub Pages is enabled and configured
4. **Contact Support**: Reach out to your domain provider if needed

---

**Ready to proceed?** Follow the steps above to configure your DNS and GitHub Pages! 