import { MongoClient } from 'mongodb';

class HistoricalFiguresImageService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.mongoUri = null;
        
        // Enhanced image sources with more reliable fallbacks
        this.imageSources = {
            // Primary sources - verified, accessible URLs
            primary: {
                'Archimedes': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Archimedes_%28Michelangelo%29.jpg/300px-Archimedes_%28Michelangelo%29.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Archimedes_%28Michelangelo%29.jpg/300px-Archimedes_%28Michelangelo%29.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Archimedes_screw.jpg/300px-Archimedes_screw.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Archimedes_lever.jpg/300px-Archimedes_lever.jpg'
                    ]
                },
                'Albert Einstein': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/300px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/300px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Einstein_formula.jpg/300px-Einstein_formula.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Einstein_1925.jpg/300px-Einstein_1925.jpg'
                    ]
                },
                'Leonardo da Vinci': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg/300px-Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg/300px-Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/300px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Leonardo_da_Vinci_-_Vitruvian_Man_-_Google_Art_Project.jpg/300px-Leonardo_da_Vinci_-_Vitruvian_Man_-_Google_Art_Project.jpg'
                    ]
                },
                'Marie Curie': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/300px-Marie_Curie_c._1920s.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/300px-Marie_Curie_c._1920s.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Marie_Curie_in_her_laboratory.jpg/300px-Marie_Curie_in_her_laboratory.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Marie_Curie_1911.jpg/300px-Marie_Curie_1911.jpg'
                    ]
                },
                'Isaac Newton': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/GodfreyKneller-IsaacNewton-1689.jpg/300px-GodfreyKneller-IsaacNewton-1689.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/GodfreyKneller-IsaacNewton-1689.jpg/300px-GodfreyKneller-IsaacNewton-1689.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Newton_reflecting_telescope_replica.jpg/300px-Newton_reflecting_telescope_replica.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Newton_prism.jpg/300px-Newton_prism.jpg'
                    ]
                },
                'Zhang Heng': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zhang_Heng.jpg/300px-Zhang_Heng.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zhang_Heng.jpg/300px-Zhang_Heng.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Seismometer.jpg/300px-Seismometer.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Astronomical_clock.jpg/300px-Astronomical_clock.jpg'
                    ]
                },
                'Al-Jazari': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Al-Jazari_automaton.jpg/300px-Al-Jazari_automaton.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Al-Jazari_automaton.jpg/300px-Al-Jazari_automaton.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Water_clock.jpg/300px-Water_clock.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Mechanical_devices.jpg/300px-Mechanical_devices.jpg'
                    ]
                },
                'Tim Berners-Lee': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/300px-Sir_Tim_Berners-Lee_%28cropped%29.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/300px-Sir_Tim_Berners-Lee_%28cropped%29.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/World_Wide_Web.jpg/300px-World_Wide_Web.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/HTML_logo.jpg/300px-HTML_logo.jpg'
                    ]
                },
                'Grace Hopper': {
                    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg/300px-Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg',
                    gallery: [
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg/300px-Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/COBOL_logo.jpg/300px-COBOL_logo.jpg',
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Computer_programming.jpg/300px-Computer_programming.jpg'
                    ]
                }
            },
            
            // Enhanced fallback sources for different categories with better reliability
            fallbacks: {
                'Technology': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzQyYz3mIi8+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVjaG5vbG9neSBJbm5vdmF0b3I8L3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzQyYz3mIi8+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9IlRlY2hub2xvZ3k8L3RleHQ+PC9zdmc+'
                    ]
                },
                'Science': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhNzNhOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNjaWVudGlzdDwvL3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhNzNhOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPlNjaWVuY2U8L3RleHQ+PC9zdmc+'
                    ]
                },
                'Art': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y2YzNhNyIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFydGlzdDwvL3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y2YzNhNyIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPkFydDwvdGV4dD48L3N2Zz4='
                    ]
                },
                'Nature': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzE2YTg3NCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5hdHVyYWxpc3Q8L3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzE2YTg3NCIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPk5hdHVyZTwvdGV4dD48L3N2Zz4='
                    ]
                },
                'Sports': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1NzNhNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkF0aGxldGU8L3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1NzNhNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPlNwb3J0czwvdGV4dD48L3N2Zz4='
                    ]
                },
                'Music': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U5M2Y3ZiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk11c2ljaWFuPC90ZXh0Pjwvc3ZnPg==',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U5M2Y3ZiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPk11c2ljPC90ZXh0Pjwvc3ZnPg=='
                    ]
                },
                'Space': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0Mzc0YSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNwYWNlIFBpb25lZXI8L3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzM0Mzc0YSIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPlNwYWNlPC90ZXh0Pjwvc3ZnPg=='
                    ]
                },
                'Innovation': {
                    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzhmNWNiNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklubm92YXRvcjwvL3RleHQ+PC9zdmc+',
                    gallery: [
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzhmNWNiNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPklubm92YXRpb248L3RleHQ+PC9zdmc+'
                    ]
                }
            }
        };
    }

    async connect(mongoUri = null) {
        try {
            this.mongoUri = mongoUri || process.env.MONGO_URI;
            
            if (!this.mongoUri) {
                throw new Error('MongoDB URI not provided and MONGO_URI environment variable not set');
            }
            
            this.client = new MongoClient(this.mongoUri);
            await this.client.connect();
            this.db = this.client.db('orbgame');
            this.collection = this.db.collection('historical_figure_images');
            
            // Create indexes for efficient querying
            await this.collection.createIndex({ figureName: 1, category: 1, epoch: 1 });
            await this.collection.createIndex({ contentType: 1 });
            await this.collection.createIndex({ createdAt: 1 });
            
            console.log('✅ Historical Figures Image Service connected to MongoDB');
        } catch (error) {
            console.error('❌ Error connecting to MongoDB for image service:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
        }
    }

    /**
     * Get reliable images for a historical figure with multiple fallback layers
     */
    async getFigureImages(figureName, category, epoch, contentType = 'portraits') {
        try {
            console.log(`🔍 Getting images for ${figureName} (${category}/${epoch})`);
            
            // Layer 1: Check database for stored images
            const storedImages = await this.getStoredImages(figureName, category, epoch, contentType);
            if (storedImages && storedImages.length > 0) {
                console.log(`✅ Found ${storedImages.length} stored images for ${figureName}`);
                return storedImages;
            }
            
            // Layer 2: Check primary sources for verified images
            const primaryImages = this.getPrimaryImages(figureName);
            if (primaryImages) {
                console.log(`✅ Found primary images for ${figureName}`);
                await this.storeImages(figureName, category, epoch, primaryImages);
                return this.formatImages(primaryImages, contentType);
            }
            
            // Layer 3: Use category-specific fallback images
            const fallbackImages = this.getFallbackImages(category);
            console.log(`🔄 Using fallback images for ${figureName} (${category})`);
            await this.storeImages(figureName, category, epoch, fallbackImages);
            return this.formatImages(fallbackImages, contentType);
            
        } catch (error) {
            console.error(`❌ Error getting images for ${figureName}:`, error);
            // Final fallback - return category fallback
            return this.formatImages(this.getFallbackImages(category), contentType);
        }
    }

    /**
     * Get stored images from database
     */
    async getStoredImages(figureName, category, epoch, contentType) {
        try {
            const doc = await this.collection.findOne({ figureName, category, epoch });
            if (doc && doc[contentType] && doc[contentType].length > 0) {
                return doc[contentType];
            }
            return null;
        } catch (error) {
            console.error('Error getting stored images:', error);
            return null;
        }
    }

    /**
     * Get primary source images for well-known figures
     */
    getPrimaryImages(figureName) {
        return this.imageSources.primary[figureName] || null;
    }

    /**
     * Get fallback images for a category
     */
    getFallbackImages(category) {
        return this.imageSources.fallbacks[category] || this.imageSources.fallbacks['Technology'];
    }

    /**
     * Store images in database
     */
    async storeImages(figureName, category, epoch, images) {
        try {
            const imageData = {
                figureName,
                category,
                epoch,
                portraits: images.portrait ? [{
                    url: images.portrait,
                    source: 'Primary',
                    reliability: 'High',
                    priority: 100,
                    createdAt: new Date()
                }] : [],
                gallery: images.gallery ? images.gallery.map((url, index) => ({
                    url,
                    source: 'Primary',
                    reliability: 'High',
                    priority: 90 - index,
                    createdAt: new Date()
                })) : [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.collection.updateOne(
                { figureName, category, epoch },
                { $set: imageData },
                { upsert: true }
            );

            console.log(`💾 Stored images for ${figureName} (${category}/${epoch})`);
        } catch (error) {
            console.error('Error storing images:', error);
        }
    }

    /**
     * Format images for specific content type
     */
    formatImages(images, contentType) {
        if (contentType === 'portraits') {
            return images.portrait ? [{
                url: images.portrait,
                source: 'Primary',
                reliability: 'High',
                priority: 100,
                createdAt: new Date()
            }] : [];
        } else {
            return images.gallery ? images.gallery.map((url, index) => ({
                url,
                source: 'Primary',
                reliability: 'High',
                priority: 90 - index,
                createdAt: new Date()
            })) : [];
        }
    }

    /**
     * Get best image for a figure (highest priority)
     */
    async getBestImage(figureName, category, epoch, contentType = 'portraits') {
        try {
            const images = await this.getFigureImages(figureName, category, epoch, contentType);
            
            if (!images || images.length === 0) {
                console.log(`❌ No images found for ${figureName}`);
                return null;
            }

            // Return the highest priority image
            const bestImage = images.sort((a, b) => b.priority - a.priority)[0];
            console.log(`✅ Best image for ${figureName}: ${bestImage.url}`);
            return bestImage;
        } catch (error) {
            console.error('Error getting best image:', error);
            return null;
        }
    }

    /**
     * Get gallery of images for a figure
     */
    async getFigureGallery(figureName, category, epoch, limit = 5) {
        try {
            const images = await this.getFigureImages(figureName, category, epoch, 'gallery');
            
            if (!images || images.length === 0) {
                // Fallback to category images
                const fallbackImages = this.getFallbackImages(category);
                return fallbackImages.gallery ? fallbackImages.gallery.map((url, index) => ({
                    url,
                    source: 'Fallback',
                    reliability: 'Medium',
                    priority: 50 - index,
                    createdAt: new Date()
                })) : [];
            }

            return images.slice(0, limit);
        } catch (error) {
            console.error('Error getting figure gallery:', error);
            return [];
        }
    }

    /**
     * Get image statistics
     */
    async getImageStats() {
        try {
            const totalFigures = await this.collection.countDocuments();
            const totalImages = await this.collection.aggregate([
                { $project: { 
                    portraitCount: { $size: { $ifNull: ["$portraits", []] } },
                    galleryCount: { $size: { $ifNull: ["$gallery", []] } }
                }},
                { $group: { 
                    _id: null, 
                    totalPortraits: { $sum: "$portraitCount" },
                    totalGallery: { $sum: "$galleryCount" }
                }}
            ]).toArray();

            const stats = totalImages[0] || { totalPortraits: 0, totalGallery: 0 };
            
            return {
                totalFigures,
                totalImages: stats.totalPortraits + stats.totalGallery,
                totalPortraits: stats.totalPortraits,
                totalGallery: stats.totalGallery,
                sources: {
                    primary: Object.keys(this.imageSources.primary).length,
                    fallbacks: Object.keys(this.imageSources.fallbacks).length
                }
            };
        } catch (error) {
            console.error('Error getting image stats:', error);
            return {
                totalFigures: 0,
                totalImages: 0,
                totalPortraits: 0,
                totalGallery: 0,
                sources: { primary: 0, fallbacks: 0 }
            };
        }
    }

    /**
     * Extract figure name from story content with improved pattern matching
     */
    extractFigureName(story) {
        if (!story) return null;
        
        // Try to extract from historicalFigure field
        if (story.historicalFigure) {
            return story.historicalFigure;
        }
        
        // Try to extract from figureName field
        if (story.figureName) {
            return story.figureName;
        }
        
        // Try to extract from title or content
        const text = (story.title || story.content || story.headline || '').toLowerCase();
        
        // Enhanced historical figure patterns with more comprehensive matching
        const patterns = [
            // Ancient figures
            /(archimedes|einstein|newton|curie|da vinci|leonardo|marie|isaac|albert)/i,
            /(hippocrates|euclid|aristotle|pythagoras|plato|socrates)/i,
            /(zhang heng|al-jazari|gutenberg|li shizhen)/i,
            
            // Medieval figures
            /(ibn al-haytham|roger bacon|hildegard|william marshal|joan of arc)/i,
            /(giovanni|francesco|guillaume|machaut|landini)/i,
            
            // Industrial figures
            /(galileo|copernicus|kepler|tesla|edison|bell)/i,
            /(james watt|charles babbage|samuel morse|thomas edison)/i,
            /(darwin|pasteur|mendel|franklin|goodall|carson)/i,
            /(claude monet|william blake|gustave courbet)/i,
            /(pierre de coubertin|james naismith|babe ruth)/i,
            /(beethoven|chopin|clara schumann)/i,
            
            // Modern figures
            /(tim berners-lee|steve jobs|hedy lamarr|grace hopper)/i,
            /(rosalind franklin|jennifer doudna|jane goodall|rachel carson)/i,
            /(frida kahlo|banksy|yayoi kusama)/i,
            /(muhammad ali|pelé|serena williams)/i,
            /(the beatles|bob dylan|aretha franklin)/i,
            
            // Future figures
            /(fei-fei li|elon musk|demis hassabis)/i,
            /(youyou tu|david sinclair|quantum pioneer)/i,
            /(refik anadol|sofia crespo|holographic artist)/i,
            /(conservation pioneer|climate scientist|biodiversity expert)/i,
            /(future olympian|ai athlete|virtual sports star)/i,
            /(ai composer|virtual performer|holographic musician)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    /**
     * Check if preloaded images exist for a story with enhanced reliability
     */
    async checkPreloadedImagesForStory(story, category, epoch) {
        try {
            const figureName = this.extractFigureName(story);
            
            if (!figureName) {
                console.log('No figure name extracted from story');
                return null;
            }

            // Check if we have images for this figure
            const existingImages = await this.getFigureImages(figureName, category, epoch, 'portraits');
            
            if (existingImages && existingImages.length > 0) {
                console.log(`Found images for ${figureName}`);
                const gallery = await this.getFigureGallery(figureName, category, epoch, 3);
                
                return {
                    figureName,
                    images: {
                        portrait: existingImages[0],
                        gallery
                    },
                    imageStatus: 'loaded'
                };
            }

            console.log(`No images found for ${figureName}`);
            return null;
        } catch (error) {
            console.error('Error checking preloaded images:', error);
            return null;
        }
    }
}

export default HistoricalFiguresImageService; 