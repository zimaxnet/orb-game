#!/usr/bin/env node

/**
 * Orb Game Memory Function Test Script (Node.js)
 * Tests all memory endpoints and functionality programmatically
 */

import https from 'https';
import { URL } from 'url';

// Configuration
const BACKEND_URL = 'https://api.orbgame.us';
const TEST_USER_ID = `memory-test-user-${Date.now()}`;

// Test results
let testsPassed = 0;
let testsFailed = 0;

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
        'User-Agent': 'Orb-Game-Memory-Test/1.0'
      }
    };

    // console.log(`DEBUG: Making ${method} request to ${url.hostname}:${options.port}${options.path}`);
    // console.log(`DEBUG: Headers:`, options.headers);

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        // console.log(`DEBUG: Response status: ${res.statusCode}`);
        // console.log(`DEBUG: Response headers:`, res.headers);
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
      // console.log(`DEBUG: Request body:`, jsonData);
      req.write(jsonData);
    }
    
    req.end();
  });
}

// Test runner
async function runTest(testName, testFunction) {
  log(`\n🧪 Testing: ${testName}`, colors.yellow);
  
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    if (result.success) {
      log(`✅ PASS: ${testName} (${duration}ms)`, colors.green);
      testsPassed++;
      return result;
    } else {
      log(`❌ FAIL: ${testName}`, colors.red);
      log(`Error: ${result.error}`, colors.red);
      testsFailed++;
      return result;
    }
  } catch (error) {
    log(`❌ FAIL: ${testName}`, colors.red);
    log(`Exception: ${error.message}`, colors.red);
    testsFailed++;
    return { success: false, error: error.message };
  }
}

// Test functions
async function testMemoryStats() {
  const response = await makeRequest('/api/memory/stats');
  return {
    success: response.status === 200 && response.data.totalMemories !== undefined,
    data: response.data
  };
}

async function testMemoryProfile() {
  const response = await makeRequest('/api/memory/profile');
  return {
    success: response.status === 200 && response.data.name !== undefined,
    data: response.data
  };
}

async function testMemoryStorage() {
  const response = await makeRequest('/api/chat', 'POST', {
    message: 'What is the capital of France?',
    userId: TEST_USER_ID
  });
  
  return {
    success: response.status === 200 && response.data.response !== undefined,
    data: response.data
  };
}

async function testMemoryRetrieval() {
  const response = await makeRequest('/api/chat', 'POST', {
    message: 'What is the capital of France?',
    userId: TEST_USER_ID
  });
  
  return {
    success: response.status === 200 && response.data.response !== undefined,
    data: response.data
  };
}

async function testMemorySearch() {
  const response = await makeRequest('/api/memory/search', 'POST', {
    query: 'capital',
    userId: TEST_USER_ID,
    limit: 5
  });
  console.log('DEBUG: /api/memory/search response:', response);
  return {
    success: response.status === 200 && response.data.memories !== undefined,
    data: response.data
  };
}

async function testMemoryExport() {
  const response = await makeRequest('/api/memory/export');
  console.log('DEBUG: /api/memory/export response:', response);
  return {
    success: response.status === 200 && Array.isArray(response.data),
    data: response.data
  };
}

async function testWebSearchMemory() {
  const response = await makeRequest('/api/chat', 'POST', {
    message: 'What is the latest news about AI?',
    userId: TEST_USER_ID
  });
  
  return {
    success: response.status === 200 && response.data.response !== undefined,
    data: response.data
  };
}

async function testMemoryContext() {
  const response = await makeRequest('/api/chat', 'POST', {
    message: 'Tell me more about France',
    userId: TEST_USER_ID
  });
  
  return {
    success: response.status === 200 && response.data.response !== undefined,
    data: response.data
  };
}

async function testErrorHandling() {
  const response = await makeRequest('/api/memory/search', 'POST', {
    invalid: 'data'
  });
  console.log('DEBUG: /api/memory/search error response:', response);
  return {
    success: response.status === 400 && response.data.error !== undefined,
    data: response.data
  };
}

async function testPerformance() {
  const startTime = Date.now();
  const response = await makeRequest('/api/chat', 'POST', {
    message: 'What is the capital of France?',
    userId: TEST_USER_ID
  });
  const duration = Date.now() - startTime;
  
  return {
    success: response.status === 200 && duration < 5000,
    data: { duration, response: response.data }
  };
}

// Main test runner
async function runAllTests() {
  log('🧠 Testing Orb Game Memory Functions...', colors.blue);
  log(`📋 Test Configuration:`, colors.blue);
  log(`  Backend URL: ${BACKEND_URL}`, colors.blue);
  log(`  Test User ID: ${TEST_USER_ID}`, colors.blue);
  
  const tests = [
    { name: 'Memory Stats Endpoint', fn: testMemoryStats },
    { name: 'Memory Profile Endpoint', fn: testMemoryProfile },
    { name: 'Memory Storage via Chat', fn: testMemoryStorage },
    { name: 'Memory Retrieval', fn: testMemoryRetrieval },
    { name: 'Memory Search Endpoint', fn: testMemorySearch },
    { name: 'Memory Export Endpoint', fn: testMemoryExport },
    { name: 'Memory with Web Search', fn: testWebSearchMemory },
    { name: 'Memory Context Injection', fn: testMemoryContext },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Performance Test', fn: testPerformance }
  ];
  
  for (const test of tests) {
    await runTest(test.name, test.fn);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  log(`\n📊 Test Results Summary:`, colors.blue);
  log(`✅ Tests Passed: ${testsPassed}`, colors.green);
  log(`❌ Tests Failed: ${testsFailed}`, colors.red);
  
  const totalTests = testsPassed + testsFailed;
  const successRate = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 0;
  log(`📈 Success Rate: ${successRate}%`, colors.blue);
  
  if (testsFailed === 0) {
    log(`\n🎉 All Memory Tests Passed! Memory system is working correctly.`, colors.green);
    process.exit(0);
  } else {
    log(`\n⚠️ Some Memory Tests Failed. Please check the implementation.`, colors.red);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 