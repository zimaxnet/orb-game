import HistoricalFiguresImageAPI from '../backend/historical-figures-image-api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupImageService() {
    console.log('Setting up Historical Figures Image Service...');
    
    try {
        // Initialize the image API
        const imageAPI = new HistoricalFiguresImageAPI();
        await imageAPI.initialize();
        
        console.log('✅ Image service initialized successfully');
        
        // Test the connection
        const stats = await imageAPI.imageService.getImageStats();
        console.log('📊 Current image statistics:', stats);
        
        // Check if we have image data to import
        const imageDataPath = path.join(__dirname, '..', 'orbGameFiguresImageData.json');
        
        if (fs.existsSync(imageDataPath)) {
            console.log('📁 Found image data file, importing...');
            
            const result = await imageAPI.imageService.importImageData(imageDataPath);
            console.log('✅ Image data import completed:', result);
        } else {
            console.log('⚠️ No image data file found. Run the Python script first to generate image data.');
        }
        
        await imageAPI.cleanup();
        console.log('✅ Image service setup completed');
        
    } catch (error) {
        console.error('❌ Error setting up image service:', error);
        process.exit(1);
    }
}

async function testImageService() {
    console.log('Testing Historical Figures Image Service...');
    
    try {
        const imageAPI = new HistoricalFiguresImageAPI();
        await imageAPI.initialize();
        
        // Test getting images for a known figure
        const testFigure = 'Archimedes';
        const testCategory = 'Technology';
        const testEpoch = 'Ancient';
        
        console.log(`🔍 Testing image retrieval for ${testFigure}...`);
        
        const bestImage = await imageAPI.imageService.getBestImage(
            testFigure,
            testCategory,
            testEpoch,
            'portraits'
        );
        
        if (bestImage) {
            console.log('✅ Best image found:', {
                url: bestImage.url,
                source: bestImage.source,
                licensing: bestImage.licensing,
                priority: bestImage.priority
            });
        } else {
            console.log('⚠️ No images found for test figure');
        }
        
        const gallery = await imageAPI.imageService.getFigureGallery(
            testFigure,
            testCategory,
            testEpoch,
            3
        );
        
        if (gallery && gallery.length > 0) {
            console.log('✅ Gallery images found:', gallery.length);
            gallery.forEach((img, index) => {
                console.log(`  ${index + 1}. ${img.source} - ${img.licensing}`);
            });
        } else {
            console.log('⚠️ No gallery images found');
        }
        
        await imageAPI.cleanup();
        console.log('✅ Image service test completed');
        
    } catch (error) {
        console.error('❌ Error testing image service:', error);
        process.exit(1);
    }
}

async function generateSampleImageData() {
    console.log('Generating sample image data for testing...');
    
    try {
        // Create sample image data structure
        const sampleData = {
            "Archimedes": {
                "Technology": {
                    "Ancient": [
                        {
                            "name": "Archimedes",
                            "portraits": {
                                "Wikimedia Commons": {
                                    "urls": [
                                        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Archimedes_%28Idealportrait%29.jpg/300px-Archimedes_%28Idealportrait%29.jpg"
                                    ],
                                    "licensing": "Public Domain",
                                    "reliability": "High",
                                    "searchTerm": "Archimedes portrait"
                                }
                            },
                            "achievements": {
                                "Wikimedia Commons": {
                                    "urls": [
                                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Archimedes_screw.jpg/300px-Archimedes_screw.jpg"
                                    ],
                                    "licensing": "Public Domain",
                                    "reliability": "High",
                                    "searchTerm": "Archimedes screw"
                                }
                            },
                            "inventions": {
                                "Wikimedia Commons": {
                                    "urls": [
                                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Archimedes_screw.jpg/300px-Archimedes_screw.jpg"
                                    ],
                                    "licensing": "Public Domain",
                                    "reliability": "High",
                                    "searchTerm": "Archimedes inventions"
                                }
                            },
                            "artifacts": {}
                        }
                    ]
                }
            },
            "Johannes Gutenberg": {
                "Technology": {
                    "Medieval": [
                        {
                            "name": "Johannes Gutenberg",
                            "portraits": {
                                "Wikimedia Commons": {
                                    "urls": [
                                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Johannes_Gutenberg.jpg/300px-Johannes_Gutenberg.jpg"
                                    ],
                                    "licensing": "Public Domain",
                                    "reliability": "High",
                                    "searchTerm": "Johannes Gutenberg portrait"
                                }
                            },
                            "achievements": {
                                "Wikimedia Commons": {
                                    "urls": [
                                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gutenberg_Bible.jpg/300px-Gutenberg_Bible.jpg"
                                    ],
                                    "licensing": "Public Domain",
                                    "reliability": "High",
                                    "searchTerm": "Gutenberg Bible"
                                }
                            },
                            "inventions": {
                                "Wikimedia Commons": {
                                    "urls": [
                                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Printing_press.jpg/300px-Printing_press.jpg"
                                    ],
                                    "licensing": "Public Domain",
                                    "reliability": "High",
                                    "searchTerm": "printing press"
                                }
                            },
                            "artifacts": {}
                        }
                    ]
                }
            }
        };
        
        const outputPath = path.join(__dirname, '..', 'sampleImageData.json');
        fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
        
        console.log('✅ Sample image data generated:', outputPath);
        
    } catch (error) {
        console.error('❌ Error generating sample data:', error);
        process.exit(1);
    }
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'setup':
        setupImageService();
        break;
    case 'test':
        testImageService();
        break;
    case 'generate-sample':
        generateSampleImageData();
        break;
    default:
        console.log('Usage: node setup-image-service.js [setup|test|generate-sample]');
        console.log('');
        console.log('Commands:');
        console.log('  setup           - Initialize the image service');
        console.log('  test            - Test the image service functionality');
        console.log('  generate-sample - Generate sample image data for testing');
        break;
} 