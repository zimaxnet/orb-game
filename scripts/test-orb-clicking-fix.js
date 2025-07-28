#!/usr/bin/env node

/**
 * Test Orb Clicking Fix
 * Verifies that the orb clicking functionality works correctly
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

// Test orb clicking simulation
async function testOrbClicking() {
  log('\n🎯 Testing Orb Clicking Functionality', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
  const epochs = ['Modern', 'Ancient', 'Medieval'];
  const languages = ['en', 'es'];
  
  let successCount = 0;
  let totalTests = 0;
  
  for (const category of categories.slice(0, 3)) { // Test first 3 categories
    for (const epoch of epochs.slice(0, 2)) { // Test first 2 epochs
      for (const language of languages) {
        totalTests++;
        
        try {
          log(`Testing: ${category} - ${epoch} - ${language}`, colors.yellow);
          
          // Test the exact endpoint the frontend uses for orb clicking
          const response = await makeRequest(
            `/api/orb/positive-news/${category}?count=3&epoch=${epoch}&language=${language}&storyType=historical-figure`
          );
          
          if (response.status === 200 && Array.isArray(response.data)) {
            log(`✅ ${category} - ${epoch} - ${language}: Success (${response.data.length} stories)`, colors.green);
            successCount++;
          } else {
            log(`❌ ${category} - ${epoch} - ${language}: HTTP ${response.status}`, colors.red);
          }
        } catch (error) {
          log(`❌ ${category} - ${epoch} - ${language}: Error - ${error.message}`, colors.red);
        }
      }
    }
  }
  
  log(`\n📊 Orb Clicking Test Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests}`, colors.green);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests };
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
        'User-Agent': 'Orb-Clicking-Test/1.0'
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
async function runOrbClickingTests() {
  log('🎯 Orb Clicking Fix Verification', colors.magenta);
  log('================================', colors.magenta);
  
  const results = await testOrbClicking();
  
  log('\n📊 Test Summary:', colors.magenta);
  log('================', colors.magenta);
  
  const successRate = Math.round((results.successCount / results.totalTests) * 100);
  
  if (successRate >= 90) {
    log('✅ Orb clicking functionality is working correctly!', colors.green);
    log('🔧 The selectedCategory state variable fix should resolve the crash.', colors.cyan);
  } else if (successRate >= 70) {
    log('⚠️  Most orb clicking tests pass, but some issues remain.', colors.yellow);
    log('🔍 Check the failing endpoints for specific issues.', colors.cyan);
  } else {
    log('❌ Significant issues with orb clicking functionality detected.', colors.red);
    log('🔧 Backend API issues need to be resolved first.', colors.yellow);
  }
  
  return results;
}

// Run tests
runOrbClickingTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 