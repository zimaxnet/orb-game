#!/usr/bin/env node

/**
 * Test Frontend Orb Clicking Access
 * Tests if the frontend can properly access the backend APIs
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

// Test the exact endpoints the frontend uses
async function testFrontendEndpoints() {
  log('\n🎯 Testing Frontend API Endpoints', colors.blue);
  
  const tests = [
    {
      name: 'Positive News - Technology (Frontend Orb Click)',
      endpoint: '/api/orb/positive-news/Technology?count=3&epoch=Modern',
      method: 'GET'
    },
    {
      name: 'Positive News - Science (Frontend Orb Click)',
      endpoint: '/api/orb/positive-news/Science?count=3&epoch=Modern',
      method: 'GET'
    },
    {
      name: 'Positive News - Art (Frontend Orb Click)',
      endpoint: '/api/orb/positive-news/Art?count=3&epoch=Modern',
      method: 'GET'
    },
    {
      name: 'Chat API (Frontend AI Generation)',
      endpoint: '/api/chat',
      method: 'POST',
      data: {
        message: 'Generate a positive Technology news story for the Modern epoch',
        useWebSearch: 'auto',
        language: 'en'
      }
    },
    {
      name: 'Generate News - Technology (Frontend Epoch Selection)',
      endpoint: '/api/orb/generate-news/Technology',
      method: 'POST',
      data: {
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'en'
      }
    }
  ];
  
  let successCount = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      log(`Testing: ${test.name}`, colors.yellow);
      
      const response = await makeRequest(test.endpoint, test.method, test.data);
      
      if (response.status === 200) {
        log(`✅ ${test.name}: Success`, colors.green);
        
        // Check response structure
        if (test.method === 'GET' && Array.isArray(response.data)) {
          log(`   📄 Found ${response.data.length} stories`, colors.cyan);
          if (response.data.length > 0) {
            const storiesWithTTS = response.data.filter(story => story.ttsAudio);
            log(`   🎵 ${storiesWithTTS.length} stories have TTS audio`, colors.cyan);
          }
        } else if (test.method === 'POST' && response.data.response) {
          log(`   🤖 AI Response received`, colors.cyan);
        }
        
        successCount++;
      } else {
        log(`❌ ${test.name}: HTTP ${response.status}`, colors.red);
      }
    } catch (error) {
      log(`❌ ${test.name}: Error - ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 Frontend Endpoint Results:`, colors.blue);
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
        'User-Agent': 'Frontend-Orb-Test/1.0'
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

// Test CORS headers (important for frontend)
async function testCORSHeaders() {
  log('\n🌐 Testing CORS Headers', colors.blue);
  
  try {
    const response = await makeRequest('/health');
    
    if (response.status === 200) {
      log('✅ Health endpoint accessible', colors.green);
      return true;
    } else {
      log(`❌ Health endpoint: HTTP ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, colors.red);
    return false;
  }
}

// Main test runner
async function runFrontendTests() {
  log('🎯 Frontend Orb Clicking Test Suite', colors.magenta);
  log('==================================', colors.magenta);
  
  // Test CORS first
  const corsResult = await testCORSHeaders();
  
  // Test frontend endpoints
  const endpointResults = await testFrontendEndpoints();
  
  // Summary
  log('\n📊 Frontend Test Summary:', colors.magenta);
  log('========================', colors.magenta);
  
  if (corsResult) {
    log('✅ CORS: Backend accessible from frontend', colors.green);
  } else {
    log('❌ CORS: Backend not accessible from frontend', colors.red);
  }
  
  const successRate = Math.round((endpointResults.successCount / endpointResults.totalTests) * 100);
  log(`📊 API Endpoints: ${endpointResults.successCount}/${endpointResults.totalTests} (${successRate}%)`, 
    successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red);
  
  if (corsResult && successRate >= 80) {
    log('\n✅ Backend APIs are working correctly!', colors.green);
    log('🔍 The issue might be in the frontend JavaScript or CSS.', colors.yellow);
    log('💡 Check browser console for JavaScript errors.', colors.cyan);
  } else {
    log('\n❌ Backend API issues detected!', colors.red);
    log('🔧 Fix backend issues before testing frontend.', colors.yellow);
  }
  
  return { corsResult, endpointResults };
}

// Run tests
runFrontendTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 