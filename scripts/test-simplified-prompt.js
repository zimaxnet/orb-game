#!/usr/bin/env node

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function testSimplifiedPrompts() {
  console.log('🧪 Testing Simplified Prompts...');
  
  try {
    // Load credentials
    const credential = new DefaultAzureCredential();
    const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    const apiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
    const apiKey = apiKeySecret.value;
    const endpoint = 'https://aimcs-foundry.cognitiveservices.azure.com/';
    const deployment = 'o4-mini';
    
    console.log('✅ Credentials loaded');
    
    // Test 1: Simple story without JSON requirement
    console.log('\n📝 Test 1: Simple story about Alan Turing');
    
    const response1 = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: deployment,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates engaging, positive news stories.'
          },
          {
            role: 'user',
            content: 'Tell me a short story about Alan Turing and his contributions to technology in modern times.'
          }
        ],
        max_completion_tokens: 500
      })
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Test 1 successful!');
      console.log('Content length:', data1.choices[0].message.content.length);
      console.log('Content preview:', data1.choices[0].message.content.substring(0, 200) + '...');
    } else {
      console.log('❌ Test 1 failed:', await response1.text());
    }
    
    // Test 2: Story with simple JSON request
    console.log('\n📝 Test 2: Story with simple JSON request');
    
    const response2 = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: deployment,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Return your response as JSON.'
          },
          {
            role: 'user',
            content: 'Create a story about Alan Turing. Return it as JSON with fields: headline, summary, fullText'
          }
        ],
        max_completion_tokens: 500
      })
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Test 2 successful!');
      console.log('Content length:', data2.choices[0].message.content.length);
      console.log('Content:', data2.choices[0].message.content);
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(data2.choices[0].message.content);
        console.log('✅ JSON parsing successful!');
        console.log('Parsed:', parsed);
      } catch (e) {
        console.log('❌ JSON parsing failed:', e.message);
      }
    } else {
      console.log('❌ Test 2 failed:', await response2.text());
    }
    
    // Test 3: Very simple JSON request
    console.log('\n📝 Test 3: Very simple JSON request');
    
    const response3 = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: deployment,
        messages: [
          {
            role: 'user',
            content: 'Return a JSON object with a "message" field containing "Hello World"'
          }
        ],
        max_completion_tokens: 100
      })
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Test 3 successful!');
      console.log('Content:', data3.choices[0].message.content);
      
      try {
        const parsed = JSON.parse(data3.choices[0].message.content);
        console.log('✅ JSON parsing successful!');
        console.log('Parsed:', parsed);
      } catch (e) {
        console.log('❌ JSON parsing failed:', e.message);
      }
    } else {
      console.log('❌ Test 3 failed:', await response3.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimplifiedPrompts().catch(console.error); 