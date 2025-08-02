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
        
        if (Array.isArray(storyImages)) {
            // New format: array of images
            return storyImages.filter(img => img && img.url);
        } else if (storyImages.portrait || storyImages.gallery) {
            // Old format: object with portrait and gallery
            const processed = [];
            if (storyImages.portrait && storyImages.portrait.url) {
                processed.push(storyImages.portrait);
            }
            if (storyImages.gallery && Array.isArray(storyImages.gallery)) {
                processed.push(...storyImages.gallery.filter(img => img && img.url));
            }
            return processed;
        }
        return [];
    };

    const getBriefAchievement = () => {
        if (story.accomplishment) return story.accomplishment;
        if (story.summary) return story.summary;
        if (story.fullText) {
            // Extract first sentence or first 100 characters
            const firstSentence = story.fullText.split('.')[0];
            return firstSentence.length > 100 ? story.fullText.substring(0, 100) + '...' : firstSentence;
        }
        return null;
    };

    const getFigureName = () => {
        return figureName || story.historicalFigure || story.figureName || 'Historical Figure';
    };

    useEffect(() => {
        const processedImages = processImages(story.images);
        setImages(processedImages);
        
        if (processedImages.length === 0) {
            setImageStatus('no-images');
            setImageError(false);
            setImageLoading(false);
        } else {
            setImageStatus('loaded');
            setImageError(false);
            setImageLoading(false);
        }
    }, [story.images]);

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
        // When image fails, treat as no images available
        setImageStatus('no-images');
    };

    const nextImage = () => {
        if (processedImages.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % processedImages.length);
        }
    };

    const prevImage = () => {
        if (processedImages.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);
        }
    };

    const getCurrentImage = () => {
        return processedImages[currentImageIndex] || null;
    };

    const renderImage = () => {
        const currentImage = getCurrentImage();
        if (!currentImage) return null;

        return (
            <div className="figure-image-container-inline">
                <img
                    src={currentImage.url}
                    alt={`${figureName} - Portrait`}
                    className={`figure-image-inline ${imageLoading ? 'hidden' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
                {imageLoading && (
                    <div className="image-loading-inline">
                        <div className="loading-spinner"></div>
                        <p>Loading image...</p>
                    </div>
                )}
                {imageError && (
                    <div className="image-error-inline">
                        <div className="error-icon">⚠️</div>
                        <p>Image unavailable</p>
                    </div>
                )}
                {processedImages.length > 1 && (
                    <>
                        <button className="gallery-nav" onClick={prevImage} aria-label="Previous image">
                            ‹
                        </button>
                        <button className="gallery-nav" onClick={nextImage} aria-label="Next image">
                            ›
                        </button>
                        <div className="gallery-counter">
                            {currentImageIndex + 1} / {processedImages.length}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderImageInfo = () => {
        const currentImage = getCurrentImage();
        if (!currentImage) return null;

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

    const processedImages = processImages(story.images);
    const briefAchievement = getBriefAchievement();

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

                {/* Images Section - Only display if valid images exist and are not in error state */}
                {imageStatus === 'loaded' && processedImages.length > 0 && !imageError && (
                    <div className="figure-images-section">
                        {renderImage()}
                        {renderImageInfo()}
                    </div>
                )}

                {/* Story Content - Always show, but with different styling based on image availability */}
                <div className="figure-story-content">
                    <div className="story-content">
                        <p className="story-text">{story.fullText || story.summary || 'No additional information available.'}</p>
                    </div>
                </div>
            </div>

            {/* Gallery thumbnails - Only show if multiple images and no errors */}
            {processedImages.length > 1 && imageStatus === 'loaded' && !imageError && (
                <div className="gallery-thumbnails">
                    <div className="thumbnail-container">
                        {processedImages.map((image, index) => (
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