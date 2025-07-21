#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Advanced Model-Specific Prompting System
 * 
 * This tests the new sophisticated prompting system that leverages each
 * AI model's unique strengths for maximum engagement and variety.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Advanced Model-Specific Prompting System...\n');

let allTestsPassed = true;

// Test 1: Import and Initialize Prompt Manager
console.log('1. Testing Prompt Manager Import and Initialization...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  const stats = promptManager.getPromptStats();
  console.log(`✅ PASS: Prompt Manager initialized with ${stats.totalCached} cached prompts`);
  console.log(`   📊 Stats: ${stats.categories} categories × ${stats.epochs} epochs × ${stats.languages} languages × ${stats.models} models`);
} catch (error) {
  console.log('❌ FAIL: Could not import or initialize Prompt Manager:', error.message);
  allTestsPassed = false;
}

// Test 2: Model Characteristics
console.log('\n2. Testing Model Characteristics...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  const characteristics = promptManager.getModelCharacteristics();
  
  const expectedModels = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
  const actualModels = Object.keys(characteristics);
  
  if (expectedModels.every(model => actualModels.includes(model))) {
    console.log('✅ PASS: All expected models have characteristics defined');
    actualModels.forEach(model => {
      const char = characteristics[model];
      console.log(`   ${char.icon} ${char.name}: ${char.description}`);
    });
  } else {
    console.log('❌ FAIL: Missing model characteristics');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test model characteristics:', error.message);
  allTestsPassed = false;
}

// Test 3: Model-Specific Prompt Retrieval
console.log('\n3. Testing Model-Specific Prompt Retrieval...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  const testCases = [
    { category: 'Technology', epoch: 'Ancient', language: 'en', model: 'o4-mini' },
    { category: 'Science', epoch: 'Modern', language: 'es', model: 'grok-4' },
    { category: 'Art', epoch: 'Future', language: 'en', model: 'perplexity-sonar' },
    { category: 'Nature', epoch: 'Medieval', language: 'es', model: 'gemini-1.5-flash' }
  ];
  
  let promptTestsPassed = 0;
  
  testCases.forEach(testCase => {
    const prompt = promptManager.getFrontendPrompt(
      testCase.category, 
      testCase.epoch, 
      testCase.language, 
      testCase.model
    );
    
    if (prompt && prompt.length > 50 && !prompt.includes('undefined')) {
      promptTestsPassed++;
      console.log(`   ✅ ${testCase.model} (${testCase.category}/${testCase.epoch}/${testCase.language}): Valid prompt retrieved`);
    } else {
      console.log(`   ❌ ${testCase.model} (${testCase.category}/${testCase.epoch}/${testCase.language}): Invalid prompt`);
    }
  });
  
  if (promptTestsPassed === testCases.length) {
    console.log('✅ PASS: All model-specific prompts retrieved successfully');
  } else {
    console.log(`❌ FAIL: ${testCases.length - promptTestsPassed} prompt retrieval tests failed`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test prompt retrieval:', error.message);
  allTestsPassed = false;
}

// Test 4: Prompt Uniqueness and Variety
console.log('\n4. Testing Prompt Uniqueness and Variety...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  const category = 'Technology';
  const epoch = 'Modern';
  const language = 'en';
  const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
  
  const prompts = models.map(model => ({
    model,
    prompt: promptManager.getFrontendPrompt(category, epoch, language, model)
  }));
  
  // Check if all prompts are different
  const uniquePrompts = new Set(prompts.map(p => p.prompt));
  
  if (uniquePrompts.size === models.length) {
    console.log('✅ PASS: All model prompts are unique');
    
    // Check for model-specific characteristics
    const hasAnalytical = prompts.some(p => p.model === 'o4-mini' && (p.prompt.toLowerCase().includes('analy') || p.prompt.toLowerCase().includes('systematic')));
    const hasWitty = prompts.some(p => p.model === 'grok-4' && (p.prompt.toLowerCase().includes('wit') || p.prompt.toLowerCase().includes('humor') || p.prompt.toLowerCase().includes('infectious enthusiasm')));
    const hasResearch = prompts.some(p => p.model === 'perplexity-sonar' && (p.prompt.toLowerCase().includes('research') || p.prompt.toLowerCase().includes('synthesize')));
    const hasNarrative = prompts.some(p => p.model === 'gemini-1.5-flash' && (p.prompt.toLowerCase().includes('narrative') || p.prompt.toLowerCase().includes('perspective') || p.prompt.toLowerCase().includes('multi-dimensional')));
    
    if (hasAnalytical && hasWitty && hasResearch && hasNarrative) {
      console.log('✅ PASS: Prompts reflect model-specific characteristics');
    } else {
      console.log('❌ FAIL: Prompts do not reflect expected model characteristics');
      allTestsPassed = false;
    }
  } else {
    console.log('❌ FAIL: Some model prompts are identical');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test prompt uniqueness:', error.message);
  allTestsPassed = false;
}

// Test 5: "No Questions" Requirement
console.log('\n5. Testing "No Questions" Requirement...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  const samplePrompts = [
    promptManager.getFrontendPrompt('Technology', 'Ancient', 'en', 'o4-mini'),
    promptManager.getFrontendPrompt('Science', 'Modern', 'es', 'grok-4'),
    promptManager.getFrontendPrompt('Art', 'Future', 'en', 'perplexity-sonar'),
    promptManager.getFrontendPrompt('Nature', 'Medieval', 'es', 'gemini-1.5-flash')
  ];
  
  const questionMarkers = ['?', 'What', 'How', 'Why', 'When', 'Where', 'Who', 'Which'];
  let hasQuestions = false;
  
  samplePrompts.forEach((prompt, index) => {
    questionMarkers.forEach(marker => {
      if (prompt.includes(marker + ' ') || prompt.endsWith(marker)) {
        console.log(`   ⚠️  Potential question found in prompt ${index + 1}: "${marker}"`);
        hasQuestions = true;
      }
    });
  });
  
  if (!hasQuestions) {
    console.log('✅ PASS: No questions found in sampled prompts');
  } else {
    console.log('❌ FAIL: Questions detected in prompts');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test question requirement:', error.message);
  allTestsPassed = false;
}

// Test 6: Backend Prompt Templates
console.log('\n6. Testing Backend Prompt Templates...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
  const languages = ['en', 'es'];
  
  let backendTestsPassed = 0;
  const totalBackendTests = models.length * languages.length;
  
  models.forEach(model => {
    languages.forEach(language => {
      const template = promptManager.getBackendPromptTemplate(model, language);
      if (template && template.includes('{category}') && template.includes('{epoch}')) {
        backendTestsPassed++;
      } else {
        console.log(`   ❌ Invalid backend template for ${model}/${language}`);
      }
    });
  });
  
  if (backendTestsPassed === totalBackendTests) {
    console.log('✅ PASS: All backend prompt templates valid');
  } else {
    console.log(`❌ FAIL: ${totalBackendTests - backendTestsPassed} backend template tests failed`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test backend templates:', error.message);
  allTestsPassed = false;
}

// Test 7: JSON Response Formats
console.log('\n7. Testing JSON Response Formats...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  const models = ['o4-mini', 'grok-4', 'perplexity-sonar', 'gemini-1.5-flash'];
  let jsonTestsPassed = 0;
  
  models.forEach(model => {
    const format = promptManager.getJSONResponseFormat(model);
    if (format && format.includes('JSON') && format.includes('headline')) {
      jsonTestsPassed++;
      console.log(`   ✅ ${model}: Valid JSON format defined`);
    } else {
      console.log(`   ❌ ${model}: Invalid JSON format`);
    }
  });
  
  if (jsonTestsPassed === models.length) {
    console.log('✅ PASS: All JSON response formats valid');
  } else {
    console.log(`❌ FAIL: ${models.length - jsonTestsPassed} JSON format tests failed`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test JSON formats:', error.message);
  allTestsPassed = false;
}

// Test 8: System Integration
console.log('\n8. Testing System Integration...');
try {
  const { default: promptManager } = await import('../utils/promptManager.js');
  
  // Test random prompt functionality
  const randomPrompt = promptManager.getRandomPrompt();
  
  if (randomPrompt.category && randomPrompt.epoch && randomPrompt.model && 
      randomPrompt.prompt && randomPrompt.characteristics) {
    console.log('✅ PASS: Random prompt system working');
    console.log(`   🎲 Sample: ${randomPrompt.characteristics.icon} ${randomPrompt.model} - ${randomPrompt.category}/${randomPrompt.epoch}`);
  } else {
    console.log('❌ FAIL: Random prompt system incomplete');
    allTestsPassed = false;
  }
  
  // Test validation system
  const validation = promptManager.validatePrompts();
  
  if (validation.valid && validation.missing.length === 0) {
    console.log(`✅ PASS: All ${validation.total} prompts validated successfully`);
  } else {
    console.log(`❌ FAIL: Validation failed - ${validation.missing.length} missing prompts`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ ERROR: Could not test system integration:', error.message);
  allTestsPassed = false;
}

// Final results
console.log('\n' + '='.repeat(70));
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED: Advanced Model-Specific Prompting System is working perfectly!');
  console.log('');
  console.log('✨ System Features Validated:');
  console.log('   🔬 Model-specific prompt characteristics');
  console.log('   🎯 Unique prompts for each AI model');
  console.log('   ❌ No questions in generated prompts');
  console.log('   🌍 Multi-language support');
  console.log('   📊 Comprehensive validation');
  console.log('   🎲 Random prompt generation');
  console.log('   🔗 Full system integration');
  console.log('');
  console.log('🚀 The Orb Game now has a sophisticated prompting system that will');
  console.log('   create unique, engaging content tailored to each AI model\'s strengths!');
} else {
  console.log('❌ SOME TESTS FAILED: Please review the issues above');
}
console.log('='.repeat(70));

process.exit(allTestsPassed ? 0 : 1); 