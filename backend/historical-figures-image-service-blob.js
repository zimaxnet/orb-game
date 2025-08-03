import { MongoClient } from 'mongodb';

class BlobStorageImageService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.mongoUri = null;
        
        // Image database with blob storage URLs
        this.imageDatabase = {
            'Archimedes': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Imhotep': {
                portrait: '',
                gallery: [
                null,
                null,
                null,
                null,
                null,
                null
]
            },
            'Hero of Alexandria': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Al-Jazari': {
                portrait: '',
                gallery: [
                null,
                null,
                null,
                null,
                null,
                null
]
            },
            'Johannes Gutenberg': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Charles Babbage': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Samuel Morse': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Tim Berners-Lee': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Steve Jobs': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Hedy Lamarr': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Fei-Fei Li': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Elon Musk': {
                portrait: '',
                gallery: [
                null,
                null,
                null,
                null,
                null,
                null
]
            },
            'Hippocrates': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Aristotle': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Ibn al-Haytham': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Hildegard of Bingen': {
                portrait: '',
                gallery: [
                null,
                null,
                null,
                null,
                null,
                null
]
            },
            'Charles Darwin': {
                portrait: '',
                gallery: [
                null,
                null,
                null,
                null,
                null,
                null
]
            },
            'Dmitri Mendeleev': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Rosalind Franklin': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Albert Einstein': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Jennifer Doudna': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Youyou Tu': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Phidias': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Polygnotus': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Giotto di Bondone': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Andrei Rublev': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Claude Monet': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Banksy': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Refik Anadol': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Sofia Crespo': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Albertus Magnus': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Avicenna': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Saint Francis of Assisi': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'David Attenborough': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Wangari Maathai': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Mercedes Bustamante': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Gaius Appuleius Diocles': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'William Marshal': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Robin Hood': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'W.G. Grace': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Serena Williams': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Pelé': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Simone Biles': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Guillaume de Machaut': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Alfonso el Sabio': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Fanny Mendelssohn': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'The Beatles': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'BTS': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Holly Herndon': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Ptolemy': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Hypatia': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Al-Battani': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Nasir al-Din al-Tusi': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Geoffrey Chaucer': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Galileo Galilei': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Edmond Halley': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Yuri Gagarin': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Stephen Hawking': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Ctesibius': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Aeneas Tacticus': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Richard of Wallingford': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Leonardo Fibonacci': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Nikola Tesla': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Alexander Graham Bell': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Grace Hopper': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Shigeru Miyamoto': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Li Shizhen': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'James Watt': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Demis Hassabis': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Euclid': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Roger Bacon': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Louis Pasteur': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'David Sinclair': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Fictional Quantum Pioneer': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'William Blake': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Gustave Courbet': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Frida Kahlo': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Yayoi Kusama': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Fictional Holographic Artist': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Theophrastus': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Empedocles': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Huang Di': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'John James Audubon': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Mary Anning': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Jane Goodall': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Fictional Climate Engineer': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Paul Stamets': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Milo of Croton': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Leonidas of Rhodes': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Richard FitzAlan': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Pierre de Coubertin': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'James Naismith': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'World E-Sports Champion': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'First Cyborg Athlete': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Zero-gravity Sports Inventor': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Sappho': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'King David': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Narada': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Hildegard von Bingen': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Ludwig van Beethoven': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Frédéric Chopin': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Louis Armstrong': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Yannick Nézet-Séguin': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Universal Music AI': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Aryabhata': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Caroline Herschel': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Katherine Johnson': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Mars Colony Leader': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Exoplanet Signal Analyst': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'AI Probe Architect': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Zhang Heng': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Thomas Edison': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Fusion Energy Scientist': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Translingual AI Architect': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
            'Synthetic Biology Entrepreneur': {
                portrait: '',
                gallery: [
                null,
                null,
                null
]
            },
        };
        
        // Category fallbacks
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
            
            console.log('✅ Blob Storage Image Service connected to MongoDB');
        } catch (error) {
            console.error('❌ Blob Storage Image Service connection failed:', error.message);
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Blob Storage Image Service disconnected');
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
            console.log(`🔍 Looking for blob images for: "${figureName}" in category: ${category}`);
            
            if (!figureName) {
                console.log('❌ No figure name found in story');
                return this.getCategoryFallback(category);
            }
            
            // Try to get specific figure images
            const figureImages = this.getFigureImages(figureName);
            if (figureImages) {
                console.log(`✅ Found blob images for: ${figureName}`);
                return figureImages;
            }
            
            // Fallback to category images
            console.log(`⚠️ No blob images found for: ${figureName}, using category fallback`);
            return this.getCategoryFallback(category);
            
        } catch (error) {
            console.error('❌ Error getting blob images for story:', error.message);
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
            
            console.log(`✅ Stored blob images for: ${figureName}`);
        } catch (error) {
            console.error('❌ Error storing blob images:', error.message);
        }
    }

    async getImageStats() {
        if (!this.collection) {
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                databaseConnected: false,
                source: "Blob Storage"
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
                databaseConnected: true,
                source: "Blob Storage"
            };
        } catch (error) {
            console.error('❌ Error getting blob image stats:', error.message);
            return {
                totalFigures: Object.keys(this.imageDatabase).length,
                totalCategories: Object.keys(this.categoryFallbacks).length,
                databaseConnected: false,
                error: error.message,
                source: "Blob Storage"
            };
        }
    }
}

export default BlobStorageImageService;
