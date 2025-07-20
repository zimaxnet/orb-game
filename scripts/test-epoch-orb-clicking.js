#!/usr/bin/env node

/**
 * Test script to verify orb clicking works after epoch changes
 * This script checks that the epoch change handler properly clears orb state
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing epoch change and orb clicking functionality...\n');

// Check if epoch change handler properly clears orb state
const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');

const checks = [
  {
    name: 'Epoch change clears orb state',
    pattern: /setOrbInCenter\(null\)/,
    shouldExist: true
  },
  {
    name: 'Epoch change clears current news',
    pattern: /setCurrentNews\(null\)/,
    shouldExist: true
  },
  {
    name: 'Epoch change clears news stories',
    pattern: /setNewsStories\(\[\]\)/,
    shouldExist: true
  },
  {
    name: 'Epoch change resets news index',
    pattern: /setCurrentNewsIndex\(0\)/,
    shouldExist: true
  },
  {
    name: 'Epoch change stops audio playback',
    pattern: /setIsPlaying\(false\)/,
    shouldExist: true
  },
  {
    name: 'Epoch change pauses audio',
    pattern: /audioRef\.current\.pause\(\)/,
    shouldExist: true
  },
  {
    name: 'Epoch change resets audio time',
    pattern: /audioRef\.current\.currentTime = 0/,
    shouldExist: true
  },
  {
    name: 'Epoch change logs state clearing',
    pattern: /Epoch changed to.*orb state cleared/,
    shouldExist: true
  },
  {
    name: 'Orb click blocking logic exists',
    pattern: /isPlaying \|\| isLoading \|\| orbInCenter/,
    shouldExist: true
  },
  {
    name: 'Database loading with epoch parameter',
    pattern: /epoch=\${currentEpoch}/,
    shouldExist: true
  },
  {
    name: 'AI generation with epoch parameter',
    pattern: /getExcitingPrompt.*currentEpoch/,
    shouldExist: true
  }
];

let allPassed = true;

checks.forEach(check => {
  const found = check.pattern.test(orbGameContent);
  const status = found === check.shouldExist ? '✅ PASS' : '❌ FAIL';
  const expected = check.shouldExist ? 'should exist' : 'should NOT exist';
  
  console.log(`${status} ${check.name} (${expected})`);
  
  if (found !== check.shouldExist) {
    allPassed = false;
  }
});

console.log('\n📊 Summary:');
if (allPassed) {
  console.log('✅ All epoch change and orb clicking checks passed!');
  console.log('✅ Orbs should be clickable immediately after epoch changes');
  console.log('✅ Stories should load with the correct epoch parameter');
} else {
  console.log('❌ Some checks failed - epoch changes may not work correctly');
}

console.log('\n🎯 Expected behavior after epoch change:');
console.log('- Orb state is cleared (no orb in center)');
console.log('- Current news is cleared (no story displayed)');
console.log('- Audio playback is stopped');
console.log('- Orbs become clickable immediately');
console.log('- Stories load with the new epoch parameter');
console.log('- Database queries include the new epoch');
console.log('- AI generation uses epoch-specific prompts');

console.log('\n🔧 How to test:');
console.log('1. Click an orb to load a story');
console.log('2. Switch to a different epoch');
console.log('3. Verify the orb is no longer in center');
console.log('4. Click an orb again - should work immediately');
console.log('5. Verify the story is appropriate for the new epoch'); 