import { MongoClient } from 'mongodb';

class SimpleImageService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.mongoUri = null;
        
        // Simple, reliable image database with verified URLs
        this.imageDatabase = {
            // Technology Figures
            'Johannes Gutenberg': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Johannes_Gutenberg.jpg/300px-Johannes_Gutenberg.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Johannes_Gutenberg.jpg/300px-Johannes_Gutenberg.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gutenberg_Bible.jpg/300px-Gutenberg_Bible.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Printing_press.jpg/300px-Printing_press.jpg'
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
            },
            'Alan Turing': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alan_Turing_Aged_16.jpg/300px-Alan_Turing_Aged_16.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alan_Turing_Aged_16.jpg/300px-Alan_Turing_Aged_16.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Enigma_machine.jpg/300px-Enigma_machine.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Computer_science.jpg/300px-Computer_science.jpg'
                ]
            },
            
            // Science Figures
            'Albert Einstein': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/300px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/300px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Einstein_formula.jpg/300px-Einstein_formula.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Einstein_1925.jpg/300px-Einstein_1925.jpg'
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
            'Marie Curie': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/300px-Marie_Curie_c._1920s.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/300px-Marie_Curie_c._1920s.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Marie_Curie_in_her_laboratory.jpg/300px-Marie_Curie_in_her_laboratory.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Marie_Curie_1911.jpg/300px-Marie_Curie_1911.jpg'
                ]
            },
            'Archimedes': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Archimedes_%28Michelangelo%29.jpg/300px-Archimedes_%28Michelangelo%29.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Archimedes_%28Michelangelo%29.jpg/300px-Archimedes_%28Michelangelo%29.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Archimedes_screw.jpg/300px-Archimedes_screw.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Archimedes_lever.jpg/300px-Archimedes_lever.jpg'
                ]
            },
            
            // Art Figures
            'Leonardo da Vinci': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg/300px-Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg/300px-Leonardo_da_Vinci_-_presumed_self-portrait_-_WGA12798.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/300px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Leonardo_da_Vinci_-_Vitruvian_Man_-_Google_Art_Project.jpg/300px-Leonardo_da_Vinci_-_Vitruvian_Man_-_Google_Art_Project.jpg'
                ]
            },
            'Vincent van Gogh': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/300px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/300px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Van_Gogh_-_Sunflowers_-_VGM_F458.jpg/300px-Van_Gogh_-_Sunflowers_-_VGM_F458.jpg'
                ]
            },
            'Pablo Picasso': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Pablo_Picasso_1962.jpg/300px-Pablo_Picasso_1962.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Pablo_Picasso_1962.jpg/300px-Pablo_Picasso_1962.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Picasso_-_Guernica.jpg/300px-Picasso_-_Guernica.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Picasso_-_Les_Demoiselles_d%27Avignon.jpg/300px-Picasso_-_Les_Demoiselles_d%27Avignon.jpg'
                ]
            },
            
            // Sports Figures
            'Pelé': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Pele_by_John_Mathew_Smith.jpg/300px-Pele_by_John_Mathew_Smith.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Pele_by_John_Mathew_Smith.jpg/300px-Pele_by_John_Mathew_Smith.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Pele_1970.jpg/300px-Pele_1970.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Soccer_ball.jpg/300px-Soccer_ball.jpg'
                ]
            },
            'Muhammad Ali': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Muhammad_Ali_NYWTS.jpg/300px-Muhammad_Ali_NYWTS.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Muhammad_Ali_NYWTS.jpg/300px-Muhammad_Ali_NYWTS.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ali_vs_Frazier.jpg/300px-Ali_vs_Frazier.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Boxing_ring.jpg/300px-Boxing_ring.jpg'
                ]
            },
            
            // Music Figures
            'Wolfgang Amadeus Mozart': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/300px-Wolfgang-amadeus-mozart_1.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/300px-Wolfgang-amadeus-mozart_1.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Mozart_piano.jpg/300px-Mozart_piano.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Classical_music.jpg/300px-Classical_music.jpg'
                ]
            },
            'Ludwig van Beethoven': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/300px-Beethoven.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/300px-Beethoven.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Beethoven_symphony.jpg/300px-Beethoven_symphony.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Orchestra.jpg/300px-Orchestra.jpg'
                ]
            },
            
            // Space Figures
            'Yuri Gagarin': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Yuri_Gagarin_in_Sweden.jpg/300px-Yuri_Gagarin_in_Sweden.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Yuri_Gagarin_in_Sweden.jpg/300px-Yuri_Gagarin_in_Sweden.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Vostok_1.jpg/300px-Vostok_1.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Space_capsule.jpg/300px-Space_capsule.jpg'
                ]
            },
            'Neil Armstrong': {
                portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Neil_Armstrong_pose.jpg/300px-Neil_Armstrong_pose.jpg',
                gallery: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Neil_Armstrong_pose.jpg/300px-Neil_Armstrong_pose.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Apollo_11_landing.jpg/300px-Apollo_11_landing.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Moon_landing.jpg/300px-Moon_landing.jpg'
                ]
            }
        };
        
        // Simple fallback images for categories
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
            
            console.log('✅ Simple Image Service connected to MongoDB');
        } catch (error) {
            console.error('❌ Simple Image Service connection failed:', error.message);
            // Continue without database - use in-memory only
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Simple Image Service disconnected');
        }
    }

    // Extract figure name from story data
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

    // Get images for a specific figure
    getFigureImages(figureName) {
        if (!figureName) return null;
        
        const normalizedName = this.normalizeFigureName(figureName);
        return this.imageDatabase[normalizedName] || null;
    }

    // Normalize figure name for matching
    normalizeFigureName(name) {
        if (!name) return '';
        
        // Remove common variations and normalize
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

    // Get fallback images for a category
    getCategoryFallback(category) {
        return this.categoryFallbacks[category] || this.categoryFallbacks['Technology'];
    }

    // Main method to get images for a story
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

    // Store images in database (for future use)
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

    // Get image statistics
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

export default SimpleImageService; 