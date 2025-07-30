import { MongoClient } from 'mongodb';

class HistoricalFiguresImageService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.mongoUri = null;
    }

    async connect(mongoUri = null) {
        try {
            // Use provided mongoUri or fall back to environment variable
            this.mongoUri = mongoUri || process.env.MONGO_URI;
            
            if (!this.mongoUri) {
                throw new Error('MongoDB URI not provided and MONGO_URI environment variable not set');
            }
            
            this.client = new MongoClient(this.mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            await this.client.connect();
            this.db = this.client.db('orbgame');
            this.collection = this.db.collection('historical_figure_images');
            
            // Create indexes for efficient querying
            await this.collection.createIndex({ figureName: 1, category: 1, epoch: 1 });
            await this.collection.createIndex({ contentType: 1 });
            await this.collection.createIndex({ source: 1 });
            await this.collection.createIndex({ createdAt: 1 });
            await this.collection.createIndex({ permalink: 1 });
            
            console.log('Historical Figures Image Service connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB for image service:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
        }
    }

    /**
     * Store image data for a historical figure with permalinks
     */
    async storeFigureImages(figureData) {
        try {
            const {
                figureName,
                category,
                epoch,
                portraits = {},
                achievements = {},
                inventions = {},
                artifacts = {}
            } = figureData;

            const imageData = {
                figureName,
                category,
                epoch,
                portraits: this.processImageData(portraits),
                achievements: this.processImageData(achievements),
                inventions: this.processImageData(inventions),
                artifacts: this.processImageData(artifacts),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Upsert to avoid duplicates
            const result = await this.collection.updateOne(
                { figureName, category, epoch },
                { $set: imageData },
                { upsert: true }
            );

            console.log(`Stored images for ${figureName} (${category}/${epoch})`);
            return result;
        } catch (error) {
            console.error('Error storing figure images:', error);
            throw error;
        }
    }

    /**
     * Process raw image data from sources into structured format with permalinks
     */
    processImageData(rawData) {
        const processed = [];
        
        for (const [sourceName, sourceData] of Object.entries(rawData)) {
            if (sourceData.urls && Array.isArray(sourceData.urls)) {
                sourceData.urls.forEach((url, index) => {
                    const permalink = this.generatePermalink(sourceName, url, sourceData.searchTerm);
                    processed.push({
                        url,
                        permalink,
                        source: sourceName,
                        licensing: sourceData.licensing || 'Unknown',
                        reliability: sourceData.reliability || 'Medium',
                        searchTerm: sourceData.searchTerm || '',
                        priority: this.calculatePriority(sourceName, sourceData.reliability),
                        index,
                        lastAccessed: new Date(),
                        accessCount: 0
                    });
                });
            }
        }

        // Sort by priority (highest first)
        return processed.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Generate permalink for source image
     */
    generatePermalink(sourceName, url, searchTerm) {
        const timestamp = Date.now();
        const urlHash = this.hashString(url);
        return `${sourceName.toLowerCase().replace(/\s+/g, '-')}-${searchTerm?.replace(/\s+/g, '-') || 'image'}-${urlHash}-${timestamp}`;
    }

    /**
     * Simple hash function for URLs
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Calculate priority score for image selection
     */
    calculatePriority(sourceName, reliability) {
        let priority = 0;
        
        // Source priority
        const sourcePriority = {
            'Wikimedia Commons': 100,
            'Library of Congress (PPOC, Brady‑Handy)': 95,
            'NYPL Free to Use Collections': 90,
            'Web Gallery of Art': 85,
            'Frick Photoarchive': 80,
            'Metropolitan Museum': 75,
            'Smithsonian Collections': 70,
            'Getty Museum': 65,
            'British Library': 60,
            'Internet Archive': 55,
            'Public Domain Archive': 50,
            'Google Arts & Culture': 45,
            'Europeana': 40,
            'Rijksmuseum': 35,
            'National Archives': 30,
            'NASA Images': 25,
            'LookAndLearn, PxHere, Dreamstime CC0': 20,
            'Unsplash': 15
        };

        priority += sourcePriority[sourceName] || 10;

        // Reliability bonus
        if (reliability === 'High') priority += 20;
        else if (reliability === 'Medium') priority += 10;

        return priority;
    }

    /**
     * Get images for a specific figure and content type
     */
    async getFigureImages(figureName, category, epoch, contentType = 'portraits') {
        try {
            const figure = await this.collection.findOne({
                figureName,
                category,
                epoch
            });

            if (!figure || !figure[contentType]) {
                return null;
            }

            // Update access statistics
            await this.updateAccessStats(figureName, category, epoch, contentType);

            return figure[contentType];
        } catch (error) {
            console.error('Error getting figure images:', error);
            throw error;
        }
    }

    /**
     * Update access statistics for images
     */
    async updateAccessStats(figureName, category, epoch, contentType) {
        try {
            await this.collection.updateOne(
                { figureName, category, epoch },
                {
                    $inc: { [`${contentType}.$[].accessCount`]: 1 },
                    $set: { [`${contentType}.$[].lastAccessed`]: new Date() }
                }
            );
        } catch (error) {
            console.error('Error updating access stats:', error);
        }
    }

    /**
     * Get best image for a figure (highest priority)
     */
    async getBestImage(figureName, category, epoch, contentType = 'portraits') {
        try {
            const images = await this.getFigureImages(figureName, category, epoch, contentType);
            
            if (!images || images.length === 0) {
                return null;
            }

            // Return the highest priority image
            return images[0];
        } catch (error) {
            console.error('Error getting best image:', error);
            throw error;
        }
    }

    /**
     * Get multiple images for a figure (for gallery view)
     */
    async getFigureGallery(figureName, category, epoch, limit = 5) {
        try {
            const allImages = [];
            const contentTypes = ['portraits', 'achievements', 'inventions', 'artifacts'];

            for (const contentType of contentTypes) {
                const images = await this.getFigureImages(figureName, category, epoch, contentType);
                if (images && images.length > 0) {
                    allImages.push(...images.slice(0, Math.ceil(limit / contentTypes.length)));
                }
            }

            // Sort by priority and return top images
            return allImages
                .sort((a, b) => b.priority - a.priority)
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting figure gallery:', error);
            throw error;
        }
    }

    /**
     * Asynchronously populate images for a story after it's loaded
     */
    async populateImagesForStory(story, category, epoch) {
        try {
            const figureName = this.extractFigureName(story);
            
            if (!figureName) {
                console.log('No figure name extracted from story');
                return null;
            }

            // Check if we already have images for this figure
            const existingImages = await this.getFigureImages(figureName, category, epoch, 'portraits');
            
            if (existingImages && existingImages.length > 0) {
                console.log(`Found existing images for ${figureName}`);
                return {
                    figureName,
                    images: {
                        portrait: existingImages[0],
                        gallery: await this.getFigureGallery(figureName, category, epoch, 3)
                    }
                };
            }

            // If no images exist, trigger background image search
            console.log(`No images found for ${figureName}, triggering background search...`);
            this.triggerBackgroundImageSearch(figureName, category, epoch);
            
            return null;
        } catch (error) {
            console.error('Error populating images for story:', error);
            return null;
        }
    }

    /**
     * Extract figure name from story content
     */
    extractFigureName(story) {
        try {
            // Try to extract from headline first
            if (story.headline) {
                // Look for common patterns in headlines
                const patterns = [
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // First words starting with capital
                    /(?:about|story of|tale of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:and|&)\s+his/i,
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:and|&)\s+her/i
                ];

                for (const pattern of patterns) {
                    const match = story.headline.match(pattern);
                    if (match && match[1]) {
                        return match[1].trim();
                    }
                }
            }

            // Try to extract from content
            if (story.content) {
                // Look for names in the first few sentences
                const firstSentence = story.content.split('.')[0];
                const namePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
                const match = firstSentence.match(namePattern);
                if (match && match[1]) {
                    return match[1].trim();
                }
            }

            return null;
        } catch (error) {
            console.error('Error extracting figure name:', error);
            return null;
        }
    }

    /**
     * Trigger background image search (non-blocking)
     */
    async triggerBackgroundImageSearch(figureName, category, epoch) {
        try {
            // This would typically call the Python script or external image search service
            console.log(`Background image search triggered for ${figureName} (${category}/${epoch})`);
            
            // For now, we'll simulate this by checking if we have sample data
            const sampleData = await this.checkForSampleData(figureName, category, epoch);
            if (sampleData) {
                await this.storeFigureImages(sampleData);
                console.log(`Sample images stored for ${figureName}`);
            }
        } catch (error) {
            console.error('Error in background image search:', error);
        }
    }

    /**
     * Check for sample data for a figure
     */
    async checkForSampleData(figureName, category, epoch) {
        // This would check if we have sample data available
        // For now, return null to indicate no sample data
        return null;
    }

    /**
     * Get image by permalink
     */
    async getImageByPermalink(permalink) {
        try {
            const result = await this.collection.findOne({
                $or: [
                    { 'portraits.permalink': permalink },
                    { 'achievements.permalink': permalink },
                    { 'inventions.permalink': permalink },
                    { 'artifacts.permalink': permalink }
                ]
            });

            if (!result) {
                return null;
            }

            // Find the specific image with this permalink
            const allImages = [
                ...(result.portraits || []),
                ...(result.achievements || []),
                ...(result.inventions || []),
                ...(result.artifacts || [])
            ];

            return allImages.find(img => img.permalink === permalink);
        } catch (error) {
            console.error('Error getting image by permalink:', error);
            throw error;
        }
    }

    /**
     * Get most accessed images
     */
    async getMostAccessedImages(limit = 10) {
        try {
            const result = await this.collection.aggregate([
                {
                    $project: {
                        allImages: {
                            $concatArrays: [
                                { $ifNull: ['$portraits', []] },
                                { $ifNull: ['$achievements', []] },
                                { $ifNull: ['$inventions', []] },
                                { $ifNull: ['$artifacts', []] }
                            ]
                        }
                    }
                },
                { $unwind: '$allImages' },
                { $sort: { 'allImages.accessCount': -1 } },
                { $limit: limit },
                {
                    $group: {
                        _id: null,
                        images: { $push: '$allImages' }
                    }
                }
            ]).toArray();

            return result[0]?.images || [];
        } catch (error) {
            console.error('Error getting most accessed images:', error);
            throw error;
        }
    }

    /**
     * Bulk import image data from JSON file
     */
    async importImageData(jsonFilePath) {
        try {
            const fs = require('fs');
            const imageData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            
            let imported = 0;
            let errors = 0;

            for (const [figureName, figureData] of Object.entries(imageData)) {
                try {
                    // Extract category and epoch from the data structure
                    // This assumes the data is organized by category/epoch
                    for (const [category, epochs] of Object.entries(figureData)) {
                        if (typeof epochs === 'object' && epochs !== null) {
                            for (const [epoch, figures] of Object.entries(epochs)) {
                                if (Array.isArray(figures)) {
                                    for (const figure of figures) {
                                        if (figure.name === figureName) {
                                            await this.storeFigureImages({
                                                figureName,
                                                category,
                                                epoch,
                                                ...figure
                                            });
                                            imported++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error importing ${figureName}:`, error);
                    errors++;
                }
            }

            console.log(`Import completed: ${imported} figures imported, ${errors} errors`);
            return { imported, errors };
        } catch (error) {
            console.error('Error importing image data:', error);
            throw error;
        }
    }

    /**
     * Get statistics about stored images
     */
    async getImageStats() {
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFigures: { $sum: 1 },
                        totalImages: {
                            $sum: {
                                $add: [
                                    { $size: { $ifNull: ['$portraits', []] } },
                                    { $size: { $ifNull: ['$achievements', []] } },
                                    { $size: { $ifNull: ['$inventions', []] } },
                                    { $size: { $ifNull: ['$artifacts', []] } }
                                ]
                            }
                        }
                    }
                }
            ]).toArray();

            const sourceStats = await this.collection.aggregate([
                {
                    $project: {
                        allImages: {
                            $concatArrays: [
                                { $ifNull: ['$portraits', []] },
                                { $ifNull: ['$achievements', []] },
                                { $ifNull: ['$inventions', []] },
                                { $ifNull: ['$artifacts', []] }
                            ]
                        }
                    }
                },
                { $unwind: '$allImages' },
                {
                    $group: {
                        _id: '$allImages.source',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray();

            return {
                figures: stats[0]?.totalFigures || 0,
                images: stats[0]?.totalImages || 0,
                sources: sourceStats
            };
        } catch (error) {
            console.error('Error getting image stats:', error);
            throw error;
        }
    }

    /**
     * Clean up old or invalid image data
     */
    async cleanupImages() {
        try {
            const result = await this.collection.deleteMany({
                $or: [
                    { portraits: { $size: 0 } },
                    { achievements: { $size: 0 } },
                    { inventions: { $size: 0 } },
                    { artifacts: { $size: 0 } }
                ]
            });

            console.log(`Cleaned up ${result.deletedCount} empty image records`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up images:', error);
            throw error;
        }
    }
}

export default HistoricalFiguresImageService; 