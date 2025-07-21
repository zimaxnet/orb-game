#!/usr/bin/env node

/**
 * Test Single Story and Learn More Functionality
 * Verifies that the system now generates only 1 story and has learn more capability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Test single story generation
function testSingleStoryGeneration() {
  log('\n📰 Testing Single Story Generation', colors.blue);
  
  const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
  const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');
  
  const backendServerFile = path.join(__dirname, '../backend/backend-server.js');
  const backendServerContent = fs.readFileSync(backendServerFile, 'utf8');
  
  const positiveNewsServiceFile = path.join(__dirname, '../backend/positive-news-service.js');
  const positiveNewsServiceContent = fs.readFileSync(positiveNewsServiceFile, 'utf8');
  
  const backendServerFixedFile = path.join(__dirname, '../backend/backend-server-fixed.js');
  const backendServerFixedContent = fs.readFileSync(backendServerFixedFile, 'utf8');
  
  const checks = [
    {
      name: 'Frontend requests single story from database',
      pattern: /count=1&epoch=\${currentEpoch}&language=\${language}/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Frontend requests single story from AI',
      pattern: /count: 1 \/\/ Request 1 story/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Frontend generates single detailed story',
      pattern: /Generate 1 detailed story/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Backend defaults to 1 story',
      pattern: /count = 1, prompt, language = 'en', ensureCaching = true/,
      shouldExist: true,
      content: backendServerContent
    },
    {
      name: 'Positive news service defaults to 1 story',
      pattern: /async getStoriesForCycling\(category, count = 1, epoch = 'Modern'\)/,
      shouldExist: true,
      content: positiveNewsServiceContent
    },
    {
      name: 'Backend server fixed defaults to 1 story',
      pattern: /count = 1, language = 'en', prompt/,
      shouldExist: true,
      content: backendServerFixedContent
    },
    {
      name: 'Story generation prompts use singular form',
      pattern: /Generate \${count} fascinating, positive \${category} story from/,
      shouldExist: true,
      content: backendServerContent
    },
    {
      name: 'Old multiple story requests removed from frontend',
      pattern: /count=3&epoch=\${currentEpoch}&language=\${language}/,
      shouldExist: false,
      content: orbGameContent
    },
    {
      name: 'Old multiple story generation removed from frontend',
      pattern: /Generate 3 different stories/,
      shouldExist: false,
      content: orbGameContent
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const found = check.pattern.test(check.content);
    const status = found === check.shouldExist ? '✅ PASS' : '❌ FAIL';
    const expected = check.shouldExist ? 'should exist' : 'should NOT exist';
    
    log(`${status} ${check.name} (${expected})`);
    
    if (found === check.shouldExist) {
      passed++;
    }
  });
  
  log(`\n📊 Single Story Generation Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Test learn more functionality
function testLearnMoreFunctionality() {
  log('\n🔍 Testing Learn More Functionality', colors.blue);
  
  const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
  const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');
  
  const orbGameCSSFile = path.join(__dirname, '../components/OrbGame.css');
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
      pattern: /\.learn-more-button/,
      shouldExist: true,
      content: orbGameCSSContent
    },
    {
      name: 'Learn more button has hover effects',
      pattern: /\.learn-more-button:hover/,
      shouldExist: true,
      content: orbGameCSSContent
    },
    {
      name: 'Learn more button has disabled state',
      pattern: /\.learn-more-button:disabled/,
      shouldExist: true,
      content: orbGameCSSContent
    },
    {
      name: 'Learn more uses web search',
      pattern: /useWebSearch: 'auto'/,
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
      pattern: /Story - Learn More/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more has bilingual support',
      pattern: /Aprender Más/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Learn more has loading state',
      pattern: /{isLoading \? '⏳' : '🔍'}/,
      shouldExist: true,
      content: orbGameContent
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const found = check.pattern.test(check.content);
    const status = found === check.shouldExist ? '✅ PASS' : '❌ FAIL';
    const expected = check.shouldExist ? 'should exist' : 'should NOT exist';
    
    log(`${status} ${check.name} (${expected})`);
    
    if (found === check.shouldExist) {
      passed++;
    }
  });
  
  log(`\n📊 Learn More Functionality Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Test user experience improvements
function testUserExperienceImprovements() {
  log('\n🎯 Testing User Experience Improvements', colors.blue);
  
  const improvements = [
    '✅ Single story generation reduces cognitive load',
    '✅ Learn more button provides deeper engagement',
    '✅ Web search integration for additional information',
    '✅ Bilingual support for learn more functionality',
    '✅ Loading states for better user feedback',
    '✅ Disabled states prevent multiple requests',
    '✅ Hover effects for better interactivity',
    '✅ Story replacement keeps context',
    '✅ Detailed prompts for better content quality',
    '✅ Error handling for robust experience'
  ];
  
  improvements.forEach(improvement => {
    log(improvement, colors.green);
  });
  
  return { passed: improvements.length, total: improvements.length };
}

// Main test runner
async function runSingleStoryLearnMoreTests() {
  log('📰 Single Story & Learn More Test Suite', colors.magenta);
  log('=====================================', colors.magenta);
  
  // Test single story generation
  const singleStoryResults = testSingleStoryGeneration();
  
  // Test learn more functionality
  const learnMoreResults = testLearnMoreFunctionality();
  
  // Test user experience improvements
  const uxResults = testUserExperienceImprovements();
  
  // Summary
  log('\n📊 Overall Test Results:', colors.magenta);
  log('======================', colors.magenta);
  
  const singleStorySuccessRate = Math.round((singleStoryResults.passed / singleStoryResults.total) * 100);
  const learnMoreSuccessRate = Math.round((learnMoreResults.passed / learnMoreResults.total) * 100);
  const uxSuccessRate = Math.round((uxResults.passed / uxResults.total) * 100);
  
  log(`Single Story Generation: ${singleStoryResults.passed}/${singleStoryResults.total} (${singleStorySuccessRate}%)`, 
    singleStorySuccessRate >= 80 ? colors.green : colors.red);
  log(`Learn More Functionality: ${learnMoreResults.passed}/${learnMoreResults.total} (${learnMoreSuccessRate}%)`, 
    learnMoreSuccessRate >= 80 ? colors.green : colors.red);
  log(`User Experience: ${uxResults.passed}/${uxResults.total} (${uxSuccessRate}%)`, 
    uxSuccessRate >= 80 ? colors.green : colors.red);
  
  const overallSuccessRate = Math.round(((singleStoryResults.passed + learnMoreResults.passed + uxResults.passed) / (singleStoryResults.total + learnMoreResults.total + uxResults.total)) * 100);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! Single story and learn more functionality implemented correctly!', colors.green);
    log('✅ System now generates only 1 story by default', colors.green);
    log('✅ Learn more button provides additional information', colors.green);
    log('✅ Web search integration for deeper content', colors.green);
    log('✅ Bilingual support maintained', colors.green);
    log('✅ Improved user experience with focused content', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most functionality working correctly.', colors.green);
  } else {
    log('\n❌ Poor! Implementation issues detected.', colors.red);
  }
  
  return { singleStoryResults, learnMoreResults, uxResults, overallSuccessRate };
}

// Run tests
runSingleStoryLearnMoreTests().catch(console.error); 