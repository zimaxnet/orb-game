#!/usr/bin/env node

/**
 * Test script to verify that "Positive Comments" category has been completely removed
 * from the Orb Game system.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing "Positive Comments" removal...\n');

let allTestsPassed = true;

// Test 1: Check promptReferenceData.js
console.log('1. Checking promptReferenceData.js...');
try {
  const promptDataPath = path.join(__dirname, '..', 'utils', 'promptReferenceData.js');
  const promptData = fs.readFileSync(promptDataPath, 'utf8');
  
  if (promptData.includes('Positive Comments')) {
    console.log('❌ FAIL: promptReferenceData.js still contains "Positive Comments"');
    allTestsPassed = false;
  } else {
    console.log('✅ PASS: promptReferenceData.js does not contain "Positive Comments"');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read promptReferenceData.js:', error.message);
  allTestsPassed = false;
}

// Test 2: Check promptManager.js
console.log('\n2. Checking promptManager.js...');
try {
  const promptManagerPath = path.join(__dirname, '..', 'utils', 'promptManager.js');
  const promptManager = fs.readFileSync(promptManagerPath, 'utf8');
  
  if (promptManager.includes('Positive Comments')) {
    console.log('❌ FAIL: promptManager.js still contains "Positive Comments"');
    allTestsPassed = false;
  } else {
    console.log('✅ PASS: promptManager.js does not contain "Positive Comments"');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read promptManager.js:', error.message);
  allTestsPassed = false;
}

// Test 3: Check OrbGame.jsx
console.log('\n3. Checking OrbGame.jsx...');
try {
  const orbGamePath = path.join(__dirname, '..', 'components', 'OrbGame.jsx');
  const orbGame = fs.readFileSync(orbGamePath, 'utf8');
  
  if (orbGame.includes('Positive Comments')) {
    console.log('❌ FAIL: OrbGame.jsx still contains "Positive Comments"');
    allTestsPassed = false;
  } else {
    console.log('✅ PASS: OrbGame.jsx does not contain "Positive Comments"');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read OrbGame.jsx:', error.message);
  allTestsPassed = false;
}

// Test 4: Check PROMPTS_REFERENCE.md
console.log('\n4. Checking PROMPTS_REFERENCE.md...');
try {
  const promptsRefPath = path.join(__dirname, '..', 'PROMPTS_REFERENCE.md');
  const promptsRef = fs.readFileSync(promptsRefPath, 'utf8');
  
  if (promptsRef.includes('Positive Comments')) {
    console.log('❌ FAIL: PROMPTS_REFERENCE.md still contains "Positive Comments"');
    allTestsPassed = false;
  } else {
    console.log('✅ PASS: PROMPTS_REFERENCE.md does not contain "Positive Comments"');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read PROMPTS_REFERENCE.md:', error.message);
  allTestsPassed = false;
}

// Test 4.5: Check PROMPTS_REFERENCE_refactored.md
console.log('\n4.5. Checking PROMPTS_REFERENCE_refactored.md...');
try {
  const promptsRefactoredPath = path.join(__dirname, '..', 'PROMPTS_REFERENCE_refactored.md');
  const promptsRefactored = fs.readFileSync(promptsRefactoredPath, 'utf8');
  
  if (promptsRefactored.includes('Positive Comments') || 
      promptsRefactored.includes('Positive / Motivational / Kind Comments') ||
      promptsRefactored.includes('Comentarios positivos / motivacionales / amables')) {
    console.log('❌ FAIL: PROMPTS_REFERENCE_refactored.md still contains positive comments references');
    allTestsPassed = false;
  } else {
    console.log('✅ PASS: PROMPTS_REFERENCE_refactored.md does not contain positive comments references');
  }
} catch (error) {
  console.log('❌ ERROR: Could not read PROMPTS_REFERENCE_refactored.md:', error.message);
  allTestsPassed = false;
}

// Test 5: Verify category count is now 9
console.log('\n5. Verifying category count is 9...');
try {
  const orbGamePath = path.join(__dirname, '..', 'components', 'OrbGame.jsx');
  const orbGame = fs.readFileSync(orbGamePath, 'utf8');
  
  // Count the categories in the array
  const categoryMatches = orbGame.match(/{ name: '[^']+', color: '[^']+' }/g);
  if (categoryMatches && categoryMatches.length === 9) {
    console.log('✅ PASS: Category count is 9 (removed 1 category)');
  } else {
    console.log(`❌ FAIL: Expected 9 categories, found ${categoryMatches ? categoryMatches.length : 0}`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not verify category count:', error.message);
  allTestsPassed = false;
}

// Test 6: Verify remaining categories are correct
console.log('\n6. Verifying remaining categories...');
try {
  const orbGamePath = path.join(__dirname, '..', 'components', 'OrbGame.jsx');
  const orbGame = fs.readFileSync(orbGamePath, 'utf8');
  
  const expectedCategories = [
    'Technology', 'Science', 'Art', 'Nature', 'Sports', 
    'Music', 'Space', 'Innovation', 'Spirituality'
  ];
  
  let missingCategories = [];
  expectedCategories.forEach(category => {
    if (!orbGame.includes(`'${category}'`)) {
      missingCategories.push(category);
    }
  });
  
  if (missingCategories.length === 0) {
    console.log('✅ PASS: All expected categories are present');
  } else {
    console.log(`❌ FAIL: Missing categories: ${missingCategories.join(', ')}`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not verify remaining categories:', error.message);
  allTestsPassed = false;
}

// Final results
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED: "Positive Comments" category has been completely removed!');
  console.log('✅ The system now has 9 categories instead of 10');
  console.log('✅ All references have been cleaned up');
} else {
  console.log('❌ SOME TESTS FAILED: Please check the issues above');
}
console.log('='.repeat(50));

process.exit(allTestsPassed ? 0 : 1); 