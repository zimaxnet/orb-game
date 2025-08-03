#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testLearnMoreFunctionality() {
  log('\n🔍 Testing Learn More Functionality', colors.blue);
  
  const orbGameFile = path.join(process.cwd(), 'components/OrbGame.jsx');
  const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');
  
  const orbGameCSSFile = path.join(process.cwd(), 'components/OrbGame.css');
  const orbGameCSSContent = fs.readFileSync(orbGameCSSFile, 'utf8');
  
  const checks = [
    {
      name: 'Learn more function exists',
      pattern: /const learnMore = async \(\) =>/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more button exists in UI',
      pattern: /onClick={learnMore}/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more button has proper styling',
      pattern: /\.go-button/,
      shouldExist: true,
      content: orbGameCSSContent
    },
    {
      name: 'Learn more button has hover effects',
      pattern: /\.go-button:hover/,
      shouldExist: true,
      content: orbGameCSSContent
    },
    {
      name: 'Learn more button has disabled state',
      pattern: /\.go-button:disabled/,
      shouldExist: true,
      content: orbGameCSSContent
    },
    {
      name: 'Learn more uses chat API',
      pattern: /fetch\(`\${BACKEND_URL}\/api\/chat`/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more generates new story content',
      pattern: /const learnMoreStory =/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more updates story headline',
      pattern: /More About This Historical Figure/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more has bilingual support',
      pattern: /Más Sobre Esta Figura Histórica/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more has loading state',
      pattern: /isLoading.*\?.*⏳.*🔍/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more uses web search',
      pattern: /useWebSearch: 'auto'/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more handles errors gracefully',
      pattern: /catch \(error\) =>/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more replaces current story',
      pattern: /setNewsStories\(\[learnMoreStory\]\)/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more updates AI source',
      pattern: /setCurrentAISource\(`\${aiModelName} - Learn More`\)/,
      shouldExist: true,
      content: orbGameContent
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  for (const check of checks) {
    const exists = check.pattern.test(check.content);
    const success = exists === check.shouldExist;
    
    if (success) {
      log(`✅ ${check.name}`, colors.green);
      passed++;
    } else {
      log(`❌ ${check.name}`, colors.red);
    }
  }
  
  log(`\n📊 Learn More Functionality Test Results: ${passed}/${total} passed`, colors.blue);
  
  return { passed, total };
}

// Test the actual API endpoint
async function testLearnMoreAPI() {
  log('\n🌐 Testing Learn More API Endpoint', colors.blue);
  
  try {
    const response = await fetch('https://api.orbgame.us/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test message for Learn More functionality',
        useWebSearch: 'auto',
        language: 'en',
        count: 1
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.response) {
        log('✅ Learn More API endpoint is working', colors.green);
        log(`📝 Response length: ${data.response.length} characters`, colors.blue);
        return true;
      } else {
        log('❌ Learn More API returned no response', colors.red);
        return false;
      }
    } else {
      log(`❌ Learn More API returned status: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Learn More API test failed: ${error.message}`, colors.red);
    return false;
  }
}

async function runLearnMoreTests() {
  log('🔍 Learn More Functionality Test Suite', colors.blue);
  log('=====================================\n', colors.blue);
  
  // Test code functionality
  const codeResults = testLearnMoreFunctionality();
  
  // Test API functionality
  const apiResults = await testLearnMoreAPI();
  
  log('\n📊 Summary', colors.blue);
  log(`Code Tests: ${codeResults.passed}/${codeResults.total} passed`, colors.blue);
  log(`API Test: ${apiResults ? '✅ PASS' : '❌ FAIL'}`, colors.blue);
  
  const totalPassed = codeResults.passed + (apiResults ? 1 : 0);
  const totalTests = codeResults.total + 1;
  
  if (totalPassed === totalTests) {
    log('\n🎉 All Learn More functionality tests passed!', colors.green);
  } else {
    log('\n⚠️ Some Learn More functionality tests failed', colors.yellow);
  }
}

runLearnMoreTests().catch(console.error); 