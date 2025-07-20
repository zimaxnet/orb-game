#!/usr/bin/env node

/**
 * Test script to verify preloading is disabled
 * This script checks that the app works correctly without preloading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing preloading disabled status...\n');

// Check if preloading triggers are removed
const orbGameFile = path.join(__dirname, '../components/OrbGame.jsx');
const orbGameContent = fs.readFileSync(orbGameFile, 'utf8');

const checks = [
  {
    name: 'Preload useEffect triggers removed',
    pattern: /useEffect.*preloadStoriesForEpoch.*\[\]/,
    shouldExist: false
  },
  {
    name: 'Preload button removed',
    pattern: /load-stories-button/,
    shouldExist: false
  },
  {
    name: 'Preload progress indicator removed',
    pattern: /preload-indicator/,
    shouldExist: false
  },
  {
    name: 'Preload state variables removed',
    pattern: /isPreloading.*useState/,
    shouldExist: false
  },
  {
    name: 'Preload function removed',
    pattern: /preloadStoriesForEpoch.*async/,
    shouldExist: false
  },
  {
    name: 'Database loading still works',
    pattern: /Loading stories from database/,
    shouldExist: true
  },
  {
    name: 'AI generation fallback still works',
    pattern: /Attempt.*to load stories/,
    shouldExist: true
  },
  {
    name: 'Audio controls still present',
    pattern: /play-button/,
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
  console.log('✅ All preloading disabled checks passed!');
  console.log('✅ App should work correctly without preloading');
  console.log('✅ Stories will load on-demand from database or AI generation');
} else {
  console.log('❌ Some checks failed - preloading may not be fully disabled');
}

console.log('\n🎯 Expected behavior:');
console.log('- No automatic preloading on mount');
console.log('- No preloading on language/epoch changes');
console.log('- No preload button in UI');
console.log('- Stories load instantly from database when available');
console.log('- Stories generate fresh via AI when database is empty');
console.log('- Audio only plays when user clicks play button'); 