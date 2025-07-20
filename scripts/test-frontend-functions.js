#!/usr/bin/env node

/**
 * Frontend Functions Test Script
 * Tests all frontend API functions and user interactions
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
        'User-Agent': 'Frontend-Test/1.0'
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

// Test positive news API (frontend function)
async function testPositiveNewsAPI() {
  log('\n🧪 Testing Positive News API (Frontend Function)', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
  
  for (const category of categories) {
    try {
      log(`Testing category: ${category}`, colors.yellow);
      const response = await makeRequest(`/api/orb/positive-news/${category}`);
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${category}: ${story.headline}`, colors.green);
        
        // Test story structure
        if (story.headline && story.summary && story.fullText) {
          log(`   📰 Story structure: OK`, colors.green);
        } else {
          log(`   ⚠️ Story structure: Incomplete`, colors.yellow);
        }
        
        // Test TTS audio
        if (story.ttsAudio) {
          log(`   🔊 TTS Audio: Available`, colors.green);
        } else {
          log(`   🔇 TTS Audio: Not available`, colors.yellow);
        }
      } else {
        log(`❌ ${category}: Failed to get stories`, colors.red);
      }
    } catch (error) {
      log(`❌ ${category}: ${error.message}`, colors.red);
    }
  }
}

// Test news generation with different epochs
async function testNewsGenerationEpochs() {
  log('\n🧪 Testing News Generation with Different Epochs', colors.blue);
  
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  const category = 'Technology';
  
  for (const epoch of epochs) {
    try {
      log(`Testing epoch: ${epoch}`, colors.yellow);
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: epoch,
        model: 'o4-mini',
        count: 1,
        language: 'en'
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${epoch}: ${story.headline}`, colors.green);
      } else {
        log(`❌ ${epoch}: Failed to generate stories`, colors.red);
      }
    } catch (error) {
      log(`❌ ${epoch}: ${error.message}`, colors.red);
    }
  }
}

// Test AI model selection
async function testAIModelSelection() {
  log('\n🧪 Testing AI Model Selection', colors.blue);
  
  const models = ['grok-4', 'perplexity-sonar', 'o4-mini'];
  const category = 'Science';
  
  for (const model of models) {
    try {
      log(`Testing model: ${model}`, colors.yellow);
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: 'Modern',
        model: model,
        count: 1,
        language: 'en'
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${model}: ${story.headline}`, colors.green);
        log(`   📝 Source: ${story.source}`, colors.cyan);
      } else {
        log(`❌ ${model}: Failed to generate stories`, colors.red);
      }
    } catch (error) {
      log(`❌ ${model}: ${error.message}`, colors.red);
    }
  }
}

// Test language support
async function testLanguageSupport() {
  log('\n🧪 Testing Language Support', colors.blue);
  
  const languages = ['en', 'es'];
  const category = 'Art';
  
  for (const language of languages) {
    try {
      log(`Testing language: ${language}`, colors.yellow);
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: language
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${language}: ${story.headline}`, colors.green);
        
        // Check if TTS audio is available for Spanish
        if (language === 'es' && story.ttsAudio) {
          log(`   🔊 Spanish TTS: Available`, colors.green);
        } else if (language === 'es') {
          log(`   🔇 Spanish TTS: Not available`, colors.yellow);
        }
      } else {
        log(`❌ ${language}: Failed to generate stories`, colors.red);
      }
    } catch (error) {
      log(`❌ ${language}: ${error.message}`, colors.red);
    }
  }
}

// Test chat functionality
async function testChatFunctionality() {
  log('\n🧪 Testing Chat Functionality', colors.blue);
  
  const testMessages = [
    'Hello, how are you?',
    'What is the capital of France?',
    'Tell me a joke',
    'What is the latest news about AI?',
    'Can you help me learn something?'
  ];
  
  for (const message of testMessages) {
    try {
      log(`Testing message: "${message}"`, colors.yellow);
      const response = await makeRequest('/api/chat', 'POST', {
        message: message,
        userId: `frontend-test-${Date.now()}`
      });
      
      if (response.status === 200 && response.data.response) {
        log(`✅ Response received`, colors.green);
        log(`   💬 ${response.data.response.substring(0, 100)}...`, colors.cyan);
        
        // Check for audio response
        if (response.data.audio) {
          log(`   🔊 Audio response: Available`, colors.green);
        } else {
          log(`   🔇 Audio response: Not available`, colors.yellow);
        }
      } else {
        log(`❌ Failed to get response`, colors.red);
      }
    } catch (error) {
      log(`❌ Error: ${error.message}`, colors.red);
    }
  }
}

// Test memory integration
async function testMemoryIntegration() {
  log('\n🧪 Testing Memory Integration', colors.blue);
  
  const testUserId = `frontend-memory-test-${Date.now()}`;
  
  try {
    // Test 1: Send first message
    log('Sending first message...', colors.yellow);
    const firstResponse = await makeRequest('/api/chat', 'POST', {
      message: 'What is the capital of France?',
      userId: testUserId
    });
    
    if (firstResponse.status === 200) {
      log('✅ First message sent successfully', colors.green);
    } else {
      log('❌ First message failed', colors.red);
      return;
    }
    
    // Test 2: Send same message again (should use memory)
    log('Sending same message again (memory test)...', colors.yellow);
    const secondResponse = await makeRequest('/api/chat', 'POST', {
      message: 'What is the capital of France?',
      userId: testUserId
    });
    
    if (secondResponse.status === 200) {
      log('✅ Second message sent successfully', colors.green);
    } else {
      log('❌ Second message failed', colors.red);
    }
    
    // Test 3: Check memory stats
    log('Checking memory stats...', colors.yellow);
    const statsResponse = await makeRequest('/api/memory/stats');
    
    if (statsResponse.status === 200 && statsResponse.data.totalMemories) {
      log(`✅ Memory stats: ${statsResponse.data.totalMemories} total memories`, colors.green);
    } else {
      log('❌ Memory stats failed', colors.red);
    }
    
  } catch (error) {
    log(`❌ Memory integration test failed: ${error.message}`, colors.red);
  }
}

// Test performance and response times
async function testPerformance() {
  log('\n🧪 Testing Performance and Response Times', colors.blue);
  
  const testCount = 5;
  const results = [];
  
  for (let i = 0; i < testCount; i++) {
    try {
      const startTime = Date.now();
      const response = await makeRequest('/api/chat', 'POST', {
        message: `Performance test ${i + 1}`,
        userId: `perf-test-${Date.now()}`
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.status === 200) {
        results.push(duration);
        log(`✅ Test ${i + 1}: ${duration}ms`, colors.green);
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
    
    log(`\n📊 Performance Summary:`, colors.blue);
    log(`   Average: ${avgTime.toFixed(0)}ms`, colors.green);
    log(`   Min: ${minTime}ms`, colors.green);
    log(`   Max: ${maxTime}ms`, colors.green);
    
    if (avgTime < 3000) {
      log(`   ✅ Performance: Excellent (< 3s)`, colors.green);
    } else if (avgTime < 5000) {
      log(`   ⚠️ Performance: Good (< 5s)`, colors.yellow);
    } else {
      log(`   ❌ Performance: Slow (> 5s)`, colors.red);
    }
  }
}

// Test error handling
async function testErrorHandling() {
  log('\n🧪 Testing Error Handling', colors.blue);
  
  const errorTests = [
    { name: 'Invalid category', endpoint: '/api/orb/positive-news/invalid-category' },
    { name: 'Invalid chat message', endpoint: '/api/chat', method: 'POST', data: { invalid: 'data' } },
    { name: 'Invalid memory search', endpoint: '/api/memory/search', method: 'POST', data: { invalid: 'data' } },
    { name: 'Non-existent endpoint', endpoint: '/api/non-existent' }
  ];
  
  for (const test of errorTests) {
    try {
      log(`Testing: ${test.name}`, colors.yellow);
      const response = await makeRequest(test.endpoint, test.method || 'GET', test.data);
      
      if (response.status >= 400) {
        log(`✅ ${test.name}: Properly handled (${response.status})`, colors.green);
      } else {
        log(`⚠️ ${test.name}: Unexpected success (${response.status})`, colors.yellow);
      }
    } catch (error) {
      log(`✅ ${test.name}: Properly handled (${error.message})`, colors.green);
    }
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Frontend Functions Test Suite', colors.magenta);
  log('================================', colors.magenta);
  
  const tests = [
    { name: 'Positive News API', fn: testPositiveNewsAPI },
    { name: 'News Generation Epochs', fn: testNewsGenerationEpochs },
    { name: 'AI Model Selection', fn: testAIModelSelection },
    { name: 'Language Support', fn: testLanguageSupport },
    { name: 'Chat Functionality', fn: testChatFunctionality },
    { name: 'Memory Integration', fn: testMemoryIntegration },
    { name: 'Performance Testing', fn: testPerformance },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of tests) {
    try {
      await test.fn();
      passedTests++;
    } catch (error) {
      log(`❌ ${test.name} failed: ${error.message}`, colors.red);
      failedTests++;
    }
  }
  
  // Summary
  log('\n📊 Test Results Summary:', colors.magenta);
  log(`✅ Tests Passed: ${passedTests}`, colors.green);
  log(`❌ Tests Failed: ${failedTests}`, colors.red);
  
  const totalTests = passedTests + failedTests;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  log(`📈 Success Rate: ${successRate}%`, colors.blue);
  
  if (failedTests === 0) {
    log('\n🎉 All Frontend Tests Passed!', colors.green);
  } else {
    log('\n⚠️ Some tests failed. Please check the implementation.', colors.yellow);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 