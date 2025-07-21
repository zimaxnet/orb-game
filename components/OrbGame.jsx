import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

import { getPositiveNews } from '../api/orbApi';
import { BACKEND_URL } from '../api/orbApi';
import { useLanguage } from '../contexts/LanguageContext';
import promptManager from '../utils/promptManager';

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
    { name: 'Art', color: '#ff6b6' },   { name: 'Nature', color: '#4ecdc4' },   { name: 'Sports', color: '#ffa726' },    { name: 'Music', color: '#ab47bc' },    { name: 'Space', color: '#7c4dff' },    { name: 'Innovation', color: '#26c6da' },
    { name: 'Spirituality', color: '#ff9800' }
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
  


  // Add epoch state
  const [currentEpoch, setCurrentEpoch] = useState('Modern');
  const epochs = ['Ancient', 'Medieval', 'Industrial', 'Modern', 'Future', 'Enlightenment', 'Digital'];
  
  // Add AI source tracking state
  const [currentAISource, setCurrentAISource] = useState('');
  
  // Add AI model selection state
  const [selectedModel, setSelectedModel] = useState('grok-4');
  const [reliableModels, setReliableModels] = useState([]);
  const aiModels = [
    { id: 'grok-4', name: 'Grok 4', description: 'Advanced reasoning and analysis' },
    { id: 'perplexity-sonar', name: 'Perplexity Sonar', description: 'Real-time web search and synthesis' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and creative content generation' },
    { id: 'o4-mini', name: 'o4-mini', description: 'Fast and efficient processing' }
  ];

  // Filter models to only show reliable ones
  const availableModels = aiModels.filter(model => 
    reliableModels.length === 0 || reliableModels.includes(model.id)
  );
  
  // Add preloaded stories state
  // Preloading state variables removed - preloading disabled
  
  // Add drag and center state
  const [draggedOrb, setDraggedOrb] = useState(null);
  const [orbInCenter, setOrbInCenter] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filter stories by current language and epoch
  const getFilteredStories = () => {
    return newsStories.filter(story => 
      story.language === language && 
      story.epoch === currentEpoch &&
      story.category === (orbInCenter?.name || '')
    );
  };
  
  // Use centralized prompt manager for all prompts
  const getExcitingPrompt = (category, epoch, model) => {
    const categoryName = typeof category === 'string' ? category : category.name;
    return promptManager.getFrontendPrompt(categoryName, epoch, language, model);
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
    
    if (currentNews) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentNews]);
  
  // Check model reliability on component mount
  useEffect(() => {
    const checkModelReliability = async () => {
      try {
        console.log('🔍 Checking model reliability on game load...');
        const response = await fetch(`${BACKEND_URL}/api/models/reliability`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setReliableModels(data.reliableModels);
            console.log('✅ Reliable models loaded:', data.reliableModels);
          }
        }
      } catch (error) {
        console.error('❌ Error checking model reliability:', error);
      }
    };

    checkModelReliability();
  }, []);

  // Add escape key handler to exit stories
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && currentNews) {
        console.log('🔙 Escape key pressed - releasing orb from center');
        releaseOrbFromCenter();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [currentNews]);
  
  // Preloading disabled - removed automatic triggers
  
  // Custom language toggle handler to refresh stories for new language
  const handleLanguageToggle = () => {
    toggleLanguage();
    
    // If there's a current orb, refresh stories for the new language
    if (orbInCenter) {
      console.log(`🔄 Refreshing stories for ${orbInCenter.name} in ${language === 'en' ? 'Spanish' : 'English'}`);
      loadStoryForOrb(orbInCenter, true); // Force fresh generation for new language
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
      console.error('❌ Error fetching cached modern story:', error);
    }
  };
  
  // Preload function removed - preloading disabled
  
  // Handle epoch change
  const handleEpochChange = (newEpoch) => {
    setCurrentEpoch(newEpoch);
    // Clear orb state and stories when switching epochs
    setOrbInCenter(null);
    setCurrentNews(null);
    setNewsStories([]);
    setCurrentNewsIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    console.log(`🔄 Epoch changed to ${newEpoch} - orb state cleared`);
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
    setCurrentAISource(availableModels.find(m => m.id === selectedModel)?.name || selectedModel);
    
    try {
      // Try to get stories from database first (unless forceFresh is true)
      if (!forceFresh) {
        console.log(`📚 Loading stories from database for ${category.name} in ${language}...`);
        try {
          const dbResponse = await fetch(`${BACKEND_URL}/api/orb/positive-news/${category.name}?count=1&epoch=${currentEpoch}&language=${language}`);
          
          if (dbResponse.ok) {
            const dbStories = await dbResponse.json();
            
            if (Array.isArray(dbStories) && dbStories.length > 0) {
              console.log(`✅ Found ${dbStories.length} stories in database for ${category.name}`);
              
              // Check if stories have TTS audio
              const storiesWithTTS = dbStories.filter(story => story.ttsAudio);
              console.log(`🎵 ${storiesWithTTS.length} stories have TTS audio`);
              
              if (storiesWithTTS.length > 0) {
                // Check if database stories are fallback stories
                const hasFallbackStories = storiesWithTTS.some(story => 
                  story.aiModel === 'fallback' || 
                  story.aiModel === 'error' || 
                  story.source === 'Orb Game'
                );
                
                if (hasFallbackStories) {
                  console.log('🔄 Database contains fallback stories, getting fresh AI stories instead...');
                  // Don't use fallback stories from database, continue to AI generation
                } else {
                  setNewsStories(storiesWithTTS);
                  setCurrentNewsIndex(0);
                  setCurrentNews(storiesWithTTS[0]);
                  setCurrentAISource('Database');
                  setIsLoading(false);
                  
                  return;
                }
              }
            }
          }
        } catch (dbError) {
          console.warn('Database fetch failed, falling back to AI generation:', dbError.message);
        }
      } else {
        console.log('🔄 Force fresh generation - skipping database cache');
      }
      
      // Fallback: Generate fresh stories with retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      
      while (attempts < maxAttempts && !success) {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts} to load stories for ${category.name} in ${language === 'es' ? 'Spanish' : 'English'}`);
        
        try {
          // Request single story from the backend
          const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: getExcitingPrompt(category.name, currentEpoch, selectedModel) + ' Generate 1 detailed story.',
              useWebSearch: 'auto',
              language: language, // Include current language
              count: 1 // Request 1 story
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.response && data.response.trim()) {
            // Try to parse multiple stories from the response
            let stories = [];
            
            // Check if response contains multiple stories (separated by --- or ###)
            const storySeparators = ['---', '###', '***', '\n\n\n'];
            let storyTexts = [data.response];
            
            for (const separator of storySeparators) {
              if (data.response.includes(separator)) {
                storyTexts = data.response.split(separator).filter(text => text.trim());
                break;
              }
            }
            
            // Create story objects from the response
            storyTexts.forEach((storyText, index) => {
              if (storyText.trim()) {
                const story = {
                  headline: language === 'es' ? `${currentEpoch} ${category.name} Historia` : `${currentEpoch} ${category.name} Story`,
                  summary: storyText.trim(),
                  fullText: storyText.trim(),
                  source: `${selectedModel} AI`,
                  publishedAt: new Date().toISOString(),
                  ttsAudio: data.audioData || null,
                  category: category.name,
                  aiModel: selectedModel,
                  language: language, // Store the language used
                  epoch: currentEpoch // Store the epoch used
                };
                stories.push(story);
              }
            });
            
            // If no multiple stories found, create single story
            if (stories.length === 0) {
              const story = {
                headline: language === 'es' ? `${currentEpoch} ${category.name} Historia` : `${currentEpoch} ${category.name} Story`,
                summary: data.response,
                fullText: data.response,
                source: `${selectedModel} AI`,
                publishedAt: new Date().toISOString(),
                ttsAudio: data.audioData || null,
                category: category.name,
                aiModel: selectedModel,
                language: language,
                epoch: currentEpoch
              };
              stories = [story];
            }
            
            setNewsStories(stories);
            setCurrentNewsIndex(0);
            setCurrentNews(stories[0]);
            success = true;
            
            // Check if any of the stories are fallback stories and regenerate if needed
            const hasFallbackStories = stories.some(story => 
              story.aiModel === 'fallback' || 
              story.aiModel === 'error' || 
              story.source === 'Orb Game'
            );
            
            if (hasFallbackStories && stories.length < 3) {
              console.log('🔄 Detected fallback stories, attempting to get fresh AI stories...');
              // Try to get more fresh stories
              try {
                const freshResponse = await fetch(`${BACKEND_URL}/api/chat`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    message: getExcitingPrompt(category.name, currentEpoch, selectedModel) + ' Generate 1 detailed story.',
                    useWebSearch: 'auto',
                    language: language,
                    count: 1
                  }),
                });
                
                if (freshResponse.ok) {
                  const freshData = await freshResponse.json();
                  
                  if (freshData.response && freshData.response.trim()) {
                    // Parse fresh stories
                    const storySeparators = ['---', '###', '***', '\n\n\n'];
                    let freshStoryTexts = [freshData.response];
                    
                    for (const separator of storySeparators) {
                      if (freshData.response.includes(separator)) {
                        freshStoryTexts = freshData.response.split(separator).filter(text => text.trim());
                        break;
                      }
                    }
                    
                    // Create fresh story objects
                    const freshStories = [];
                    freshStoryTexts.forEach((storyText, index) => {
                      if (storyText.trim()) {
                        const freshStory = {
                          headline: language === 'es' ? `${currentEpoch} ${category.name} Historia` : `${currentEpoch} ${category.name} Story`,
                          summary: storyText.trim(),
                          fullText: storyText.trim(),
                          source: `${selectedModel} AI`,
                          publishedAt: new Date().toISOString(),
                          ttsAudio: freshData.audioData || null,
                          category: category.name,
                          aiModel: selectedModel,
                          language: language,
                          epoch: currentEpoch
                        };
                        freshStories.push(freshStory);
                      }
                    });
                    
                    if (freshStories.length > 0) {
                      console.log(`✅ Generated ${freshStories.length} fresh AI stories`);
                      setNewsStories(freshStories);
                      setCurrentNewsIndex(0);
                      setCurrentNews(freshStories[0]);
                      setCurrentAISource(availableModels.find(m => m.id === selectedModel)?.name || selectedModel);
                    }
                  }
                }
              } catch (freshError) {
                console.warn('Failed to get fresh stories:', freshError);
              }
            }
            
            // Cache storage removed - preloading disabled
          } else {
            throw new Error('Empty response from AI');
          }
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error);
          
          if (attempts === maxAttempts) {
            // Final fallback: Create a simple story
            const fallbackStory = {
              headline: language === 'es' ? `Noticias de ${category.name}` : `${category.name} News`,
              summary: language === 'es' 
                ? `¡Descubre noticias positivas increíbles sobre ${category.name.toLowerCase()}! Haz clic para explorar más historias.`
                : `Discover amazing positive news about ${category.name.toLowerCase()}! Click to explore more stories.`,
              fullText: language === 'es'
                ? `Estamos preparando algunas historias emocionantes de ${category.name.toLowerCase()} para ti. Por favor, inténtalo de nuevo en un momento o selecciona una categoría diferente.`
                : `We're preparing some exciting ${category.name.toLowerCase()} stories for you. Please try again in a moment or select a different category.`,
              source: 'Orb Game',
              publishedAt: new Date().toISOString(),
              ttsAudio: null,
              category: category.name,
              aiModel: 'fallback',
              language: language
            };
            
            setNewsStories([fallbackStory]);
            setCurrentNewsIndex(0);
            setCurrentNews(fallbackStory);
            setCurrentAISource('Fallback');
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }
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
    } finally {
      setIsLoading(false);
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
    if (!currentNews?.ttsAudio) {
      console.log('No TTS audio available to play');
      return;
    }
    
    if (isMuted) {
      console.log('Audio is muted');
      return;
    }
    
    setIsAudioLoading(true);
    setAudioError(null);
    
    try {
      // Ensure audioRef exists
      if (!audioRef.current) {
        console.error('Audio reference not available');
        setAudioError('Audio system not ready');
        setIsAudioLoading(false);
        return;
      }
      
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



  const nextStory = () => {
    const filteredStories = getFilteredStories();
    if (filteredStories.length > 1) {
      const nextIndex = (currentNewsIndex + 1) % filteredStories.length;
      setCurrentNewsIndex(nextIndex);
      setCurrentNews(filteredStories[nextIndex]);
      
      // Removed auto-play audio - user must click play button
    }
  };

  const prevStory = () => {
    const filteredStories = getFilteredStories();
    if (filteredStories.length > 1) {
      const prevIndex = (currentNewsIndex - 1 + filteredStories.length) % filteredStories.length;
      setCurrentNewsIndex(prevIndex);
      setCurrentNews(filteredStories[prevIndex]);
      
      // Removed auto-play audio - user must click play button
    }
  };

  const learnMore = async () => {
    if (!currentNews || !orbInCenter) return;
    
    setIsLoading(true);
    console.log(`🔍 Learning more about ${currentNews.headline}...`);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Based on this story: "${currentNews.headline}" - ${currentNews.summary} ${currentNews.fullText}. Please provide additional fascinating details, background information, and related developments about this topic. Make it engaging and informative.`,
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
        // Create a new story with the additional information
        const learnMoreStory = {
          headline: language === 'es' ? `${currentEpoch} ${orbInCenter.name} Historia - Más Información` : `${currentEpoch} ${orbInCenter.name} Story - Learn More`,
          summary: data.response.trim(),
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
        setCurrentAISource(`${availableModels.find(m => m.id === selectedModel)?.name || selectedModel} - Learn More`);
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
        
        {/* Central Orb */}
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#3366ff" />
        </Sphere>
        

        
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
        <div className="news-panel" ref={storyPanelRef}>
          <div className="news-header">
            <div className="escape-hint">
              <span className="escape-text">{t('news.escape.hint').replace('Esc', '<kbd>Esc</kbd>')}</span>
            </div>
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
            <label>AI Model:</label>
            <select value={selectedModel} onChange={(e) => {
              setSelectedModel(e.target.value);
              // Don't clear stories - keep panel visible until user manually closes
            }}>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button 
              onClick={async () => {
                // Generate fresh stories with current model and ensure audio is cached
                if (orbInCenter) {
                  console.log(`🔄 Generating fresh stories with ${selectedModel} for ${orbInCenter.name}`);
                  
                  // Clear current stories to force fresh generation
                  setNewsStories([]);
                  setCurrentNews(null);
                  setCurrentNewsIndex(0);
                  
                  // Load fresh stories with audio (force fresh generation)
                  await loadStoryForOrb(orbInCenter, true);
                  
                  // Removed auto-play audio - user must click play button
                }
              }}
              className="go-button"
              disabled={isLoading}
            >
              {isLoading ? '⏳' : t('news.go')}
            </button>
            {currentNews && (currentNews.aiModel === 'fallback' || currentNews.aiModel === 'error' || currentNews.source === 'Orb Game') && (
              <div className="fallback-notice">
                <span className="fallback-text">⚠️ {t('news.fallback.detected')}</span>
              </div>
            )}
            {isLoading && (
              <div className="generating-notice">
                <span className="generating-text">🔄 {t('news.generating.fresh')} {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}...</span>
              </div>
            )}
          </div>
          <div className="news-content">
            <p className="news-full-text">{currentNews.fullText}</p>
          </div>
          <div className="news-actions">
            <button 
              onClick={learnMore}
              disabled={isLoading}
              className="learn-more-button"
              title={language === 'es' ? 'Obtener más información sobre este tema' : 'Get more information about this topic'}
            >
              {isLoading ? '⏳' : '🔍'} {language === 'es' ? 'Aprender Más' : 'Learn More'}
            </button>
          </div>
          <div className="ai-model-section">
            <span className="ai-model-text">AI Model: {currentAISource}</span>
          </div>
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
          <div className="news-navigation">
            <button 
              onClick={prevStory} 
              disabled={getFilteredStories().length <= 1}
              className={getFilteredStories().length <= 1 ? 'disabled' : ''}
            >
              ← {t('news.previous')}
            </button>
            <span className="story-counter">
              {currentNewsIndex + 1} {t('news.story.of')} {getFilteredStories().length} {t('news.stories')}
            </span>
            <button 
              onClick={nextStory} 
              disabled={getFilteredStories().length <= 1}
              className={getFilteredStories().length <= 1 ? 'disabled' : ''}
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