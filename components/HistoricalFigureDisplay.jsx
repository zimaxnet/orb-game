import React, { useState, useEffect } from 'react';
import './HistoricalFigureDisplay.css';

const HistoricalFigureDisplay = ({ story, onClose, onLearnMore }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [imageStatus, setImageStatus] = useState('searching'); // Initialize as searching
    const [images, setImages] = useState(story.images || {});
    const [figureName, setFigureName] = useState(story.historicalFigure || story.figureName);
    const [showFullStory, setShowFullStory] = useState(false);

    const portrait = images?.portrait;
    const gallery = images?.gallery || [];

    // Extract brief content (first 2-3 sentences) for initial display
    const getBriefContent = (content) => {
        if (!content) return '';
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        return sentences.slice(0, 2).join('. ') + '.';
    };

    const briefContent = getBriefContent(story.content);

    useEffect(() => {
        if (portrait) {
            setImageLoading(true);
            setImageError(false);
        }
    }, [portrait]);

    useEffect(() => {
        // Always try to load images for historical figures
        if (figureName) {
            console.log(`🔍 Starting image search for: ${figureName} (${story.category}/${story.epoch})`);
            setImageStatus('searching');
            
            const pollForImages = async () => {
                try {
                    console.log(`🔍 Polling for images: ${figureName} (${story.category}/${story.epoch})`);
                    const response = await fetch(`https://api.orbgame.us/api/orb/images/best?figureName=${encodeURIComponent(figureName)}&category=${encodeURIComponent(story.category)}&epoch=${encodeURIComponent(story.epoch)}&contentType=portraits`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.image) {
                            console.log(`✅ Found image for ${figureName}:`, data.image.url);
                            setImages({
                                portrait: data.image,
                                gallery: [data.image]
                            });
                            setImageStatus('loaded');
                            setImageLoading(false);
                        } else {
                            console.log(`❌ No image found for ${figureName}`);
                            setImageStatus('no-figure');
                        }
                    } else {
                        console.log(`❌ Image API error for ${figureName}:`, response.status);
                        setImageStatus('error');
                    }
                } catch (error) {
                    console.error('Error polling for images:', error);
                    setImageStatus('error');
                }
            };

            // Poll immediately, then every 2 seconds for up to 30 seconds
            pollForImages();
            const pollInterval = setInterval(pollForImages, 2000);
            const timeout = setTimeout(() => {
                clearInterval(pollInterval);
                if (imageStatus === 'searching') {
                    console.log(`⏰ Image search timeout for ${figureName}`);
                    setImageStatus('timeout');
                }
            }, 30000); // 30 seconds

            return () => {
                clearInterval(pollInterval);
                clearTimeout(timeout);
            };
        } else {
            // No figure name, set status to no-figure
            setImageStatus('no-figure');
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

    const renderImageStatus = () => {
        switch (imageStatus) {
            case 'searching':
                return (
                    <div className="image-status-inline searching">
                        <div className="loading-spinner"></div>
                        <p>Searching for images...</p>
                        <small>This may take a few moments</small>
                    </div>
                );
            case 'timeout':
                return (
                    <div className="image-status-inline timeout">
                        <div className="timeout-icon">⏰</div>
                        <p>Image search timed out</p>
                        <small>Images may be available later</small>
                    </div>
                );
            case 'no-figure':
                return (
                    <div className="image-status-inline no-figure">
                        <div className="no-figure-icon">❓</div>
                        <p>No historical figure detected</p>
                        <small>This story may not be about a specific person</small>
                    </div>
                );
            case 'error':
                return (
                    <div className="image-status-inline error">
                        <div className="error-icon">⚠️</div>
                        <p>Error loading images</p>
                        <small>Please try again later</small>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderImage = () => {
        const currentImage = getCurrentImage();
        
        if (!currentImage) {
            return (
                <div className="figure-placeholder-inline">
                    <div className="placeholder-icon">👤</div>
                    <p>No image available</p>
                </div>
            );
        }

        return (
            <div className="figure-image-container-inline">
                {imageLoading && (
                    <div className="image-loading-inline">
                        <div className="loading-spinner"></div>
                        <p>Loading image...</p>
                    </div>
                )}
                
                {imageError && (
                    <div className="image-error-inline">
                        <div className="error-icon">⚠️</div>
                        <p>Failed to load image</p>
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
                <div className="figure-story-section">
                    <h3 className="story-headline-normal">{story.headline}</h3>
                    <div className="story-content-scrollable">
                        {showFullStory ? story.content : briefContent}
                    </div>
                    
                    {/* Images displayed inline with text */}
                    {imageStatus === 'loaded' ? (
                        <>
                            {renderImage()}
                            {renderImageInfo()}
                        </>
                    ) : (
                        renderImageStatus()
                    )}
                    
                    <div className="story-actions">
                        {!showFullStory && (
                            <button 
                                className="more-button"
                                onClick={() => setShowFullStory(true)}
                            >
                                More
                            </button>
                        )}
                        
                        {showFullStory && story.learnMore && (
                            <button 
                                className="learn-more-button"
                                onClick={() => onLearnMore(story)}
                            >
                                Learn More
                            </button>
                        )}
                    </div>
                </div>
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