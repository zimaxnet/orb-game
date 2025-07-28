#!/usr/bin/env node

/**
 * Test AI Historical Figures Generation
 * Directly tests the AI with historical figures to see if it follows instructions
 */

import https from 'https';
import { URL } from 'url';
import fs from 'fs';

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

// Test direct AI generation with historical figures
async function testAIHistoricalFigures() {
  log('\n🎯 Testing AI Historical Figures Generation', colors.blue);
  
  try {
    // Load historical figures
    const seedData = JSON.parse(fs.readFileSync('OrbGameInfluentialPeopleSeeds', 'utf8'));
    
    // Test with Technology Modern
    const category = 'Technology';
    const epoch = 'Modern';
    const figures = seedData[category][epoch];
    
    log(`📚 Testing with ${figures.length} figures from ${category} - ${epoch}:`, colors.yellow);
    figures.forEach((fig, index) => {
      log(`   ${index + 1}. ${fig.name} - ${fig.context}`, colors.cyan);
    });
    
    // Create a very explicit prompt
    const figureNames = figures.map(fig => fig.name).join(', ');
    const explicitPrompt = `Generate a story about ONE of these specific historical figures: ${figureNames}. 
    
IMPORTANT: You MUST choose ONE of these exact names and tell their story. Do NOT create a generic story.

Choose from: ${figureNames}

Tell the story of the chosen historical figure, including:
1. Their exact name
2. Their specific achievements in ${category.toLowerCase()}
3. How their innovations changed the world during ${epoch.toLowerCase()} times
4. Their background and challenges they faced
5. The lasting impact of their contributions

Make it engaging and educational with concrete details about their life and work.`;

    log('\n📝 Sending explicit prompt to AI...', colors.yellow);
    
    const response = await makeRequest('/api/chat', 'POST', {
      message: explicitPrompt,
      useWebSearch: 'auto',
      language: 'en'
    });
    
    if (response.status === 200 && response.data.response) {
      log('✅ AI Response received:', colors.green);
      log(response.data.response.substring(0, 200) + '...', colors.cyan);
      
      // Check if any of the historical figures are mentioned
      const mentionedFigures = figures.filter(fig => 
        response.data.response.toLowerCase().includes(fig.name.toLowerCase())
      );
      
      if (mentionedFigures.length > 0) {
        log(`✅ Found ${mentionedFigures.length} historical figure(s) mentioned:`, colors.green);
        mentionedFigures.forEach(fig => {
          log(`   📚 ${fig.name}`, colors.cyan);
        });
      } else {
        log('❌ No historical figures mentioned in response', colors.red);
      }
    } else {
      log(`❌ AI request failed: ${response.status}`, colors.red);
    }
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
  }
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
        'User-Agent': 'AI-Historical-Test/1.0'
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

// Main test runner
async function runAITests() {
  log('🎯 AI Historical Figures Test', colors.magenta);
  log('============================', colors.magenta);
  
  await testAIHistoricalFigures();
  
  log('\n📊 Test Summary:', colors.magenta);
  log('================', colors.magenta);
  log('🔧 This test shows if the AI is following instructions to mention specific historical figures.', colors.cyan);
}

// Run tests
runAITests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, colors.red);
  process.exit(1);
}); 