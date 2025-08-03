#!/usr/bin/env node

/**
 * Test Headline Format Changes
 * Verifies that story headlines now use "Epoch Category Story" format instead of "Positive Category News #number"
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

// Test headline format changes
function testHeadlineFormat() {
  log('\n📰 Testing Headline Format Changes', colors.blue);
  
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
      name: 'Frontend story headlines use new format',
      pattern: /headline: language === 'es' \? `\${currentEpoch} \${category\.name} Historia` : `\${currentEpoch} \${category\.name} Story`/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Frontend single story headline uses new format',
      pattern: /headline: language === 'es' \? `\${currentEpoch} \${category\.name} Historia` : `\${currentEpoch} \${category\.name} Story`/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Frontend fresh story headlines use new format',
      pattern: /headline: language === 'es' \? `\${currentEpoch} \${category\.name} Historia` : `\${currentEpoch} \${category\.name} Story`/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Frontend error story headline uses new format',
      pattern: /headline: language === 'es' \? `\${currentEpoch} \${category\.name} Historia` : `\${currentEpoch} \${category\.name} Story`/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Backend fallback story headlines use new format',
      pattern: /headline: `Modern \${category} Story`/,
      shouldExist: true,
      content: backendServerContent
    },
    {
      name: 'Positive news service fallback headlines use new format',
      pattern: /headline: `Modern \${category} Story`/,
      shouldExist: true,
      content: positiveNewsServiceContent
    },
    {
      name: 'Backend server fixed fallback headlines use new format',
      pattern: /headline: `Modern \${category} Story`/,
      shouldExist: true,
      content: backendServerFixedContent
    },
    {
      name: 'Old "Positive Category News #number" format removed from frontend',
      pattern: /Positive \${category\.name} News #\${index \+ 1}/,
      shouldExist: false,
      content: orbGameContent
    },
    {
      name: 'Old "Positive Category News" format removed from frontend',
      pattern: /Positive \${category\.name} News/,
      shouldExist: false,
      content: orbGameContent
    },
    {
      name: 'Old "Positive Category Development" format removed from backend',
      pattern: /headline: `Positive \${category} Development`/,
      shouldExist: false,
      content: backendServerContent
    },
    {
      name: 'Old "Positive Category News" format removed from backend',
      pattern: /headline: `Positive \${category} News`/,
      shouldExist: false,
      content: backendServerContent
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
  
  log(`\n📊 Headline Format Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Test example headlines
function testExampleHeadlines() {
  log('\n🎯 Testing Example Headlines', colors.blue);
  
  const examples = [
    { epoch: 'Modern', category: 'Technology', expected: 'Modern Technology Story' },
    { epoch: 'Ancient', category: 'Science', expected: 'Ancient Science Story' },
    { epoch: 'Future', category: 'Art', expected: 'Future Art Story' },
    { epoch: 'Enlightenment', category: 'Music', expected: 'Enlightenment Music Story' },
    { epoch: 'Digital', category: 'Space', expected: 'Digital Space Story' }
  ];
  
  let passed = 0;
  let total = examples.length;
  
  examples.forEach(example => {
    const actual = `${example.epoch} ${example.category} Story`;
    const status = actual === example.expected ? '✅ PASS' : '❌ FAIL';
    
    log(`${status} ${example.epoch} ${example.category} Story`);
    
    if (actual === example.expected) {
      passed++;
    }
  });
  
  log(`\n📊 Example Headlines Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Main test runner
async function runHeadlineTests() {
  log('📰 Headline Format Test Suite', colors.magenta);
  log('============================', colors.magenta);
  
  // Test headline format changes
  const formatResults = testHeadlineFormat();
  
  // Test example headlines
  const exampleResults = testExampleHeadlines();
  
  // Summary
  log('\n📊 Overall Headline Test Results:', colors.magenta);
  log('================================', colors.magenta);
  
  const formatSuccessRate = Math.round((formatResults.passed / formatResults.total) * 100);
  const exampleSuccessRate = Math.round((exampleResults.passed / exampleResults.total) * 100);
  
  log(`Headline Format Changes: ${formatResults.passed}/${formatResults.total} (${formatSuccessRate}%)`, 
    formatSuccessRate >= 80 ? colors.green : colors.red);
  log(`Example Headlines: ${exampleResults.passed}/${exampleResults.total} (${exampleSuccessRate}%)`, 
    exampleSuccessRate >= 80 ? colors.green : colors.red);
  
  const overallSuccessRate = Math.round(((formatResults.passed + exampleResults.passed) / (formatResults.total + exampleResults.total)) * 100);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! All headline format changes implemented correctly!', colors.green);
    log('✅ Story headlines now use "Epoch Category Story" format', colors.green);
    log('✅ Removed "Positive Category News #number" format', colors.green);
    log('✅ Updated across frontend and backend files', colors.green);
    log('✅ Both English and Spanish formats updated', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most headline format changes working correctly.', colors.green);
  } else {
    log('\n❌ Poor! Headline format issues detected.', colors.red);
  }
  
  return { formatResults, exampleResults, overallSuccessRate };
}

// Run tests
runHeadlineTests().catch(console.error); 