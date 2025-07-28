#!/usr/bin/env node

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function debug400Error() {
  console.log('🔍 Debugging 400 Error...');
  
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
    
    // Test with different parameter combinations
    const tests = [
      {
        name: 'Test 1: max_tokens',
        body: {
          model: deployment,
          messages: [
            {
              role: 'user',
              content: 'Tell me a short story about Alan Turing'
            }
          ],
          max_tokens: 2000
        }
      },
      {
        name: 'Test 2: max_completion_tokens',
        body: {
          model: deployment,
          messages: [
            {
              role: 'user',
              content: 'Tell me a short story about Alan Turing'
            }
          ],
          max_completion_tokens: 2000
        }
      },
      {
        name: 'Test 3: no token limit',
        body: {
          model: deployment,
          messages: [
            {
              role: 'user',
              content: 'Tell me a short story about Alan Turing'
            }
          ]
        }
      },
      {
        name: 'Test 4: lower token limit',
        body: {
          model: deployment,
          messages: [
            {
              role: 'user',
              content: 'Tell me a short story about Alan Turing'
            }
          ],
          max_tokens: 500
        }
      }
    ];
    
    for (const test of tests) {
      console.log(`\n📝 ${test.name}`);
      
      const response = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.body)
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success!');
        console.log('Content length:', data.choices[0].message.content.length);
        console.log('Content preview:', data.choices[0].message.content.substring(0, 100) + '...');
      } else {
        const errorText = await response.text();
        console.log('❌ Failed:', errorText);
      }
      
      // Delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debug400Error().catch(console.error); 