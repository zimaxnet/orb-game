import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

import { getPositiveNews } from '../api/orbApi';
import { BACKEND_URL } from '../api/orbApi';
import { useLanguage } from '../contexts/LanguageContext';

import './OrbGame.css';

// Milky Way Background Component
function MilkyWayBackground() {
  const starsRef = useRef();
  const milkyWayRef = useRef();
  
  useEffect(() => {
    if (starsRef.current) {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });
      
      // Create thousands of stars
      const starsCount = 5000;
      const positions = new Float32Array(starsCount * 3);
      const colors = new Float32Array(starsCount * 3);
      
      for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a large sphere
        const radius = 50 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Vary star colors slightly
        const starColor = new THREE.Color();
        const temperature = 0.5 + Math.random() * 0.5;
        starColor.setHSL(0.6, 0.1, temperature);
        
        colors[i3] = starColor.r;
        colors[i3 + 1] = starColor.g;
        colors[i3 + 2] = starColor.b;
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      starsRef.current.add(stars);
    }
    
    if (milkyWayRef.current) {
      // Create Milky Way band
      const milkyWayGeometry = new THREE.PlaneGeometry(200, 100);
      const milkyWayMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a4a8a,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
      milkyWay.rotation.x = Math.PI / 2;
      milkyWay.rotation.z = Math.PI / 4;
      milkyWay.position.y = 20;
      milkyWayRef.current.add(milkyWay);
      
      // Add nebula-like clouds
      for (let i = 0; i < 3; i++) {
        const nebulaGeometry = new THREE.SphereGeometry(10 + Math.random() * 20, 32, 32);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.3, 0.1),
          transparent: true,
          opacity: 0.1
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        nebula.position.set(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 100
        );
        milkyWayRef.current.add(nebula);
      }
    }
  }, []);
  
  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0005;
    }
    if (milkyWayRef.current) {
      milkyWayRef.current.rotation.y += 0.0002;
    }
  });
  
  return (
    <>
      <group ref={starsRef} />
      <group ref={milkyWayRef} />
    </>
  );
}

function OrbGame() {
  const { language, toggleLanguage, t } = useLanguage();
  
  const [categories] = useState([
    { name: 'Technology', color: '#00ff88' },  { name: 'Science', color: '#3366ff' },
    { name: 'Art', color: '#ff6b6' },   { name: 'Nature', color: '#4ecdc4' },   { name: 'Sports', color: '#ffa726' },    { name: 'Music', color: '#ab47bc' },    { name: 'Space', color: '#7c4dff' },    { name: 'Innovation', color: '#26c6da' }
  ]);
  // Remove score/streak state
  // const [score, setScore] = useState(0);
  // const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [currentNews, setCurrentNews] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [clickedOrbs, setClickedOrbs] = useState(new Set());
  const audioRef = useRef(new Audio());
  const howToPlayRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [newsStories, setNewsStories] = useState([]);
  // Add audio loading state
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);

  // Add epoch state
  const [currentEpoch, setCurrentEpoch] = useState('Modern');
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  
  // Add AI source tracking state
  const [currentAISource, setCurrentAISource] = useState('');
  
  // Add AI model selection state
  const [selectedModel, setSelectedModel] = useState('grok-4');
  const aiModels = [
    { id: 'grok-4', name: 'Grok 4', description: 'Advanced reasoning and analysis' },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar', description: 'Real-time web search and synthesis' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and creative content generation' },
    { id: 'o4-mini', name: 'O4-Mini', description: 'Fast and efficient processing' }
  ];
  
  // Add drag and center state
  const [draggedOrb, setDraggedOrb] = useState(null);
  const [orbInCenter, setOrbInCenter] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  


  // Enhanced touch/swipe handlers for the how to play overlay
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Calculate swipe direction for visual feedback
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
    }
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const minSwipeDistance = 30; // Reduced for easier dismissal

    // Check if swipe distance is sufficient
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      // Any direction swipe will dismiss
      setShowHowToPlay(false);
    }
    setSwipeDirection(null);
  };

  // Mouse click handler for desktop
  const handleHowToPlayClick = () => {
    setShowHowToPlay(false);
  };



  const handleSatelliteClick = async (category) => {
    if (isPlaying || isLoading || orbInCenter) return;
    
    // Start dragging the orb to center
    setDraggedOrb(category);
    setIsDragging(true);
    
    // Move orb to center position
    setTimeout(() => {
      setOrbInCenter(category);
      setIsDragging(false);
      setDraggedOrb(null);
      
      // Now load the story
      loadStoryForOrb(category);
    }, 1000); // 1 second animation to center
  };
  
  const loadStoryForOrb = async (category) => {
    if (isPlaying || isLoading) return;
    console.log('BACKEND_URL:', BACKEND_URL);
    setIsLoading(true);
    
    // Set initial loading message based on selected model and epoch
    const selectedModelInfo = aiModels.find(model => model.id === selectedModel);
    const epochDescriptions = {
      'Ancient': 'ancient civilizations and discoveries',
      'Medieval': 'medieval innovations and breakthroughs',
      'Industrial': 'industrial revolution and technological advances',
      'Modern': 'modern breakthroughs and innovations',
      'Future': 'futuristic technologies and possibilities'
    };
    const epochDesc = epochDescriptions[currentEpoch] || currentEpoch.toLowerCase();
    
    setCurrentAISource(selectedModelInfo.name);
    setCurrentNews({
      headline: t('news.generating'),
      summary: `${t(`loading.${currentEpoch.toLowerCase()}.${category.name.toLowerCase()}`)} ${selectedModelInfo.name}...`,
      fullText: t('news.creating'),
      source: selectedModelInfo.name,
      publishedAt: new Date().toISOString(),
      ttsAudio: null
    });
    
    try {
      // Always generate fresh stories from the AI model
      console.log('Generating fresh stories for:', category.name, 'epoch:', currentEpoch, 'model:', selectedModel);
      
      const generateResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category.name}?epoch=${currentEpoch}&model=${selectedModel}&count=5`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: category.name,
          epoch: currentEpoch,
          model: selectedModel,
          count: 5,
          prompt: `Generate 5 fascinating, positive ${category.name} stories from ${epochDesc}. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Make each story unique and captivating.`
        })
      });
      
      if (generateResponse.ok) {
        const newStories = await generateResponse.json();
        console.log('Generated fresh stories:', newStories);
        
        if (newStories && newStories.length > 0) {
          setNewsStories(newStories);
          setCurrentNewsIndex(0);
          setCurrentNews(newStories[0]);
          
          // Ensure TTS is ready before autoplaying
          if (newStories[0]?.ttsAudio && !isMuted) {
            // Small delay to ensure UI is updated before playing audio
            setTimeout(() => {
              playAudio();
            }, 800); // Increased delay to ensure proper synchronization
          }
        } else {
          // If no stories generated, try one more time with a different approach
          console.log('No stories generated, trying alternative approach...');
          setCurrentNews({
            headline: t('news.alternative'),
            summary: `${t(`loading.${currentEpoch.toLowerCase()}.${category.name.toLowerCase()}`)} ${selectedModelInfo.name}...`,
            fullText: t('news.creating'),
            source: selectedModelInfo.name,
            publishedAt: new Date().toISOString(),
            ttsAudio: null
          });
          
          const alternativeResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category.name}?epoch=${currentEpoch}&model=${selectedModel}&count=3`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              category: category.name,
              epoch: currentEpoch,
              model: selectedModel,
              count: 3,
              prompt: `Tell me about 3 incredible ${category.name} achievements from ${epochDesc}. Focus on the most remarkable and inspiring stories.`
            })
          });
          
          if (alternativeResponse.ok) {
            const alternativeStories = await alternativeResponse.json();
            if (alternativeStories && alternativeStories.length > 0) {
              setNewsStories(alternativeStories);
              setCurrentNewsIndex(0);
              setCurrentNews(alternativeStories[0]);
              
              if (alternativeStories[0]?.ttsAudio && !isMuted) {
                setTimeout(() => {
                  playAudio();
                }, 800); // Increased delay to ensure proper synchronization
              }
            } else {
              throw new Error('No stories could be generated');
            }
          } else {
            throw new Error('Alternative generation failed');
          }
        }
      } else {
        throw new Error('Failed to generate stories');
      }
    } catch (error) {
      console.error('Error generating stories:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Even on error, try to provide some content
      setCurrentNews({
        headline: t('news.connection.issue'),
        summary: `${t('news.try.again')} ${selectedModelInfo.name}.`,
        fullText: t('news.unavailable') + ' ' + t('news.switch.model'),
        source: selectedModelInfo.name,
        publishedAt: new Date().toISOString(),
        ttsAudio: null
      });
      setNewsStories([]);
      setCurrentNewsIndex(0);
    } finally {
      setIsLoading(false);
      setCurrentAISource('');
    }
  };
  
  const releaseOrbFromCenter = () => {
    setOrbInCenter(null);
    setCurrentNews(null);
    setNewsStories([]);
    setCurrentNewsIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (isPlaying) {
      if (newMutedState) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
      }
    }
  };

  const playAudio = () => {
    if (currentNews?.ttsAudio && !isMuted) {
      setIsAudioLoading(true);
      setAudioError(null);
      
      try {
        audioRef.current.src = `data:audio/mp3;base64,${currentNews.ttsAudio}`;
        
        // Add event listeners for better audio handling
        audioRef.current.onloadstart = () => {
          setIsAudioLoading(true);
        };
        
        audioRef.current.oncanplay = () => {
          setIsAudioLoading(false);
          setIsPlaying(true);
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsAudioLoading(false);
        };
        
        audioRef.current.onerror = (error) => {
          console.error('Audio playback error:', error);
          setAudioError('Failed to play audio');
          setIsAudioLoading(false);
          setIsPlaying(false);
        };
        
        // Start playing
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio play failed:', error);
            setAudioError('Failed to start audio playback');
            setIsAudioLoading(false);
            setIsPlaying(false);
          });
        }
      } catch (error) {
        console.error('Audio setup error:', error);
        setAudioError('Failed to setup audio');
        setIsAudioLoading(false);
      }
    }
  };



  const nextStory = () => {
    if (newsStories.length > 1) {
      const nextIndex = (currentNewsIndex + 1) % newsStories.length;
      setCurrentNewsIndex(nextIndex);
      setCurrentNews(newsStories[nextIndex]);
      
      // Ensure TTS is ready before autoplaying for the new story
      if (newsStories[nextIndex]?.ttsAudio && !isMuted) {
        setTimeout(() => {
          playAudio();
        }, 500); // Delay for story transition
      }
    }
  };

  const prevStory = () => {
    if (newsStories.length > 1) {
      const prevIndex = (currentNewsIndex - 1 + newsStories.length) % newsStories.length;
      setCurrentNewsIndex(prevIndex);
      setCurrentNews(newsStories[prevIndex]);
      
      // Ensure TTS is ready before autoplaying for the new story
      if (newsStories[prevIndex]?.ttsAudio && !isMuted) {
        setTimeout(() => {
          playAudio();
        }, 500); // Delay for story transition
      }
    }
  };

  return (
    <div className="orb-game-container">
      {/* Language Toggle */}
      <div className="language-toggle">
        <button 
          onClick={toggleLanguage}
          className={`language-button ${language === 'es' ? 'spanish' : 'english'}`}
          title={t('language.toggle')}
        >
          {language === 'en' ? '🇪🇸' : '🇺🇸'} {t(language === 'en' ? 'language.spanish' : 'language.english')}
        </button>
      </div>
      
      {/* How to Play Overlay */}
      {showHowToPlay && (
        <div 
          className={`how-to-play-overlay ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
          ref={howToPlayRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleHowToPlayClick}
        >
          <div className="how-to-play-content">
            <div className="how-to-play-header">
              <h2>🎮 {t('orb.game.how.to.play')}</h2>
              <button 
                className="close-how-to-play"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHowToPlay(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="how-to-play-steps">
              <div className="step">
                <span className="step-icon">🎯</span>
                <div className="step-text">
                  <h3>{t('orb.game.how.to.play.step1')}</h3>
                  <p>{t('orb.game.how.to.play.step2')}</p>
                </div>
              </div>
              <div className="step">
                <span className="step-icon">🎵</span>
                <div className="step-text">
                  <h3>{t('orb.game.how.to.play.step3')}</h3>
                  <p>{t('orb.game.how.to.play.step4')}</p>
                </div>
              </div>
              <div className="step">
                <span className="step-icon">🔄</span>
                <div className="step-text">
                  <h3>{t('orb.game.how.to.play.step4')}</h3>
                  <p>{t('orb.game.how.to.play.step4')}</p>
                </div>
              </div>
              <div className="step">
                <span className="step-icon">🌟</span>
                <div className="step-text">
                  <h3>Explore Categories</h3>
                  <p>See labeled orbs: {t('category.technology')}, {t('category.science')}, {t('category.art')}, {t('category.nature')}, {t('category.sports')}, {t('category.music')}, {t('category.space')}, {t('category.innovation')}</p>
                </div>
              </div>
            </div>
            <div className="how-to-play-footer">
              <p className="swipe-hint">💡 {t('orb.game.how.to.play.swipe')} {t('orb.game.how.to.play.click')}</p>
            </div>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} enablePan={false} />
        
        {/* Milky Way Background */}
        <MilkyWayBackground />
        
        {/* Central Orb */}
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#3366ff" />
        </Sphere>
        

        
        {/* Orbiting Satellites */}
        {categories.map((category, index) => (
          <OrbitingSatellite
            key={category.name}
            category={category}
            index={index}
            totalCategories={categories.length}
            onClick={() => handleSatelliteClick(category)}
            onHover={() => setHoveredCategory(category)}
            onUnhover={() => setHoveredCategory(null)}
            isHovered={hoveredCategory?.name === category.name}
            isLoading={isLoading}
            isClicked={clickedOrbs.has(category.name)}
            isDragged={draggedOrb?.name === category.name}
            isInCenter={orbInCenter?.name === category.name}
          />
        ))}
      </Canvas>
      
      {/* Add epoch roller */}
      <div className="epoch-roller">
        <label>Time Epoch:</label>
        <select value={currentEpoch} onChange={(e) => setCurrentEpoch(e.target.value)}>
          {epochs.map(epoch => (
            <option key={epoch} value={epoch}>{t(`epoch.${epoch.toLowerCase()}`)}</option>
          ))}
        </select>
      </div>
      

      
      {/* Loading indicator for AI source */}
      {isLoading && currentAISource && (
        <div className="ai-loading-indicator">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h4>{currentNews?.headline || 'Gathering your story...'}</h4>
            <p>Searching for positive news using <strong>{currentAISource}</strong> AI</p>
            <p className="loading-detail">{currentNews?.summary || 'This may take a few seconds as we find the perfect story for you!'}</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">Connecting to {selectedModel}...</p>
            </div>
          </div>
        </div>
      )}
      
      {currentNews && (
        <div className="news-panel">
          <div className="news-header">
            <h4>{currentNews.headline}</h4>
            <div className="audio-controls">
              <button 
                onClick={playAudio}
                disabled={!currentNews.ttsAudio || isMuted || isAudioLoading}
                className={`play-button ${isPlaying ? 'playing' : ''} ${isAudioLoading ? 'loading' : ''}`}
                title={audioError ? 'Audio error - try again' : isAudioLoading ? 'Loading audio...' : isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isAudioLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
              </button>
              <button 
                onClick={toggleMute}
                className={`mute-button ${isMuted ? 'muted' : ''}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              {audioError && (
                <span className="audio-error" title={audioError}>
                  ⚠️
                </span>
              )}
              <button 
                onClick={releaseOrbFromCenter}
                className="close-button"
                title="Release orb back to orbit"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* AI Model Selector in News Panel */}
          <div className="news-model-selector">
            <label>{t('ai.model.select')}:</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>
                  {t(`ai.model.${model.id}`)} - {model.description}
                </option>
              ))}
            </select>
            <button 
              onClick={() => loadStoryForOrb(orbInCenter)}
              className="go-button"
              disabled={isLoading}
            >
              {isLoading ? '⏳' : t('news.go')}
            </button>
          </div>
          <div className="news-content">
            <p className="news-summary">{currentNews.summary}</p>
            <p className="news-full-text">{currentNews.fullText}</p>
          </div>
          <div className="news-meta">
            <span className="news-source">Source: {currentNews.source}</span>
            <span className="ai-model-used">AI: {currentAISource}</span>
            <span className="news-date">
              {new Date(currentNews.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="news-navigation">
            <button 
              onClick={prevStory} 
              disabled={newsStories.length <= 1}
              className={newsStories.length <= 1 ? 'disabled' : ''}
            >
              ← {t('news.previous')}
            </button>
            <span className="story-counter">
              {currentNewsIndex + 1} {t('news.story.of')} {newsStories.length} {t('news.stories')}
            </span>
            <button 
              onClick={nextStory} 
              disabled={newsStories.length <= 1}
              className={newsStories.length <= 1 ? 'disabled' : ''}
            >
              {t('news.next')} →
            </button>
          </div>
        </div>
      )}
      
      {hoveredCategory && !currentNews && (
        <div className="category-preview">
          <h4>{hoveredCategory.name}</h4>
          <p>Click to hear positive news about {hoveredCategory.name.toLowerCase()}!</p>
        </div>
      )}
    </div>
  );
}

function OrbitingSatellite({ category, index, totalCategories, onClick, onHover, onUnhover, isHovered, isLoading, isClicked, isDragged, isInCenter }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const dragStartTime = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const radius = 3;
      const speed = 0.3;
      
      // If orb is in center, position it at center
      if (isInCenter) {
        meshRef.current.position.set(0, 0, 0);
        meshRef.current.scale.setScalar(1.5); // Make it slightly larger in center
      } else if (isDragged) {
        // Animate to center position
        if (!dragStartTime.current) {
          dragStartTime.current = time;
        }
        const progress = Math.min(1, (time - dragStartTime.current) / 1);
        const angle = (index / totalCategories) * Math.PI * 2;
        const startX = Math.cos(angle) * radius;
        const startZ = Math.sin(angle) * radius;
        const startY = Math.sin(time * 2 + index) * 0.5;
        
        meshRef.current.position.x = startX + (0 - startX) * progress;
        meshRef.current.position.z = startZ + (0 - startZ) * progress;
        meshRef.current.position.y = startY + (0 - startY) * progress;
        meshRef.current.scale.setScalar(1 + progress * 0.5);
      } else {
        // Reset drag start time when not dragging
        dragStartTime.current = null;
        // Normal orbiting movement
        const angle = (index / totalCategories) * Math.PI * 2 + time * speed;
        meshRef.current.position.x = Math.cos(angle) * radius;
        meshRef.current.position.z = Math.sin(angle) * radius;
        meshRef.current.position.y = Math.sin(time * 2 + index) * 0.5;
        meshRef.current.scale.setScalar(1.0);
      }
      
      // Scale effect on hover (only when not in center)
      if (!isInCenter && !isDragged) {
        const scale = isHovered ? 1.5 : 1.0;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      <Sphere 
        ref={meshRef} 
        args={[0.3, 32, 32]} 
        onPointerDown={onClick}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
      >
        <meshStandardMaterial 
          color={category.color} 
          emissive={isHovered ? category.color : "#000000"}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
        />
      </Sphere>
      
      {/* Always show label below the orb */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={isInCenter ? 0.25 : 0.2}
        color={isInCenter ? "white" : "rgba(255, 255, 255, 0.8)"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {category.name}
      </Text>
      
      {/* Show "Release" text when in center */}
      {isInCenter && (
        <Text
          position={[0, -1.0, 0]}
          fontSize={0.15}
          color="rgba(255, 255, 255, 0.7)"
          anchorX="center"
          anchorY="middle"
        >
          Click ✕ to release
        </Text>
      )}
    </group>
  );
}

export default OrbGame; # Trigger deployment
