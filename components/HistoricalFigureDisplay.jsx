import React, { useState, useEffect } from 'react';
import './HistoricalFigureDisplay.css';

const HistoricalFigureDisplay = ({ story, onClose, onLearnMore }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [imageStatus, setImageStatus] = useState('checking');
    const [images, setImages] = useState([]);
    const [figureName, setFigureName] = useState(story.historicalFigure || story.figureName);

    // Handle both old format (object with portrait/gallery) and new format (array)
    const processImages = (storyImages) => {
        if (!storyImages) return [];
        
        // New format: images is an array
        if (Array.isArray(storyImages)) {
            return storyImages;
        }
        
        // Old format: images is an object with portrait and gallery
        const processedImages = [];
        if (storyImages.portrait) {
            processedImages.push(storyImages.portrait);
        }
        if (storyImages.gallery && Array.isArray(storyImages.gallery)) {
            processedImages.push(...storyImages.gallery);
        }
        return processedImages;
    };

    const processedImages = processImages(story.images);
    const portrait = processedImages[0]; // First image as portrait
    const gallery = processedImages.slice(1); // Rest as gallery

    // Get brief achievement text (first sentence only)
    const getBriefAchievement = () => {
        if (story.summary) return story.summary;
        if (story.headline) {
            // Extract achievement from headline (e.g., "Archimedes: Innovator of Levers and Buoyancy")
            const colonIndex = story.headline.indexOf(':');
            if (colonIndex > 0) {
                return story.headline.substring(colonIndex + 1).trim();
            }
            return story.headline;
        }
        return '';
    };

    const briefAchievement = getBriefAchievement();
    
    // Get the historical figure name from the headline or story data
    const getFigureName = () => {
        if (story.historicalFigure) return story.historicalFigure;
        if (story.figureName) return story.figureName;
        if (story.headline) {
            // Extract name from headline (e.g., "Archimedes: Innovator of Levers and Buoyancy")
            const colonIndex = story.headline.indexOf(':');
            if (colonIndex > 0) {
                return story.headline.substring(0, colonIndex);
            }
            return story.headline;
        }
        return 'Historical Figure';
    };

    useEffect(() => {
        // Check if we have valid images in the story data
        const hasValidImages = processedImages.length > 0 && processedImages.some(img => img && img.url);

        if (hasValidImages) {
            console.log(`✅ Using images from story data for: ${figureName}`);
            console.log(`🖼️  Total images: ${processedImages.length}`);
            console.log(`🖼️  Portrait: ${portrait ? 'Available' : 'Not available'}`);
            console.log(`🖼️  Gallery: ${gallery.length} images`);
            setImages(processedImages);
            setImageStatus('loaded');
            setImageLoading(false);
        } else {
            console.log(`❌ No valid images found in story data for: ${figureName}`);
            setImageStatus('no-images');
        }
    }, [story.images, figureName, processedImages, portrait, gallery]);

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    const nextImage = () => {
        if (gallery.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
        }
    };

    const prevImage = () => {
        if (gallery.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
        }
    };

    const getCurrentImage = () => {
        if (gallery.length > 0 && showGallery) {
            return gallery[currentImageIndex];
        }
        return portrait;
    };

    const renderImage = () => {
        const currentImage = getCurrentImage();
        
        if (!currentImage || !currentImage.url) {
            // Show story text directly when no image is available - clean display
            return (
                <div className="figure-story-content">
                    <div className="story-content">
                        <p className="story-text">{story.fullText || story.summary || 'No additional information available.'}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="figure-image-container-inline">
                {imageLoading && (
                    <div className="image-loading-inline">
                        <div className="loading-spinner"></div>
                    </div>
                )}
                
                {imageError && (
                    <div className="image-error-inline">
                        <div className="error-icon">⚠️</div>
                        <div className="error-message">Image unavailable</div>
                        {/* Show story text directly when image fails to load - clean display */}
                        <div className="story-content">
                            <p className="story-text">{story.fullText || story.summary || 'No additional information available.'}</p>
                        </div>
                    </div>
                )}

                <img
                    src={currentImage.url}
                    alt={`${figureName || 'Historical figure'}`}
                    className={`figure-image-inline ${imageLoading ? 'hidden' : ''} ${imageError ? 'hidden' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        objectFit: 'cover',
                        borderRadius: '8px'
                    }}
                />

                {gallery.length > 1 && showGallery && (
                    <div className="gallery-controls-inline">
                        <button 
                            className="gallery-nav prev" 
                            onClick={prevImage}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <span className="gallery-counter">
                            {currentImageIndex + 1} / {gallery.length}
                        </span>
                        <button 
                            className="gallery-nav next" 
                            onClick={nextImage}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </div>
                )}

                {gallery.length > 1 && (
                    <button 
                        className="gallery-toggle-inline"
                        onClick={() => setShowGallery(!showGallery)}
                    >
                        {showGallery ? 'Show Portrait' : 'Show Gallery'}
                    </button>
                )}
            </div>
        );
    };

    const renderImageInfo = () => {
        const currentImage = getCurrentImage();
        
        if (!currentImage || !currentImage.url) return null;

        return (
            <div className="image-info-inline">
                <div className="image-source">
                    <span className="source-label">Source:</span>
                    <span className="source-name">{currentImage.source}</span>
                </div>
                {currentImage.reliability && (
                    <div className="image-reliability">
                        <span className="reliability-label">Reliability:</span>
                        <span className="reliability-value">{currentImage.reliability}</span>
                    </div>
                )}
                {currentImage.priority && (
                    <div className="image-priority">
                        <span className="priority-label">Priority:</span>
                        <span className="priority-value">{currentImage.priority}</span>
                    </div>
                )}
                {currentImage.permalink && (
                    <div className="image-permalink">
                        <span className="permalink-label">Permalink:</span>
                        <span className="permalink-value">{currentImage.permalink}</span>
                    </div>
                )}
                {currentImage.searchTerm && (
                    <div className="image-search-term">
                        <span className="search-label">Search:</span>
                        <span className="search-term">{currentImage.searchTerm}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="historical-figure-display-inline">
            <div className="figure-header">
                <h2 className="figure-name-normal">{getFigureName()}</h2>
                <button className="close-button-tiny" onClick={onClose} aria-label="Close">
                    ×
                </button>
            </div>

            <div className="figure-content-inline">
                {/* Brief Accomplishment - Only show if there's an achievement to display */}
                {briefAchievement && (
                    <div className="figure-header-section">
                        <p className="figure-accomplishment">{briefAchievement}</p>
                    </div>
                )}

                {/* Images Section - Only display if valid images exist */}
                {imageStatus === 'loaded' && processedImages.length > 0 && (
                    <div className="figure-images-section">
                        {renderImage()}
                        {renderImageInfo()}
                    </div>
                )}

                {/* Story Content - Show when no images are available or when image fails */}
                {(imageStatus === 'no-images' || imageError) && (
                    <div className="figure-story-content">
                        <div className="story-content">
                            <p className="story-text">{story.fullText || story.summary || 'No additional information available.'}</p>
                        </div>
                    </div>
                )}

                {/* Always show story content when images are available but not loading/error */}
                {imageStatus === 'loaded' && !imageLoading && !imageError && processedImages.length > 0 && (
                    <div className="figure-story-content">
                        <div className="story-content">
                            <p className="story-text">{story.fullText || story.summary || 'No additional information available.'}</p>
                        </div>
                    </div>
                )}
            </div>

            {gallery.length > 1 && imageStatus === 'loaded' && !imageError && (
                <div className="gallery-thumbnails">
                    <div className="thumbnail-container">
                        {gallery.map((image, index) => (
                            <button
                                key={index}
                                className={`thumbnail ${index === currentImageIndex && showGallery ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setShowGallery(true);
                                }}
                                aria-label={`View image ${index + 1}`}
                            >
                                <img
                                    src={image.url}
                                    alt={`${figureName} - Image ${index + 1}`}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoricalFigureDisplay; 