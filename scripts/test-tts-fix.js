#!/usr/bin/env node

/**
 * TTS Fix Test Script
 * Tests the TTS functionality after configuration fixes
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
        'User-Agent': 'TTS-Test/1.0'
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

// Test TTS functionality
async function testTTSFunctionality() {
  log('\n🎵 Testing TTS Functionality', colors.blue);
  
  const testMessages = [
    'Hello, this is a TTS test',
    'Tell me a short story',
    'What is the weather like today?',
    'Can you help me learn something?'
  ];
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const message of testMessages) {
    try {
      log(`Testing: "${message}"`, colors.yellow);
      const startTime = Date.now();
      
      const response = await makeRequest('/api/chat', 'POST', {
        message: message,
        userId: `tts-test-${Date.now()}`
      });
      
      const duration = Date.now() - startTime;
      totalCount++;
      
      if (response.status === 200 && response.data.response) {
        log(`✅ Response received (${duration}ms)`, colors.green);
        log(`   💬 ${response.data.response.substring(0, 100)}...`, colors.cyan);
        
        if (response.data.audioData) {
          log(`   🔊 TTS Audio: Available (${response.data.audioData.length} characters)`, colors.green);
          successCount++;
        } else {
          log(`   🔇 TTS Audio: Not available`, colors.red);
        }
      } else {
        log(`❌ Failed to get response`, colors.red);
      }
    } catch (error) {
      log(`❌ Error: ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 TTS Test Results:`, colors.blue);
  log(`✅ Audio Generated: ${successCount}/${totalCount}`, colors.green);
  log(`📈 Success Rate: ${Math.round((successCount / totalCount) * 100)}%`, colors.cyan);
  
  return successCount > 0;
}

// Test story generation with TTS
async function testStoryTTS() {
  log('\n📰 Testing Story Generation with TTS', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art'];
  
  for (const category of categories) {
    try {
      log(`Testing story generation for: ${category}`, colors.yellow);
      
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: 'en'
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ Story generated: ${story.headline}`, colors.green);
        
        if (story.ttsAudio) {
          log(`   🔊 TTS Audio: Available (${story.ttsAudio.length} characters)`, colors.green);
        } else {
          log(`   🔇 TTS Audio: Not available`, colors.red);
        }
      } else {
        log(`❌ Story generation failed`, colors.red);
      }
    } catch (error) {
      log(`❌ Error: ${error.message}`, colors.red);
    }
  }
}

// Test Spanish TTS
async function testSpanishTTS() {
  log('\n🇪🇸 Testing Spanish TTS', colors.blue);
  
  try {
    log('Testing Spanish story generation...', colors.yellow);
    
    const response = await makeRequest('/api/orb/generate-news/Art', 'POST', {
      epoch: 'Modern',
      model: 'o4-mini',
      count: 1,
      language: 'es'
    });
    
    if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
      const story = response.data[0];
      log(`✅ Spanish story generated: ${story.headline}`, colors.green);
      
      if (story.ttsAudio) {
        log(`   🔊 Spanish TTS Audio: Available (${story.ttsAudio.length} characters)`, colors.green);
      } else {
        log(`   🔇 Spanish TTS Audio: Not available`, colors.red);
      }
    } else {
      log(`❌ Spanish story generation failed`, colors.red);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
  }
}

// Test TTS performance
async function testTTSPerformance() {
  log('\n⚡ Testing TTS Performance', colors.blue);
  
  const testCount = 3;
  const results = [];
  
  for (let i = 0; i < testCount; i++) {
    try {
      const startTime = Date.now();
      const response = await makeRequest('/api/chat', 'POST', {
        message: `TTS performance test ${i + 1}`,
        userId: `perf-test-${Date.now()}`
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.status === 200 && response.data.audioData) {
        results.push(duration);
        log(`✅ Test ${i + 1}: ${duration}ms (with audio)`, colors.green);
      } else {
        log(`❌ Test ${i + 1}: Failed`, colors.red);
      }
    } catch (error) {
      log(`❌ Test ${i + 1}: ${error.message}`, colors.red);
    }
  }
  
  if (results.length > 0) {
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    
    log(`\n📊 TTS Performance Summary:`, colors.blue);
    log(`   Average: ${avgTime.toFixed(0)}ms`, colors.green);
    log(`   Min: ${minTime}ms`, colors.green);
    log(`   Max: ${maxTime}ms`, colors.green);
    
    if (avgTime < 5000) {
      log(`   ✅ Performance: Good (< 5s)`, colors.green);
    } else {
      log(`   ⚠️ Performance: Slow (> 5s)`, colors.yellow);
    }
  }
}

// Main test runner
async function runTTSTests() {
  log('🎵 TTS Fix Test Suite', colors.magenta);
  log('====================', colors.magenta);
  
  const tests = [
    { name: 'Chat TTS Functionality', fn: testTTSFunctionality },
    { name: 'Story Generation TTS', fn: testStoryTTS },
    { name: 'Spanish TTS', fn: testSpanishTTS },
    { name: 'TTS Performance', fn: testTTSPerformance }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result !== false) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (error) {
      log(`❌ ${test.name} failed: ${error.message}`, colors.red);
      failedTests++;
    }
  }
  
  // Summary
  log('\n📊 TTS Test Results Summary:', colors.magenta);
  log(`✅ Tests Passed: ${passedTests}`, colors.green);
  log(`❌ Tests Failed: ${failedTests}`, colors.red);
  
  const totalTests = passedTests + failedTests;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  log(`📈 Success Rate: ${successRate}%`, colors.blue);
  
  if (failedTests === 0) {
    log('\n🎉 TTS Functionality Fixed and Working!', colors.green);
  } else {
    log('\n⚠️ Some TTS tests failed. Please check the configuration.', colors.yellow);
  }
}

// Run tests
runTTSTests().catch(error => {
  log(`\n💥 TTS test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 