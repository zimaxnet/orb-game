#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateSocialPreview() {
  console.log('🚀 Generating social media preview image...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to exact social media preview dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2 // High DPI for better quality
    });
    
    // Load the HTML file
    const htmlPath = path.resolve(__dirname, '../public/social-preview-generator.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    await page.setContent(htmlContent);
    
    // Wait for fonts and all content to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const outputPath = path.resolve(__dirname, '../public/social-preview.png');
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 630
      }
    });
    
    console.log('✅ Social preview image generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating preview:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
} catch (e) {
  console.log('📦 Installing puppeteer...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
}

generateSocialPreview(); 