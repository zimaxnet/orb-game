import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

import { getPositiveNews } from '../api/orbApi';
import { BACKEND_URL } from '../api/orbApi';

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

  // Add epoch state
  const [currentEpoch, setCurrentEpoch] = useState('Modern');
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  
  // Add AI source tracking state
  const [currentAISource, setCurrentAISource] = useState('');
  
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
    setIsLoading(true);
    
    // Set initial loading message
    setCurrentAISource('Grok');
    setCurrentNews({
      headline: 'Gathering your story...',
      summary: `Searching for positive ${category.name} stories from the ${currentEpoch} epoch using Grok AI...`,
      fullText: 'Please wait while we gather the perfect story for you!',
      source: 'Grok AI',
      publishedAt: new Date().toISOString(),
      ttsAudio: null
    });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/orb/positive-news/${category.name}?count=5&epoch=${currentEpoch}`);
      const stories = await response.json();
      
      if (!stories || stories.length === 0) {
        setNewsStories([]);
        setCurrentNews({
          headline: 'No stories found',
          summary: `No positive news stories are available for ${category.name} in the ${currentEpoch} epoch. Try another category or epoch!`,
          fullText: '',
          source: '',
          publishedAt: new Date().toISOString(),
          ttsAudio: null
        });
        setCurrentNewsIndex(0);
      } else {
        setNewsStories(stories);
        setCurrentNewsIndex(0);
        setCurrentNews(stories[0]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setCurrentNews({
        headline: 'Error loading story',
        summary: 'Failed to load news story. Please try again.',
        fullText: '',
        source: '',
        publishedAt: new Date().toISOString(),
        ttsAudio: null
      });
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
    setIsMuted(!isMuted);
    if (isPlaying) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const playAudio = () => {
    if (currentNews?.ttsAudio && !isMuted) {
      setIsPlaying(true);
      audioRef.current.src = `data:audio/mp3;base64,${currentNews.ttsAudio}`;
      audioRef.current.play();
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const nextStory = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % newsStories.length);
    setCurrentNews(newsStories[(currentNewsIndex + 1) % newsStories.length]);
  };

  const prevStory = () => {
    setCurrentNewsIndex((prev) => (prev - 1 + newsStories.length) % newsStories.length);
    setCurrentNews(newsStories[(currentNewsIndex - 1 + newsStories.length) % newsStories.length]);
  };

  return (
    <div className="orb-game-container">
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
              <h2>🎮 How to Play</h2>
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
                  <h3>Drag Orbs to Center</h3>
                  <p>Click on any labeled orb to drag it to the center and hear its story</p>
                </div>
              </div>
              <div className="step">
                <span className="step-icon">🎵</span>
                <div className="step-text">
                  <h3>Listen to Stories</h3>
                  <p>Each orb plays audio news stories about positive developments</p>
                </div>
              </div>
              <div className="step">
                <span className="step-icon">🔄</span>
                <div className="step-text">
                  <h3>Release Back to Orbit</h3>
                  <p>Click the ✕ button to release the orb back into orbit</p>
                </div>
              </div>
              <div className="step">
                <span className="step-icon">🌟</span>
                <div className="step-text">
                  <h3>Explore Categories</h3>
                  <p>See labeled orbs: Technology, Science, Art, Nature, Sports, Music, Space, Innovation</p>
                </div>
              </div>
            </div>
            <div className="how-to-play-footer">
              <p className="swipe-hint">💡 Swipe in any direction or click to start playing!</p>
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
          <meshStandardMaterial color="#3366ff" emissive="#222244" emissiveIntensity={0.5} />
        </Sphere>
        
        {/* Center indicator when no orb is in center */}
        {!orbInCenter && (
          <group>
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[1.2, 1.4, 32]} />
              <meshBasicMaterial color="rgba(255, 255, 255, 0.1)" transparent={true} />
            </mesh>
          </group>
        )}
        
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
            <option key={epoch} value={epoch}>{epoch}</option>
          ))}
        </select>
      </div>
      
      {/* Loading indicator for AI source */}
      {isLoading && currentAISource && (
        <div className="ai-loading-indicator">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h4>Gathering your story...</h4>
            <p>Searching for positive news using <strong>{currentAISource}</strong> AI</p>
            <p className="loading-detail">This may take a few seconds as we find the perfect story for you!</p>
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
                disabled={!currentNews.ttsAudio || isMuted}
                className={`play-button ${isPlaying ? 'playing' : ''}`}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button 
                onClick={toggleMute}
                className={`mute-button ${isMuted ? 'muted' : ''}`}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button 
                onClick={releaseOrbFromCenter}
                className="close-button"
                title="Release orb back to orbit"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="news-content">
            <p className="news-summary">{currentNews.summary}</p>
            <p className="news-full-text">{currentNews.fullText}</p>
          </div>
          <div className="news-meta">
            <span className="news-source">Source: {currentNews.source}</span>
            <span className="news-date">
              {new Date(currentNews.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="news-navigation">
            <button onClick={prevStory}>← Previous</button>
            <span>{currentNewsIndex + 1} / {newsStories.length}</span>
            <button onClick={nextStory}>Next →</button>
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
          emissive={isHovered ? category.color : (isInCenter ? category.color : "#000000")}
          emissiveIntensity={isHovered ? 0.3 : (isInCenter ? 0.4 : 0.1)}
        />
      </Sphere>
      
      {/* Always show label, but with different styling based on state */}
      <Text
        position={[0, 0.6, 0]}
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
          position={[0, -0.6, 0]}
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

export default OrbGame; 