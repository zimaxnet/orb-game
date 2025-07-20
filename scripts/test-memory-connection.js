#!/usr/bin/env node

/**
 * Memory Service Connection Test
 * Tests the memory service connection and provides diagnostic information
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
        'User-Agent': 'Memory-Connection-Test/1.0'
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

async function testMemoryEndpoints() {
  log('🧠 Testing Memory Service Connection...', colors.blue);
  
  const endpoints = [
    { name: 'Memory Stats', path: '/api/memory/stats', method: 'GET' },
    { name: 'Memory Profile', path: '/api/memory/profile', method: 'GET' },
    { name: 'Memory Export', path: '/api/memory/export', method: 'GET' },
    { name: 'Memory Search', path: '/api/memory/search', method: 'POST', data: { query: 'test', userId: 'test-user', limit: 5 } }
  ];
  
  for (const endpoint of endpoints) {
    log(`\n🧪 Testing: ${endpoint.name}`, colors.yellow);
    try {
      const response = await makeRequest(endpoint.path, endpoint.method, endpoint.data);
      log(`Status: ${response.status}`, response.status === 200 ? colors.green : colors.red);
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, colors.blue);
      
      if (response.status === 503 && response.data.error === 'Memory service not available') {
        log('❌ Memory service is not available - likely MongoDB connection issue', colors.red);
      } else if (response.status === 200) {
        log('✅ Endpoint working correctly', colors.green);
      }
    } catch (error) {
      log(`❌ Request failed: ${error.message}`, colors.red);
    }
  }
}

async function testChatWithMemory() {
  log('\n🧪 Testing Chat with Memory Integration...', colors.yellow);
  
  const testUserId = `memory-test-${Date.now()}`;
  
  try {
    // First chat request
    log('Sending first chat request...', colors.blue);
    const firstResponse = await makeRequest('/api/chat', 'POST', {
      message: 'What is the capital of France?',
      userId: testUserId
    });
    
    log(`First response status: ${firstResponse.status}`, firstResponse.status === 200 ? colors.green : colors.red);
    
    // Second chat request (should use memory)
    log('Sending second chat request (should use memory)...', colors.blue);
    const secondResponse = await makeRequest('/api/chat', 'POST', {
      message: 'What is the capital of France?',
      userId: testUserId
    });
    
    log(`Second response status: ${secondResponse.status}`, secondResponse.status === 200 ? colors.green : colors.red);
    
    if (firstResponse.status === 200 && secondResponse.status === 200) {
      log('✅ Chat with memory integration working', colors.green);
    } else {
      log('❌ Chat with memory integration failed', colors.red);
    }
  } catch (error) {
    log(`❌ Chat test failed: ${error.message}`, colors.red);
  }
}

async function runDiagnostics() {
  log('🔍 Memory Service Diagnostics', colors.blue);
  log('================================', colors.blue);
  
  await testMemoryEndpoints();
  await testChatWithMemory();
  
  log('\n📋 Diagnostic Summary:', colors.blue);
  log('1. If memory endpoints return 503 "Memory service not available":', colors.yellow);
  log('   - MongoDB connection string (MONGO_URI) may not be set', colors.yellow);
  log('   - MongoDB service may be down or unreachable', colors.yellow);
  log('   - Network connectivity issues', colors.yellow);
  log('2. If chat works but memory endpoints fail:', colors.yellow);
  log('   - Memory service is partially working', colors.yellow);
  log('   - Some memory features may be disabled', colors.yellow);
  log('3. If all endpoints work:', colors.yellow);
  log('   - Memory system is fully operational', colors.yellow);
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(`\n💥 Diagnostic failed: ${error.message}`, colors.red);
  process.exit(1);
}); 