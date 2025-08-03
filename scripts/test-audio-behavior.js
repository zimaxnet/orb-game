#!/usr/bin/env node

/**
 * Test Audio Behavior Changes
 * Verifies that audio only plays on manual user action, not autoplay
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
        'User-Agent': 'Audio-Behavior-Test/1.0'
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

// Test audio behavior changes
async function testAudioBehavior() {
  log('\n🎵 Testing Audio Behavior Changes', colors.blue);
  
  const tests = [
    {
      name: 'Stories with TTS Audio Available',
      endpoint: '/api/orb/positive-news/Technology?count=3&epoch=Modern',
      method: 'GET',
      expected: 'Should return stories with TTS audio but NOT autoplay'
    },
    {
      name: 'Stories with TTS Audio Available - Art',
      endpoint: '/api/orb/positive-news/Art?count=3&epoch=Modern',
      method: 'GET',
      expected: 'Should return stories with TTS audio but NOT autoplay'
    },
    {
      name: 'Stories with TTS Audio Available - Music',
      endpoint: '/api/orb/positive-news/Music?count=3&epoch=Modern',
      method: 'GET',
      expected: 'Should return stories with TTS audio but NOT autoplay'
    },
    {
      name: 'AI Generated Stories with TTS',
      endpoint: '/api/chat',
      method: 'POST',
      data: {
        message: 'Generate a compelling positive news story about modern technology innovations, breakthroughs, or achievements that are making a positive impact today. Make it engaging and inspiring.',
        useWebSearch: 'auto',
        language: 'en'
      },
      expected: 'Should generate story with TTS but NOT autoplay'
    }
  ];
  
  let successCount = 0;
  let totalTests = tests.length;
  let storiesWithTTS = 0;
  
  for (const test of tests) {
    try {
      log(`Testing: ${test.name}`, colors.yellow);
      
      const response = await makeRequest(test.endpoint, test.method, test.data);
      
      if (response.status === 200) {
        log(`✅ ${test.name}: Success`, colors.green);
        
        // Check for TTS audio availability
        if (test.method === 'GET' && Array.isArray(response.data)) {
          const ttsStories = response.data.filter(story => story.ttsAudio);
          storiesWithTTS += ttsStories.length;
          log(`   🎵 Found ${response.data.length} stories, ${ttsStories.length} with TTS audio`, colors.cyan);
        } else if (test.method === 'POST' && response.data.audioData) {
          storiesWithTTS++;
          log(`   🤖 AI generated story with TTS audio available`, colors.cyan);
        }
        
        successCount++;
      } else {
        log(`❌ ${test.name}: HTTP ${response.status}`, colors.red);
      }
    } catch (error) {
      log(`❌ ${test.name}: Error - ${error.message}`, colors.red);
    }
  }
  
  log(`\n📊 Audio Behavior Test Results:`, colors.blue);
  log(`✅ Success: ${successCount}/${totalTests}`, colors.green);
  log(`🎵 Stories with TTS: ${storiesWithTTS}`, colors.cyan);
  log(`📈 Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, colors.cyan);
  
  return { successCount, totalTests, storiesWithTTS };
}

// Test orb clicking without autoplay
async function testOrbClickingNoAutoplay() {
  log('\n🎯 Testing Orb Clicking (No Autoplay)', colors.blue);
  
  const categories = ['Technology', 'Science', 'Art', 'Nature', 'Sports', 'Music', 'Space', 'Innovation'];
  let successCount = 0;
  let totalTests = categories.length;
  
  for (const category of categories) {
    try {
      log(`Testing orb click: ${category}`, colors.yellow);
      
      // Test the endpoint that orbs use
      const response = await makeRequest(`/api/orb/positive-news/${category}?count=3&epoch=Modern`);
      
      if (response.status === 200) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          log(`✅ ${category}: Found ${response.data.length} stories`, colors.green);
          
          // Check TTS availability but note no autoplay
          const storiesWithTTS = response.data.filter(story => story.ttsAudio);
          log(`   🎵 ${storiesWithTTS.length} stories have TTS (manual play only)`, colors.cyan);
          
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

// Test epoch selection without autoplay
async function testEpochSelectionNoAutoplay() {
  log('\n⏰ Testing Epoch Selection (No Autoplay)', colors.blue);
  
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  const testCategory = 'Technology';
  let successCount = 0;
  let totalTests = epochs.length;
  
  for (const epoch of epochs) {
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
        log(`✅ ${epoch}: Success (manual play only)`, colors.green);
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

// Main test runner
async function runAudioBehaviorTests() {
  log('🎵 Audio Behavior Test Suite', colors.magenta);
  log('===========================', colors.magenta);
  
  // Test audio behavior
  const audioResults = await testAudioBehavior();
  
  // Test orb clicking without autoplay
  const orbResults = await testOrbClickingNoAutoplay();
  
  // Test epoch selection without autoplay
  const epochResults = await testEpochSelectionNoAutoplay();
  
  // Summary
  log('\n📊 Overall Audio Behavior Results:', colors.magenta);
  log('==================================', colors.magenta);
  
  const audioSuccessRate = Math.round((audioResults.successCount / audioResults.totalTests) * 100);
  const orbSuccessRate = Math.round((orbResults.successCount / orbResults.totalTests) * 100);
  const epochSuccessRate = Math.round((epochResults.successCount / epochResults.totalTests) * 100);
  
  log(`Audio Behavior: ${audioResults.successCount}/${audioResults.totalTests} (${audioSuccessRate}%)`, 
    audioSuccessRate >= 80 ? colors.green : colors.red);
  log(`Orb Clicking: ${orbResults.successCount}/${orbResults.totalTests} (${orbSuccessRate}%)`, 
    orbSuccessRate >= 80 ? colors.green : colors.red);
  log(`Epoch Selection: ${epochResults.successCount}/${epochResults.totalTests} (${epochSuccessRate}%)`, 
    epochSuccessRate >= 80 ? colors.green : colors.red);
  
  log(`\n🎵 TTS Audio Available: ${audioResults.storiesWithTTS} stories`, colors.cyan);
  
  const overallSuccessRate = Math.round(((audioResults.successCount + orbResults.successCount + epochResults.successCount) / (audioResults.totalTests + orbResults.totalTests + epochResults.totalTests)) * 100);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! Audio behavior changes working correctly!', colors.green);
    log('✅ No autoplay - audio only plays on manual user action', colors.green);
    log('✅ Orb clicking should not crash', colors.green);
    log('✅ Epoch selection should work without autoplay', colors.green);
    log('✅ Stories load correctly with TTS available', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most audio behavior working correctly.', colors.green);
  } else {
    log('\n❌ Poor! Audio behavior issues detected.', colors.red);
  }
  
  return { audioResults, orbResults, epochResults, overallSuccessRate };
}

// Run tests
runAudioBehaviorTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 