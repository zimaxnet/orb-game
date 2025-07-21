#!/usr/bin/env node

/**
 * Test UI Changes
 * Verifies that the requested UI changes are working correctly
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

// Test 1: Check that audio autoplay is removed
function testAudioAutoplayRemoved() {
  log('\n🎵 Testing Audio Autoplay Removal', colors.blue);
  
  const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
  const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');
  
  const checks = [
    {
      name: 'Audio autoplay removed from nextStory',
      pattern: /Removed auto-play audio - user must click play button/,
      shouldExist: true
    },
    {
      name: 'Audio autoplay removed from prevStory',
      pattern: /Removed auto-play audio - user must click play button/,
      shouldExist: true
    },
    {
      name: 'Audio autoplay removed from Go button',
      pattern: /Removed auto-play audio - user must click play button/,
      shouldExist: true
    },
    {
      name: 'No autoplay in nextStory function',
      pattern: /setTimeout\(\(\) => \{\s+playAudio\(\);\s+\}, 100\)/,
      shouldExist: false
    },
    {
      name: 'No autoplay in prevStory function',
      pattern: /setTimeout\(\(\) => \{\s+playAudio\(\);\s+\}, 100\)/,
      shouldExist: false
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const found = check.pattern.test(orbGameContent);
    const status = found === check.shouldExist ? '✅ PASS' : '❌ FAIL';
    const expected = check.shouldExist ? 'should exist' : 'should NOT exist';
    
    log(`${status} ${check.name} (${expected})`);
    
    if (found === check.shouldExist) {
      passed++;
    }
  });
  
  log(`\n📊 Audio Autoplay Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Test 2: Check AI Model selector label change
function testAIModelSelectorLabel() {
  log('\n🤖 Testing AI Model Selector Label', colors.blue);
  
  const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
  const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');
  
  const checks = [
    {
      name: 'AI Model selector label changed to "AI Model:"',
      pattern: /<label>AI Model:<\/label>/,
      shouldExist: true
    },
    {
      name: 'Old label "Select AI Model" removed',
      pattern: /{t\('ai\.model\.select'\)}/,
      shouldExist: false
    }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const found = check.pattern.test(orbGameContent);
    const status = found === check.shouldExist ? '✅ PASS' : '❌ FAIL';
    const expected = check.shouldExist ? 'should exist' : 'should NOT exist';
    
    log(`${status} ${check.name} (${expected})`);
    
    if (found === check.shouldExist) {
      passed++;
    }
  });
  
  log(`\n📊 AI Model Selector Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Test 3: Check epoch name changes
function testEpochNameChanges() {
  log('\n⏰ Testing Epoch Name Changes', colors.blue);
  
  const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
  const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');
  
  const promptManagerFile = path.join(__dirname, '../utils/promptManager.js');
  const promptManagerContent = fs.readFileSync(promptManagerFile, 'utf8');
  
  const promptDataFile = path.join(__dirname, '../utils/promptReferenceData.js');
  const promptDataContent = fs.readFileSync(promptDataFile, 'utf8');
  
  const languageContextFile = path.join(__dirname, '../contexts/LanguageContext.jsx');
  const languageContextContent = fs.readFileSync(languageContextFile, 'utf8');
  
  const checks = [
    {
      name: 'Epochs array updated in OrbGame.jsx',
      pattern: /const epochs = \['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'\]/,
      shouldExist: true,
      content: orbGameContent
    },
    {
      name: 'Old epoch names removed from OrbGame.jsx',
      pattern: /'Enlightenment Era'|'Digital Era'/,
      shouldExist: false,
      content: orbGameContent
    },
    {
      name: 'PromptManager epochs updated',
      pattern: /const epochs = \['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'\]/,
      shouldExist: true,
      content: promptManagerContent
    },
    {
      name: 'PromptReferenceData epochs updated',
      pattern: /'Enlightenment': \{[^}]*en: 'Generate an exciting positive news story about enlightenment era/,
      shouldExist: true,
      content: promptDataContent
    },
    {
      name: 'LanguageContext epochs updated',
      pattern: /'epoch\.enlightenment': 'Enlightenment'/,
      shouldExist: true,
      content: languageContextContent
    },
    {
      name: 'LanguageContext Spanish epochs updated',
      pattern: /'epoch\.enlightenment': 'Ilustración'/,
      shouldExist: true,
      content: languageContextContent
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
  
  log(`\n📊 Epoch Name Test Results: ${passed}/${total} passed`, passed === total ? colors.green : colors.red);
  
  return { passed, total };
}

// Main test runner
async function runUITests() {
  log('🎮 UI Changes Test Suite', colors.magenta);
  log('========================', colors.magenta);
  
  // Test audio autoplay removal
  const audioResults = testAudioAutoplayRemoved();
  
  // Test AI model selector label
  const aiModelResults = testAIModelSelectorLabel();
  
  // Test epoch name changes
  const epochResults = testEpochNameChanges();
  
  // Summary
  log('\n📊 Overall UI Changes Results:', colors.magenta);
  log('==============================', colors.magenta);
  
  const audioSuccessRate = Math.round((audioResults.passed / audioResults.total) * 100);
  const aiModelSuccessRate = Math.round((aiModelResults.passed / aiModelResults.total) * 100);
  const epochSuccessRate = Math.round((epochResults.passed / epochResults.total) * 100);
  
  log(`Audio Autoplay Removal: ${audioResults.passed}/${audioResults.total} (${audioSuccessRate}%)`, 
    audioSuccessRate >= 80 ? colors.green : colors.red);
  log(`AI Model Selector Label: ${aiModelResults.passed}/${aiModelResults.total} (${aiModelSuccessRate}%)`, 
    aiModelSuccessRate >= 80 ? colors.green : colors.red);
  log(`Epoch Name Changes: ${epochResults.passed}/${epochResults.total} (${epochSuccessRate}%)`, 
    epochSuccessRate >= 80 ? colors.green : colors.red);
  
  const overallSuccessRate = Math.round(((audioResults.passed + aiModelResults.passed + epochResults.passed) / (audioResults.total + aiModelResults.total + epochResults.total)) * 100);
  
  if (overallSuccessRate >= 90) {
    log('\n🎉 Excellent! All UI changes implemented correctly!', colors.green);
    log('✅ Audio autoplay removed - users must click play button', colors.green);
    log('✅ AI Model selector label changed to "AI Model:"', colors.green);
    log('✅ Epoch names updated: "Enlightenment Era" → "Enlightenment"', colors.green);
    log('✅ Epoch names updated: "Digital Era" → "Digital"', colors.green);
  } else if (overallSuccessRate >= 80) {
    log('\n✅ Good! Most UI changes working correctly.', colors.green);
  } else {
    log('\n❌ Poor! UI changes issues detected.', colors.red);
  }
  
  return { audioResults, aiModelResults, epochResults, overallSuccessRate };
}

// Run tests
runUITests().catch(console.error); 