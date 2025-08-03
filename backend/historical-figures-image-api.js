import HistoricalFiguresImageService from './historical-figures-image-service.js';

class HistoricalFiguresImageAPI {
    constructor() {
        this.imageService = new HistoricalFiguresImageService();
    }

    async initialize(mongoUri = null) {
        await this.imageService.connect(mongoUri);
    }

    async cleanup() {
        await this.imageService.disconnect();
    }

    /**
     * Get best image for a historical figure
     */
    async getBestImage(req, res) {
        try {
            const { figureName, category, epoch, contentType = 'portraits' } = req.query;

            if (!figureName || !category || !epoch) {
                return res.status(400).json({
                    error: 'Missing required parameters: figureName, category, epoch'
                });
            }

            console.log(`🔍 Getting best image for ${figureName} (${category}/${epoch})`);

            const image = await this.imageService.getBestImage(
                figureName,
                category,
                epoch,
                contentType
            );

            if (!image) {
                console.log(`❌ No image found for ${figureName}`);
                return res.status(404).json({
                    error: 'No image found for the specified parameters'
                });
            }

            console.log(`✅ Returning image for ${figureName}: ${image.url}`);

            res.json({
                success: true,
                image,
                figureName,
                category,
                epoch,
                contentType
            });

        } catch (error) {
            console.error('❌ Error getting best image:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get gallery of images for a historical figure
     */
    async getFigureGallery(req, res) {
        try {
            const { figureName, category, epoch, limit = 5 } = req.query;

            if (!figureName || !category || !epoch) {
                return res.status(400).json({
                    error: 'Missing required parameters: figureName, category, epoch'
                });
            }

            console.log(`🔍 Getting gallery for ${figureName} (${category}/${epoch})`);

            const images = await this.imageService.getFigureGallery(
                figureName,
                category,
                epoch,
                parseInt(limit)
            );

            if (!images || images.length === 0) {
                console.log(`❌ No gallery images found for ${figureName}`);
                return res.status(404).json({
                    error: 'No images found for the specified parameters'
                });
            }

            console.log(`✅ Returning ${images.length} gallery images for ${figureName}`);

            res.json({
                success: true,
                images,
                figureName,
                category,
                epoch,
                count: images.length
            });

        } catch (error) {
            console.error('❌ Error getting figure gallery:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get image statistics
     */
    async getImageStats(req, res) {
        try {
            console.log('🔍 Getting image statistics');
            
            const stats = await this.imageService.getImageStats();
            
            console.log(`✅ Image stats: ${stats.totalFigures} figures, ${stats.totalImages} images`);

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            console.error('❌ Error getting image stats:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get stories with images integrated
     */
    async getStoryWithImages(req, res) {
        try {
            const { category, epoch, language = 'en', count = 1, storyType = 'historical-figure' } = req.query;

            if (!category || !epoch) {
                return res.status(400).json({
                    error: 'Missing required parameters: category, epoch'
                });
            }

            console.log(`🔍 Getting stories with images for ${category}/${epoch}`);

            // Get stories from existing service
            const stories = await this.getStoriesFromService(category, epoch, language, count, req);

            if (!stories || stories.length === 0) {
                return res.status(404).json({
                    error: 'No stories found for the specified parameters'
                });
            }

            // Enhance stories with images
            const enhancedStories = await Promise.all(
                stories.map(async (story) => {
                    try {
                        // Extract figure name from story
                        const figureName = this.extractFigureName(story);
                        
                        if (figureName) {
                            console.log(`🔍 Looking for images for ${figureName}`);
                            
                            // Check for existing images
                            const existingImages = await this.imageService.getFigureImages(
                                figureName,
                                category,
                                epoch,
                                'portraits'
                            );

                            if (existingImages && existingImages.length > 0) {
                                console.log(`✅ Found images for ${figureName}`);
                                
                                const gallery = await this.imageService.getFigureGallery(
                                    figureName,
                                    category,
                                    epoch,
                                    3
                                );

                                return {
                                    ...story,
                                    figureName,
                                    images: {
                                        portrait: existingImages[0],
                                        gallery
                                    },
                                    imageStatus: 'loaded'
                                };
                            } else {
                                console.log(`🔄 No images found for ${figureName}, using fallback`);
                                
                                // Use category fallback
                                const fallbackImages = this.imageService.getFallbackImages(category);
                                
                                return {
                                    ...story,
                                    figureName,
                                    images: {
                                        portrait: {
                                            url: fallbackImages.portrait,
                                            source: 'Fallback',
                                            reliability: 'Medium',
                                            priority: 50,
                                            createdAt: new Date()
                                        },
                                        gallery: fallbackImages.gallery.map((url, index) => ({
                                            url,
                                            source: 'Fallback',
                                            reliability: 'Medium',
                                            priority: 40 - index,
                                            createdAt: new Date()
                                        }))
                                    },
                                    imageStatus: 'fallback'
                                };
                            }
                        }

                        console.log(`❌ No figure name extracted from story`);
                        return {
                            ...story,
                            images: null,
                            imageStatus: 'no-figure'
                        };
                    } catch (error) {
                        console.error(`❌ Error enhancing story with images:`, error);
                        return {
                            ...story,
                            images: null,
                            imageStatus: 'error'
                        };
                    }
                })
            );

            console.log(`✅ Returning ${enhancedStories.length} enhanced stories`);

            res.json({
                success: true,
                stories: enhancedStories,
                category,
                epoch,
                language,
                count: enhancedStories.length
            });

        } catch (error) {
            console.error('❌ Error getting story with images:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get stories from the historical figures service
     */
    async getStoriesFromService(category, epoch, language, count, req) {
        try {
            // Access the historical figures service directly from the backend server
            if (!req.app.locals.historicalFiguresService) {
                throw new Error('Historical figures service not available');
            }
            
            // Get a single story and return it as an array
            const story = await req.app.locals.historicalFiguresService.getRandomStory(category, epoch, language);
            return story ? [story] : [];
        } catch (error) {
            console.error('❌ Error getting stories from service:', error);
            throw error;
        }
    }

    /**
     * Extract figure name from story content
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
        const text = (story.title || story.content || '').toLowerCase();
        
        // Common historical figure patterns
        const patterns = [
            /(archimedes|einstein|newton|curie|da vinci|leonardo|marie|isaac|albert)/i,
            /(hippocrates|euclid|aristotle|pythagoras|plato|socrates)/i,
            /(galileo|copernicus|kepler|tesla|edison|bell)/i,
            /(darwin|pasteur|mendel|franklin|goodall|carson)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
}

export default HistoricalFiguresImageAPI; 