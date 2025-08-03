import HistoricalFiguresImageAPI from '../backend/historical-figures-image-api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageGatheringReport {
    constructor() {
        this.imageAPI = new HistoricalFiguresImageAPI();
        this.report = {
            summary: {},
            categories: {},
            sources: {},
            errors: [],
            recommendations: []
        };
    }

    async initialize() {
        await this.imageAPI.initialize();
        console.log('✅ Image API initialized for reporting');
    }

    async cleanup() {
        await this.imageAPI.cleanup();
    }

    /**
     * Load historical figures data
     */
    loadHistoricalFigures() {
        try {
            const seedPath = path.join(__dirname, '..', 'OrbGameInfluentialPeopleSeeds');
            const seedData = fs.readFileSync(seedPath, 'utf8');
            return JSON.parse(seedData);
        } catch (error) {
            console.error('Error loading historical figures:', error);
            throw error;
        }
    }

    /**
     * Load image data file
     */
    loadImageData() {
        try {
            const imageDataPath = path.join(__dirname, '..', 'orbGameFiguresImageData.json');
            if (fs.existsSync(imageDataPath)) {
                const imageData = fs.readFileSync(imageDataPath, 'utf8');
                return JSON.parse(imageData);
            }
            return {};
        } catch (error) {
            console.error('Error loading image data:', error);
            return {};
        }
    }

    /**
     * Analyze image gathering statistics
     */
    async analyzeImageGathering() {
        console.log('📊 Analyzing image gathering system...');
        
        const figures = this.loadHistoricalFigures();
        const imageData = this.loadImageData();
        
        // Initialize statistics
        const stats = {
            totalFigures: 0,
            figuresWithImageData: 0,
            figuresWithoutImageData: 0,
            categories: {},
            epochs: {},
            sources: {},
            contentTypes: {
                portraits: 0,
                achievements: 0,
                inventions: 0,
                artifacts: 0
            },
            errors: []
        };

        // Process each category
        for (const [category, epochs] of Object.entries(figures)) {
            stats.categories[category] = {
                total: 0,
                withImages: 0,
                withoutImages: 0,
                figures: []
            };

            for (const [epoch, figureList] of Object.entries(epochs)) {
                if (!stats.epochs[epoch]) {
                    stats.epochs[epoch] = {
                        total: 0,
                        withImages: 0,
                        withoutImages: 0
                    };
                }

                for (const figure of figureList) {
                    const figureName = figure.name;
                    stats.totalFigures++;
                    stats.categories[category].total++;
                    stats.epochs[epoch].total++;

                    const hasImageData = imageData[figureName] && 
                                       imageData[figureName][category] && 
                                       imageData[figureName][category][epoch];

                    if (hasImageData) {
                        stats.figuresWithImageData++;
                        stats.categories[category].withImages++;
                        stats.epochs[epoch].withImages++;
                        
                        // Analyze content types
                        const figureData = imageData[figureName][category][epoch][0];
                        if (figureData.searchTerms) {
                            if (figureData.searchTerms.portraits) stats.contentTypes.portraits++;
                            if (figureData.searchTerms.achievements) stats.contentTypes.achievements++;
                            if (figureData.searchTerms.inventions) stats.contentTypes.inventions++;
                            if (figureData.searchTerms.artifacts) stats.contentTypes.artifacts++;
                        }

                        // Analyze sources
                        if (figureData.sources) {
                            for (const [contentType, sources] of Object.entries(figureData.sources)) {
                                for (const source of sources) {
                                    if (!stats.sources[source]) {
                                        stats.sources[source] = 0;
                                    }
                                    stats.sources[source]++;
                                }
                            }
                        }
                    } else {
                        stats.figuresWithoutImageData++;
                        stats.categories[category].withoutImages++;
                        stats.epochs[epoch].withoutImages++;
                        stats.errors.push({
                            figure: figureName,
                            category,
                            epoch,
                            reason: 'No image data found'
                        });
                    }

                    stats.categories[category].figures.push({
                        name: figureName,
                        epoch,
                        hasImages: hasImageData
                    });
                }
            }
        }

        return stats;
    }

    /**
     * Test image retrieval for sample figures
     */
    async testImageRetrieval() {
        console.log('🧪 Testing image retrieval...');
        
        const testFigures = [
            { name: 'Archimedes', category: 'Technology', epoch: 'Ancient' },
            { name: 'Johannes Gutenberg', category: 'Technology', epoch: 'Medieval' },
            { name: 'Leonardo da Vinci', category: 'Art', epoch: 'Medieval' },
            { name: 'Albert Einstein', category: 'Science', epoch: 'Modern' },
            { name: 'Steve Jobs', category: 'Technology', epoch: 'Modern' }
        ];

        const testResults = [];

        for (const figure of testFigures) {
            try {
                console.log(`🔍 Testing: ${figure.name}`);
                
                // Test getting best image
                const bestImage = await this.imageAPI.imageService.getBestImage(
                    figure.name,
                    figure.category,
                    figure.epoch,
                    'portraits'
                );

                // Test getting gallery
                const gallery = await this.imageAPI.imageService.getFigureGallery(
                    figure.name,
                    figure.category,
                    figure.epoch,
                    3
                );

                testResults.push({
                    figure: figure.name,
                    category: figure.category,
                    epoch: figure.epoch,
                    bestImage: bestImage ? 'Found' : 'Not found',
                    gallery: gallery ? gallery.length : 0,
                    success: bestImage !== null
                });

            } catch (error) {
                testResults.push({
                    figure: figure.name,
                    category: figure.category,
                    epoch: figure.epoch,
                    bestImage: 'Error',
                    gallery: 0,
                    success: false,
                    error: error.message
                });
            }
        }

        return testResults;
    }

    /**
     * Generate comprehensive report
     */
    async generateReport() {
        try {
            console.log('📋 Generating comprehensive image gathering report...\n');

            // Analyze statistics
            const stats = await this.analyzeImageGathering();
            
            // Test image retrieval
            const testResults = await this.testImageRetrieval();

            // Generate report
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalFigures: stats.totalFigures,
                    figuresWithImageData: stats.figuresWithImageData,
                    figuresWithoutImageData: stats.figuresWithoutImageData,
                    successRate: ((stats.figuresWithImageData / stats.totalFigures) * 100).toFixed(1) + '%',
                    coverageRate: ((stats.figuresWithImageData / stats.totalFigures) * 100).toFixed(1) + '%'
                },
                categories: stats.categories,
                epochs: stats.epochs,
                contentTypes: stats.contentTypes,
                sources: stats.sources,
                testResults,
                errors: stats.errors,
                recommendations: this.generateRecommendations(stats, testResults)
            };

            // Print report
            this.printReport(report);

            // Save report to file
            const reportPath = path.join(__dirname, '..', 'image-gathering-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n✅ Report saved to: ${reportPath}`);

            return report;

        } catch (error) {
            console.error('❌ Error generating report:', error);
            throw error;
        }
    }

    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(stats, testResults) {
        const recommendations = [];

        // Coverage recommendations
        if (stats.figuresWithoutImageData > 0) {
            recommendations.push({
                type: 'coverage',
                priority: 'high',
                message: `${stats.figuresWithoutImageData} figures need image data`,
                action: 'Run systematic image gathering for missing figures'
            });
        }

        // Category recommendations
        for (const [category, data] of Object.entries(stats.categories)) {
            const successRate = ((data.withImages / data.total) * 100).toFixed(1);
            if (parseFloat(successRate) < 80) {
                recommendations.push({
                    type: 'category',
                    priority: 'medium',
                    message: `${category} has low coverage (${successRate}%)`,
                    action: `Focus on gathering images for ${category} figures`
                });
            }
        }

        // Source recommendations
        const topSources = Object.entries(stats.sources)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        recommendations.push({
            type: 'sources',
            priority: 'low',
            message: 'Top image sources identified',
            action: `Focus on: ${topSources.map(([source, count]) => `${source} (${count})`).join(', ')}`
        });

        // Test results recommendations
        const failedTests = testResults.filter(r => !r.success);
        if (failedTests.length > 0) {
            recommendations.push({
                type: 'testing',
                priority: 'high',
                message: `${failedTests.length} test figures failed image retrieval`,
                action: 'Investigate image retrieval issues for test figures'
            });
        }

        return recommendations;
    }

    /**
     * Print formatted report
     */
    printReport(report) {
        console.log('📊 IMAGE GATHERING SYSTEM REPORT');
        console.log('================================');
        console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}\n`);

        // Summary
        console.log('📈 SUMMARY');
        console.log('----------');
        console.log(`Total Historical Figures: ${report.summary.totalFigures}`);
        console.log(`Figures with Image Data: ${report.summary.figuresWithImageData}`);
        console.log(`Figures without Image Data: ${report.summary.figuresWithoutImageData}`);
        console.log(`Success Rate: ${report.summary.successRate}`);
        console.log(`Coverage Rate: ${report.summary.coverageRate}\n`);

        // Categories
        console.log('📁 CATEGORIES');
        console.log('--------------');
        for (const [category, data] of Object.entries(report.categories)) {
            const successRate = ((data.withImages / data.total) * 100).toFixed(1);
            console.log(`${category}: ${data.withImages}/${data.total} (${successRate}%)`);
        }
        console.log('');

        // Epochs
        console.log('⏰ EPOCHS');
        console.log('----------');
        for (const [epoch, data] of Object.entries(report.epochs)) {
            const successRate = ((data.withImages / data.total) * 100).toFixed(1);
            console.log(`${epoch}: ${data.withImages}/${data.total} (${successRate}%)`);
        }
        console.log('');

        // Content Types
        console.log('🖼️ CONTENT TYPES');
        console.log('-----------------');
        for (const [type, count] of Object.entries(report.contentTypes)) {
            console.log(`${type}: ${count} figures`);
        }
        console.log('');

        // Top Sources
        console.log('🔗 TOP IMAGE SOURCES');
        console.log('---------------------');
        const topSources = Object.entries(report.sources)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        topSources.forEach(([source, count], index) => {
            console.log(`${index + 1}. ${source}: ${count} references`);
        });
        console.log('');

        // Test Results
        console.log('🧪 TEST RESULTS');
        console.log('---------------');
        report.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.figure} (${result.category}/${result.epoch}): ${result.bestImage}, Gallery: ${result.gallery} images`);
        });
        console.log('');

        // Errors
        if (report.errors.length > 0) {
            console.log('❌ ERRORS');
            console.log('----------');
            report.errors.slice(0, 10).forEach(error => {
                console.log(`- ${error.figure} (${error.category}/${error.epoch}): ${error.reason}`);
            });
            if (report.errors.length > 10) {
                console.log(`... and ${report.errors.length - 10} more errors`);
            }
            console.log('');
        }

        // Recommendations
        console.log('💡 RECOMMENDATIONS');
        console.log('------------------');
        report.recommendations.forEach((rec, index) => {
            const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
            console.log(`${index + 1}. ${priority} ${rec.message}`);
            console.log(`   Action: ${rec.action}`);
        });
        console.log('');
    }
}

// Command line interface
async function main() {
    const reporter = new ImageGatheringReport();
    
    try {
        await reporter.initialize();
        await reporter.generateReport();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await reporter.cleanup();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default ImageGatheringReport; 