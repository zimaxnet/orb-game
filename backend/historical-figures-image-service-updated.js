import { MongoClient } from 'mongodb';

class UpdatedImageService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.mongoUri = null;
        
        // Updated image database with blob storage URLs
        this.imageDatabase = {
        };
        
        // Category fallbacks (unchanged)
        this.categoryFallbacks = {
            'Technology': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzQyYzNmIi8+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjaG5vbG9neTwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Science': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhNzNhOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNjaWVuY2U8L3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Art': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzOTNmMyIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFydDwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Sports': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzRjYWY1MCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwb3J0czwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Music': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1NzNhMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk11c2ljPC90ZXh0Pjwvc3ZnPg==',
                gallery: []
            },
            'Space': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0M2E0MCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwYWNlPC90ZXh0Pjwvc3ZnPg==',
                gallery: []
            },
            'Nature': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzQyYzM4MyIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5hdHVyZTwvL3RleHQ+PC9zdmc+',
                gallery: []
            },
            'Innovation': {
                portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1NzNhMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklubm92YXRpb248L3RleHQ+PC9zdmc+',
                gallery: []
            }
        };
    }

    // ... rest of the service methods remain the same ...
    async connect(mongoUri = null) {
        try {
            this.mongoUri = mongoUri || process.env.MONGO_URI;
            if (!this.mongoUri) {
                console.log('⚠️ No MongoDB URI provided, running in memory-only mode');
                return;
            }

            this.client = new MongoClient(this.mongoUri, {
                tls: true,
                tlsAllowInvalidCertificates: false,
            });
            await this.client.connect();
            this.db = this.client.db('orbgame');
            this.collection = this.db.collection('historical_figures_images');
            
            // Create indexes
            await this.collection.createIndex({ figureName: 1 });
            await this.collection.createIndex({ category: 1 });
            await this.collection.createIndex({ epoch: 1 });
            await this.collection.createIndex({ createdAt: 1 });
            
            console.log('✅ Updated Image Service connected to MongoDB');
        } catch (error) {
            console.error('❌ Updated Image Service connection failed:', error.message);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Updated Image Service disconnected');
        }
    }

    extractFigureName(story) {
        if (story.historicalFigure) return story.historicalFigure;
        if (story.figureName) return story.figureName;
        if (story.headline) {
            const colonIndex = story.headline.indexOf(':');
            if (colonIndex > 0) {
                return story.headline.substring(0, colonIndex).trim();
            }
            return story.headline.trim();
        }
        return null;
    }

    getFigureImages(figureName) {
        if (!figureName) return null;
        
        const normalizedName = this.normalizeFigureName(figureName);
        return this.imageDatabase[normalizedName] || null;
    }

    normalizeFigureName(name) {
        if (!name) return '';
        
        let normalized = name.trim();
        
        // Handle common variations
        const variations = {
            'Johannes Gutenberg': 'Johannes Gutenberg',
            'Gutenberg': 'Johannes Gutenberg',
            'Tim Berners-Lee': 'Tim Berners-Lee',
            'Berners-Lee': 'Tim Berners-Lee',
            'Grace Hopper': 'Grace Hopper',
            'Alan Turing': 'Alan Turing',
            'Albert Einstein': 'Albert Einstein',
            'Einstein': 'Albert Einstein',
            'Isaac Newton': 'Isaac Newton',
            'Newton': 'Isaac Newton',
            'Marie Curie': 'Marie Curie',
            'Curie': 'Marie Curie',
            'Archimedes': 'Archimedes',
            'Leonardo da Vinci': 'Leonardo da Vinci',
            'Da Vinci': 'Leonardo da Vinci',
            'Vincent van Gogh': 'Vincent van Gogh',
            'Van Gogh': 'Vincent van Gogh',
            'Pablo Picasso': 'Pablo Picasso',
            'Picasso': 'Pablo Picasso',
            'Pelé': 'Pelé',
            'Pele': 'Pelé',
            'Muhammad Ali': 'Muhammad Ali',
            'Ali': 'Muhammad Ali',
            'Wolfgang Amadeus Mozart': 'Wolfgang Amadeus Mozart',
            'Mozart': 'Wolfgang Amadeus Mozart',
            'Ludwig van Beethoven': 'Ludwig van Beethoven',
            'Beethoven': 'Ludwig van Beethoven',
            'Yuri Gagarin': 'Yuri Gagarin',
            'Gagarin': 'Yuri Gagarin',
            'Neil Armstrong': 'Neil Armstrong',
            'Armstrong': 'Neil Armstrong'
        };
        
        return variations[normalized] || normalized;
    }

    getCategoryFallback(category) {
        return this.categoryFallbacks[category] || this.categoryFallbacks['Technology'];
    }

    async getImagesForStory(story, category, epoch) {
        try {
            const figureName = this.extractFigureName(story);
            console.log(`🔍 Looking for images for: "${figureName}" in category: ${category}`);
            
            if (!figureName) {
                console.log('❌ No figure name found in story');
                return this.getCategoryFallback(category);
            }
            
            // Try to get specific figure images
            const figureImages = this.getFigureImages(figureName);
            if (figureImages) {
                console.log(`✅ Found specific images for: ${figureName}`);
                return figureImages;
            }
            
            // Fallback to category images
            console.log(`⚠️ No specific images found for: ${figureName}, using category fallback`);
            return this.getCategoryFallback(category);
            
        } catch (error) {
            console.error('❌ Error getting images for story:', error.message);
            return this.getCategoryFallback(category);
        }
    }

    async storeImages(figureName, category, epoch, images) {
        if (!this.collection) return;
        
        try {
            const imageData = {
                figureName: this.normalizeFigureName(figureName),
                category,
                epoch,
                images,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await this.collection.updateOne(
                { figureName: imageData.figureName, category, epoch },
                { $set: imageData },
                { upsert: true }
            );
            
            console.log(`✅ Stored images for: ${figureName}`);
        } catch (error) {
            console.error('❌ Error storing images:', error.message);
        }
    }

    async getImageStats() {
        if (!this.collection) {
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                databaseConnected: false
            };
        }
        
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStored: { $sum: 1 },
                        categories: { $addToSet: '$category' },
                        figures: { $addToSet: '$figureName' }
                    }
                }
            ]).toArray();
            
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                storedFigures: stats[0]?.totalStored || 0,
                storedCategories: stats[0]?.categories?.length || 0,
                databaseConnected: true
            };
        } catch (error) {
            console.error('❌ Error getting image stats:', error.message);
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                databaseConnected: false,
                error: error.message
            };
        }
    }
}

export default UpdatedImageService;
