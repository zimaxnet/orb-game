import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

import { getPositiveNews } from '../api/orbApi';
import { BACKEND_URL } from '../api/orbApi';
import { useLanguage } from '../contexts/LanguageContext';
import promptManager from '../utils/promptManager';

import './OrbGame.css';
import HistoricalFigureDisplay from './HistoricalFigureDisplay';

// Earth Orb Component
function EarthOrb() {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Rotate Earth slowly
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  // Create Earth texture programmatically
  const createEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Create gradient for ocean
    const oceanGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    oceanGradient.addColorStop(0, '#1e3a8a');
    oceanGradient.addColorStop(0.5, '#3b82f6');
    oceanGradient.addColorStop(1, '#1e3a8a');
    
    // Fill with ocean
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add continents (simplified)
    ctx.fillStyle = '#22c55e';
    
    // North America
    ctx.fillRect(50, 80, 120, 60);
    ctx.fillRect(50, 140, 80, 40);
    
    // South America
    ctx.fillRect(120, 160, 60, 80);
    
    // Europe
    ctx.fillRect(200, 70, 60, 40);
    
    // Africa
    ctx.fillRect(200, 110, 80, 100);
    
    // Asia
    ctx.fillRect(260, 60, 150, 80);
    ctx.fillRect(260, 140, 120, 60);
    
    // Australia
    ctx.fillRect(350, 180, 80, 40);
    
    // Add some cloud coverage
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(100, 50, 40, 20);
    ctx.fillRect(250, 90, 60, 15);
    ctx.fillRect(300, 120, 50, 25);
    ctx.fillRect(150, 150, 70, 20);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <meshStandardMaterial 
        map={createEarthTexture()}
        roughness={0.8}
        metalness={0.1}
      />
    </Sphere>
  );
}

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
  
  // Add click outside handler for story panel
  const storyPanelRef = useRef(null);
  


  // Add epoch state with round-robin
  const [currentEpoch, setCurrentEpoch] = useState('Ancient'); // Start with Ancient instead of Modern
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future'];
  const [epochIndex, setEpochIndex] = useState(0); // Track current epoch index for round-robin
  
  // Add AI source tracking state
  const [currentAISource, setCurrentAISource] = useState('');
  
  // AI model is fixed to o4-mini
  const selectedModel = 'o4-mini';
  const aiModelName = 'o4-mini';
  
  // Add preloaded stories state
  // Preloading state variables removed - preloading disabled
  
  // Add drag and center state
  const [draggedOrb, setDraggedOrb] = useState(null);
  const [orbInCenter, setOrbInCenter] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Technology');
  
  // Add historical figure display state
  const [showHistoricalFigure, setShowHistoricalFigure] = useState(false);
  
  // Filter stories by current language and epoch
  const getFilteredStories = () => {
    return newsStories.filter(story => 
      story.category === (orbInCenter?.name || selectedCategory) && 
      story.epoch === currentEpoch &&
      story.language === language
    );
  };
  
  // Get exciting prompt for historical character presentation
  const getExcitingPrompt = (category, epoch, model) => {
    const categoryName = typeof category === 'string' ? category : category.name;
    const epochName = epoch.toLowerCase();
    const categoryLower = categoryName.toLowerCase();
    
    if (language === 'es') {
      return `Presentando al personaje histórico más influyente en ${categoryLower} durante la época ${epochName}. Comparte su historia de logros notables y contribuciones que cambiaron el mundo. Haz que sea emocionante, educativo e inspirador.`;
    } else {
      return `Presenting the most influential historical character in ${categoryLower} during the ${epochName} epoch. Share their story of remarkable achievements and contributions that changed the world. Make it exciting, educational, and inspiring.`;
    }
  };
  
  // Handle click outside story panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (storyPanelRef.current && !storyPanelRef.current.contains(event.target)) {
        // Check if click is not on an orb (to avoid closing when clicking orbs)
        const isOrbClick = event.target.closest('.orb-game-container canvas');
        if (!isOrbClick) {
          releaseOrbFromCenter();
        }
      }
    };
    
    // Handle escape key to close story panel
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && currentNews) {
        releaseOrbFromCenter();
      }
    };
    
    if (currentNews) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [currentNews]);
  
  // O4-Mini is the only model used
  useEffect(() => {
    console.log('✅ Using O4-Mini for all story generation');
  }, []);

  // Auto-hide instructions after 5 seconds
  useEffect(() => {
    if (showHowToPlay) {
      const timer = setTimeout(() => {
        setShowHowToPlay(false);
        console.log('⏰ Instructions auto-hidden after 5 seconds');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showHowToPlay]);

  // Auto-cycle epochs for variety (every 2 minutes)
  useEffect(() => {
    const epochTimer = setInterval(() => {
      // Only auto-cycle when not busy AND no story is being viewed
      if (!isLoading && !currentNews && !orbInCenter) {
        cycleEpoch();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(epochTimer);
  }, [epochIndex, isLoading, currentNews, orbInCenter]);


  
  // Preloading disabled - removed automatic triggers
  
  // Custom language toggle handler to refresh stories for new language
  const handleLanguageToggle = () => {
    toggleLanguage();
    
    // If there's a current orb, refresh stories for the new language
    if (orbInCenter) {
      console.log(`🔄 Refreshing stories for ${orbInCenter.name} in ${language === 'en' ? 'Spanish' : 'English'}`);
      loadStoryForOrb(orbInCenter); // Load prepopulated stories for new language
    }
  };



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
  const handleHowToPlayClick = async () => {
    setShowHowToPlay(false);
    
    // Fetch cached modern epoch story after user acknowledges instructions
    try {
      console.log('🔍 Fetching cached modern epoch story...');
      const response = await fetch(`${BACKEND_URL}/api/stories/modern-cached`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.story) {
          console.log('✅ Loaded cached modern epoch story:', data.story.headline);
          
          // Set the cached story as the current story for Technology category
          setStories([data.story]);
          setCurrentStoryIndex(0);
          setSelectedCategory('Technology');
          setCurrentEpoch('Modern');
          setSelectedModel(data.story.source || 'Cached');
          setStoriesLoaded(true);
          setShowStoryPanel(true);
          
          // Play audio if available
          if (data.story.ttsAudio) {
            setCurrentAudio(data.story.ttsAudio);
            if (!isMuted) {
              playAudio();
            }
          }
        }
      } else {
        console.log('ℹ️ No cached modern story available');
      }
    } catch (error) {
      console.error('Error fetching cached story:', error);
    }
  };
  
  // Preload function removed - preloading disabled
  
  // Handle epoch change
  const handleEpochChange = (newEpoch) => {
    setCurrentEpoch(newEpoch);
    // Update epoch index for round-robin - ensure proper synchronization
    const newIndex = epochs.indexOf(newEpoch);
    if (newIndex !== -1) {
      setEpochIndex(newIndex);
      console.log(`🔄 Epoch changed to ${newEpoch} (index: ${newIndex})`);
    } else {
      console.warn(`⚠️ Invalid epoch: ${newEpoch}, keeping current index: ${epochIndex}`);
    }
    
    // Only clear orb state and stories if no story is currently being viewed
    if (!currentNews) {
      setOrbInCenter(null);
      setCurrentNews(null);
      setNewsStories([]);
      setCurrentNewsIndex(0);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      console.log(`🔄 Epoch changed to ${newEpoch} (index: ${newIndex}) - orb state cleared`);
    } else {
      // If a story is being viewed, just update the epoch without clearing the story panel
      console.log(`🔄 Epoch changed to ${newEpoch} (index: ${newIndex}) - story panel preserved`);
    }
  };

  // Round-robin epoch cycling function - improved logic
  const cycleEpoch = () => {
    // Don't cycle if user is viewing a story
    if (currentNews || orbInCenter) {
      console.log('🔄 Epoch cycling blocked - user is viewing a story');
      return;
    }
    
    // Ensure epoch index is synchronized with current epoch
    const currentIndex = epochs.indexOf(currentEpoch);
    if (currentIndex === -1) {
      console.warn(`⚠️ Current epoch ${currentEpoch} not found in epochs array, resetting to index 0`);
      setEpochIndex(0);
      setCurrentEpoch(epochs[0]);
      return;
    }
    
    const nextIndex = (currentIndex + 1) % epochs.length;
    const nextEpoch = epochs[nextIndex];
    handleEpochChange(nextEpoch);
    console.log(`🔄 Round-robin: Cycling from ${currentEpoch} (${currentIndex}) to ${nextEpoch} (${nextIndex})`);
  };


  const handleSatelliteClick = async (category) => {
    try {
      // Allow clicking if we're switching orbs or if nothing is currently processing
      if (isLoading && orbInCenter !== category) {
        console.log('Orb click blocked - loading in progress');
        return;
      }
      
      console.log(`🎯 Orb clicked: ${category.name}`);
      
      // If clicking the same orb that's already in center, do nothing
      if (orbInCenter === category) {
        console.log('Same orb already in center');
        return;
      }
      
      // If clicking a different orb, immediately set it as the new center orb
      if (orbInCenter && orbInCenter !== category) {
        console.log('Switching from', orbInCenter.name, 'to', category.name);
        setOrbInCenter(category);
        setCurrentNews(null);
        setNewsStories([]);
        setCurrentNewsIndex(0);
        setIsLoading(false); // Reset loading state when switching orbs
      } else {
        // First orb click - set it as center orb
        setOrbInCenter(category);
      }
      
      // Start dragging animation
      setDraggedOrb(category);
      setIsDragging(true);
      
      // Load stories immediately without waiting for animation
      loadStoryForOrb(category);
      
      // Complete the animation after a short delay
      setTimeout(() => {
        setIsDragging(false);
        setDraggedOrb(null);
      }, 800); // Reduced animation time
    } catch (error) {
      console.error('Error in handleSatelliteClick:', error);
      setDraggedOrb(null);
      setIsDragging(false);
    }
  };
  
  const loadStoryForOrb = async (category, forceFresh = false) => {
    setIsLoading(true);
    setCurrentAISource(aiModelName);
    
    try {
      // For historical figures, use the image-enhanced endpoint - only load ONE story
      console.log(`📚 Fetching single historical figure story with images for ${category.name} in ${currentEpoch} epoch (${language})...`);
      try {
        const storiesResponse = await fetch(`${BACKEND_URL}/api/orb/stories-with-images?category=${category.name}&epoch=${currentEpoch}&language=${language}&count=1`);

        console.log(`🔍 Response status: ${storiesResponse.status}`);
        console.log(`🔍 Response ok: ${storiesResponse.ok}`);

        if (storiesResponse.ok) {
          const data = await storiesResponse.json();
          console.log(`🔍 Response data:`, data);
          console.log(`🔍 Data success: ${data.success}`);
          console.log(`🔍 Data stories: ${data.stories ? data.stories.length : 'undefined'}`);
          
          if (data.success && data.stories && data.stories.length > 0) {
            console.log(`✅ Fetched single historical figure story with images for ${category.name} in ${currentEpoch} epoch`);
            console.log(`📖 Story headline: ${data.stories[0].headline}`);
            
            // Set only the first story - no multiple figures
            setNewsStories([data.stories[0]]);
            setCurrentNewsIndex(0);
            setCurrentNews(data.stories[0]);
            setCurrentAISource('o4-mini');
            setShowHistoricalFigure(true); // Show historical figure display
            setIsLoading(false);
            
            return;
          } else {
            console.log(`❌ Invalid response format:`, data);
          }
        } else {
          console.log(`❌ HTTP error: ${storiesResponse.status} ${storiesResponse.statusText}`);
        }
      } catch (storiesError) {
        console.warn('Stories with images fetch failed:', storiesError.message);
        console.warn('Error details:', storiesError);
      }
      
      // Ultimate fallback
      const errorStory = {
        headline: language === 'es' ? `${currentEpoch} ${category.name} Historia` : `${currentEpoch} ${category.name} Story`,
        summary: language === 'es'
          ? `Estamos experimentando algunas dificultades técnicas. Por favor, inténtalo de nuevo o selecciona una categoría diferente.`
          : `We're experiencing some technical difficulties. Please try again or select a different category.`,
        fullText: language === 'es'
          ? `Nuestra IA está tomando un momento para recopilar las últimas noticias positivas de ${category.name.toLowerCase()}. Por favor, inténtalo de nuevo en un momento.`
          : `Our AI is taking a moment to gather the latest positive ${category.name.toLowerCase()} news. Please try again in a moment.`,
        source: 'Orb Game',
        publishedAt: new Date().toISOString(),
        ttsAudio: null,
        category: category.name,
        aiModel: 'error',
        language: language
      };
      
      setNewsStories([errorStory]);
      setCurrentNewsIndex(0);
      setCurrentNews(errorStory);
      setCurrentAISource('Error');
      setShowHistoricalFigure(true); // Show historical figure display
    } catch (error) {
      console.error('Failed to load stories:', error);
      
      // Ultimate fallback
      const errorStory = {
        headline: language === 'es' ? `${currentEpoch} ${category.name} Historia` : `${currentEpoch} ${category.name} Story`,
        summary: language === 'es'
          ? `Estamos experimentando algunas dificultades técnicas. Por favor, inténtalo de nuevo o selecciona una categoría diferente.`
          : `We're experiencing some technical difficulties. Please try again or select a different category.`,
        fullText: language === 'es'
          ? `Nuestra IA está tomando un momento para recopilar las últimas noticias positivas de ${category.name.toLowerCase()}. Por favor, inténtalo de nuevo en un momento.`
          : `Our AI is taking a moment to gather the latest positive ${category.name.toLowerCase()} news. Please try again in a moment.`,
        source: 'Orb Game',
        publishedAt: new Date().toISOString(),
        ttsAudio: null,
        category: category.name,
        aiModel: 'error',
        language: language
      };
      
      setNewsStories([errorStory]);
      setCurrentNewsIndex(0);
      setCurrentNews(errorStory);
      setCurrentAISource('Error');
      setShowHistoricalFigure(true); // Show historical figure display
    } finally {
      setIsLoading(false);
    }
  };

  // Remove preloadAdditionalStories function - no longer needed
    
  const releaseOrbFromCenter = () => {
    setOrbInCenter(null);
    setCurrentNews(null);
    setNewsStories([]);
    setCurrentNewsIndex(0);
    setShowHistoricalFigure(false); // Hide historical figure display
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

  const playAudio = async () => {
    if (!currentNews) {
      console.log('No current news to play audio for');
      return;
    }
    
    if (isMuted) {
      console.log('Audio is muted');
      return;
    }
    
    setIsAudioLoading(true);
    setAudioError(null);
    
    try {
      // If no TTS audio is available, generate it on-demand
      if (!currentNews.ttsAudio) {
        console.log('Generating TTS audio on-demand...');
        
        const ttsResponse = await fetch(`${BACKEND_URL}/api/tts/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: currentNews.fullText,
            language: language
          }),
        });
        
        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          if (ttsData.audio) {
            // Update the current news with the generated TTS audio
            const updatedNews = { ...currentNews, ttsAudio: ttsData.audio };
            setCurrentNews(updatedNews);
            
            // Update the story in the stories array
            setNewsStories(prevStories => 
              prevStories.map(story => 
                story === currentNews ? updatedNews : story
              )
            );
            
            console.log('✅ TTS audio generated successfully');
          } else {
            throw new Error('No audio data received');
          }
        } else {
          throw new Error('Failed to generate TTS audio');
        }
      }
      
      // Ensure audioRef exists
      if (!audioRef.current) {
        console.error('Audio reference not available');
        setAudioError('Audio system not ready');
        setIsAudioLoading(false);
        return;
      }
      
      // Use the current news (which may now have TTS audio)
      const newsToPlay = currentNews.ttsAudio ? currentNews : currentNews;
      audioRef.current.src = `data:audio/mp3;base64,${newsToPlay.ttsAudio}`;
      
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
      
      // Start playing with better error handling
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
  };



  // Remove nextStory and prevStory functions - no longer needed since we only show one figure per try

  const learnMore = async () => {
    if (!currentNews || !orbInCenter) return;
    
    setIsLoading(true);
    console.log(`🔍 Learning more about the historical figure in: ${currentNews.headline}...`);
    
    // Extract historical figure name from the current story
    const storyText = `${currentNews.headline} ${currentNews.summary} ${currentNews.fullText}`;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: language === 'es' 
            ? `Basado en esta historia sobre una figura histórica: "${currentNews.headline}" - ${currentNews.summary} ${currentNews.fullText}. Por favor proporciona información MUY DETALLADA sobre esta figura histórica específica, incluyendo: 1) Su vida temprana y educación, 2) Los logros específicos mencionados en la historia y otros logros importantes, 3) El contexto histórico de su época, 4) El impacto duradero de sus contribuciones, 5) Anecdotas fascinantes y detalles poco conocidos, 6) Cómo sus innovaciones influyeron en el desarrollo posterior de ${orbInCenter.name.toLowerCase()}. Hazlo muy detallado, atractivo e informativo con al menos 500-600 palabras. Enfócate específicamente en la figura histórica mencionada en la historia. Responde en español.`
            : `Based on this story about a historical figure: "${currentNews.headline}" - ${currentNews.summary} ${currentNews.fullText}. Please provide VERY DETAILED information about this specific historical figure, including: 1) Their early life and education, 2) The specific achievements mentioned in the story and other important accomplishments, 3) The historical context of their era, 4) The lasting impact of their contributions, 5) Fascinating anecdotes and little-known details, 6) How their innovations influenced the later development of ${orbInCenter.name.toLowerCase()}. Make it very detailed, engaging, and informative with at least 500-600 words. Focus specifically on the historical figure mentioned in the story. Respond in English.`,
          useWebSearch: 'auto',
          language: language,
          count: 1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.response && data.response.trim()) {
        // Create a new story with the additional information about the historical figure
        const learnMoreStory = {
          headline: language === 'es' ? `${currentEpoch} ${orbInCenter.name} - Más Sobre Esta Figura Histórica` : `${currentEpoch} ${orbInCenter.name} - More About This Historical Figure`,
          summary: language === 'es' ? 'Información detallada y profunda sobre esta figura histórica específica' : 'Detailed and in-depth information about this specific historical figure',
          fullText: data.response.trim(),
          source: `${selectedModel} AI - Learn More`,
          publishedAt: new Date().toISOString(),
          ttsAudio: data.audioData || null,
          category: orbInCenter.name,
          aiModel: selectedModel,
          language: language,
          epoch: currentEpoch
        };
        
        // Replace current story with learn more content
        setNewsStories([learnMoreStory]);
        setCurrentNewsIndex(0);
        setCurrentNews(learnMoreStory);
        setCurrentAISource(`${aiModelName} - Learn More`);
      }
    } catch (error) {
      console.error('Failed to learn more:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZimaxAILabsClick = () => {
    const message = language === 'es' 
      ? '¿Te gustaría ir a la página de Zimax AI Labs para aprender más o regresar al Juego Orb?'
      : 'Would you like to go to the Zimax AI Labs page to learn more or return to Orb Game?';
    
    const userChoice = confirm(message);
    
    if (userChoice) {
      // User chose to go to Zimax AI Labs page
      window.location.href = 'https://zimax.net/ailabs';
    }
    // If user cancels, they stay on the Orb Game page
  };
  
  return (
    <div className="orb-game-container">
      {/* Language Toggle */}
      <div className="language-toggle">
        <button 
          onClick={handleLanguageToggle}
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
        
        {/* Central Earth Orb */}
        <EarthOrb />
        

        
        {/* Orbiting Satellites */}
        {categories.map((category, index) => {
          // Check if stories are loaded for this specific category and selected model
          const hasStoriesForThisOrb = newsStories.filter(story => story.category === category.name).length > 0;
          
          return (
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
              hasStoriesLoaded={hasStoriesForThisOrb}
            />
          );
        })}
      </Canvas>
      
      {/* Add epoch roller */}
      <div className="epoch-roller">
        <label>Epoch:</label>
        <select value={currentEpoch} onChange={(e) => handleEpochChange(e.target.value)}>
          {epochs.map(epoch => (
            <option key={epoch} value={epoch}>{t(`epoch.${epoch.toLowerCase()}`)}</option>
          ))}
        </select>
        {/* Preload button removed - preloading disabled */}
      </div>
      

      
      {/* Loading indicator for AI source */}
      {isLoading && currentAISource && (
        <div className="ai-loading-indicator">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h4>{currentNews?.headline || (language === 'es' ? `Cargando la historia... figura histórica más influyente de ${currentEpoch} ${orbInCenter?.name || selectedCategory}` : `Loading the story... most influential historical figure of ${currentEpoch} ${orbInCenter?.name || selectedCategory}`)}</h4>
            <p>{language === 'es' ? 'Contexto diseñado por Zimax AI Labs usando' : 'Context engineered by Zimax AI Labs using'} <strong>{currentAISource}</strong> AI</p>
            <p className="loading-detail">{currentNews?.summary || (language === 'es' ? '¡Prepárate para aprender sobre las figuras históricas más importantes!' : 'Get ready to learn about the most important historical figures!')}</p>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">Connecting to {aiModelName}...</p>
            </div>
          </div>
        </div>
      )}
      
      {currentNews && (
        <div className="news-panel" ref={storyPanelRef}>
          <div className="news-header">
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
          
          {/* Category Display */}
          <div className="ai-model-display">
            <span className="ai-model-label">Category: {currentNews?.category || selectedCategory}</span>
            <button 
              onClick={learnMore}
              disabled={isLoading}
              className="go-button"
            >
              {isLoading ? '⏳' : '🔍'} {t('news.more')}
            </button>
          </div>
          
          {/* Story content with integrated images */}
          {currentNews && (
            <div className="story-content-with-images">
              {/* Integrated Historical Figure Display */}
              {showHistoricalFigure && (
                <HistoricalFigureDisplay
                  story={currentNews}
                  onClose={() => setShowHistoricalFigure(false)}
                  onLearnMore={learnMore}
                />
              )}
            </div>
          )}
          <div className="news-meta">
            <span className="zimax-ai-labs">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                handleZimaxAILabsClick();
              }}>
                Zimax AI Labs
              </a>
            </span>
            <span className="news-date">
              {new Date(currentNews.publishedAt).toLocaleDateString()}
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

      {/* Historical Figure Display - Now integrated into news panel */}
    </div>
  );
}

function OrbitingSatellite({ category, index, totalCategories, onClick, onHover, onUnhover, isHovered, isLoading, isClicked, isDragged, isInCenter, hasStoriesLoaded }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const dragStartTime = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const radius = 3;
      const speed = 0.3;
      
      // If orb is in center, position it at center with smooth animation
      if (isInCenter) {
        meshRef.current.position.set(0, 0, 0);
        meshRef.current.scale.setScalar(1.5); // Make it slightly larger in center
      } else if (isDragged) {
        // Smooth animation to center position with easing
        if (!dragStartTime.current) {
          dragStartTime.current = time;
        }
        const progress = Math.min(1, (time - dragStartTime.current) / 1.5); // Slower animation
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
        
        const angle = (index / totalCategories) * Math.PI * 2;
        const startX = Math.cos(angle) * radius;
        const startZ = Math.sin(angle) * radius;
        const startY = Math.sin(time * 2 + index) * 0.5;
        
        meshRef.current.position.x = startX + (0 - startX) * easeProgress;
        meshRef.current.position.z = startZ + (0 - startZ) * easeProgress;
        meshRef.current.position.y = startY + (0 - startY) * easeProgress;
        meshRef.current.scale.setScalar(1 + easeProgress * 0.5);
      } else {
        // Reset drag start time when not dragging
        dragStartTime.current = null;
        // Normal orbiting movement with smooth transitions
        const angle = (index / totalCategories) * Math.PI * 2 + time * speed;
        const targetX = Math.cos(angle) * radius;
        const targetZ = Math.sin(angle) * radius;
        const targetY = Math.sin(time * 2 + index) * 0.5;
        
        // Smooth transition back to orbit position
        const currentX = meshRef.current.position.x;
        const currentZ = meshRef.current.position.z;
        const currentY = meshRef.current.position.y;
        
        meshRef.current.position.x = currentX + (targetX - currentX) * 0.1;
        meshRef.current.position.z = currentZ + (targetZ - currentZ) * 0.1;
        meshRef.current.position.y = currentY + (targetY - currentY) * 0.1;
        meshRef.current.scale.setScalar(1.0);
      }
      
      // Smooth scale effect on hover (only when not in center)
      if (!isInCenter && !isDragged) {
        const targetScale = isHovered ? 1.8 : 1.0; // Increased hover scale
        const currentScale = meshRef.current.scale.x;
        const scaleDiff = targetScale - currentScale;
        meshRef.current.scale.setScalar(currentScale + scaleDiff * 0.15); // Faster scale transition
      }
    }
  });
  
  // Determine emissive intensity based on state
  let emissiveIntensity = 0.1; // Default dim
  let opacity = hasStoriesLoaded ? 1.0 : 0.3; // More dim if no stories loaded
  
  if (isHovered) {
    emissiveIntensity = 0.5; // Brighter hover
    opacity = 1.0;
  } else if (hasStoriesLoaded) {
    emissiveIntensity = 0.3; // Brighter when stories are loaded
    opacity = 1.0;
  }
  
  return (
    <group ref={groupRef}>
      {/* Visible orb with click handlers */}
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
          emissiveIntensity={emissiveIntensity}
          transparent={true}
          opacity={opacity}
        />
      </Sphere>
      
      {/* Glow effect for better visibility */}
      {isHovered && (
        <Sphere args={[0.4, 32, 32]}>
          <meshBasicMaterial 
            color={category.color}
            transparent={true}
            opacity={0.3}
          />
        </Sphere>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.12}
          color="rgba(255, 255, 255, 0.8)"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          Loading...
        </Text>
      )}
    </group>
  );
}

export default OrbGame; 