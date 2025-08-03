#!/usr/bin/env node
/**
 * Database Population Script for Orb Game Historical Figure Images
 * Populates MongoDB with real, validated images
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

class DatabasePopulationService {
    constructor() {
        this.mongoUri = process.env.MONGO_URI;
        this.dbName = 'orbgame';
        this.collectionName = 'historical_figure_images';
    }

    async connectToMongoDB() {
        try {
            const client = await MongoClient.connect(this.mongoUri);
            this.db = client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
            console.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            return false;
        }
    }

    async loadImageData(filename = 'real_image_results.json') {
        try {
            if (!fs.existsSync(filename)) {
                console.warn(`⚠️ Image data file ${filename} not found`);
                return [];
            }

            const data = fs.readFileSync(filename, 'utf8');
            const results = JSON.parse(data);
            
            console.log(`📁 Loaded image data for ${results.figures?.length || 0} figures`);
            return results.figures || [];
        } catch (error) {
            console.error('Error loading image data:', error);
            return [];
        }
    }

    async validateImageData(figureData) {
        const validatedData = [];
        let validCount = 0;
        let invalidCount = 0;

        for (const figure of figureData) {
            const validatedFigure = {
                figureName: figure.figureName,
                category: figure.category,
                epoch: figure.epoch,
                images: {
                    portraits: [],
                    achievements: [],
                    inventions: [],
                    artifacts: []
                },
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    validationStatus: 'validated',
                    sourceCount: 0
                }
            };

            // Validate each image type
            for (const imageType of ['portraits', 'achievements', 'inventions', 'artifacts']) {
                const images = figure.images[imageType] || [];
                
                for (const image of images) {
                    if (this.isValidImageData(image)) {
                        validatedFigure.images[imageType].push({
                            ...image,
                            validatedAt: new Date(),
                            validationStatus: 'valid'
                        });
                        validatedFigure.metadata.sourceCount++;
                    } else {
                        console.warn(`⚠️ Invalid image data for ${figure.figureName} (${imageType}): ${image.url}`);
                        invalidCount++;
                    }
                }
            }

            if (validatedFigure.metadata.sourceCount > 0) {
                validatedData.push(validatedFigure);
                validCount++;
            } else {
                console.warn(`⚠️ No valid images found for ${figure.figureName}`);
                invalidCount++;
            }
        }

        console.log(`✅ Validated ${validCount} figures with valid images`);
        console.log(`❌ Found ${invalidCount} figures with invalid or missing images`);

        return validatedData;
    }

    isValidImageData(image) {
        // Basic validation of image data structure
        return image && 
               image.url && 
               typeof image.url === 'string' && 
               image.url.startsWith('http') &&
               image.source &&
               image.licensing &&
               image.reliability;
    }

    async populateDatabase(validatedData) {
        try {
            console.log('🗄️ Populating database...');
            
            let insertedCount = 0;
            let updatedCount = 0;
            let errorCount = 0;

            for (const figureData of validatedData) {
                try {
                    // Check if figure already exists
                    const existingFigure = await this.collection.findOne({
                        figureName: figureData.figureName,
                        category: figureData.category,
                        epoch: figureData.epoch
                    });

                    if (existingFigure) {
                        // Update existing figure
                        await this.collection.updateOne(
                            { _id: existingFigure._id },
                            {
                                $set: {
                                    images: figureData.images,
                                    metadata: {
                                        ...existingFigure.metadata,
                                        updatedAt: new Date(),
                                        validationStatus: 'updated'
                                    }
                                }
                            }
                        );
                        updatedCount++;
                        console.log(`🔄 Updated: ${figureData.figureName}`);
                    } else {
                        // Insert new figure
                        await this.collection.insertOne(figureData);
                        insertedCount++;
                        console.log(`➕ Inserted: ${figureData.figureName}`);
                    }
                } catch (error) {
                    console.error(`❌ Error processing ${figureData.figureName}:`, error);
                    errorCount++;
                }
            }

            console.log(`\n📊 Database Population Summary:`);
            console.log(`  ✅ Inserted: ${insertedCount} figures`);
            console.log(`  🔄 Updated: ${updatedCount} figures`);
            console.log(`  ❌ Errors: ${errorCount} figures`);

            return { insertedCount, updatedCount, errorCount };
        } catch (error) {
            console.error('Error populating database:', error);
            return { insertedCount: 0, updatedCount: 0, errorCount: 1 };
        }
    }

    async removeMockData() {
        try {
            console.log('🧹 Removing mock/placeholder images...');
            
            const result = await this.collection.updateMany(
                {
                    $or: [
                        { 'images.portraits.url': { $regex: /example\.com/ } },
                        { 'images.portraits.url': { $regex: /placeholder/ } },
                        { 'images.portraits.url': { $regex: /mock/ } }
                    ]
                },
                {
                    $set: {
                        'images.portraits': [],
                        'metadata.validationStatus': 'mock_removed'
                    }
                }
            );

            console.log(`✅ Removed mock data from ${result.modifiedCount} figures`);
            return result.modifiedCount;
        } catch (error) {
            console.error('Error removing mock data:', error);
            return 0;
        }
    }

    async createIndexes() {
        try {
            console.log('🔍 Creating database indexes...');
            
            await this.collection.createIndex({ figureName: 1, category: 1, epoch: 1 });
            await this.collection.createIndex({ 'metadata.validationStatus': 1 });
            await this.collection.createIndex({ 'metadata.updatedAt': 1 });
            await this.collection.createIndex({ 'images.portraits.source': 1 });
            
            console.log('✅ Database indexes created');
        } catch (error) {
            console.error('Error creating indexes:', error);
        }
    }

    async generateStatistics() {
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFigures: { $sum: 1 },
                        figuresWithPortraits: {
                            $sum: { $cond: [{ $gt: [{ $size: "$images.portraits" }, 0] }, 1, 0] }
                        },
                        figuresWithAchievements: {
                            $sum: { $cond: [{ $gt: [{ $size: "$images.achievements" }, 0] }, 1, 0] }
                        },
                        figuresWithInventions: {
                            $sum: { $cond: [{ $gt: [{ $size: "$images.inventions" }, 0] }, 1, 0] }
                        },
                        figuresWithArtifacts: {
                            $sum: { $cond: [{ $gt: [{ $size: "$images.artifacts" }, 0] }, 1, 0] }
                        },
                        totalImages: {
                            $sum: {
                                $add: [
                                    { $size: "$images.portraits" },
                                    { $size: "$images.achievements" },
                                    { $size: "$images.inventions" },
                                    { $size: "$images.artifacts" }
                                ]
                            }
                        }
                    }
                }
            ]).toArray();

            return stats[0] || {
                totalFigures: 0,
                figuresWithPortraits: 0,
                figuresWithAchievements: 0,
                figuresWithInventions: 0,
                figuresWithArtifacts: 0,
                totalImages: 0
            };
        } catch (error) {
            console.error('Error generating statistics:', error);
            return null;
        }
    }

    async run() {
        console.log('🚀 Starting Database Population Process...');
        
        // Connect to MongoDB
        const connected = await this.connectToMongoDB();
        if (!connected) {
            console.error('❌ Cannot proceed without database connection');
            return;
        }

        // Create indexes
        await this.createIndexes();

        // Load image data
        const imageData = await this.loadImageData();
        if (imageData.length === 0) {
            console.log('⚠️ No image data found. Please run the real image retrieval script first.');
            return;
        }

        // Validate image data
        console.log('🔍 Validating image data...');
        const validatedData = await this.validateImageData(imageData);

        if (validatedData.length === 0) {
            console.log('❌ No valid image data found');
            return;
        }

        // Remove mock data
        await this.removeMockData();

        // Populate database
        const populationResults = await this.populateDatabase(validatedData);

        // Generate final statistics
        console.log('\n📊 Final Statistics:');
        const finalStats = await this.generateStatistics();
        
        if (finalStats) {
            console.log(`Total Figures: ${finalStats.totalFigures}`);
            console.log(`Figures with Portraits: ${finalStats.figuresWithPortraits}`);
            console.log(`Figures with Achievements: ${finalStats.figuresWithAchievements}`);
            console.log(`Figures with Inventions: ${finalStats.figuresWithInventions}`);
            console.log(`Figures with Artifacts: ${finalStats.figuresWithArtifacts}`);
            console.log(`Total Images: ${finalStats.totalImages}`);
        }

        console.log('\n✅ Database population completed successfully!');
    }
}

// CLI interface
async function main() {
    const service = new DatabasePopulationService();
    await service.run();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = DatabasePopulationService; 