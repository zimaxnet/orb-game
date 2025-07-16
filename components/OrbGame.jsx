import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Sphere, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import './OrbGame.css';

// Topic Satellite Component
function TopicSatellite({ topic, position, onClick, isHovered, onHover }) {
  const meshRef = useRef();
  const textRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Orbit around the center
      const time = state.clock.getElapsedTime();
      const radius = position[0];
      const speed = 0.3;
      meshRef.current.position.x = Math.cos(time * speed + position[2]) * radius;
      meshRef.current.position.z = Math.sin(time * speed + position[2]) * radius;
      meshRef.current.position.y = position[1];
      
      // Gentle bobbing and scaling
      meshRef.current.scale.setScalar(isHovered ? 1.2 : 1.0);
      meshRef.current.position.y += Math.sin(time * 2 + position[2]) * 0.1;
    }
  });

  const categoryColors = {
    Technology: '#00ff88',
    Science: '#3366ff',
    Art: '#ff6b6b',
    Nature: '#4ecdc4',
    Sports: '#ffa726',
    Music: '#ab47bc',
    Space: '#7c4dff',
    Innovation: '#26c6da',
    Health: '#66bb6a',
    Food: '#ffca28'
  };

  const color = categoryColors[topic.category] || '#ffffff';

  return (
    <group 
      ref={meshRef} 
      onClick={() => onClick(topic)}
      onPointerOver={() => onHover(topic.id)}
      onPointerOut={() => onHover(null)}
    >
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial 
          color={color}
          emissive={isHovered ? color : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
        />
      </Sphere>
      <Text
        ref={textRef}
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {topic.category}
      </Text>
    </group>
  );
}

// Central Orb Component
function CentralOrb({ isPlaying }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
      
      // Pulse when playing audio
      const scale = isPlaying ? 1.0 + Math.sin(state.clock.getElapsedTime() * 8) * 0.1 : 1.0;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]}>
      <meshStandardMaterial 
        color="#4a90e2"
        transparent
        opacity={0.8}
        emissive="#2c5aa0"
        emissiveIntensity={isPlaying ? 0.5 : 0.2}
      />
    </Sphere>
  );
}

// Main Scene Component
function OrbScene({ topics, onTopicClick, hoveredTopic, setHoveredTopic, isPlaying }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 2, 5);
  }, [camera]);

  // Generate satellite positions
  const positions = useMemo(() => {
    return topics.map((_, index) => {
      const radius = 3 + Math.random() * 2;
      const y = (Math.random() - 0.5) * 3;
      const angle = (index / topics.length) * Math.PI * 2;
      return [radius, y, angle];
    });
  }, [topics]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a90e2" />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      <CentralOrb isPlaying={isPlaying} />
      
      {topics.map((topic, index) => (
        <TopicSatellite
          key={topic.id}
          topic={topic}
          position={positions[index]}
          onClick={onTopicClick}
          isHovered={hoveredTopic === topic.id}
          onHover={setHoveredTopic}
        />
      ))}
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main OrbGame Component
const OrbGame = () => {
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [userStats, setUserStats] = useState({
    score: 0,
    streak: 0,
    todayCount: 0,
    achievements: []
  });
  const audioRef = useRef();

  const BACKEND_URL = 'https://api.aimcs.net';

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/orb/topics`);
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      // Fallback sample data
      setTopics([
        { id: 1, category: 'Technology', headline: 'AI Breakthrough in Healthcare', summary: 'New AI helps doctors...' },
        { id: 2, category: 'Science', headline: 'Amazing Ocean Discovery', summary: 'Scientists found...' },
        { id: 3, category: 'Art', headline: 'Street Art Goes Digital', summary: 'Artists creating...' },
        { id: 4, category: 'Nature', headline: 'Bee Population Recovery', summary: 'Great news for bees...' },
        { id: 5, category: 'Sports', headline: 'Olympic Records Broken', summary: 'Athletes achieve...' },
        { id: 6, category: 'Music', headline: 'New Instrument Invented', summary: 'Musicians can now...' },
        { id: 7, category: 'Space', headline: 'Mars Mission Success', summary: 'Space exploration...' },
        { id: 8, category: 'Innovation', headline: 'Clean Energy Breakthrough', summary: 'Renewable energy...' }
      ]);
    }
  };

  const handleTopicClick = async (topic) => {
    setCurrentTopic(topic);
    setIsPlaying(true);
    
    try {
      // Track interaction
      await fetch(`${BACKEND_URL}/api/orb/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: topic.id, action: 'click' })
      });

      // Get TTS audio
      const response = await fetch(`${BACKEND_URL}/api/orb/tts/${topic.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.audioData) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
          audioRef.current = audio;
          
          audio.onended = () => {
            setIsPlaying(false);
            updateScore(10);
          };
          
          audio.play();
        }
      }
    } catch (error) {
      console.error('Failed to play topic:', error);
      setIsPlaying(false);
    }
  };

  const updateScore = (points) => {
    setUserStats(prev => ({
      ...prev,
      score: prev.score + points,
      todayCount: prev.todayCount + 1
    }));
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTopic(null);
  };

  return (
    <div className="orb-game">
      <div className="orb-canvas">
        <Canvas>
          <OrbScene 
            topics={topics}
            onTopicClick={handleTopicClick}
            hoveredTopic={hoveredTopic}
            setHoveredTopic={setHoveredTopic}
            isPlaying={isPlaying}
          />
        </Canvas>
      </div>
      
      <div className="orb-ui">
        <div className="stats-panel">
          <div className="score">Score: {userStats.score}</div>
          <div className="streak">Streak: {userStats.streak}</div>
          <div className="today">Today: {userStats.todayCount}</div>
        </div>
        
        {currentTopic && (
          <div className="topic-panel">
            <h3>{currentTopic.headline}</h3>
            <p className="category">{currentTopic.category}</p>
            <p className="summary">{currentTopic.summary}</p>
            {isPlaying && (
              <button onClick={stopAudio} className="stop-btn">
                ⏹️ Stop
              </button>
            )}
          </div>
        )}
        
        {hoveredTopic && !currentTopic && (
          <div className="hover-hint">
            Click to listen!
          </div>
        )}
        
        <div className="instructions">
          <h2>🌟 Orb Game</h2>
          <p>Discover trending topics by clicking the floating satellites around the orb!</p>
          <p>Listen to positive news and earn points for each discovery.</p>
        </div>
      </div>
    </div>
  );
};

export default OrbGame; 