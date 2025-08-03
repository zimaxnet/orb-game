const fs = require('fs');
const path = require('path');

// Read the backend server file
const backendServerPath = path.join(__dirname, '..', 'backend', 'backend-server.js');

async function integrateImageService() {
    try {
        console.log('Integrating Historical Figures Image Service with backend server...');
        
        // Read the current backend server file
        let backendContent = fs.readFileSync(backendServerPath, 'utf8');
        
        // Check if image service is already integrated
        if (backendContent.includes('HistoricalFiguresImageAPI')) {
            console.log('✅ Image service already integrated');
            return;
        }
        
        // Add the import statement
        const importStatement = "const HistoricalFiguresImageAPI = require('./historical-figures-image-api');";
        
        // Find the imports section and add our import
        const importSection = backendContent.indexOf('const express = require');
        if (importSection === -1) {
            throw new Error('Could not find imports section in backend server');
        }
        
        // Insert the import after the existing imports
        const insertPosition = backendContent.indexOf('\n', importSection) + 1;
        backendContent = backendContent.slice(0, insertPosition) + importStatement + '\n' + backendContent.slice(insertPosition);
        
        // Add image service initialization
        const initSection = backendContent.indexOf('// Initialize services');
        if (initSection === -1) {
            // If no initialization section, add it after the app creation
            const appCreation = backendContent.indexOf('const app = express()');
            if (appCreation === -1) {
                throw new Error('Could not find app creation in backend server');
            }
            
            const initCode = `
// Initialize services
const imageAPI = new HistoricalFiguresImageAPI();
await imageAPI.initialize();
app.locals.imageAPI = imageAPI;

`;
            
            const insertPos = backendContent.indexOf('\n', appCreation) + 1;
            backendContent = backendContent.slice(0, insertPos) + initCode + backendContent.slice(insertPos);
        } else {
            // Add to existing initialization section
            const initCode = `
const imageAPI = new HistoricalFiguresImageAPI();
await imageAPI.initialize();
app.locals.imageAPI = imageAPI;
`;
            
            const insertPos = backendContent.indexOf('\n', initSection) + 1;
            backendContent = backendContent.slice(0, insertPos) + initCode + backendContent.slice(insertPos);
        }
        
        // Add image service routes
        const routesSection = backendContent.indexOf('// API Routes');
        if (routesSection === -1) {
            // If no routes section, add it before the error handling
            const errorHandling = backendContent.indexOf('// Error handling middleware');
            if (errorHandling === -1) {
                throw new Error('Could not find error handling section in backend server');
            }
            
            const routesCode = `
// Image Service Routes
app.get('/api/orb/images/best', imageAPI.getBestImage.bind(imageAPI));
app.get('/api/orb/images/gallery', imageAPI.getFigureGallery.bind(imageAPI));
app.get('/api/orb/images/by-type', imageAPI.getImagesByType.bind(imageAPI));
app.get('/api/orb/images/stats', imageAPI.getImageStats.bind(imageAPI));
app.get('/api/orb/images/permalink/:permalink', imageAPI.getImageByPermalink.bind(imageAPI));
app.get('/api/orb/images/most-accessed', imageAPI.getMostAccessedImages.bind(imageAPI));
app.post('/api/orb/images/import', imageAPI.importImageData.bind(imageAPI));
app.post('/api/orb/images/cleanup', imageAPI.cleanupImages.bind(imageAPI));
app.post('/api/orb/images/populate', imageAPI.populateImagesForStory.bind(imageAPI));
app.get('/api/orb/images/check-updated', imageAPI.checkForUpdatedImages.bind(imageAPI));
app.get('/api/orb/stories-with-images', imageAPI.getStoryWithImages.bind(imageAPI));

`;
            
            backendContent = backendContent.slice(0, errorHandling) + routesCode + backendContent.slice(errorHandling);
        } else {
            // Add to existing routes section
            const routesCode = `
// Image Service Routes
app.get('/api/orb/images/best', imageAPI.getBestImage.bind(imageAPI));
app.get('/api/orb/images/gallery', imageAPI.getFigureGallery.bind(imageAPI));
app.get('/api/orb/images/by-type', imageAPI.getImagesByType.bind(imageAPI));
app.get('/api/orb/images/stats', imageAPI.getImageStats.bind(imageAPI));
app.get('/api/orb/images/permalink/:permalink', imageAPI.getImageByPermalink.bind(imageAPI));
app.get('/api/orb/images/most-accessed', imageAPI.getMostAccessedImages.bind(imageAPI));
app.post('/api/orb/images/import', imageAPI.importImageData.bind(imageAPI));
app.post('/api/orb/images/cleanup', imageAPI.cleanupImages.bind(imageAPI));
app.post('/api/orb/images/populate', imageAPI.populateImagesForStory.bind(imageAPI));
app.get('/api/orb/images/check-updated', imageAPI.checkForUpdatedImages.bind(imageAPI));
app.get('/api/orb/stories-with-images', imageAPI.getStoryWithImages.bind(imageAPI));
`;
            
            const insertPos = backendContent.indexOf('\n', routesSection) + 1;
            backendContent = backendContent.slice(0, insertPos) + routesCode + backendContent.slice(insertPos);
        }
        
        // Add cleanup in the graceful shutdown section
        const shutdownSection = backendContent.indexOf('process.on(\'SIGTERM\'');
        if (shutdownSection !== -1) {
            const cleanupCode = `
    // Cleanup image service
    if (app.locals.imageAPI) {
        await app.locals.imageAPI.cleanup();
    }
`;
            
            const insertPos = backendContent.indexOf('server.close()', shutdownSection);
            if (insertPos !== -1) {
                const beforeShutdown = backendContent.indexOf('\n', insertPos) + 1;
                backendContent = backendContent.slice(0, beforeShutdown) + cleanupCode + backendContent.slice(beforeShutdown);
            }
        }
        
        // Write the updated backend server file
        fs.writeFileSync(backendServerPath, backendContent);
        
        console.log('✅ Image service successfully integrated with backend server');
        
        // Create a backup of the original file
        const backupPath = backendServerPath + '.backup';
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(backendServerPath, backupPath);
            console.log('📁 Backup created:', backupPath);
        }
        
    } catch (error) {
        console.error('❌ Error integrating image service:', error);
        throw error;
    }
}

async function testImageServiceIntegration() {
    try {
        console.log('Testing image service integration...');
        
        // Test if the backend server file exists and has the required imports
        const backendContent = fs.readFileSync(backendServerPath, 'utf8');
        
        const requiredElements = [
            'HistoricalFiguresImageAPI',
            '/api/orb/images/best',
            '/api/orb/stories-with-images',
            'imageAPI.initialize()'
        ];
        
        let allFound = true;
        for (const element of requiredElements) {
            if (!backendContent.includes(element)) {
                console.log(`❌ Missing: ${element}`);
                allFound = false;
            }
        }
        
        if (allFound) {
            console.log('✅ All required elements found in backend server');
        } else {
            console.log('❌ Some required elements missing');
        }
        
    } catch (error) {
        console.error('❌ Error testing integration:', error);
        throw error;
    }
}

async function createSampleImageData() {
    try {
        console.log('Creating sample image data for testing...');
        
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
            }
        };
        
        const outputPath = path.join(__dirname, '..', 'sampleImageData.json');
        fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
        
        console.log('✅ Sample image data created:', outputPath);
        
    } catch (error) {
        console.error('❌ Error creating sample data:', error);
        throw error;
    }
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'integrate':
        integrateImageService();
        break;
    case 'test':
        testImageServiceIntegration();
        break;
    case 'create-sample':
        createSampleImageData();
        break;
    default:
        console.log('Usage: node integrate-image-service.js [integrate|test|create-sample]');
        console.log('');
        console.log('Commands:');
        console.log('  integrate      - Integrate image service with backend server');
        console.log('  test           - Test if integration was successful');
        console.log('  create-sample  - Create sample image data for testing');
        break;
} 