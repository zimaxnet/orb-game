#!/usr/bin/env node
/**
 * Image Validation Dashboard for Orb Game
 * Monitors image coverage gaps and success rates
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

class ImageValidationDashboard {
    constructor() {
        this.mongoUri = process.env.MONGO_URI;
        this.dbName = 'orbgame';
        this.collectionName = 'historical_figure_images';
    }

    async connectToMongoDB() {
        try {
            const client = await MongoClient.connect(this.mongoUri);
            this.db = client.db(this.dbName);
            this.collection = this.db.collection(this.collectionName);
            console.log('✅ Connected to MongoDB');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            return false;
        }
    }

    async getImageStatistics() {
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFigures: { $sum: 1 },
                        figuresWithPortraits: {
                            $sum: { $cond: [{ $gt: [{ $size: "$portraits" }, 0] }, 1, 0] }
                        },
                        figuresWithAchievements: {
                            $sum: { $cond: [{ $gt: [{ $size: "$achievements" }, 0] }, 1, 0] }
                        },
                        figuresWithInventions: {
                            $sum: { $cond: [{ $gt: [{ $size: "$inventions" }, 0] }, 1, 0] }
                        },
                        figuresWithArtifacts: {
                            $sum: { $cond: [{ $gt: [{ $size: "$artifacts" }, 0] }, 1, 0] }
                        }
                    }
                }
            ]).toArray();

            return stats[0] || {
                totalFigures: 0,
                figuresWithPortraits: 0,
                figuresWithAchievements: 0,
                figuresWithInventions: 0,
                figuresWithArtifacts: 0
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return null;
        }
    }

    async getMissingImages() {
        try {
            const missingImages = await this.collection.aggregate([
                {
                    $project: {
                        figureName: 1,
                        category: 1,
                        epoch: 1,
                        missingPortraits: { $eq: [{ $size: "$portraits" }, 0] },
                        missingAchievements: { $eq: [{ $size: "$achievements" }, 0] },
                        missingInventions: { $eq: [{ $size: "$inventions" }, 0] },
                        missingArtifacts: { $eq: [{ $size: "$artifacts" }, 0] }
                    }
                },
                {
                    $match: {
                        $or: [
                            { missingPortraits: true },
                            { missingAchievements: true },
                            { missingInventions: true },
                            { missingArtifacts: true }
                        ]
                    }
                },
                {
                    $sort: { figureName: 1 }
                }
            ]).toArray();

            return missingImages;
        } catch (error) {
            console.error('Error getting missing images:', error);
            return [];
        }
    }

    async getSourceStatistics() {
        try {
            const sourceStats = await this.collection.aggregate([
                {
                    $project: {
                        portraits: 1,
                        achievements: 1,
                        inventions: 1,
                        artifacts: 1
                    }
                },
                {
                    $unwind: {
                        path: "$portraits",
                        preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $group: {
                        _id: "$portraits.source",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]).toArray();

            return sourceStats;
        } catch (error) {
            console.error('Error getting source statistics:', error);
            return [];
        }
    }

    async getBrokenImages() {
        try {
            // This would require checking actual image URLs
            // For now, return a placeholder
            console.log('⚠️ Broken image detection requires URL validation (not implemented)');
            return [];
        } catch (error) {
            console.error('Error getting broken images:', error);
            return [];
        }
    }

    generateReport(stats, missingImages, sourceStats) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFigures: stats.totalFigures,
                coverage: {
                    portraits: `${stats.figuresWithPortraits}/${stats.totalFigures} (${((stats.figuresWithPortraits / stats.totalFigures) * 100).toFixed(1)}%)`,
                    achievements: `${stats.figuresWithAchievements}/${stats.totalFigures} (${((stats.figuresWithAchievements / stats.totalFigures) * 100).toFixed(1)}%)`,
                    inventions: `${stats.figuresWithInventions}/${stats.totalFigures} (${((stats.figuresWithInventions / stats.totalFigures) * 100).toFixed(1)}%)`,
                    artifacts: `${stats.figuresWithArtifacts}/${stats.totalFigures} (${((stats.figuresWithArtifacts / stats.totalFigures) * 100).toFixed(1)}%)`
                },
                missingImagesCount: missingImages.length,
                topSources: sourceStats.slice(0, 5)
            },
            missingImages: missingImages,
            sourceStatistics: sourceStats
        };

        return report;
    }

    async saveReport(report, filename = 'image-validation-report.json') {
        try {
            fs.writeFileSync(filename, JSON.stringify(report, null, 2));
            console.log(`✅ Report saved to ${filename}`);
        } catch (error) {
            console.error('Error saving report:', error);
        }
    }

    displayReport(report) {
        console.log('\n📊 IMAGE VALIDATION DASHBOARD');
        console.log('=' .repeat(50));
        
        console.log('\n📈 COVERAGE SUMMARY');
        console.log(`Total Figures: ${report.summary.totalFigures}`);
        console.log(`Portraits: ${report.summary.coverage.portraits}`);
        console.log(`Achievements: ${report.summary.coverage.achievements}`);
        console.log(`Inventions: ${report.summary.coverage.inventions}`);
        console.log(`Artifacts: ${report.summary.coverage.artifacts}`);
        
        console.log('\n🔍 MISSING IMAGES');
        console.log(`Figures with missing images: ${report.summary.missingImagesCount}`);
        
        if (report.missingImages.length > 0) {
            console.log('\nTop 10 figures with missing images:');
            report.missingImages.slice(0, 10).forEach((figure, index) => {
                const missing = [];
                if (figure.missingPortraits) missing.push('portraits');
                if (figure.missingAchievements) missing.push('achievements');
                if (figure.missingInventions) missing.push('inventions');
                if (figure.missingArtifacts) missing.push('artifacts');
                
                console.log(`  ${index + 1}. ${figure.figureName} (${figure.category}, ${figure.epoch}) - Missing: ${missing.join(', ')}`);
            });
        }
        
        console.log('\n🏆 TOP SOURCES');
        report.summary.topSources.forEach((source, index) => {
            console.log(`  ${index + 1}. ${source._id}: ${source.count} images`);
        });
        
        console.log('\n📋 RECOMMENDATIONS');
        this.generateRecommendations(report);
    }

    generateRecommendations(report) {
        const recommendations = [];
        
        // Coverage recommendations
        const portraitCoverage = (report.summary.totalFigures > 0) ? 
            (report.summary.totalFigures - parseInt(report.summary.coverage.portraits.split('/')[0])) / report.summary.totalFigures : 0;
        
        if (portraitCoverage > 0.1) {
            recommendations.push(`🔴 High priority: ${Math.round(portraitCoverage * 100)}% of figures missing portraits`);
        }
        
        if (report.summary.missingImagesCount > 50) {
            recommendations.push(`🟡 Medium priority: ${report.summary.missingImagesCount} figures have missing images`);
        }
        
        // Source recommendations
        if (report.summary.topSources.length > 0) {
            const topSource = report.summary.topSources[0];
            const totalImages = report.summary.topSources.reduce((sum, source) => sum + source.count, 0);
            const topSourcePercentage = (topSource.count / totalImages) * 100;
            
            if (topSourcePercentage > 80) {
                recommendations.push(`🟡 Diversify sources: ${topSource._id} provides ${topSourcePercentage.toFixed(1)}% of images`);
            }
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Good coverage achieved');
        }
        
        recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    async run() {
        console.log('🚀 Starting Image Validation Dashboard...');
        
        // Connect to MongoDB
        const connected = await this.connectToMongoDB();
        if (!connected) {
            console.error('❌ Cannot proceed without database connection');
            return;
        }
        
        // Gather statistics
        console.log('📊 Gathering statistics...');
        const stats = await this.getImageStatistics();
        const missingImages = await this.getMissingImages();
        const sourceStats = await this.getSourceStatistics();
        
        // Generate and display report
        const report = this.generateReport(stats, missingImages, sourceStats);
        this.displayReport(report);
        
        // Save report
        await this.saveReport(report);
        
        console.log('\n✅ Dashboard completed');
    }
}

// CLI interface
async function main() {
    const dashboard = new ImageValidationDashboard();
    await dashboard.run();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ImageValidationDashboard; 