import React, { useState, useEffect } from 'react';
import './HistoricalFigureDisplay.css';

const HistoricalFigureDisplay = ({ story, onClose, onLearnMore }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [imageStatus, setImageStatus] = useState('checking');
    const [images, setImages] = useState(story.images || {});
    const [figureName, setFigureName] = useState(story.historicalFigure || story.figureName);

    const portrait = images?.portrait;
    const gallery = images?.gallery || [];

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
        // Only check for preloaded images in MongoDB - no external loading
        if (figureName) {
            console.log(`🔍 Checking preloaded images for: ${figureName} (${story.category}/${story.epoch})`);
            setImageStatus('checking');
            
            const checkPreloadedImages = async () => {
                try {
                    console.log(`🔍 Checking MongoDB for preloaded images: ${figureName} (${story.category}/${story.epoch})`);
                    const response = await fetch(`https://api.orbgame.us/api/orb/images/best?figureName=${encodeURIComponent(figureName)}&category=${encodeURIComponent(story.category)}&epoch=${encodeURIComponent(story.epoch)}&contentType=portraits`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.image) {
                            console.log(`✅ Found preloaded image for ${figureName}:`, data.image.url);
                            setImages({
                                portrait: data.image,
                                gallery: [data.image]
                            });
                            setImageStatus('loaded');
                            setImageLoading(false);
                        } else {
                            console.log(`❌ No preloaded images found for ${figureName}`);
                            setImageStatus('no-images');
                        }
                    } else {
                        console.log(`❌ Image API error for ${figureName}:`, response.status);
                        setImageStatus('no-images');
                    }
                } catch (error) {
                    console.error('Error checking preloaded images:', error);
                    setImageStatus('no-images');
                }
            };

            // Check immediately for preloaded images
            checkPreloadedImages();
        } else {
            // No figure name, set status to no-images
            setImageStatus('no-images');
        }
    }, [figureName, story.category, story.epoch]);

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
        
        if (!currentImage) {
            return null; // Don't render anything if no image
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
                    </div>
                )}

                <img
                    src={currentImage.url}
                    alt={`${figureName || 'Historical figure'}`}
                    className={`figure-image-inline ${imageLoading ? 'hidden' : ''} ${imageError ? 'hidden' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
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
        
        if (!currentImage) return null;

        return (
            <div className="image-info-inline">
                <div className="image-source">
                    <span className="source-label">Source:</span>
                    <span className="source-name">{currentImage.source}</span>
                </div>
                <div className="image-licensing">
                    <span className="licensing-label">License:</span>
                    <span className="licensing-type">{currentImage.licensing}</span>
                </div>
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
                <h2 className="figure-name-normal">{figureName || 'Historical Figure'}</h2>
                <button className="close-button" onClick={onClose} aria-label="Close">
                    ×
                </button>
            </div>

            <div className="figure-content-inline">
                {/* Historical Figure Name and Brief Accomplishment */}
                <div className="figure-header-section">
                    <h2 className="figure-name">{getFigureName()}</h2>
                    {briefAchievement && (
                        <p className="figure-accomplishment">{briefAchievement}</p>
                    )}
                </div>

                {/* Images Section - Only display if preloaded images exist */}
                {imageStatus === 'loaded' && (
                    <div className="figure-images-section">
                        {renderImage()}
                        {renderImageInfo()}
                    </div>
                )}

                {/* No Image Placeholder - Show when no images are available */}
                {imageStatus === 'no-images' && (
                    <div className="no-image-placeholder">
                        <div className="placeholder-icon">🖼️</div>
                        <p className="placeholder-text">No image available for this historical figure</p>
                    </div>
                )}
            </div>

            {gallery.length > 1 && imageStatus === 'loaded' && (
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