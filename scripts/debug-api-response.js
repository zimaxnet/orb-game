#!/usr/bin/env node

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import promptManager from '../utils/promptManager.js';

async function debugAPIResponse() {
  console.log('🔍 Debugging API Response...');
  
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
    
    // Test with a simple prompt first
    console.log('\n📝 Testing with simple prompt...');
    
    const simpleResponse = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
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
            content: 'Say hello'
          }
        ],
        max_completion_tokens: 100
      })
    });
    
    console.log(`Simple response status: ${simpleResponse.status}`);
    
    if (simpleResponse.ok) {
      const simpleData = await simpleResponse.json();
      console.log('Simple response content:', simpleData.choices[0].message.content);
    } else {
      const errorText = await simpleResponse.text();
      console.log('Simple response error:', errorText);
    }
    
    // Test with our complex prompt
    console.log('\n📝 Testing with complex prompt...');
    
    const testPrompt = promptManager.getFrontendPrompt('Technology', 'Modern', 'en', 'o4-mini');
    const enhancedPrompt = `${testPrompt} Focus specifically on Alan Turing and his remarkable achievements in technology during modern times. He was a brilliant mathematician and computer scientist who laid the foundation for modern computing. Make it engaging, informative, and highlight his significant contributions that shaped history. Tell the story as if you are Alan Turing sharing your journey, discoveries, and the impact you had on the world.`;
    
    const complexResponse = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
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
            content: 'You are a helpful assistant that creates engaging, positive news stories. Always focus on uplifting and inspiring content. You MUST return valid JSON only.'
          },
          {
            role: 'user',
            content: `${enhancedPrompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "O4-Mini" }]`
          }
        ],
        max_completion_tokens: 1000
      })
    });
    
    console.log(`Complex response status: ${complexResponse.status}`);
    console.log(`Complex response headers:`, Object.fromEntries(complexResponse.headers.entries()));
    
    if (complexResponse.ok) {
      const complexData = await complexResponse.json();
      console.log('Complex response content length:', complexData.choices[0].message.content.length);
      console.log('Complex response content:', complexData.choices[0].message.content);
      
      if (complexData.choices[0].message.content.trim() === '') {
        console.log('⚠️ Content is empty!');
      }
    } else {
      const errorText = await complexResponse.text();
      console.log('Complex response error:', errorText);
    }
    
    // Test with different token limits
    console.log('\n📝 Testing with different token limits...');
    
    const tokenLimits = [500, 1000, 2000];
    
    for (const limit of tokenLimits) {
      console.log(`\nTesting with max_completion_tokens: ${limit}`);
      
      const tokenResponse = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
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
              content: 'Tell me a short story about technology'
            }
          ],
          max_completion_tokens: limit
        })
      });
      
      console.log(`Status: ${tokenResponse.status}`);
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log(`Content length: ${tokenData.choices[0].message.content.length}`);
        console.log(`Content preview: ${tokenData.choices[0].message.content.substring(0, 100)}...`);
      } else {
        const errorText = await tokenResponse.text();
        console.log(`Error: ${errorText.substring(0, 100)}...`);
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAPIResponse().catch(console.error); 