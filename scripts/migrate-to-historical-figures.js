import { MongoClient } from 'mongodb';
import { HistoricalFiguresService, HistoricalFigureStory, HistoricalFigureAudio, HistoricalFigureImage } from '../backend/historical-figures-service-new.js';

/**
 * Migration script to move from positive-news-service to historical-figures-service
 * This separates text, audio, and images into different collections for better performance
 */
class HistoricalFiguresMigration {
  constructor(mongoUri, dbName = 'orbgame') {
    this.mongoUri = mongoUri;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
    
    // Old collections
    this.oldStories = null;
    
    // New service
    this.newService = new HistoricalFiguresService(mongoUri, dbName);
  }

  async initialize() {
    try {
      this.client = new MongoClient(this.mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: false,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      
      // Connect to old collection
      this.oldStories = this.db.collection('positive_news_stories');
      
      console.log('✅ Migration service initialized');
    } catch (error) {
      console.error('❌ Migration service initialization failed:', error.message);
      throw error;
    }
  }

  async close() {
    await this.client.close();
  }

  /**
   * Migrate existing historical figure stories to new structure
   */
  async migrateHistoricalFigureStories() {
    try {
      console.log('🔄 Starting migration of historical figure stories...');
      
      // Get all historical figure stories from old collection
      const oldStories = await this.oldStories.find({ 
        storyType: 'historical-figure' 
      }).toArray();
      
      console.log(`📚 Found ${oldStories.length} historical figure stories to migrate`);
      
      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const oldStory of oldStories) {
        try {
          // Check if story already exists in new collection
          const existingStory = await this.newService.stories.findOne({
            historicalFigure: oldStory.historicalFigure,
            category: oldStory.category,
            epoch: oldStory.epoch,
            language: oldStory.language
          });
          
          if (existingStory) {
            console.log(`⏭️ Skipping ${oldStory.historicalFigure} - already exists`);
            skippedCount++;
            continue;
          }
          
          // Create new story document
          const newStory = new HistoricalFigureStory({
            historicalFigure: oldStory.historicalFigure,
            category: oldStory.category,
            epoch: oldStory.epoch,
            language: oldStory.language,
            headline: oldStory.headline,
            summary: oldStory.summary,
            fullText: oldStory.fullText,
            source: oldStory.source,
            publishedAt: oldStory.publishedAt,
            createdAt: oldStory.createdAt,
            lastUsed: oldStory.lastUsed,
            useCount: oldStory.useCount
          });
          
          // Store story in new collection
          await this.newService.stories.insertOne(newStory);
          
          // Migrate audio if it exists
          if (oldStory.ttsAudio) {
            const audio = new HistoricalFigureAudio({
              storyId: newStory.id,
              historicalFigure: newStory.historicalFigure,
              category: newStory.category,
              epoch: newStory.epoch,
              language: newStory.language,
              audioData: oldStory.ttsAudio,
              audioLength: oldStory.ttsAudio.length,
              generatedAt: oldStory.ttsGeneratedAt || new Date().toISOString()
            });
            
            await this.newService.audio.insertOne(audio);
            
            // Update story to indicate it has audio
            await this.newService.stories.updateOne(
              { _id: newStory._id },
              { $set: { hasAudio: true, audioId: audio.id } }
            );
          }
          
          // Migrate images if they exist
          if (oldStory.images && (oldStory.images.portrait || oldStory.images.gallery)) {
            const imageDocuments = [];
            
            if (oldStory.images.portrait) {
              imageDocuments.push(new HistoricalFigureImage({
                storyId: newStory.id,
                historicalFigure: newStory.historicalFigure,
                category: newStory.category,
                epoch: newStory.epoch,
                imageType: 'portrait',
                imageUrl: oldStory.images.portrait.url,
                source: oldStory.images.portrait.source,
                licensing: oldStory.images.portrait.licensing,
                permalink: oldStory.images.portrait.permalink,
                searchTerm: oldStory.images.portrait.searchTerm
              }));
            }
            
            if (oldStory.images.gallery && Array.isArray(oldStory.images.gallery)) {
              oldStory.images.gallery.forEach(img => {
                imageDocuments.push(new HistoricalFigureImage({
                  storyId: newStory.id,
                  historicalFigure: newStory.historicalFigure,
                  category: newStory.category,
                  epoch: newStory.epoch,
                  imageType: 'gallery',
                  imageUrl: img.url,
                  source: img.source,
                  licensing: img.licensing,
                  permalink: img.permalink,
                  searchTerm: img.searchTerm
                }));
              });
            }
            
            if (imageDocuments.length > 0) {
              await this.newService.images.insertMany(imageDocuments);
              
              // Update story to indicate it has images
              await this.newService.stories.updateOne(
                { _id: newStory._id },
                { 
                  $set: { 
                    hasImages: true, 
                    imageIds: imageDocuments.map(img => img.id) 
                  } 
                }
              );
            }
          }
          
          migratedCount++;
          console.log(`✅ Migrated ${oldStory.historicalFigure} (${oldStory.category}-${oldStory.epoch}-${oldStory.language})`);
          
        } catch (error) {
          console.error(`❌ Failed to migrate ${oldStory.historicalFigure}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`\n📊 Migration Summary:`);
      console.log(`✅ Successfully migrated: ${migratedCount} stories`);
      console.log(`⏭️ Skipped (already exists): ${skippedCount} stories`);
      console.log(`❌ Failed migrations: ${errorCount} stories`);
      console.log(`📈 Success rate: ${((migratedCount / oldStories.length) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    }
  }

  /**
   * Generate missing audio for migrated stories
   */
  async generateMissingAudio() {
    try {
      console.log('🎵 Generating missing audio for migrated stories...');
      
      const storiesWithoutAudio = await this.newService.stories.find({
        hasAudio: false
      }).toArray();
      
      console.log(`📚 Found ${storiesWithoutAudio.length} stories without audio`);
      
      let generatedCount = 0;
      let errorCount = 0;
      
      for (const story of storiesWithoutAudio) {
        try {
          const audioData = await this.newService.generateTTS(story.fullText, story.language);
          if (audioData) {
            const audio = new HistoricalFigureAudio({
              storyId: story.id,
              historicalFigure: story.historicalFigure,
              category: story.category,
              epoch: story.epoch,
              language: story.language,
              audioData: audioData,
              audioLength: audioData.length
            });
            
            await this.newService.audio.insertOne(audio);
            
            // Update story to indicate it has audio
            await this.newService.stories.updateOne(
              { _id: story._id },
              { $set: { hasAudio: true, audioId: audio.id } }
            );
            
            generatedCount++;
            console.log(`✅ Generated audio for ${story.historicalFigure}`);
          }
        } catch (error) {
          console.error(`❌ Failed to generate audio for ${story.historicalFigure}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`\n🎵 Audio Generation Summary:`);
      console.log(`✅ Successfully generated: ${generatedCount} audio files`);
      console.log(`❌ Failed generations: ${errorCount} audio files`);
      
    } catch (error) {
      console.error('❌ Audio generation failed:', error.message);
    }
  }

  /**
   * Generate missing images for migrated stories
   */
  async generateMissingImages() {
    try {
      console.log('🖼️ Generating missing images for migrated stories...');
      
      const storiesWithoutImages = await this.newService.stories.find({
        hasImages: false
      }).toArray();
      
      console.log(`📚 Found ${storiesWithoutImages.length} stories without images`);
      
      let generatedCount = 0;
      let errorCount = 0;
      
      for (const story of storiesWithoutImages) {
        try {
          const figure = { name: story.historicalFigure };
          const images = await this.newService.generateImages(figure, story.category, story.epoch);
          
          if (images.length > 0) {
            const imageDocuments = images.map((img, index) => new HistoricalFigureImage({
              storyId: story.id,
              historicalFigure: story.historicalFigure,
              category: story.category,
              epoch: story.epoch,
              imageType: index === 0 ? 'portrait' : 'gallery',
              imageUrl: img.url,
              source: img.source,
              licensing: img.licensing,
              permalink: img.permalink,
              searchTerm: img.searchTerm
            }));
            
            await this.newService.images.insertMany(imageDocuments);
            
            // Update story to indicate it has images
            await this.newService.stories.updateOne(
              { _id: story._id },
              { 
                $set: { 
                  hasImages: true, 
                  imageIds: imageDocuments.map(img => img.id) 
                } 
              }
            );
            
            generatedCount++;
            console.log(`✅ Generated ${images.length} images for ${story.historicalFigure}`);
          }
        } catch (error) {
          console.error(`❌ Failed to generate images for ${story.historicalFigure}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`\n🖼️ Image Generation Summary:`);
      console.log(`✅ Successfully generated: ${generatedCount} image sets`);
      console.log(`❌ Failed generations: ${errorCount} image sets`);
      
    } catch (error) {
      console.error('❌ Image generation failed:', error.message);
    }
  }

  /**
   * Verify migration results
   */
  async verifyMigration() {
    try {
      console.log('🔍 Verifying migration results...');
      
      const oldCount = await this.oldStories.countDocuments({ storyType: 'historical-figure' });
      const newCount = await this.newService.stories.countDocuments();
      const audioCount = await this.newService.audio.countDocuments();
      const imageCount = await this.newService.images.countDocuments();
      
      console.log(`📊 Migration Verification:`);
      console.log(`📚 Old stories: ${oldCount}`);
      console.log(`📚 New stories: ${newCount}`);
      console.log(`🎵 Audio files: ${audioCount}`);
      console.log(`🖼️ Image files: ${imageCount}`);
      
      const storiesWithAudio = await this.newService.stories.countDocuments({ hasAudio: true });
      const storiesWithImages = await this.newService.stories.countDocuments({ hasImages: true });
      
      console.log(`🎵 Stories with audio: ${storiesWithAudio}`);
      console.log(`🖼️ Stories with images: ${storiesWithImages}`);
      
      if (newCount >= oldCount) {
        console.log('✅ Migration verification successful!');
      } else {
        console.log('⚠️ Migration verification incomplete - some stories may be missing');
      }
      
    } catch (error) {
      console.error('❌ Migration verification failed:', error.message);
    }
  }

  /**
   * Run complete migration
   */
  async runCompleteMigration() {
    try {
      console.log('🚀 Starting complete migration to Historical Figures Service...');
      
      // Initialize new service
      await this.newService.initialize();
      
      // Migrate stories
      await this.migrateHistoricalFigureStories();
      
      // Generate missing media
      await this.generateMissingAudio();
      await this.generateMissingImages();
      
      // Verify results
      await this.verifyMigration();
      
      console.log('🎉 Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    } finally {
      await this.close();
      await this.newService.close();
    }
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI environment variable is required');
    process.exit(1);
  }
  
  const migration = new HistoricalFiguresMigration(mongoUri);
  migration.runCompleteMigration().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export { HistoricalFiguresMigration }; 