import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

import { getTopics, generateTTS } from '../api/orbApi';

import './OrbGame.css';

function OrbGame() {
  const [topics, setTopics] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    // Fetch topics from backend
    getTopics().then(setTopics);
  }, []);

  const handleSatelliteClick = async (topic) => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      const audioUrl = await generateTTS(topic.id);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      audioRef.current.onended = () => setIsPlaying(false);
      
      // Update score and streak
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
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
        {topics.map((topic, index) => (
          <OrbitingSatellite
            key={topic.id}
            topic={topic}
            index={index}
            totalTopics={topics.length}
            onClick={() => handleSatelliteClick(topic)}
            onHover={() => setHoveredTopic(topic)}
            onUnhover={() => setHoveredTopic(null)}
            isHovered={hoveredTopic?.id === topic.id}
          />
        ))}
      </Canvas>
      
      <div className="score-panel">
        <h2>Score: {score}</h2>
        <h3>Streak: {streak}</h3>
        {isPlaying && <div className="playing-indicator">🎵 Playing...</div>}
      </div>
      
      <div className="instructions">
        <h3>How to Play:</h3>
        <p>🎯 Click on the orbiting satellites to hear positive news!</p>
        <p>🎮 Earn points for each discovery</p>
        <p>🌟 Build your streak by playing daily</p>
      </div>
      
      {hoveredTopic && (
        <div className="topic-preview">
          <h4>{hoveredTopic.category}</h4>
          <p>{hoveredTopic.headline}</p>
        </div>
      )}
    </div>
  );
}

function OrbitingSatellite({ topic, index, totalTopics, onClick, onHover, onUnhover, isHovered }) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const radius = 3;
      const speed = 0.3;
      const angle = (index / totalTopics) * Math.PI * 2 + time * speed;
      
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
          color={topic.color} 
          emissive={isHovered ? topic.color : "#000000"}
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
          {topic.category}
        </Text>
      )}
    </group>
  );
}

export default OrbGame; 