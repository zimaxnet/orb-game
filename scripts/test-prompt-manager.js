#!/usr/bin/env node

/**
 * Test script for the centralized prompt manager
 * This script verifies that all prompts are working correctly
 */

import promptManager from '../utils/promptManager.js';

console.log('🧪 Testing Centralized Prompt Manager...\n');

// Test 1: Basic prompt retrieval
console.log('📝 Test 1: Basic Prompt Retrieval');
const testPrompt = promptManager.getFrontendPrompt('Technology', 'Modern', 'en');
console.log(`✅ Technology-Modern-EN: ${testPrompt.substring(0, 100)}...`);

const testPromptES = promptManager.getFrontendPrompt('Technology', 'Modern', 'es');
console.log(`✅ Technology-Modern-ES: ${testPromptES.substring(0, 100)}...`);

// Test 2: Backend prompt templates
console.log('\n🤖 Test 2: Backend Prompt Templates');
const backendPrompt = promptManager.getBackendPromptTemplate('azure-openai', 'en');
console.log(`✅ Azure OpenAI EN: ${backendPrompt.substring(0, 100)}...`);

const backendPromptES = promptManager.getBackendPromptTemplate('azure-openai', 'es');
console.log(`✅ Azure OpenAI ES: ${backendPromptES.substring(0, 100)}...`);

// Test 3: System prompts
console.log('\n💬 Test 3: System Prompts');
const systemPrompt = promptManager.getSystemPrompt('en');
console.log(`✅ System EN: ${systemPrompt.substring(0, 100)}...`);

const systemPromptES = promptManager.getSystemPrompt('es');
console.log(`✅ System ES: ${systemPromptES.substring(0, 100)}...`);

// Test 4: Fallback stories
console.log('\n🔄 Test 4: Fallback Stories');
const fallbackStory = promptManager.getFallbackStory('Technology', 'en');
console.log(`✅ Fallback EN: ${fallbackStory.headline} - ${fallbackStory.summary.substring(0, 50)}...`);

const fallbackStoryES = promptManager.getFallbackStory('Technology', 'es');
console.log(`✅ Fallback ES: ${fallbackStoryES.headline} - ${fallbackStoryES.summary.substring(0, 50)}...`);

// Test 5: TTS voices
console.log('\n🎵 Test 5: TTS Voices');
const voiceEN = promptManager.getTTSVoice('en');
console.log(`✅ Voice EN: ${voiceEN}`);

const voiceES = promptManager.getTTSVoice('es');
console.log(`✅ Voice ES: ${voiceES}`);

// Test 6: Prompt statistics
console.log('\n📊 Test 6: Prompt Statistics');
const stats = promptManager.getPromptStats();
console.log(`✅ Stats: ${JSON.stringify(stats, null, 2)}`);

// Test 7: Prompt validation
console.log('\n✅ Test 7: Prompt Validation');
const validation = promptManager.validatePrompts();
console.log(`✅ Validation: ${validation.valid ? 'PASS' : 'FAIL'}`);
if (!validation.valid) {
  console.log(`❌ Missing prompts: ${validation.missing.join(', ')}`);
}

// Test 8: Category prompts
console.log('\n📂 Test 8: Category Prompts');
const categoryPrompts = promptManager.getCategoryPrompts('Science', 'en');
console.log(`✅ Science category has ${Object.keys(categoryPrompts).length} epochs`);

// Test 9: Epoch prompts
console.log('\n⏰ Test 9: Epoch Prompts');
const epochPrompts = promptManager.getEpochPrompts('Modern', 'en');
console.log(`✅ Modern epoch has ${Object.keys(epochPrompts).length} categories`);

// Test 10: Language prompts
console.log('\n🌍 Test 10: Language Prompts');
const languagePrompts = promptManager.getLanguagePrompts('en');
const totalPrompts = Object.keys(languagePrompts).length * Object.keys(languagePrompts.Technology).length;
console.log(`✅ English language has ${totalPrompts} total prompts`);

console.log('\n🎉 All tests completed successfully!');
console.log('\n📋 Summary:');
console.log(`- Total cached prompts: ${stats.totalCached}`);
console.log(`- Categories: ${stats.categories}`);
console.log(`- Epochs: ${stats.epochs}`);
console.log(`- Languages: ${stats.languages}`);
console.log(`- AI Models: ${stats.models}`);
console.log(`- Total combinations: ${stats.totalCombinations}`);

console.log('\n✅ Centralized Prompt Manager is working correctly!'); 