import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDisturbMaterial } from '@react-three/drei';
import * as THREE from 'three';

import { getTopics, generateTTS } from '../api/orbApi'; // We'll implement this

import './OrbGame.css';

function OrbGame() {
  const [topics, setTopics] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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
        <OrbitControls enableZoom={false} />
        
        // Central Orb
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <MeshDisturbMaterial color="#3366ff" speed={1} />
        </Sphere>
        
        // Orbiting Satellites
        {topics.map((topic, index) => (
          <OrbitingSatellite
            key={topic.id}
            position={[2 + Math.cos(index * Math.PI / 4), Math.sin(index * Math.PI / 4), 0]}
            color={topic.color}
            onClick={() => handleSatelliteClick(topic)}
          />
        ))}
      </Canvas>
      
      <div className="score-panel">
        <h2>Score: {score}</h2>
        <h3>Streak: {streak}</h3>
      </div>
    </div>
  );
}

function OrbitingSatellite({ position, color, onClick }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    meshRef.current.position.x = position[0] * Math.cos(clock.getElapsedTime());
    meshRef.current.position.y = position[1] * Math.sin(clock.getElapsedTime());
  });
  
  return (
    <Sphere ref={meshRef} args={[0.2, 32, 32]} onClick={onClick}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
}

export default OrbGame; 