#!/usr/bin/env node

import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import promptManager from '../utils/promptManager.js';

class StoryErrorFixer {
  constructor() {
    this.azureOpenAIApiKey = null;
    this.azureOpenAIEndpoint = null;
    this.azureOpenAIDeployment = null;
    
    this.errorStats = {
      jsonParseErrors: 0,
      ttsErrors: 0,
      apiErrors: 0,
      networkErrors: 0,
      totalErrors: 0
    };
  }

  async initialize() {
    console.log('🔧 Initializing Story Error Fixer...');
    await this.loadCredentialsFromKeyVault();
  }

  async loadCredentialsFromKeyVault() {
    try {
      console.log('🔐 Loading credentials from Azure Key Vault...');
      
      const credential = new DefaultAzureCredential();
      const keyVaultUrl = 'https://orb-game-kv-eastus2.vault.azure.net/';
      const secretClient = new SecretClient(keyVaultUrl, credential);
      
      const apiKeySecret = await secretClient.getSecret('AZURE-OPENAI-API-KEY');
      
      this.azureOpenAIApiKey = apiKeySecret.value;
      this.azureOpenAIEndpoint = 'https://aimcs-foundry.cognitiveservices.azure.com/';
      this.azureOpenAIDeployment = 'o4-mini';
      
      console.log('✅ Credentials loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load credentials:', error.message);
      throw error;
    }
  }

  // Test JSON parsing with better error handling
  async testJSONParsing() {
    console.log('\n🔍 Testing JSON Parsing...');
    
    const testPrompt = promptManager.getFrontendPrompt('Technology', 'Modern', 'en', 'o4-mini');
    const enhancedPrompt = `${testPrompt} Focus specifically on Alan Turing and his remarkable achievements in technology during modern times. He was a brilliant mathematician and computer scientist who laid the foundation for modern computing. Make it engaging, informative, and highlight his significant contributions that shaped history. Tell the story as if you are Alan Turing sharing your journey, discoveries, and the impact you had on the world.`;

    try {
      const response = await fetch(`${this.azureOpenAIEndpoint}openai/deployments/${this.azureOpenAIDeployment}/chat/completions?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.azureOpenAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.azureOpenAIDeployment,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates engaging, positive news stories. Always focus on uplifting and inspiring content. You MUST return valid JSON.'
            },
            {
              role: 'user',
              content: `${enhancedPrompt} Return ONLY a valid JSON array with this exact format: [{ "headline": "Brief headline", "summary": "One sentence summary", "fullText": "2-3 sentence story", "source": "O4-Mini" }]`
            }
          ],
          max_completion_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log('📝 Raw API Response:');
      console.log(content);
      
      let stories;
      try {
        stories = JSON.parse(content);
        console.log('✅ JSON parsing successful!');
        console.log('📊 Parsed stories:', stories.length);
        return stories;
      } catch (parseError) {
        this.errorStats.jsonParseErrors++;
        console.error('❌ JSON parse failed:', parseError.message);
        console.error('🔍 Content that failed to parse:');
        console.error(content);
        
        // Try to fix common JSON issues
        const fixedContent = this.attemptJSONFix(content);
        if (fixedContent) {
          try {
            stories = JSON.parse(fixedContent);
            console.log('✅ JSON fixed and parsed successfully!');
            return stories;
          } catch (secondError) {
            console.error('❌ JSON fix also failed:', secondError.message);
            return [];
          }
        }
        
        return [];
      }
      
    } catch (error) {
      this.errorStats.apiErrors++;
      console.error('❌ API call failed:', error.message);
      return [];
    }
  }

  // Attempt to fix common JSON parsing issues
  attemptJSONFix(content) {
    console.log('🔧 Attempting to fix JSON...');
    
    // Remove any text before the first [
    let fixed = content.replace(/^[^[]*/, '');
    
    // Remove any text after the last ]
    fixed = fixed.replace(/[^]*$/, '');
    
    // Fix common issues
    fixed = fixed.replace(/,\s*]/g, ']'); // Remove trailing commas
    fixed = fixed.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
    fixed = fixed.replace(/\\"/g, '"'); // Fix escaped quotes
    fixed = fixed.replace(/\\n/g, ' '); // Replace newlines with spaces
    fixed = fixed.replace(/\\t/g, ' '); // Replace tabs with spaces
    
    console.log('🔧 Fixed content preview:', fixed.substring(0, 200) + '...');
    return fixed;
  }

  // Test TTS generation
  async testTTSGeneration() {
    console.log('\n🎵 Testing TTS Generation...');
    
    const testText = "Alan Turing was a brilliant mathematician who laid the foundation for modern computing. His work on the Turing machine and the concept of computability revolutionized our understanding of what computers could do.";
    
    try {
      const response = await fetch(`${this.azureOpenAIEndpoint}openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2024-12-01-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.azureOpenAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          input: testText,
          voice: 'alloy',
          response_format: 'mp3',
          speed: 1.0
        })
      });

      console.log(`📊 TTS Response Status: ${response.status}`);
      console.log(`📊 TTS Response Headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TTS failed:', errorText);
        this.errorStats.ttsErrors++;
        return false;
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      console.log('✅ TTS generation successful!');
      console.log(`📊 Audio size: ${base64Audio.length} characters`);
      return true;
      
    } catch (error) {
      this.errorStats.ttsErrors++;
      console.error('❌ TTS generation failed:', error.message);
      return false;
    }
  }

  // Test with different TTS API versions
  async testTTSSettings() {
    console.log('\n🔧 Testing different TTS settings...');
    
    const testText = "This is a test of TTS generation.";
    const apiVersions = ['2024-12-01-preview', '2024-02-15-preview', '2024-01-01-preview'];
    const voices = ['alloy', 'jorge'];
    
    for (const apiVersion of apiVersions) {
      for (const voice of voices) {
        console.log(`\n🎵 Testing TTS with API version: ${apiVersion}, voice: ${voice}`);
        
        try {
          const response = await fetch(`${this.azureOpenAIEndpoint}openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=${apiVersion}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.azureOpenAIApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini-tts',
              input: testText,
              voice: voice,
              response_format: 'mp3',
              speed: 1.0
            })
          });

          console.log(`   Status: ${response.status}`);
          
          if (response.ok) {
            console.log(`   ✅ Success with ${apiVersion} and ${voice}`);
          } else {
            const errorText = await response.text();
            console.log(`   ❌ Failed: ${errorText.substring(0, 100)}...`);
          }
          
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Test API rate limits
  async testRateLimits() {
    console.log('\n⏱️ Testing API Rate Limits...');
    
    const testPrompts = [
      'Tell me about technology in modern times.',
      'Tell me about science in ancient times.',
      'Tell me about art in medieval times.'
    ];
    
    for (let i = 0; i < testPrompts.length; i++) {
      console.log(`\n📝 Test ${i + 1}/${testPrompts.length}: ${testPrompts[i]}`);
      
      try {
        const response = await fetch(`${this.azureOpenAIEndpoint}openai/deployments/${this.azureOpenAIDeployment}/chat/completions?api-version=2024-12-01-preview`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.azureOpenAIApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.azureOpenAIDeployment,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant.'
              },
              {
                role: 'user',
                content: testPrompts[i]
              }
            ],
            max_completion_tokens: 100
          })
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Success: ${data.choices[0].message.content.substring(0, 50)}...`);
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Failed: ${errorText.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Running Story Error Diagnostics...');
    console.log('=====================================');
    
    await this.initialize();
    
    // Test JSON parsing
    await this.testJSONParsing();
    
    // Test TTS generation
    await this.testTTSGeneration();
    
    // Test different TTS settings
    await this.testTTSSettings();
    
    // Test rate limits
    await this.testRateLimits();
    
    console.log('\n📊 Error Statistics:');
    console.log(`   JSON Parse Errors: ${this.errorStats.jsonParseErrors}`);
    console.log(`   TTS Generation Errors: ${this.errorStats.ttsErrors}`);
    console.log(`   API Errors: ${this.errorStats.apiErrors}`);
    console.log(`   Network Errors: ${this.errorStats.networkErrors}`);
    console.log(`   Total Errors: ${this.errorStats.totalErrors}`);
    
    console.log('\n🎉 Error diagnostics complete!');
  }
}

// Main execution
async function main() {
  const fixer = new StoryErrorFixer();
  
  try {
    await fixer.runAllTests();
  } catch (error) {
    console.error('💥 Error diagnostics failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { StoryErrorFixer }; 