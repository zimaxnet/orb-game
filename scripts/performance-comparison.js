#!/usr/bin/env node

/**
 * Performance Comparison: MongoDB vs AI Generation
 * Tests the speed difference between loading from database vs generating fresh
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

// HTTP request helper with timing
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const url = new URL(endpoint, BACKEND_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Performance-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response, duration });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, duration });
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

// Test MongoDB story loading performance
async function testMongoDBPerformance() {
  log('\n🗄️ Testing MongoDB Story Loading Performance', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
  const epochs = ['Modern', 'Ancient', 'Medieval', 'Industrial', 'Future'];
  
  let totalDuration = 0;
  let successCount = 0;
  let totalTests = 0;
  let storiesWithTTS = 0;
  
  for (const category of categories) {
    for (const epoch of epochs) {
      totalTests++;
      try {
        log(`Testing: ${category} - ${epoch}`, colors.yellow);
        
        const response = await makeRequest(`/api/orb/positive-news/${category}?count=3&epoch=${epoch}`);
        
        if (response.status === 200) {
          log(`✅ ${category} - ${epoch}: ${response.duration}ms`, colors.green);
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            const ttsStories = response.data.filter(story => story.ttsAudio);
            storiesWithTTS += ttsStories.length;
            log(`   📄 Found ${response.data.length} stories, ${ttsStories.length} with TTS`, colors.cyan);
          }
          
          totalDuration += response.duration;
          successCount++;
        } else {
          log(`❌ ${category} - ${epoch}: HTTP ${response.status}`, colors.red);
        }
      } catch (error) {
        log(`❌ ${category} - ${epoch}: Error - ${error.message}`, colors.red);
      }
    }
  }
  
  const avgDuration = successCount > 0 ? Math.round(totalDuration / successCount) : 0;
  
  log(`\n📊 MongoDB Performance Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests}`, colors.green);
  log(`⏱️ Average Duration: ${avgDuration}ms`, colors.cyan);
  log(`🎵 Stories with TTS: ${storiesWithTTS}`, colors.cyan);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests, avgDuration, storiesWithTTS };
}

// Test AI generation performance
async function testAIGenerationPerformance() {
  log('\n🤖 Testing AI Generation Performance', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art'];
  const epochs = ['Modern', 'Ancient', 'Medieval'];
  const models = ['o4-mini'];
  
  let totalDuration = 0;
  let successCount = 0;
  let totalTests = 0;
  let storiesWithTTS = 0;
  
  for (const category of categories) {
    for (const epoch of epochs) {
      for (const model of models) {
        totalTests++;
        try {
          log(`Testing: ${category} - ${epoch} - ${model}`, colors.yellow);
          
          const response = await makeRequest('/api/chat', 'POST', {
            message: `Generate an exciting positive news story about ${category.toLowerCase()} in the ${epoch} epoch. Make it engaging and inspiring.`,
            useWebSearch: 'auto',
            language: 'en'
          });
          
          if (response.status === 200) {
            log(`✅ ${category} - ${epoch} - ${model}: ${response.duration}ms`, colors.green);
            
            if (response.data.audioData) {
              storiesWithTTS++;
              log(`   🤖 Generated story with TTS audio`, colors.cyan);
            }
            
            totalDuration += response.duration;
            successCount++;
          } else {
            log(`❌ ${category} - ${epoch} - ${model}: HTTP ${response.status}`, colors.red);
          }
        } catch (error) {
          log(`❌ ${category} - ${epoch} - ${model}: Error - ${error.message}`, colors.red);
        }
      }
    }
  }
  
  const avgDuration = successCount > 0 ? Math.round(totalDuration / successCount) : 0;
  
  log(`\n📊 AI Generation Performance Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests}`, colors.green);
  log(`⏱️ Average Duration: ${avgDuration}ms`, colors.cyan);
  log(`🎵 Stories with TTS: ${storiesWithTTS}`, colors.cyan);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests, avgDuration, storiesWithTTS };
}

// Test concurrent loading performance
async function testConcurrentPerformance() {
  log('\n⚡ Testing Concurrent Loading Performance', colors.blue);
  
  const tests = [
    // MongoDB concurrent tests
    {
      name: 'MongoDB - 5 concurrent requests',
      requests: [
        '/api/orb/positive-news/Technology?count=3&epoch=Modern',
        '/api/orb/positive-news/Science?count=3&epoch=Modern',
        '/api/orb/positive-news/Art?count=3&epoch=Modern',
        '/api/orb/positive-news/Nature?count=3&epoch=Modern',
        '/api/orb/positive-news/Sports?count=3&epoch=Modern'
      ],
      method: 'GET'
    },
    // AI generation concurrent tests
    {
      name: 'AI Generation - 3 concurrent requests',
      requests: [
        {
          endpoint: '/api/chat',
          method: 'POST',
          data: {
            message: 'Generate an exciting positive news story about technology in the modern epoch. Make it engaging and inspiring.',
            useWebSearch: 'auto',
            language: 'en'
          }
        },
        {
          endpoint: '/api/chat',
          method: 'POST',
          data: {
            message: 'Generate an exciting positive news story about science in the modern epoch. Make it engaging and inspiring.',
            useWebSearch: 'auto',
            language: 'en'
          }
        },
        {
          endpoint: '/api/chat',
          method: 'POST',
          data: {
            message: 'Generate an exciting positive news story about art in the modern epoch. Make it engaging and inspiring.',
            useWebSearch: 'auto',
            language: 'en'
          }
        }
      ]
    }
  ];
  
  for (const test of tests) {
    try {
      log(`Testing: ${test.name}`, colors.yellow);
      
      const startTime = Date.now();
      
      if (test.method === 'GET') {
        // MongoDB concurrent test
        const promises = test.requests.map(endpoint => makeRequest(endpoint));
        const responses = await Promise.all(promises);
        
        const endTime = Date.now();
        const totalDuration = endTime - startTime;
        
        const successCount = responses.filter(r => r.status === 200).length;
        const avgDuration = Math.round(totalDuration / test.requests.length);
        
        log(`✅ ${test.name}: ${totalDuration}ms total, ${avgDuration}ms average`, colors.green);
        log(`   📊 Success: ${successCount}/${test.requests.length}`, colors.cyan);
      } else {
        // AI generation concurrent test
        const promises = test.requests.map(req => makeRequest(req.endpoint, req.method, req.data));
        const responses = await Promise.all(promises);
        
        const endTime = Date.now();
        const totalDuration = endTime - startTime;
        
        const successCount = responses.filter(r => r.status === 200).length;
        const avgDuration = Math.round(totalDuration / test.requests.length);
        
        log(`✅ ${test.name}: ${totalDuration}ms total, ${avgDuration}ms average`, colors.green);
        log(`   📊 Success: ${successCount}/${test.requests.length}`, colors.cyan);
      }
    } catch (error) {
      log(`❌ ${test.name}: Error - ${error.message}`, colors.red);
    }
  }
}

// Main performance comparison
async function runPerformanceComparison() {
  log('⚡ Performance Comparison: MongoDB vs AI Generation', colors.magenta);
  log('================================================', colors.magenta);
  
  // Test MongoDB performance
  const mongoResults = await testMongoDBPerformance();
  
  // Test AI generation performance
  const aiResults = await testAIGenerationPerformance();
  
  // Test concurrent performance
  await testConcurrentPerformance();
  
  // Comparison summary
  log('\n📊 Performance Comparison Summary:', colors.magenta);
  log('==================================', colors.magenta);
  
  log(`🗄️ MongoDB Average: ${mongoResults.avgDuration}ms`, colors.blue);
  log(`🤖 AI Generation Average: ${aiResults.avgDuration}ms`, colors.blue);
  
  const speedDifference = aiResults.avgDuration - mongoResults.avgDuration;
  const speedRatio = mongoResults.avgDuration > 0 ? (aiResults.avgDuration / mongoResults.avgDuration).toFixed(2) : 'N/A';
  
  if (speedDifference > 0) {
    log(`🚀 MongoDB is ${speedDifference}ms faster than AI generation`, colors.green);
    log(`📈 MongoDB is ${speedRatio}x faster`, colors.green);
  } else {
    log(`🐌 AI generation is ${Math.abs(speedDifference)}ms faster than MongoDB`, colors.yellow);
    log(`📉 AI generation is ${speedRatio}x faster`, colors.yellow);
  }
  
  log(`\n🎵 TTS Coverage:`, colors.cyan);
  log(`   MongoDB: ${mongoResults.storiesWithTTS} stories with TTS`, colors.cyan);
  log(`   AI Generation: ${aiResults.storiesWithTTS} stories with TTS`, colors.cyan);
  
  // Recommendations
  log(`\n💡 Recommendations:`, colors.magenta);
  
  if (mongoResults.avgDuration < aiResults.avgDuration * 0.5) {
    log(`✅ MongoDB is significantly faster - prioritize database stories`, colors.green);
    log(`✅ Use AI generation as fallback only`, colors.green);
  } else if (mongoResults.avgDuration < aiResults.avgDuration) {
    log(`✅ MongoDB is faster - use database stories when available`, colors.green);
    log(`✅ Use AI generation for missing content`, colors.green);
  } else {
    log(`⚠️ AI generation is faster - consider caching more stories`, colors.yellow);
    log(`✅ Use AI generation for fresh content`, colors.green);
  }
  
  return { mongoResults, aiResults, speedDifference, speedRatio };
}

// Run performance comparison
runPerformanceComparison().catch(error => {
  log(`\n💥 Performance test failed: ${error.message}`, colors.red);
  process.exit(1);
}); 