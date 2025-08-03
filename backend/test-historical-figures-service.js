import { HistoricalFiguresService } from './historical-figures-service.js';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testHistoricalFiguresService() {
  console.log('🧪 Testing Historical Figures Service...');
  
  // Initialize Azure Key Vault client
  let secretClient;
  let secrets = {};
  
  try {
    console.log('🔐 Initializing Azure Key Vault secrets...');
    
    // Use DefaultAzureCredential for managed identity
    const credential = new DefaultAzureCredential();
    const keyVaultName = process.env.KEY_VAULT_NAME || 'orb-game-kv-eastus2';
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net/`;
    
    secretClient = new SecretClient(keyVaultUrl, credential);
    
    // Fetch required secrets
    const secretNames = [
      'AZURE-OPENAI-API-KEY',
      'PERPLEXITY-API-KEY',
      'MONGO-URI'
    ];
    
    const secretPromises = secretNames.map(async (secretName) => {
      try {
        const secret = await secretClient.getSecret(secretName);
        return { name: secretName, value: secret.value };
      } catch (error) {
        console.warn(`⚠️ Failed to fetch secret ${secretName}:`, error.message);
        return { name: secretName, value: null };
      }
    });
    
    const secretResults = await Promise.all(secretPromises);
    
    // Store secrets in memory
    secretResults.forEach(({ name, value }) => {
      if (value) {
        const envName = name.replace(/-/g, '_');
        secrets[envName] = value;
        console.log(`✅ Loaded secret: ${name}`);
      }
    });
    
    console.log('✅ Azure Key Vault secrets initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Azure Key Vault secrets:', error.message);
    console.warn('⚠️ Falling back to environment variables');
  }
  
  const mongoUri = secrets['MONGO_URI'] || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI not available from Key Vault or environment. Cannot test service.');
    return false;
  }
  
  let service = null;
  
  try {
    // Initialize service
    console.log('🔧 Initializing Historical Figures Service...');
    service = new HistoricalFiguresService(mongoUri);
    await service.initialize();
    console.log('✅ Service initialized successfully');
    
    // Test getting available categories
    console.log('\n📋 Testing available categories...');
    const categories = await service.getAvailableCategories();
    console.log('✅ Available categories:', categories);
    
    // Test getting available epochs
    console.log('\n⏰ Testing available epochs...');
    const epochs = await service.getAvailableEpochs();
    console.log('✅ Available epochs:', epochs);
    
    // Test getting available languages
    console.log('\n🌍 Testing available languages...');
    const languages = await service.getAvailableLanguages();
    console.log('✅ Available languages:', languages);
    
    // Test getting historical figures for a category and epoch
    console.log('\n👥 Testing historical figures list...');
    const figures = await service.getHistoricalFiguresList('Technology', 'Modern');
    console.log('✅ Historical figures for Technology-Modern:', figures);
    
    // Test generating a story
    console.log('\n📝 Testing story generation...');
    const story = await service.generateHistoricalFigureStory('Technology', 'Modern', 'en');
    if (story) {
      console.log('✅ Generated story:', {
        headline: story.headline,
        historicalFigure: story.historicalFigure,
        category: story.category,
        epoch: story.epoch,
        language: story.language,
        hasTTS: !!story.ttsAudio
      });
    } else {
      console.log('❌ Failed to generate story');
    }
    
    // Test getting stories
    console.log('\n📚 Testing get stories...');
    const stories = await service.getStories('Technology', 'Modern', 'en', 2, false);
    console.log(`✅ Retrieved ${stories.length} stories`);
    
    // Test getting random story
    console.log('\n🎲 Testing random story...');
    const randomStory = await service.getRandomStory('Technology', 'Modern', 'en');
    if (randomStory) {
      console.log('✅ Random story:', {
        headline: randomStory.headline,
        historicalFigure: randomStory.historicalFigure
      });
    } else {
      console.log('❌ No random story found');
    }
    
    // Test getting stats
    console.log('\n📊 Testing stats...');
    const stats = await service.getStoryStats();
    console.log('✅ Stats:', stats);
    
    console.log('\n🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (service) {
      await service.close();
      console.log('🔒 Service closed');
    }
  }
}

// Run the test
testHistoricalFiguresService().then(success => {
  console.log(`\nTest result: ${success ? 'SUCCESS' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}); 