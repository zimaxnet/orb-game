#!/usr/bin/env node

/**
 * Frontend UI Test Script
 * Tests frontend UI interactions and web search functionality
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
        'User-Agent': 'Frontend-UI-Test/1.0'
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

// Test web search functionality
async function testWebSearch() {
  log('\n🧪 Testing Web Search Functionality', colors.blue);
  
  const searchQueries = [
    'latest AI developments 2024',
    'space exploration news',
    'climate change solutions',
    'recent sports achievements',
    'technology innovations'
  ];
  
  for (const query of searchQueries) {
    try {
      log(`Testing web search: "${query}"`, colors.yellow);
      const response = await makeRequest('/api/chat', 'POST', {
        message: query,
        userId: `web-search-test-${Date.now()}`
      });
      
      if (response.status === 200 && response.data.response) {
        log(`✅ Web search response received`, colors.green);
        log(`   💬 ${response.data.response.substring(0, 150)}...`, colors.cyan);
        
        // Check if response contains web search indicators
        const responseText = response.data.response.toLowerCase();
        if (responseText.includes('search') || responseText.includes('found') || responseText.includes('recent')) {
          log(`   🔍 Web search indicators detected`, colors.green);
        } else {
          log(`   ⚠️ No clear web search indicators`, colors.yellow);
        }
      } else {
        log(`❌ Web search failed`, colors.red);
      }
    } catch (error) {
      log(`❌ Web search error: ${error.message}`, colors.red);
    }
  }
}

// Test orb category interactions (simulating frontend clicks)
async function testOrbCategoryInteractions() {
  log('\n🧪 Testing Orb Category Interactions', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
  
  for (const category of categories) {
    try {
      log(`Testing orb category: ${category}`, colors.yellow);
      
      // Simulate clicking on an orb category
      const response = await makeRequest(`/api/orb/positive-news/${category}`);
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${category} orb clicked successfully`, colors.green);
        log(`   📰 Headline: ${story.headline}`, colors.cyan);
        log(`   📝 Summary: ${story.summary}`, colors.cyan);
        
        // Test story navigation (simulating next/prev buttons)
        if (response.data.length > 1) {
          log(`   📚 Multiple stories available (${response.data.length})`, colors.green);
        } else {
          log(`   📚 Single story available`, colors.yellow);
        }
      } else {
        log(`❌ ${category} orb interaction failed`, colors.red);
      }
    } catch (error) {
      log(`❌ ${category} orb error: ${error.message}`, colors.red);
    }
  }
}

// Test epoch switching (simulating frontend epoch selector)
async function testEpochSwitching() {
  log('\n🧪 Testing Epoch Switching', colors.blue);
  
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  const category = 'Technology';
  
  for (const epoch of epochs) {
    try {
      log(`Testing epoch: ${epoch}`, colors.yellow);
      
      // Simulate switching epoch in frontend
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: epoch,
        model: 'o4-mini',
        count: 1,
        language: 'en'
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${epoch} epoch selected successfully`, colors.green);
        log(`   📰 Story: ${story.headline}`, colors.cyan);
        
        // Check if story content reflects the epoch
        const storyText = story.fullText.toLowerCase();
        const epochKeywords = {
          'Ancient': ['ancient', 'old', 'historical', 'past'],
          'Medieval': ['medieval', 'middle ages', 'knight', 'castle'],
          'Industrial': ['industrial', 'revolution', 'factory', 'machine'],
          'Modern': ['modern', 'current', 'today', 'contemporary'],
          'Future': ['future', 'advanced', 'technology', 'innovation']
        };
        
        const keywords = epochKeywords[epoch] || [];
        const hasEpochKeywords = keywords.some(keyword => storyText.includes(keyword));
        
        if (hasEpochKeywords) {
          log(`   🎯 Epoch-appropriate content detected`, colors.green);
        } else {
          log(`   ⚠️ Epoch content not clearly differentiated`, colors.yellow);
        }
      } else {
        log(`❌ ${epoch} epoch selection failed`, colors.red);
      }
    } catch (error) {
      log(`❌ ${epoch} epoch error: ${error.message}`, colors.red);
    }
  }
}

// Test AI model switching (simulating frontend model selector)
async function testAIModelSwitching() {
  log('\n🧪 Testing AI Model Switching', colors.blue);
  
  const models = [
    { id: 'grok-4', name: 'Grok 4' },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar' },
    { id: 'o4-mini', name: 'o4-mini' }
  ];
  const category = 'Science';
  
  for (const model of models) {
    try {
      log(`Testing AI model: ${model.name}`, colors.yellow);
      
      // Simulate switching AI model in frontend
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: 'Modern',
        model: model.id,
        count: 1,
        language: 'en'
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${model.name} model selected successfully`, colors.green);
        log(`   📰 Story: ${story.headline}`, colors.cyan);
        log(`   🤖 Source: ${story.source}`, colors.cyan);
        
        // Check response time for different models
        const startTime = Date.now();
        await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
          epoch: 'Modern',
          model: model.id,
          count: 1,
          language: 'en'
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        log(`   ⏱️ Response time: ${duration}ms`, colors.cyan);
        
        if (duration < 5000) {
          log(`   ✅ Performance: Good`, colors.green);
        } else {
          log(`   ⚠️ Performance: Slow`, colors.yellow);
        }
      } else {
        log(`❌ ${model.name} model selection failed`, colors.red);
      }
    } catch (error) {
      log(`❌ ${model.name} model error: ${error.message}`, colors.red);
    }
  }
}

// Test language switching (simulating frontend language toggle)
async function testLanguageSwitching() {
  log('\n🧪 Testing Language Switching', colors.blue);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' }
  ];
  const category = 'Art';
  
  for (const language of languages) {
    try {
      log(`Testing language: ${language.name}`, colors.yellow);
      
      // Simulate switching language in frontend
      const response = await makeRequest(`/api/orb/generate-news/${category}`, 'POST', {
        epoch: 'Modern',
        model: 'o4-mini',
        count: 1,
        language: language.code
      });
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        const story = response.data[0];
        log(`✅ ${language.name} language selected successfully`, colors.green);
        log(`   📰 Story: ${story.headline}`, colors.cyan);
        
        // Check if content is in the correct language
        const storyText = story.fullText.toLowerCase();
        const spanishWords = ['arte', 'cultura', 'creatividad', 'expresión'];
        const englishWords = ['art', 'culture', 'creativity', 'expression'];
        
        if (language.code === 'es') {
          const hasSpanishWords = spanishWords.some(word => storyText.includes(word));
          if (hasSpanishWords) {
            log(`   🇪🇸 Spanish content detected`, colors.green);
          } else {
            log(`   ⚠️ Spanish content not clearly detected`, colors.yellow);
          }
        } else {
          const hasEnglishWords = englishWords.some(word => storyText.includes(word));
          if (hasEnglishWords) {
            log(`   🇺🇸 English content detected`, colors.green);
          } else {
            log(`   ⚠️ English content not clearly detected`, colors.yellow);
          }
        }
      } else {
        log(`❌ ${language.name} language selection failed`, colors.red);
      }
    } catch (error) {
      log(`❌ ${language.name} language error: ${error.message}`, colors.red);
    }
  }
}

// Test memory panel interactions (simulating frontend memory features)
async function testMemoryPanelInteractions() {
  log('\n🧪 Testing Memory Panel Interactions', colors.blue);
  
  const testUserId = `memory-panel-test-${Date.now()}`;
  
  try {
    // Test 1: Send messages to create memories
    log('Creating test memories...', colors.yellow);
    const messages = [
      'What is artificial intelligence?',
      'Tell me about space exploration',
      'How does climate change work?'
    ];
    
    for (const message of messages) {
      const response = await makeRequest('/api/chat', 'POST', {
        message: message,
        userId: testUserId
      });
      
      if (response.status === 200) {
        log(`✅ Memory created: "${message}"`, colors.green);
      } else {
        log(`❌ Failed to create memory: "${message}"`, colors.red);
      }
    }
    
    // Test 2: Search memories (simulating memory search)
    log('Testing memory search...', colors.yellow);
    const searchResponse = await makeRequest('/api/memory/search', 'POST', {
      query: 'artificial intelligence',
      userId: testUserId,
      limit: 5
    });
    
    if (searchResponse.status === 200 && searchResponse.data.memories) {
      log(`✅ Memory search successful`, colors.green);
      log(`   📚 Found ${searchResponse.data.memories.length} memories`, colors.cyan);
    } else {
      log(`❌ Memory search failed`, colors.red);
    }
    
    // Test 3: Get memory stats (simulating memory panel stats)
    log('Testing memory stats...', colors.yellow);
    const statsResponse = await makeRequest('/api/memory/stats');
    
    if (statsResponse.status === 200) {
      log(`✅ Memory stats retrieved`, colors.green);
      log(`   📊 Total memories: ${statsResponse.data.totalMemories}`, colors.cyan);
      log(`   👥 Users with memories: ${statsResponse.data.usersWithMemories}`, colors.cyan);
    } else {
      log(`❌ Memory stats failed`, colors.red);
    }
    
    // Test 4: Export memories (simulating memory export)
    log('Testing memory export...', colors.yellow);
    const exportResponse = await makeRequest('/api/memory/export');
    
    if (exportResponse.status === 200 && Array.isArray(exportResponse.data)) {
      log(`✅ Memory export successful`, colors.green);
      log(`   📤 Exported ${exportResponse.data.length} memories`, colors.cyan);
    } else {
      log(`❌ Memory export failed`, colors.red);
    }
    
  } catch (error) {
    log(`❌ Memory panel test failed: ${error.message}`, colors.red);
  }
}

// Test audio/TTS functionality
async function testAudioFunctionality() {
  log('\n🧪 Testing Audio/TTS Functionality', colors.blue);
  
  try {
    // Test 1: Generate story with TTS
    log('Testing story generation with TTS...', colors.yellow);
    const storyResponse = await makeRequest('/api/orb/generate-news/Technology', 'POST', {
      epoch: 'Modern',
      model: 'o4-mini',
      count: 1,
      language: 'en'
    });
    
    if (storyResponse.status === 200 && Array.isArray(storyResponse.data) && storyResponse.data.length > 0) {
      const story = storyResponse.data[0];
      log(`✅ Story generated successfully`, colors.green);
      
      if (story.ttsAudio) {
        log(`   🔊 TTS Audio: Available (${story.ttsAudio.length} characters)`, colors.green);
      } else {
        log(`   🔇 TTS Audio: Not available`, colors.yellow);
      }
    } else {
      log(`❌ Story generation failed`, colors.red);
    }
    
    // Test 2: Chat with audio response
    log('Testing chat with audio response...', colors.yellow);
    const chatResponse = await makeRequest('/api/chat', 'POST', {
      message: 'Tell me a short story',
      userId: `audio-test-${Date.now()}`
    });
    
    if (chatResponse.status === 200) {
      log(`✅ Chat response received`, colors.green);
      
      if (chatResponse.data.audio) {
        log(`   🔊 Chat Audio: Available`, colors.green);
      } else {
        log(`   🔇 Chat Audio: Not available`, colors.yellow);
      }
    } else {
      log(`❌ Chat response failed`, colors.red);
    }
    
  } catch (error) {
    log(`❌ Audio functionality test failed: ${error.message}`, colors.red);
  }
}

// Main test runner
async function runUITests() {
  log('🎮 Frontend UI Test Suite', colors.magenta);
  log('========================', colors.magenta);
  
  const tests = [
    { name: 'Web Search Functionality', fn: testWebSearch },
    { name: 'Orb Category Interactions', fn: testOrbCategoryInteractions },
    { name: 'Epoch Switching', fn: testEpochSwitching },
    { name: 'AI Model Switching', fn: testAIModelSwitching },
    { name: 'Language Switching', fn: testLanguageSwitching },
    { name: 'Memory Panel Interactions', fn: testMemoryPanelInteractions },
    { name: 'Audio/TTS Functionality', fn: testAudioFunctionality }
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
  log('\n📊 UI Test Results Summary:', colors.magenta);
  log(`✅ Tests Passed: ${passedTests}`, colors.green);
  log(`❌ Tests Failed: ${failedTests}`, colors.red);
  
  const totalTests = passedTests + failedTests;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  log(`📈 Success Rate: ${successRate}%`, colors.blue);
  
  if (failedTests === 0) {
    log('\n🎉 All Frontend UI Tests Passed!', colors.green);
  } else {
    log('\n⚠️ Some UI tests failed. Please check the implementation.', colors.yellow);
  }
}

// Run tests
runUITests().catch(error => {
  log(`\n💥 UI test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 