#!/usr/bin/env node

/**
 * Test Backend Historical Figures Loading
 * Checks if the backend is loading historical figures correctly
 */

import https from 'https';
import { URL } from 'url';

const BACKEND_URL = 'https://api.orbgame.us';

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// Test backend historical figures loading
async function testBackendHistoricalFigures() {
  log('\n🎯 Testing Backend Historical Figures Loading', colors.blue);
  
  // Test with a very explicit request that should force historical figures
  const testRequest = {
    epoch: 'Modern',
    model: 'o4-mini',
    count: 1,
    language: 'en',
    storyType: 'historical-figure'
  };
  
  try {
    log('📝 Sending test request to backend...', colors.yellow);
    
    const response = await makeRequest('/api/orb/generate-news/Technology', 'POST', testRequest);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log('✅ Backend response received:', colors.green);
      
      const story = response.data[0];
      log(`📰 Headline: ${story.headline}`, colors.cyan);
      log(`📚 Historical Figure: ${story.historicalFigure || 'NOT SET'}`, colors.cyan);
      log(`📖 Full Text: ${story.fullText.substring(0, 100)}...`, colors.cyan);
      
      // Check if any historical figures are mentioned
      const historicalFigures = ['Tim Berners-Lee', 'Steve Jobs', 'Hedy Lamarr'];
      const mentionedFigures = historicalFigures.filter(fig => 
        story.headline.toLowerCase().includes(fig.toLowerCase()) ||
        story.fullText.toLowerCase().includes(fig.toLowerCase())
      );
      
      if (mentionedFigures.length > 0) {
        log(`✅ Found ${mentionedFigures.length} historical figure(s) mentioned:`, colors.green);
        mentionedFigures.forEach(fig => {
          log(`   📚 ${fig}`, colors.cyan);
        });
      } else {
        log('❌ No historical figures mentioned in response', colors.red);
        log('🔧 This suggests the backend is not using the historical figures prompt', colors.yellow);
      }
    } else {
      log(`❌ Backend request failed: ${response.status}`, colors.red);
    }
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
  }
}

// HTTP request helper
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BACKEND_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Backend-Historical-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      const jsonData = JSON.stringify(data);
      req.write(jsonData);
    }
    
    req.end();
  });
}

// Main test runner
async function runBackendTests() {
  log('🎯 Backend Historical Figures Test', colors.magenta);
  log('================================', colors.magenta);
  
  await testBackendHistoricalFigures();
  
  log('\n📊 Test Summary:', colors.magenta);
  log('================', colors.magenta);
  log('🔧 This test shows if the backend is properly loading and using historical figures.', colors.cyan);
}

// Run tests
runBackendTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 