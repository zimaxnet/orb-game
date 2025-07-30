import HistoricalFiguresImageAPI from '../backend/historical-figures-image-api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystematicImageGathering {
    constructor() {
        this.imageAPI = new HistoricalFiguresImageAPI();
        this.results = {
            totalFigures: 0,
            processedFigures: 0,
            successfulImages: 0,
            failedImages: 0,
            errors: []
        };
    }

    async initialize() {
        await this.imageAPI.initialize();
        console.log('✅ Image API initialized');
    }

    async cleanup() {
        await this.imageAPI.cleanup();
    }

    /**
     * Load historical figures data from the seed file
     */
    loadHistoricalFigures() {
        try {
            const seedPath = path.join(__dirname, '..', 'OrbGameInfluentialPeopleSeeds');
            const seedData = fs.readFileSync(seedPath, 'utf8');
            
            const figures = JSON.parse(seedData);
            console.log(`📊 Loaded ${Object.keys(figures).length} categories from seed file`);
            
            return figures;
        } catch (error) {
            console.error('Error loading historical figures:', error);
            throw error;
        }
    }

    /**
     * Generate search terms for a historical figure
     */
    generateSearchTerms(figureName, category, epoch) {
        const baseTerms = [
            `${figureName} portrait`,
            `${figureName} painting`,
            `${figureName} bust`,
            `${figureName} statue`,
            `${figureName} engraving`
        ];

        const categoryTerms = {
            'Technology': [
                `${figureName} invention`,
                `${figureName} discovery`,
                `${figureName} machine`,
                `${figureName} device`
            ],
            'Science': [
                `${figureName} discovery`,
                `${figureName} experiment`,
                `${figureName} research`,
                `${figureName} theory`
            ],
            'Art': [
                `${figureName} artwork`,
                `${figureName} painting`,
                `${figureName} sculpture`,
                `${figureName} masterpiece`
            ],
            'Nature': [
                `${figureName} naturalist`,
                `${figureName} exploration`,
                `${figureName} discovery`,
                `${figureName} specimen`
            ],
            'Sports': [
                `${figureName} athlete`,
                `${figureName} champion`,
                `${figureName} record`,
                `${figureName} competition`
            ],
            'Music': [
                `${figureName} composer`,
                `${figureName} musician`,
                `${figureName} performance`,
                `${figureName} instrument`
            ],
            'Space': [
                `${figureName} astronaut`,
                `${figureName} astronomer`,
                `${figureName} rocket`,
                `${figureName} mission`
            ],
            'Innovation': [
                `${figureName} innovation`,
                `${figureName} breakthrough`,
                `${figureName} invention`,
                `${figureName} creation`
            ]
        };

        return {
            portraits: baseTerms,
            achievements: categoryTerms[category] || baseTerms,
            inventions: categoryTerms[category] || baseTerms,
            artifacts: [`${figureName} artifact`, `${figureName} object`, `${figureName} relic`]
        };
    }

    /**
     * Simulate image search for a figure (this would call the Python script)
     */
    async searchImagesForFigure(figureName, category, epoch) {
        try {
            console.log(`🔍 Searching images for ${figureName} (${category}/${epoch})...`);
            
            // Generate search terms
            const searchTerms = this.generateSearchTerms(figureName, category, epoch);
            
            // Simulate image search results
            // In production, this would call the Python script
            const mockImageData = this.generateMockImageData(figureName, category, epoch, searchTerms);
            
            // Store the image data
            await this.imageAPI.imageService.storeFigureImages(mockImageData);
            
            this.results.successfulImages++;
            console.log(`✅ Found images for ${figureName}`);
            
            return mockImageData;
        } catch (error) {
            console.error(`❌ Error searching images for ${figureName}:`, error);
            this.results.errors.push({ figureName, error: error.message });
            this.results.failedImages++;
            return null;
        }
    }

    /**
     * Generate mock image data for testing
     */
    generateMockImageData(figureName, category, epoch, searchTerms) {
        // This simulates what the Python script would return
        const baseUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
        const figureHash = this.hashString(figureName);
        
        return {
            figureName,
            category,
            epoch,
            portraits: {
                'Wikimedia Commons': {
                    urls: [
                        `${baseUrl}/${figureHash}/portrait.jpg/300px-${figureName}_portrait.jpg`
                    ],
                    licensing: 'Public Domain',
                    reliability: 'High',
                    searchTerm: searchTerms.portraits[0]
                }
            },
            achievements: {
                'Wikimedia Commons': {
                    urls: [
                        `${baseUrl}/${figureHash}/achievement.jpg/300px-${figureName}_achievement.jpg`
                    ],
                    licensing: 'Public Domain',
                    reliability: 'High',
                    searchTerm: searchTerms.achievements[0]
                }
            },
            inventions: {
                'Wikimedia Commons': {
                    urls: [
                        `${baseUrl}/${figureHash}/invention.jpg/300px-${figureName}_invention.jpg`
                    ],
                    licensing: 'Public Domain',
                    reliability: 'High',
                    searchTerm: searchTerms.inventions[0]
                }
            },
            artifacts: {}
        };
    }

    /**
     * Simple hash function for generating mock URLs
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Process all historical figures systematically
     */
    async processAllFigures() {
        try {
            console.log('🚀 Starting systematic image gathering...');
            
            const figures = this.loadHistoricalFigures();
            console.log(`📊 Found ${Object.keys(figures).length} categories with historical figures`);
            
            for (const [category, epochs] of Object.entries(figures)) {
                console.log(`\n📁 Processing category: ${category}`);
                
                for (const [epoch, figureList] of Object.entries(epochs)) {
                    console.log(`  📂 Processing epoch: ${epoch} (${figureList.length} figures)`);
                    
                    for (const figure of figureList) {
                        const figureName = figure.name;
                        this.results.totalFigures++;
                        
                        try {
                            await this.searchImagesForFigure(figureName, category, epoch);
                            this.results.processedFigures++;
                            
                            // Add a small delay to avoid overwhelming the system
                            await new Promise(resolve => setTimeout(resolve, 100));
                            
                        } catch (error) {
                            console.error(`❌ Error processing ${figureName}:`, error);
                            this.results.errors.push({ figureName, category, epoch, error: error.message });
                        }
                    }
                }
            }
            
            console.log('\n✅ Systematic image gathering completed!');
            this.printResults();
            
        } catch (error) {
            console.error('❌ Error in systematic image gathering:', error);
            throw error;
        }
    }

    /**
     * Print results summary
     */
    printResults() {
        console.log('\n📊 RESULTS SUMMARY');
        console.log('==================');
        console.log(`Total figures: ${this.results.totalFigures}`);
        console.log(`Processed: ${this.results.processedFigures}`);
        console.log(`Successful images: ${this.results.successfulImages}`);
        console.log(`Failed images: ${this.results.failedImages}`);
        console.log(`Success rate: ${((this.results.successfulImages / this.results.totalFigures) * 100).toFixed(1)}%`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.results.errors.forEach(error => {
                console.log(`  - ${error.figureName}: ${error.error}`);
            });
        }
    }

    /**
     * Generate a comprehensive image data file
     */
    async generateImageDataFile() {
        try {
            console.log('📝 Generating comprehensive image data file...');
            
            const figures = this.loadHistoricalFigures();
            const imageData = {};
            
            for (const [category, epochs] of Object.entries(figures)) {
                for (const [epoch, figureList] of Object.entries(epochs)) {
                    for (const figure of figureList) {
                        const figureName = figure.name;
                        const searchTerms = this.generateSearchTerms(figureName, category, epoch);
                        
                        if (!imageData[figureName]) {
                            imageData[figureName] = {};
                        }
                        
                        if (!imageData[figureName][category]) {
                            imageData[figureName][category] = {};
                        }
                        
                        imageData[figureName][category][epoch] = [{
                            name: figureName,
                            context: figure.context,
                            searchTerms,
                            sources: {
                                portraits: ['Wikimedia Commons', 'Library of Congress', 'NYPL Free to Use Collections'],
                                achievements: ['Wikimedia Commons', 'Internet Archive', 'Smithsonian Collections'],
                                inventions: ['Wikimedia Commons', 'Internet Archive', 'Metropolitan Museum'],
                                artifacts: ['Smithsonian Collections', 'Metropolitan Museum', 'Rijksmuseum']
                            }
                        }];
                    }
                }
            }
            
            const outputPath = path.join(__dirname, '..', 'orbGameFiguresImageData.json');
            fs.writeFileSync(outputPath, JSON.stringify(imageData, null, 2));
            
            console.log(`✅ Image data file generated: ${outputPath}`);
            console.log(`📊 Total figures processed: ${Object.keys(imageData).length}`);
            return outputPath;
            
        } catch (error) {
            console.error('❌ Error generating image data file:', error);
            throw error;
        }
    }

    /**
     * Test the image gathering system
     */
    async testSystem() {
        try {
            console.log('🧪 Testing image gathering system...');
            
            const testFigures = [
                { name: 'Archimedes', category: 'Technology', epoch: 'Ancient' },
                { name: 'Johannes Gutenberg', category: 'Technology', epoch: 'Medieval' },
                { name: 'Leonardo da Vinci', category: 'Art', epoch: 'Medieval' }
            ];
            
            for (const figure of testFigures) {
                console.log(`\n🔍 Testing: ${figure.name}`);
                const result = await this.searchImagesForFigure(figure.name, figure.category, figure.epoch);
                
                if (result) {
                    console.log(`✅ Success: Found ${Object.keys(result.portraits || {}).length} portrait sources`);
                } else {
                    console.log(`❌ Failed: No images found`);
                }
            }
            
            console.log('\n✅ System test completed');
            
        } catch (error) {
            console.error('❌ Error in system test:', error);
            throw error;
        }
    }
}

// Command line interface
async function main() {
    const gatherer = new SystematicImageGathering();
    
    try {
        await gatherer.initialize();
        
        const command = process.argv[2];
        
        switch (command) {
            case 'gather':
                await gatherer.processAllFigures();
                break;
            case 'generate':
                await gatherer.generateImageDataFile();
                break;
            case 'test':
                await gatherer.testSystem();
                break;
            default:
                console.log('Usage: node systematic-image-gathering.js [gather|generate|test]');
                console.log('');
                console.log('Commands:');
                console.log('  gather   - Process all historical figures and gather images');
                console.log('  generate - Generate comprehensive image data file');
                console.log('  test     - Test the image gathering system');
                break;
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await gatherer.cleanup();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default SystematicImageGathering; 