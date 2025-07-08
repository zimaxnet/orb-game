#!/usr/bin/env node

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSocialPreview() {
  console.log('🚀 Generating social preview image...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to social media card dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2 // Higher resolution
    });
    
    // Load the HTML file
    const htmlPath = path.join(__dirname, '..', 'aimcs_social_preview.html');
    const htmlContent = await import('fs').then(fs => fs.readFileSync(htmlPath, 'utf8'));
    await page.setContent(htmlContent);
    
    // Wait for any animations to settle
    await new Promise(r => setTimeout(r, 2000));
    
    // Take screenshot
    const outputPath = path.join(__dirname, '..', 'public', 'social-preview.png');
    await page.screenshot({
      path: outputPath,
      type: 'png',
      fullPage: false
    });
    
    console.log('✅ Social preview generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating social preview:', error);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is installed
try {
  await import('puppeteer');
} catch (e) {
  console.log('📦 Installing puppeteer...');
  const { execSync } = await import('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
}

generateSocialPreview(); 