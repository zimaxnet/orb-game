import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

import { getPositiveNews } from '../api/orbApi';

import './OrbGame.css';

function OrbGame() {
  const [categories] = useState([
    { name: 'Technology', color: '#00ff88' },  { name: 'Science', color: '#3366ff' },
    { name: 'Art', color: '#ff6b6' },   { name: 'Nature', color: '#4ecdc4' },   { name: 'Sports', color: '#ffa726' },    { name: 'Music', color: '#ab47bc' },    { name: 'Space', color: '#7c4dff' },    { name: 'Innovation', color: '#26c6da' }
  ]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [currentNews, setCurrentNews] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(new Audio());

  const handleSatelliteClick = async (category) => {
    if (isPlaying || isLoading) return;
    
    setIsLoading(true);
    try {
      const news = await getPositiveNews(category.name);
      setCurrentNews(news);
      
      if (news.ttsAudio && !isMuted) {
        setIsPlaying(true);
        audioRef.current.src = `data:audio/mp3;base64,${news.ttsAudio}`;
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
      }
      
      // Update score and streak
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="orb-game-container">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} enablePan={false} />
        
        {/* Central Orb */}
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#3366ff" emissive="#222244" emissiveIntensity={0.5} />
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
          />
        ))}
      </Canvas>
      
      <div className="score-panel">
        <h2>Score: {score}</h2>
        <h3>Streak: {streak}</h3>
        {isPlaying && <div className="playing-indicator">🎵 Playing...</div>}
        {isLoading && <div className="loading-indicator">⏳ Loading...</div>}
      </div>
      
      <div className="instructions">
        <h3>How to Play:</h3>
        <p>🎯 Click on the orbiting satellites to hear positive news!</p>
        <p>🎮 Earn points for each discovery</p>
        <p>🌟 Build your streak by playing daily</p>
      </div>
      
      {currentNews && (
        <div className="news-panel">
          <div className="news-header">
            <h4>{currentNews.headline}</h4>
            <div className="audio-controls">           <button 
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
            </div>
          </div>
          <p className="news-summary">{currentNews.summary}</p>
          <p className="news-full-text">{currentNews.fullText}</p>
          <div className="news-meta">
            <span className="news-source">Source: {currentNews.source}</span>
            <span className="news-date">              {new Date(currentNews.publishedAt).toLocaleDateString()}
            </span>
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

function OrbitingSatellite({ category, index, totalCategories, onClick, onHover, onUnhover, isHovered, isLoading }) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const radius = 3;
      const speed = 0.3;
      const angle = (index / totalCategories) * Math.PI * 2 + time * speed;
      
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = Math.sin(time * 2 + index) * 0.5;
      
      // Scale effect on hover
      const scale = isHovered ? 1.5 : 1.0;
      meshRef.current.scale.setScalar(scale);
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
      
      {isHovered && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {category.name}
        </Text>
      )}
    </group>
  );
}

export default OrbGame; 