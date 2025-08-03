#!/usr/bin/env node

/**
 * Add Voice Live Key to Azure Key Vault
 * Adds the voice live key to the Azure Key Vault for TTS functionality
 */

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const KEY_VAULT_NAME = 'orb-game-kv-eastus2';
const KEY_VAULT_URL = `https://${KEY_VAULT_NAME}.vault.azure.net/`;

// The voice live key to add (replace with actual key)
const VOICE_LIVE_KEY = 'YOUR_VOICE_LIVE_KEY_HERE';

async function addVoiceLiveKey() {
  console.log('🎵 Adding Voice Live Key to Azure Key Vault...');
  console.log(`Key Vault URL: ${KEY_VAULT_URL}`);
  
  try {
    // Use DefaultAzureCredential for managed identity
    const credential = new DefaultAzureCredential();
    const secretClient = new SecretClient(KEY_VAULT_URL, credential);
    
    console.log('✅ Key Vault client created successfully');
    
    // Add the voice live key
    console.log('🔐 Adding VOICE-LIVE-KEY secret...');
    const secret = await secretClient.setSecret('VOICE-LIVE-KEY', VOICE_LIVE_KEY);
    
    console.log('✅ Voice Live Key added successfully!');
    console.log(`   Secret Name: ${secret.name}`);
    console.log(`   Secret Version: ${secret.properties.version}`);
    console.log(`   Created: ${secret.properties.createdOn}`);
    
    // Verify the secret was added
    console.log('🔍 Verifying secret was added...');
    const retrievedSecret = await secretClient.getSecret('VOICE-LIVE-KEY');
    console.log(`✅ Secret verified - Value preview: ${retrievedSecret.value.substring(0, 8)}...`);
    
    console.log('🎉 Voice Live Key successfully added to Key Vault!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Update your backend code to use this key for TTS');
    console.log('2. Add VOICE-LIVE-KEY to your environment variables');
    console.log('3. Test TTS functionality with the new key');
    
  } catch (error) {
    console.error('❌ Failed to add Voice Live Key:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('403')) {
      console.error('💡 This might be a permissions issue. Make sure:');
      console.error('   - Your Azure account has access to the Key Vault');
      console.error('   - The Key Vault exists: orb-game-kv-eastus2');
      console.error('   - You have "Key Vault Secrets Officer" permissions');
    }
  }
}

addVoiceLiveKey().catch(error => {
  console.error('💥 Script failed:', error.message);
  process.exit(1);
}); 