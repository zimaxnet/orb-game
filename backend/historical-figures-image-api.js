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

            const image = await this.imageService.getBestImage(
                figureName,
                category,
                epoch,
                contentType
            );

            if (!image) {
                return res.status(404).json({
                    error: 'No image found for the specified parameters'
                });
            }

            res.json({
                success: true,
                image,
                figureName,
                category,
                epoch,
                contentType
            });

        } catch (error) {
            console.error('Error getting best image:', error);
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

            const images = await this.imageService.getFigureGallery(
                figureName,
                category,
                epoch,
                parseInt(limit)
            );

            if (!images || images.length === 0) {
                return res.status(404).json({
                    error: 'No images found for the specified parameters'
                });
            }

            res.json({
                success: true,
                images,
                figureName,
                category,
                epoch,
                count: images.length
            });

        } catch (error) {
            console.error('Error getting figure gallery:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get images by content type for a figure
     */
    async getImagesByType(req, res) {
        try {
            const { figureName, category, epoch, contentType } = req.query;

            if (!figureName || !category || !epoch || !contentType) {
                return res.status(400).json({
                    error: 'Missing required parameters: figureName, category, epoch, contentType'
                });
            }

            const images = await this.imageService.getFigureImages(
                figureName,
                category,
                epoch,
                contentType
            );

            if (!images || images.length === 0) {
                return res.status(404).json({
                    error: 'No images found for the specified parameters'
                });
            }

            res.json({
                success: true,
                images,
                figureName,
                category,
                epoch,
                contentType,
                count: images.length
            });

        } catch (error) {
            console.error('Error getting images by type:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get image by permalink
     */
    async getImageByPermalink(req, res) {
        try {
            const { permalink } = req.params;

            if (!permalink) {
                return res.status(400).json({
                    error: 'Missing required parameter: permalink'
                });
            }

            const image = await this.imageService.getImageByPermalink(permalink);

            if (!image) {
                return res.status(404).json({
                    error: 'No image found for the specified permalink'
                });
            }

            res.json({
                success: true,
                image,
                permalink
            });

        } catch (error) {
            console.error('Error getting image by permalink:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Get most accessed images
     */
    async getMostAccessedImages(req, res) {
        try {
            const { limit = 10 } = req.query;

            const images = await this.imageService.getMostAccessedImages(parseInt(limit));

            res.json({
                success: true,
                images,
                count: images.length
            });

        } catch (error) {
            console.error('Error getting most accessed images:', error);
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
            const stats = await this.imageService.getImageStats();

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            console.error('Error getting image stats:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Import image data from JSON file
     */
    async importImageData(req, res) {
        try {
            const { filePath } = req.body;

            if (!filePath) {
                return res.status(400).json({
                    error: 'Missing required parameter: filePath'
                });
            }

            const result = await this.imageService.importImageData(filePath);

            res.json({
                success: true,
                message: 'Image data import completed',
                result
            });

        } catch (error) {
            console.error('Error importing image data:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Clean up image data
     */
    async cleanupImages(req, res) {
        try {
            const deletedCount = await this.imageService.cleanupImages();

            res.json({
                success: true,
                message: 'Image cleanup completed',
                deletedCount
            });

        } catch (error) {
            console.error('Error cleaning up images:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Populate images for a story asynchronously
     */
    async populateImagesForStory(req, res) {
        try {
            const { story, category, epoch } = req.body;

            if (!story || !category || !epoch) {
                return res.status(400).json({
                    error: 'Missing required parameters: story, category, epoch'
                });
            }

            const imageData = await this.imageService.populateImagesForStory(story, category, epoch);

            res.json({
                success: true,
                imageData,
                message: imageData ? 'Images found and populated' : 'No images found, background search triggered'
            });

        } catch (error) {
            console.error('Error populating images for story:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Enhanced story endpoint that includes images (asynchronous loading)
     */
    async getStoryWithImages(req, res) {
        try {
            const { category, epoch, language = 'en', count = 1, storyType = 'historical-figure' } = req.query;

            if (!category || !epoch) {
                return res.status(400).json({
                    error: 'Missing required parameters: category, epoch'
                });
            }

            // Get stories from existing service
            // Note: historicalFiguresService is a global variable in the backend server
            // We need to access it through the request context
            const stories = await this.getStoriesFromService(category, epoch, language, count, req);

            if (!stories || stories.length === 0) {
                return res.status(404).json({
                    error: 'No stories found for the specified parameters'
                });
            }

            // Return stories immediately, then populate images asynchronously
            const enhancedStories = await Promise.all(
                stories.map(async (story) => {
                    try {
                        // Extract figure name from story
                        const figureName = this.extractFigureName(story);
                        
                        if (figureName) {
                            // Check for existing images first
                            const existingImages = await this.imageService.getFigureImages(
                                figureName,
                                category,
                                epoch,
                                'portraits'
                            );

                            if (existingImages && existingImages.length > 0) {
                                // Images exist, include them immediately
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
                                // No images exist, trigger background search
                                this.imageService.triggerBackgroundImageSearch(figureName, category, epoch);
                                
                                return {
                                    ...story,
                                    figureName,
                                    images: null,
                                    imageStatus: 'searching'
                                };
                            }
                        }

                        return {
                            ...story,
                            images: null,
                            imageStatus: 'no-figure'
                        };
                    } catch (error) {
                        console.error(`Error enhancing story with images:`, error);
                        return {
                            ...story,
                            images: null,
                            imageStatus: 'error'
                        };
                    }
                })
            );

            res.json({
                success: true,
                stories: enhancedStories,
                category,
                epoch,
                language,
                count: enhancedStories.length
            });

        } catch (error) {
            console.error('Error getting story with images:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    }

    /**
     * Check for updated images for a story
     */
    async checkForUpdatedImages(req, res) {
        try {
            const { figureName, category, epoch } = req.query;

            if (!figureName || !category || !epoch) {
                return res.status(400).json({
                    error: 'Missing required parameters: figureName, category, epoch'
                });
            }

            const images = await this.imageService.getFigureImages(figureName, category, epoch, 'portraits');

            if (images && images.length > 0) {
                const gallery = await this.imageService.getFigureGallery(figureName, category, epoch, 3);
                
                res.json({
                    success: true,
                    images: {
                        portrait: images[0],
                        gallery
                    },
                    figureName,
                    category,
                    epoch
                });
            } else {
                res.json({
                    success: false,
                    message: 'No images available yet',
                    figureName,
                    category,
                    epoch
                });
            }

        } catch (error) {
            console.error('Error checking for updated images:', error);
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
            // Access the historical figures service through the global variable
            // This is a workaround since the service is not in app.locals
            const response = await fetch(`${req.protocol}://${req.get('host')}/api/orb/positive-news/${category}?count=${count}&epoch=${epoch}&language=${language}&storyType=historical-figure`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch stories: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting stories from service:', error);
            throw error;
        }
    }

    /**
     * Extract figure name from story content
     */
    extractFigureName(story) {
        try {
            // Try to extract from headline first
            if (story.headline) {
                // Look for common patterns in headlines - improved to capture full names
                const patterns = [
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+of\s+[A-Z][a-z]+)/, // Full names with "of" (required)
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+the\s+[A-Z][a-z]+)/, // Names with "the" (required)
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // Basic name pattern (fallback)
                    /(?:about|story of|tale of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+of\s+[A-Z][a-z]+)/i,
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+of\s+[A-Z][a-z]+)\s+(?:and|&)\s+his/i,
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+of\s+[A-Z][a-z]+)\s+(?:and|&)\s+her/i,
                ];

                for (const pattern of patterns) {
                    const match = story.headline.match(pattern);
                    if (match && match[1]) {
                        const extractedName = match[1].trim();
                        // Validate that we have a reasonable name (at least 2 characters)
                        if (extractedName.length >= 2) {
                            return extractedName;
                        }
                    }
                }
            }

            // Try to extract from content
            if (story.content) {
                // Look for names in the first few sentences - improved patterns
                const firstSentence = story.content.split('.')[0];
                const namePatterns = [
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+of\s+[A-Z][a-z]+)/, // Full names with "of" (required)
                    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/, // Basic name pattern (fallback)
                ];
                
                for (const pattern of namePatterns) {
                    const match = firstSentence.match(pattern);
                    if (match && match[1]) {
                        const extractedName = match[1].trim();
                        // Validate that we have a reasonable name (at least 2 characters)
                        if (extractedName.length >= 2) {
                            return extractedName;
                        }
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error extracting figure name:', error);
            return null;
        }
    }
}

export default HistoricalFiguresImageAPI; 