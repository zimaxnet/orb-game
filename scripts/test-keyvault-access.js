#!/usr/bin/env node

/**
 * Test Key Vault Access Script
 * Tests if the backend can access Key Vault secrets
 */

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const KEY_VAULT_NAME = 'orb-game-kv-eastus2';
const KEY_VAULT_URL = `https://${KEY_VAULT_NAME}.vault.azure.net/`;

async function testKeyVaultAccess() {
  console.log('🔐 Testing Key Vault Access...');
  console.log(`Key Vault URL: ${KEY_VAULT_URL}`);
  
  try {
    // Use DefaultAzureCredential for managed identity
    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(KEY_VAULT_URL, credential);
    
    console.log('✅ Key Vault client created successfully');
    
    // Test fetching secrets
    const secretNames = [
      'AZURE-OPENAI-API-KEY',
      'PERPLEXITY-API-KEY',
      'MONGO-URI'
    ];
    
    for (const secretName of secretNames) {
      try {
        console.log(`🔍 Testing secret: ${secretName}`);
        const secret = await secretClient.getSecret(secretName);
        console.log(`✅ Secret ${secretName} retrieved successfully`);
        console.log(`   Value preview: ${secret.value.substring(0, 8)}...`);
      } catch (error) {
        console.log(`❌ Failed to retrieve secret ${secretName}: ${error.message}`);
      }
    }
    
    console.log('🎉 Key Vault access test completed!');
    
  } catch (error) {
    console.error('❌ Key Vault access failed:', error.message);
    console.error('Error details:', error);
  }
}

testKeyVaultAccess().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
}); 