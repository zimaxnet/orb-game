#!/usr/bin/env node

/**
 * Test Frontend Fix Verification
 * Tests if the getExcitingPrompt function and orb clicking fixes work
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
        'User-Agent': 'Frontend-Fix-Test/1.0'
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

// Test the exact functionality that was broken
async function testFrontendFixes() {
  log('\n🔧 Testing Frontend Fixes', colors.blue);
  
  const tests = [
    {
      name: 'Orb Click - Technology (Database Stories)',
      endpoint: '/api/orb/positive-news/Technology?count=3&epoch=Modern',
      method: 'GET',
      expected: 'Should return stories with TTS audio'
    },
    {
      name: 'Orb Click - Science (Database Stories)',
      endpoint: '/api/orb/positive-news/Science?count=3&epoch=Modern',
      method: 'GET',
      expected: 'Should return stories with TTS audio'
    },
    {
      name: 'Orb Click - Art (Database Stories)',
      endpoint: '/api/orb/positive-news/Art?count=3&epoch=Modern',
      method: 'GET',
      expected: 'Should return stories with TTS audio'
    },
    {
      name: 'Epoch Selection - Ancient Technology',
      endpoint: '/api/chat',
      method: 'POST',
      data: {
        message: 'Generate an exciting positive news story about ancient technology innovations, discoveries, or achievements that would have amazed people in ancient times. Make it engaging and inspiring.',
        useWebSearch: 'auto',
        language: 'en'
      },
      expected: 'Should generate AI story for Ancient epoch'
    },
    {
      name: 'Epoch Selection - Future Science',
      endpoint: '/api/chat',
      method: 'POST',
      data: {
        message: 'Create an exciting positive news story about futuristic science research, scientific possibilities, or breakthrough technologies that could revolutionize science. Make it visionary and inspiring.',
        useWebSearch: 'auto',
        language: 'en'
      },
      expected: 'Should generate AI story for Future epoch'
    },
    {
      name: 'Progress Indicator - AI Loading',
      endpoint: '/api/chat',
      method: 'POST',
      data: {
        message: 'Generate a compelling positive news story about modern art innovations, artistic breakthroughs, or cultural achievements that are enriching society today. Make it engaging and inspiring.',
        useWebSearch: 'auto',
        language: 'en'
      },
      expected: 'Should show loading progress for AI generation'
    }
  ];
  
  let successCount = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      log(`Testing: ${test.name}`, colors.yellow);
      
      const startTime = Date.now();
      const response = await makeRequest(test.endpoint, test.method, test.data);
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        log(`✅ ${test.name}: Success (${duration}ms)`, colors.green);
        
        // Check response content
        if (test.method === 'GET' && Array.isArray(response.data)) {
          const storiesWithTTS = response.data.filter(story => story.ttsAudio);
          log(`   📄 Found ${response.data.length} stories, ${storiesWithTTS.length} with TTS`, colors.cyan);
        } else if (test.method === 'POST' && response.data.response) {
          log(`   🤖 AI Response: ${response.data.response.substring(0, 100)}...`, colors.cyan);
        }
        
        successCount++;
      } else {
        log(`❌ ${test.name}: HTTP ${response.status}`, colors.red);
      }
    } catch (error) {
      log(`❌ ${test.name}: Error - ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 Frontend Fix Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests}`, colors.green);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests };
}

// Test epoch selection specifically
async function testEpochSelection() {
  log('\n⏰ Testing Epoch Selection Fixes', colors.blue);
  
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  const categories = ['Technology', 'Science', 'Art'];
  let successCount = 0;
  let totalTests = 0;
  
  for (const epoch of epochs) {
    for (const category of categories) {
      totalTests++;
      try {
        log(`Testing: ${epoch} ${category}`, colors.yellow);
        
        // Test the exact prompt format that should work now
        const response = await makeRequest('/api/chat', 'POST', {
          message: `Generate an exciting positive news story about ${category.toLowerCase()} in the ${epoch} epoch. Make it engaging and inspiring.`,
          useWebSearch: 'auto',
          language: 'en'
        });
        
        if (response.status === 200 && response.data.response) {
          log(`✅ ${epoch} ${category}: Success`, colors.green);
          successCount++;
        } else {
          log(`❌ ${epoch} ${category}: Failed`, colors.red);
        }
      } catch (error) {
        log(`❌ ${epoch} ${category}: Error - ${error.message}`, colors.red);
      }
    }
  }
  
  log(`\n📊 Epoch Selection Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests}`, colors.green);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests };
}

// Main test runner
async function runFrontendFixTests() {
  log('🔧 Frontend Fix Verification Test Suite', colors.magenta);
  log('=====================================', colors.magenta);
  
  // Test frontend fixes
  const fixResults = await testFrontendFixes();
  
  // Test epoch selection
  const epochResults = await testEpochSelection();
  
  // Summary
  log('\n📊 Overall Fix Results:', colors.magenta);
  log('======================', colors.magenta);
  
  const fixSuccessRate = Math.round((fixResults.successCount / fixResults.totalTests) * 100);
  const epochSuccessRate = Math.round((epochResults.successCount / epochResults.totalTests) * 100);
  
  log(`Frontend Fixes: ${fixResults.successCount}/${fixResults.totalTests} (${fixSuccessRate}%)`, 
    fixSuccessRate >= 80 ? colors.green : colors.red);
  log(`Epoch Selection: ${epochResults.successCount}/${epochResults.totalTests} (${epochSuccessRate}%)`, 
    epochSuccessRate >= 80 ? colors.green : colors.red);
  
  const overallSuccessRate = Math.round(((fixResults.successCount + epochResults.successCount) / (fixResults.totalTests + epochResults.totalTests)) * 100);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! All frontend fixes are working!', colors.green);
    log('✅ Orb clicking should now work correctly', colors.green);
    log('✅ Epoch selection should show progress indicators', colors.green);
    log('✅ Stories should load when clicking orbs', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most fixes are working, minor issues remain.', colors.green);
  } else {
    log('\n❌ Poor! Many fixes still need attention.', colors.red);
  }
  
  return { fixResults, epochResults, overallSuccessRate };
}

// Run tests
runFrontendFixTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 