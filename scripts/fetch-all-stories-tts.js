#!/usr/bin/env node

/**
 * Fetch All Stories and Generate TTS Script
 * Fetches all stories from MongoDB and generates TTS audio for each one
 */

import { MongoClient } from 'mongodb';

// Configuration
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/orb-game';
const AZURE_OPENAI_ENDPOINT = 'https://aimcs-foundry.cognitiveservices.azure.com/';
const AZURE_OPENAI_TTS_DEPLOYMENT = 'gpt-4o-mini-tts';

async function getAzureApiKey() {
  // Try to get from environment first
  let apiKey = process.env.AZURE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Try to get from Azure Key Vault
    try {
      const { execSync } = await import('child_process');
      apiKey = execSync('az keyvault secret show --vault-name orb-game-kv-eastus2 --name AZURE-OPENAI-API-KEY --query value -o tsv', { encoding: 'utf8' }).trim();
      console.log('🔑 Retrieved API key from Key Vault');
    } catch (error) {
      console.error('❌ Failed to get API key from Key Vault:', error.message);
      return null;
    }
  }
  
  return apiKey;
}

async function generateTTS(text, apiKey) {
  try {
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_TTS_DEPLOYMENT}/audio/speech?api-version=2025-03-01-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AZURE_OPENAI_TTS_DEPLOYMENT,
        input: text,
        voice: 'alloy'
      })
    });
    
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return Buffer.from(audioBuffer).toString('base64');
    } else {
      const errorText = await response.text();
      console.error(`❌ TTS failed (${response.status}):`, errorText);
      return null;
    }
  } catch (error) {
    console.error('💥 TTS request failed:', error.message);
    return null;
  }
}

async function processCollection(coll, collectionName, apiKey) {
  console.log(`\n📖 Processing collection: ${collectionName}`);
  
  const stories = await coll.find({}).toArray();
  console.log(`📊 Found ${stories.length} documents in ${collectionName}`);
  
  let processedStories = 0;
  let ttsGenerated = 0;
  let errors = 0;
  
  for (const story of stories) {
    // Extract text content from different possible fields
    let textContent = null;
    
    if (story.summary) {
      textContent = story.summary;
    } else if (story.content) {
      textContent = story.content;
    } else if (story.title) {
      textContent = story.title;
    } else if (story.text) {
      textContent = story.text;
    } else if (story.story) {
      textContent = story.story;
    } else if (story.headline) {
      textContent = story.headline;
    }
    
    if (!textContent) {
      console.log(`⚠️ No text content found for story ${story._id}`);
      continue;
    }
    
    // Skip if TTS already exists
    if (story.ttsAudio) {
      console.log(`⏭️ TTS already exists for story ${story._id}, skipping...`);
      continue;
    }
    
    // Truncate text if too long (TTS has limits)
    if (textContent.length > 4000) {
      textContent = textContent.substring(0, 4000) + '...';
    }
    
    console.log(`🎵 Generating TTS for story ${story._id} (${textContent.length} chars)...`);
    
    try {
      const audioData = await generateTTS(textContent, apiKey);
      
      if (audioData) {
        // Update the story with TTS audio
        await coll.updateOne(
          { _id: story._id },
          { 
            $set: { 
              ttsAudio: audioData,
              ttsGeneratedAt: new Date(),
              ttsTextLength: textContent.length
            }
          }
        );
        
        ttsGenerated++;
        console.log(`✅ TTS generated (${audioData.length} chars)`);
      } else {
        errors++;
        console.log(`❌ TTS generation failed`);
      }
      
      processedStories++;
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errors++;
      console.error(`💥 Error processing story ${story._id}:`, error.message);
    }
  }
  
  return { processedStories, ttsGenerated, errors };
}

async function fetchAllStoriesAndGenerateTTS() {
  console.log('📚 Fetching All Stories and Generating TTS...');
  
  // Get API key
  const apiKey = await getAzureApiKey();
  if (!apiKey) {
    console.error('❌ No API key available');
    return;
  }
  
  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    let totalProcessed = 0;
    let totalTTSGenerated = 0;
    let totalErrors = 0;
    
    // Process orbgame database
    console.log('\n🗄️ Processing orbgame database...');
    const orbgameDb = client.db('orbgame');
    const orbgameCollections = await orbgameDb.listCollections().toArray();
    
    for (const collection of orbgameCollections) {
      const collectionName = collection.name;
      
      // Only process collections that might contain stories
      if (collectionName.includes('stories') || collectionName.includes('story')) {
        const coll = orbgameDb.collection(collectionName);
        const result = await processCollection(coll, `orbgame.${collectionName}`, apiKey);
        totalProcessed += result.processedStories;
        totalTTSGenerated += result.ttsGenerated;
        totalErrors += result.errors;
      }
    }
    
    // AIMCS database has been migrated to ORBGAME and dropped
    console.log('\n✅ AIMCS database has been migrated to ORBGAME and dropped');
    
    console.log('\n📊 Final Results:');
    console.log(`📚 Total stories processed: ${totalProcessed}`);
    console.log(`🎵 TTS generated successfully: ${totalTTSGenerated}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log(`📈 Success rate: ${totalProcessed > 0 ? ((totalTTSGenerated / totalProcessed) * 100).toFixed(1) : 0}%`);
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
fetchAllStoriesAndGenerateTTS().catch(error => {
  console.error('💥 Script runner failed:', error.message);
  process.exit(1);
}); 