#!/usr/bin/env node

/**
 * Test Orb Clicking and Epoch Selection
 * Tests the specific functionality mentioned by the user
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

// Test orb clicking functionality
async function testOrbClicking() {
  log('\n🎯 Testing Orb Clicking Functionality', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
  let successCount = 0;
  let totalTests = 0;
  
  for (const category of categories) {
    totalTests++;
    try {
      log(`Testing orb click for: ${category}`, colors.yellow);
      
      // Test the positive news endpoint that orbs use
      const response = await makeRequest(`/api/orb/positive-news/${category}?count=3&epoch=Modern`);
      
      if (response.status === 200) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          log(`✅ ${category}: Found ${response.data.length} stories`, colors.green);
          
          // Check if stories have TTS audio
          const storiesWithTTS = response.data.filter(story => story.ttsAudio);
          log(`   🎵 ${storiesWithTTS.length} stories have TTS audio`, colors.cyan);
          
          successCount++;
        } else {
          log(`⚠️ ${category}: No stories found`, colors.yellow);
        }
      } else {
        log(`❌ ${category}: HTTP ${response.status}`, colors.red);
      }
    } catch (error) {
      log(`❌ ${category}: Error - ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 Orb Clicking Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests} categories`, colors.green);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests };
}

// Test epoch selection functionality
async function testEpochSelection() {
  log('\n⏰ Testing Epoch Selection Functionality', colors.blue);
  
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  const testCategory = 'Technology';
  let successCount = 0;
  let totalTests = 0;
  
  for (const epoch of epochs) {
    totalTests++;
    try {
      log(`Testing epoch: ${epoch}`, colors.yellow);
      
      // Test generating news for each epoch
      const response = await makeRequest('/api/orb/generate-news/Technology', 'POST', {
        epoch: epoch,
        model: 'o4-mini',
        count: 1,
        language: 'en'
      });
      
      if (response.status === 200) {
        log(`✅ ${epoch}: Success`, colors.green);
        successCount++;
      } else {
        log(`❌ ${epoch}: HTTP ${response.status}`, colors.red);
      }
    } catch (error) {
      log(`❌ ${epoch}: Error - ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 Epoch Selection Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests} epochs`, colors.green);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests };
}

// Test progress indicators
async function testProgressIndicators() {
  log('\n📊 Testing Progress Indicators', colors.blue);
  
  const tests = [
    {
      name: 'AI Loading Indicator',
      test: async () => {
        try {
          const startTime = Date.now();
          const response = await makeRequest('/api/chat', 'POST', {
            message: 'Test message for loading indicator',
            userId: 'progress-test'
          });
          const duration = Date.now() - startTime;
          
          if (response.status === 200 && duration > 1000) {
            log(`✅ AI Loading: ${duration}ms (should show progress)`, colors.green);
            return true;
          } else {
            log(`⚠️ AI Loading: ${duration}ms (too fast to show progress)`, colors.yellow);
            return false;
          }
        } catch (error) {
          log(`❌ AI Loading: Error - ${error.message}`, colors.red);
          return false;
        }
      }
    },
    {
      name: 'Preload Progress',
      test: async () => {
        try {
          // Test preloading multiple categories
          const categories = ['Technology', 'Science', 'Art'];
          const promises = categories.map(category => 
            makeRequest(`/api/orb/positive-news/${category}?count=2&epoch=Modern`)
          );
          
          const startTime = Date.now();
          const responses = await Promise.all(promises);
          const duration = Date.now() - startTime;
          
          const successCount = responses.filter(r => r.status === 200).length;
          
          if (successCount === categories.length) {
            log(`✅ Preload Progress: ${duration}ms for ${categories.length} categories`, colors.green);
            return true;
          } else {
            log(`⚠️ Preload Progress: ${successCount}/${categories.length} successful`, colors.yellow);
            return false;
          }
        } catch (error) {
          log(`❌ Preload Progress: Error - ${error.message}`, colors.red);
          return false;
        }
      }
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      log(`❌ ${test.name}: Error - ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 Progress Indicator Results:`, colors.blue);
  log(`✅ Passed: ${passedTests}/${totalTests}`, colors.green);
  log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, colors.cyan);
  
  return { passedTests, totalTests };
}

// Main test runner
async function runOrbClickingTests() {
  log('🎯 Orb Clicking and Epoch Selection Test Suite', colors.magenta);
  log('============================================', colors.magenta);
  
  const results = [];
  
  // Test orb clicking
  const orbResults = await testOrbClicking();
  results.push({ name: 'Orb Clicking', ...orbResults });
  
  // Test epoch selection
  const epochResults = await testEpochSelection();
  results.push({ name: 'Epoch Selection', ...epochResults });
  
  // Test progress indicators
  const progressResults = await testProgressIndicators();
  results.push({ name: 'Progress Indicators', ...progressResults });
  
  // Final summary
  log('\n📊 Overall Test Results:', colors.magenta);
  log('======================', colors.magenta);
  
  let totalSuccess = 0;
  let totalTests = 0;
  
  for (const result of results) {
    const successRate = result.totalTests > 0 ? 
      Math.round((result.successCount / result.totalTests) * 100) : 0;
    log(`${result.name}: ${result.successCount}/${result.totalTests} (${successRate}%)`, 
      successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red);
    
    totalSuccess += result.successCount;
    totalTests += result.totalTests;
  }
  
  const overallSuccessRate = totalTests > 0 ? Math.round((totalSuccess / totalTests) * 100) : 0;
  log(`\n📈 Overall Success Rate: ${overallSuccessRate}%`, colors.blue);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! All orb clicking and epoch functionality working!', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most functionality working, minor issues detected.', colors.green);
  } else if (overallSuccessRate >= 60) {
    log('\n⚠️ Fair! Some functionality needs attention.', colors.yellow);
  } else {
    log('\n❌ Poor! Significant issues with orb clicking and epoch selection.', colors.red);
  }
  
  return { totalSuccess, totalTests, overallSuccessRate };
}

// Run tests
runOrbClickingTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 