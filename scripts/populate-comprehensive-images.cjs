#!/usr/bin/env node
/**
 * Comprehensive Image Database Population Script
 * Populates MongoDB with all image types for historical figures
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

class ComprehensiveImagePopulationService {
    constructor(mongoUri) {
        this.mongoUri = mongoUri;
        this.client = null;
        this.db = null;
        this.collection = null;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.mongoUri);
            await this.client.connect();
            this.db = this.client.db('orbgame');
            this.collection = this.db.collection('historical_figure_images');
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Disconnected from MongoDB');
        }
    }

    loadImageData(filename) {
        try {
            const data = fs.readFileSync(filename, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ Error loading image data from ${filename}:`, error);
            throw error;
        }
    }

    transformImageData(figureData) {
        // Transform the comprehensive image data into the format expected by the frontend
        const transformed = {
            figureName: figureData.figureName,
            category: figureData.category,
            epoch: figureData.epoch,
            images: {
                portrait: figureData.images.portraits[0] || null,
                gallery: []
            }
        };

        // Add all images to gallery array
        const allImages = [];
        
        // Add portraits
        if (figureData.images.portraits && figureData.images.portraits.length > 0) {
            allImages.push(...figureData.images.portraits);
        }
        
        // Add achievements
        if (figureData.images.achievements && figureData.images.achievements.length > 0) {
            allImages.push(...figureData.images.achievements);
        }
        
        // Add inventions
        if (figureData.images.inventions && figureData.images.inventions.length > 0) {
            allImages.push(...figureData.images.inventions);
        }
        
        // Add artifacts
        if (figureData.images.artifacts && figureData.images.artifacts.length > 0) {
            allImages.push(...figureData.images.artifacts);
        }

        transformed.images.gallery = allImages;

        return transformed;
    }

    async populateDatabase(imageData) {
        console.log('🔄 Starting comprehensive image database population...');
        
        const results = {
            total: imageData.figures.length,
            processed: 0,
            updated: 0,
            inserted: 0,
            errors: 0,
            imageTypes: {
                portraits: 0,
                achievements: 0,
                inventions: 0,
                artifacts: 0
            }
        };

        for (const figure of imageData.figures) {
            try {
                console.log(`Processing ${figure.figureName}...`);
                
                const transformedData = this.transformImageData(figure);
                
                // Check if figure already exists
                const existing = await this.collection.findOne({ 
                    figureName: figure.figureName 
                });

                if (existing) {
                    // Update existing record
                    await this.collection.updateOne(
                        { figureName: figure.figureName },
                        { 
                            $set: {
                                images: transformedData.images,
                                category: figure.category,
                                epoch: figure.epoch,
                                lastUpdated: new Date()
                            }
                        }
                    );
                    results.updated++;
                    console.log(`✅ Updated ${figure.figureName}`);
                } else {
                    // Insert new record
                    await this.collection.insertOne({
                        figureName: figure.figureName,
                        category: figure.category,
                        epoch: figure.epoch,
                        images: transformedData.images,
                        createdAt: new Date(),
                        lastUpdated: new Date()
                    });
                    results.inserted++;
                    console.log(`✅ Inserted ${figure.figureName}`);
                }

                // Count image types
                if (figure.images.portraits && figure.images.portraits.length > 0) {
                    results.imageTypes.portraits++;
                }
                if (figure.images.achievements && figure.images.achievements.length > 0) {
                    results.imageTypes.achievements++;
                }
                if (figure.images.inventions && figure.images.inventions.length > 0) {
                    results.imageTypes.inventions++;
                }
                if (figure.images.artifacts && figure.images.artifacts.length > 0) {
                    results.imageTypes.artifacts++;
                }

                results.processed++;

                // Progress update
                if (results.processed % 10 === 0) {
                    console.log(`Progress: ${results.processed}/${results.total} figures processed`);
                }

            } catch (error) {
                console.error(`❌ Error processing ${figure.figureName}:`, error);
                results.errors++;
            }
        }

        return results;
    }

    async createIndexes() {
        try {
            await this.collection.createIndex({ figureName: 1 });
            await this.collection.createIndex({ category: 1 });
            await this.collection.createIndex({ epoch: 1 });
            console.log('✅ Database indexes created');
        } catch (error) {
            console.error('❌ Error creating indexes:', error);
        }
    }

    async getStatistics() {
        try {
            const totalFigures = await this.collection.countDocuments();
            const figuresWithImages = await this.collection.countDocuments({
                'images.portrait': { $exists: true, $ne: null }
            });
            const figuresWithGallery = await this.collection.countDocuments({
                'images.gallery': { $exists: true, $ne: [] }
            });

            return {
                totalFigures,
                figuresWithImages,
                figuresWithGallery,
                coverage: figuresWithImages / totalFigures * 100
            };
        } catch (error) {
            console.error('❌ Error getting statistics:', error);
            return null;
        }
    }
}

async function main() {
    console.log('🚀 Starting Comprehensive Image Database Population');
    
    // Get MongoDB URI from environment or Azure Key Vault
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        try {
            const { execSync } = require('child_process');
            mongoUri = execSync('az keyvault secret show --name MONGO-URI --vault-name orb-game-kv-eastus2 --query value -o tsv', { encoding: 'utf8' }).trim();
            console.log('✅ Retrieved MongoDB URI from Azure Key Vault');
        } catch (error) {
            console.error('❌ Could not retrieve MongoDB URI:', error);
            process.exit(1);
        }
    }

    const service = new ComprehensiveImagePopulationService(mongoUri);
    
    try {
        await service.connect();
        
        // Load image data
        const imageData = service.loadImageData('bing_image_results_fixed.json');
        console.log(`📊 Loaded image data for ${imageData.figures.length} figures`);
        
        // Create indexes
        await service.createIndexes();
        
        // Populate database
        const results = await service.populateDatabase(imageData);
        
        // Get final statistics
        const stats = await service.getStatistics();
        
        // Print results
        console.log('\n=== COMPREHENSIVE IMAGE POPULATION RESULTS ===');
        console.log(`Total figures processed: ${results.processed}`);
        console.log(`Figures updated: ${results.updated}`);
        console.log(`Figures inserted: ${results.inserted}`);
        console.log(`Errors: ${results.errors}`);
        
        console.log('\nImage types added:');
        console.log(`  Portraits: ${results.imageTypes.portraits}`);
        console.log(`  Achievements: ${results.imageTypes.achievements}`);
        console.log(`  Inventions: ${results.imageTypes.inventions}`);
        console.log(`  Artifacts: ${results.imageTypes.artifacts}`);
        
        if (stats) {
            console.log('\nDatabase statistics:');
            console.log(`  Total figures in database: ${stats.totalFigures}`);
            console.log(`  Figures with images: ${stats.figuresWithImages}`);
            console.log(`  Figures with gallery: ${stats.figuresWithGallery}`);
            console.log(`  Coverage: ${stats.coverage.toFixed(1)}%`);
        }
        
        console.log('\n✅ Comprehensive image population completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during population:', error);
        process.exit(1);
    } finally {
        await service.disconnect();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ComprehensiveImagePopulationService; 