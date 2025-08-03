#!/usr/bin/env node

/**
 * Test Azure Key Vault Access
 * 
 * This script tests if the Azure Key Vault access is working properly.
 */

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

async function testKeyVaultAccess() {
  console.log('🧪 Testing Azure Key Vault Access...\n');

  try {
    console.log('🔐 Initializing Azure Key Vault client...');
    
    // Use DefaultAzureCredential for managed identity
    const credential = new DefaultAzureCredential();
    const keyVaultName = process.env.KEY_VAULT_NAME || 'orb-game-kv-eastus2';
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
    
    console.log(`📡 Key Vault URL: ${keyVaultUrl}`);
    
    const secretClient = new SecretClient(keyVaultUrl, credential);
    
    // Test fetching secrets
    const secretNames = [
      'AZURE-OPENAI-API-KEY',
      'PERPLEXITY-API-KEY',
      'MONGO-URI'
    ];
    
    console.log('\n🔍 Testing secret retrieval...');
    
    for (const secretName of secretNames) {
      try {
        console.log(`📝 Fetching secret: ${secretName}`);
        const secret = await secretClient.getSecret(secretName);
        console.log(`✅ Successfully retrieved: ${secretName}`);
        console.log(`   Value length: ${secret.value ? secret.value.length : 0} characters`);
      } catch (error) {
        console.error(`❌ Failed to fetch ${secretName}:`, error.message);
      }
    }
    
    console.log('\n✅ Key Vault access test completed');
    
  } catch (error) {
    console.error('❌ Key Vault access test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testKeyVaultAccess().catch(console.error); 