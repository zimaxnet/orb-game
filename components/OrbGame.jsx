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
  
  // Add preloaded stories state
  const [preloadedStories, setPreloadedStories] = useState({});
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  
  // Add drag and center state
  const [draggedOrb, setDraggedOrb] = useState(null);
  const [orbInCenter, setOrbInCenter] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Preload stories on component mount
  useEffect(() => {
    preloadStoriesForEpoch(currentEpoch);
  }, []); // Only run on mount
  
  // Preload stories when language changes
  useEffect(() => {
    preloadStoriesForEpoch(currentEpoch);
  }, [language]); // Re-run when language changes
  


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
  
  // Preload stories for all categories and models when epoch changes
  const preloadStoriesForEpoch = async (epoch) => {
    if (isPreloading) return;
    
    setIsPreloading(true);
    setPreloadProgress(0);
    
    const newPreloadedStories = {};
    const totalRequests = categories.length * aiModels.length;
    let completedRequests = 0;
    
    console.log(`🔄 Preloading stories for ${epoch} epoch...`);
    
    for (const category of categories) {
      newPreloadedStories[category.name] = {};
      
      for (const model of aiModels) {
        try {
          console.log(`📚 Preloading ${category.name} stories from ${model.name} for ${epoch} epoch...`);
          
          const response = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category.name}?epoch=${epoch}&model=${model.id}&count=3&language=${language}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              category: category.name,
              epoch: epoch,
              model: model.id,
              count: 3,
              language: language,
              prompt: getExcitingPrompt(category.name, epoch, model.id)
            })
          });
          
          if (response.ok) {
            const stories = await response.json();
            if (stories && stories.length > 0) {
              newPreloadedStories[category.name][model.id] = stories;
              console.log(`✅ Preloaded ${stories.length} stories for ${category.name} from ${model.name}`);
            } else {
              console.log(`⚠️ No stories generated for ${category.name} from ${model.name}`);
            }
          } else {
            console.log(`❌ Failed to preload stories for ${category.name} from ${model.name}`);
          }
        } catch (error) {
          console.error(`❌ Error preloading ${category.name} from ${model.name}:`, error);
        }
        
        completedRequests++;
        setPreloadProgress((completedRequests / totalRequests) * 100);
      }
    }
    
    setPreloadedStories(newPreloadedStories);
    setIsPreloading(false);
    setPreloadProgress(0);
    console.log(`✅ Preloading complete for ${epoch} epoch!`);
  };
  
  // Handle epoch change
  const handleEpochChange = (newEpoch) => {
    setCurrentEpoch(newEpoch);
    preloadStoriesForEpoch(newEpoch);
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
    
    // Check if we have preloaded stories for this category and model
    const preloadedCategoryStories = preloadedStories[category.name];
    const preloadedModelStories = preloadedCategoryStories?.[selectedModel];
    
    if (preloadedModelStories && preloadedModelStories.length > 0) {
      console.log(`🎯 Using preloaded stories for ${category.name} from ${selectedModelInfo.name}`);
      setNewsStories(preloadedModelStories);
      setCurrentNewsIndex(0);
      setCurrentNews(preloadedModelStories[0]);
      setCurrentAISource(selectedModelInfo.name);
      
      // Ensure TTS is ready before autoplaying
      if (preloadedModelStories[0]?.ttsAudio && !isMuted) {
        setTimeout(() => {
          playAudio();
        }, 800);
      }
      
      setIsLoading(false);
      return;
    }
    
    // Enhanced prompts for each epoch and category
    const getExcitingPrompt = (category, epoch, model) => {
      if (language === 'es') {
        // Spanish prompts
        const spanishCategoryPrompts = {
          'Technology': {
            'Ancient': `¡Descubre 5 maravillas tecnológicas asombrosas de las civilizaciones antiguas! De los conocimientos perdidos de los tiempos ${epoch.toLowerCase()}, revela los inventos más increíbles, hazañas de ingeniería y avances tecnológicos que dieron forma al progreso humano. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo estos pioneros tecnológicos antiguos cambiaron el mundo!`,
            'Medieval': `¡Descubre 5 innovaciones tecnológicas revolucionarias de la era medieval! De las mentes ingeniosas de los tiempos ${epoch.toLowerCase()}, revela los inventos más extraordinarios, maravillas mecánicas y saltos tecnológicos que transformaron la sociedad. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo estos visionarios tecnológicos medievales empujaron los límites de lo posible!`,
            'Industrial': `¡Explora 5 revoluciones tecnológicas innovadoras de la era industrial! De las innovaciones explosivas de los tiempos ${epoch.toLowerCase()}, revela los inventos más increíbles, maravillas de ingeniería y avances tecnológicos que impulsaron el mundo moderno. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo estos pioneros industriales desataron la revolución tecnológica!`,
            'Modern': `¡Revela 5 avances tecnológicos de vanguardia de la era moderna! De las últimas innovaciones de los tiempos ${epoch.toLowerCase()}, revela los inventos más alucinantes, revoluciones digitales y saltos tecnológicos que están remodelando nuestro futuro. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo estos visionarios tecnológicos modernos están cambiando el mundo!`,
            'Future': `¡Imagina 5 maravillas tecnológicas revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela los inventos más asombrosos, avances de IA y saltos tecnológicos que transformarán la humanidad. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo estos pioneros tecnológicos futuros remodelarán nuestro mundo!`
          },
          'Science': {
            'Ancient': `¡Revela 5 descubrimientos científicos extraordinarios de las civilizaciones antiguas! De las mentes brillantes de los tiempos ${epoch.toLowerCase()}, descubre los avances más asombrosos, fenómenos naturales y revelaciones científicas que sentaron las bases de la ciencia moderna. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo estos científicos antiguos desbloquearon los secretos del universo!`,
            'Medieval': `¡Descubre 5 avances científicos revolucionarios de la era medieval! De las mentes pioneras de los tiempos ${epoch.toLowerCase()}, revela los descubrimientos más extraordinarios, maravillas naturales y revelaciones científicas que avanzaron el conocimiento humano. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo estos científicos medievales expandieron nuestra comprensión del mundo!`,
            'Industrial': `¡Explora 5 revoluciones científicas innovadoras de la era industrial! De los descubrimientos explosivos de los tiempos ${epoch.toLowerCase()}, revela los avances más increíbles, fenómenos naturales y revelaciones científicas que impulsaron la revolución científica moderna. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo estos científicos industriales transformaron nuestra comprensión de la naturaleza!`,
            'Modern': `¡Revela 5 avances científicos de vanguardia de la era moderna! De los últimos descubrimientos de los tiempos ${epoch.toLowerCase()}, revela las revelaciones más alucinantes, maravillas naturales y saltos científicos que están remodelando nuestra comprensión del universo. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo estos científicos modernos están desbloqueando los misterios de la existencia!`,
            'Future': `¡Imagina 5 maravillas científicas revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela los descubrimientos más asombrosos, avances impulsados por IA y saltos científicos que transformarán nuestra comprensión de la realidad. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo estos científicos futuros desbloquearán los secretos del cosmos!`
          },
          'Art': {
            'Ancient': `¡Descubre 5 obras maestras artísticas impresionantes de las civilizaciones antiguas! Del genio creativo de los tiempos ${epoch.toLowerCase()}, revela las obras de arte más asombrosas, expresiones culturales y revelaciones artísticas que dieron forma a la creatividad humana. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo estos artistas antiguos capturaron la belleza y el misterio de su mundo!`,
            'Medieval': `¡Descubre 5 innovaciones artísticas revolucionarias de la era medieval! De las mentes visionarias de los tiempos ${epoch.toLowerCase()}, revela las obras maestras más extraordinarias, expresiones culturales y avances artísticos que transformaron la expresión humana. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo estos artistas medievales empujaron los límites de la creatividad!`,
            'Industrial': `¡Explora 5 revoluciones artísticas innovadoras de la era industrial! De la creatividad explosiva de los tiempos ${epoch.toLowerCase()}, revela las obras maestras más increíbles, expresiones culturales y revelaciones artísticas que reflejaron el mundo cambiante. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo estos artistas industriales capturaron el espíritu de su era!`,
            'Modern': `¡Revela 5 avances artísticos de vanguardia de la era moderna! De las últimas innovaciones de los tiempos ${epoch.toLowerCase()}, revela las obras maestras más alucinantes, arte digital y saltos artísticos que están remodelando la expresión creativa. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo estos artistas modernos están redefiniendo lo que puede ser el arte!`,
            'Future': `¡Imagina 5 maravillas artísticas revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela las obras maestras más asombrosas, arte generado por IA y saltos artísticos que transformarán la creatividad humana. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo estos artistas futuros crearán arte más allá de nuestros sueños más salvajes!`
          },
          'Nature': {
            'Ancient': `¡Revela 5 maravillas naturales extraordinarias de las civilizaciones antiguas! De la belleza prístina de los tiempos ${epoch.toLowerCase()}, descubre los fenómenos naturales más asombrosos, descubrimientos ambientales y revelaciones ecológicas que dieron forma a nuestra comprensión de la Tierra. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo la gente antigua se maravillaba del mundo natural!`,
            'Medieval': `¡Descubre 5 descubrimientos naturales revolucionarios de la era medieval! De la exploración de los tiempos ${epoch.toLowerCase()}, revela las maravillas naturales más extraordinarias, fenómenos ambientales y avances ecológicos que expandieron el conocimiento humano de la naturaleza. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo los exploradores medievales descubrieron los secretos de la Tierra!`,
            'Industrial': `¡Explora 5 revelaciones naturales innovadoras de la era industrial! Del paisaje cambiante de los tiempos ${epoch.toLowerCase()}, revela los fenómenos naturales más increíbles, descubrimientos ambientales y perspectivas ecológicas que surgieron durante el desarrollo rápido. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo los naturalistas de la era industrial documentaron la transformación de la Tierra!`,
            'Modern': `¡Revela 5 avances naturales de vanguardia de la era moderna! De los últimos descubrimientos de los tiempos ${epoch.toLowerCase()}, revela las maravillas naturales más alucinantes, fenómenos ambientales y revelaciones ecológicas que están remodelando nuestra comprensión de la Tierra. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo los científicos modernos están descubriendo los secretos de la naturaleza!`,
            'Future': `¡Imagina 5 maravillas naturales revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela los fenómenos ambientales más asombrosos, descubrimientos asistidos por IA y saltos ecológicos que transformarán nuestra relación con la naturaleza. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo los ambientalistas futuros protegerán y entenderán nuestro planeta!`
          },
          'Sports': {
            'Ancient': `¡Descubre 5 logros atléticos extraordinarios de las civilizaciones antiguas! Del espíritu competitivo de los tiempos ${epoch.toLowerCase()}, revela los eventos deportivos más asombrosos, hazañas físicas y revelaciones atléticas que celebraron el potencial humano. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo los atletas antiguos empujaron los límites del rendimiento humano!`,
            'Medieval': `¡Descubre 5 innovaciones deportivas revolucionarias de la era medieval! De las tradiciones competitivas de los tiempos ${epoch.toLowerCase()}, revela los eventos atléticos más extraordinarios, desafíos físicos y avances deportivos que probaron los límites humanos. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo los atletas medievales celebraron la fuerza y la habilidad!`,
            'Industrial': `¡Explora 5 revoluciones deportivas innovadoras de la era industrial! Del espíritu competitivo de los tiempos ${epoch.toLowerCase()}, revela los eventos atléticos más increíbles, logros físicos y revelaciones deportivas que reflejaron la sociedad cambiante. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo los atletas de la era industrial redefinieron lo que era posible!`,
            'Modern': `¡Revela 5 avances deportivos de vanguardia de la era moderna! De los últimos logros de los tiempos ${epoch.toLowerCase()}, revela las hazañas atléticas más alucinantes, innovaciones tecnológicas y saltos deportivos que están redefiniendo el potencial humano. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo los atletas modernos están rompiendo todos los récords!`,
            'Future': `¡Imagina 5 maravillas deportivas revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela los logros atléticos más asombrosos, rendimiento mejorado por IA y saltos deportivos que transformarán la competencia humana. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo los atletas futuros empujarán más allá de los límites actuales!`
          },
          'Music': {
            'Ancient': `¡Revela 5 obras maestras musicales extraordinarias de las civilizaciones antiguas! Del genio melódico de los tiempos ${epoch.toLowerCase()}, descubre las innovaciones musicales más asombrosas, expresiones culturales y revelaciones armónicas que dieron forma a la emoción humana. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo los músicos antiguos crearon los primeros sonidos que movieron el alma!`,
            'Medieval': `¡Descubre 5 innovaciones musicales revolucionarias de la era medieval! De las tradiciones armónicas de los tiempos ${epoch.toLowerCase()}, revela las composiciones más extraordinarias, expresiones culturales y avances musicales que transformaron la expresión humana. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo los músicos medievales crearon melodías que aún resuenan hoy!`,
            'Industrial': `¡Explora 5 revoluciones musicales innovadoras de la era industrial! De los sonidos en evolución de los tiempos ${epoch.toLowerCase()}, revela las composiciones más increíbles, expresiones culturales y revelaciones musicales que reflejaron la sociedad cambiante. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo los músicos de la era industrial capturaron el ritmo del progreso!`,
            'Modern': `¡Revela 5 avances musicales de vanguardia de la era moderna! De las últimas innovaciones de los tiempos ${epoch.toLowerCase()}, revela las composiciones más alucinantes, música digital y saltos musicales que están remodelando la expresión humana. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo los músicos modernos están creando sonidos nunca antes escuchados!`,
            'Future': `¡Imagina 5 maravillas musicales revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela las composiciones más asombrosas, música generada por IA y saltos musicales que transformarán la creatividad humana. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo los músicos futuros crearán armonías más allá de nuestra imaginación!`
          },
          'Space': {
            'Ancient': `¡Descubre 5 descubrimientos cósmicos extraordinarios de las civilizaciones antiguas! De la sabiduría de observación de estrellas de los tiempos ${epoch.toLowerCase()}, revela las observaciones astronómicas más asombrosas, fenómenos celestes y revelaciones espaciales que dieron forma a la comprensión humana del cosmos. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo los astrónomos antiguos mapearon los cielos!`,
            'Medieval': `¡Descubre 5 observaciones espaciales revolucionarias de la era medieval! Del conocimiento celeste de los tiempos ${epoch.toLowerCase()}, revela los descubrimientos astronómicos más extraordinarios, fenómenos cósmicos y revelaciones espaciales que expandieron la comprensión humana del universo. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo los astrónomos medievales estudiaron las estrellas!`,
            'Industrial': `¡Explora 5 revelaciones espaciales innovadoras de la era industrial! Del conocimiento en expansión de los tiempos ${epoch.toLowerCase()}, revela los descubrimientos astronómicos más increíbles, fenómenos cósmicos y revelaciones espaciales que allanaron el camino para la astronomía moderna. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo los astrónomos de la era industrial desbloquearon secretos cósmicos!`,
            'Modern': `¡Revela 5 avances espaciales de vanguardia de la era moderna! De los últimos descubrimientos de los tiempos ${epoch.toLowerCase()}, revela los fenómenos cósmicos más alucinantes, innovaciones tecnológicas y revelaciones espaciales que están remodelando nuestra comprensión del universo. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo los astrónomos modernos están descubriendo misterios cósmicos!`,
            'Future': `¡Imagina 5 maravillas espaciales revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela los descubrimientos cósmicos más asombrosos, exploración impulsada por IA y saltos espaciales que transformarán nuestra comprensión del universo. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo los exploradores espaciales futuros desbloquearán los secretos del cosmos!`
          },
          'Innovation': {
            'Ancient': `¡Revela 5 avances innovadores extraordinarios de las civilizaciones antiguas! Del genio creativo de los tiempos ${epoch.toLowerCase()}, descubre los inventos más asombrosos, hazañas de resolución de problemas y revelaciones innovadoras que dieron forma al progreso humano. ¡Haz cada historia absolutamente cautivadora con detalles increíbles sobre cómo los innovadores antiguos resolvieron desafíos imposibles!`,
            'Medieval': `¡Descubre 5 logros innovadores revolucionarios de la era medieval! De las mentes creativas de los tiempos ${epoch.toLowerCase()}, revela los inventos más extraordinarios, avances en resolución de problemas y revelaciones innovadoras que avanzaron la civilización humana. ¡Haz cada historia emocionante con detalles fascinantes sobre cómo los innovadores medievales empujaron los límites de lo posible!`,
            'Industrial': `¡Explora 5 revoluciones innovadoras innovadoras de la era industrial! De la creatividad explosiva de los tiempos ${epoch.toLowerCase()}, revela los inventos más increíbles, hazañas de resolución de problemas y revelaciones innovadoras que impulsaron el mundo moderno. ¡Haz cada historia electrizante con detalles asombrosos sobre cómo los innovadores industriales desataron la era de la invención!`,
            'Modern': `¡Revela 5 avances innovadores de vanguardia de la era moderna! De las últimas creaciones de los tiempos ${epoch.toLowerCase()}, revela los inventos más alucinantes, saltos tecnológicos y revelaciones innovadoras que están remodelando nuestro futuro. ¡Haz cada historia absolutamente fascinante con detalles increíbles sobre cómo los innovadores modernos están resolviendo los problemas del mañana hoy!`,
            'Future': `¡Imagina 5 maravillas innovadoras revolucionarias del futuro! De las increíbles posibilidades de los tiempos ${epoch.toLowerCase()}, revela los inventos más asombrosos, avances impulsados por IA y saltos innovadores que transformarán la civilización humana. ¡Haz cada historia absolutamente alucinante con detalles fascinantes sobre cómo los innovadores futuros crearán soluciones más allá de nuestros sueños más salvajes!`
          }
        };
        
        return spanishCategoryPrompts[category]?.[epoch] || `Genera 5 historias fascinantes y positivas de ${category} de los tiempos ${epoch.toLowerCase()}. Cada historia debe ser atractiva, informativa y destacar logros o descubrimientos notables. Haz cada historia única y cautivadora.`;
      }
      
      // English prompts (existing)
      const categoryPrompts = {
        'Technology': {
          'Ancient': `Uncover 5 mind-blowing technological marvels from ancient civilizations! From lost knowledge of ${epoch.toLowerCase()} times, reveal the most astonishing inventions, engineering feats, and technological breakthroughs that shaped human progress. Make each story absolutely captivating with incredible details about how these ancient tech pioneers changed the world!`,
          'Medieval': `Discover 5 revolutionary technological innovations from the medieval era! From the ingenious minds of ${epoch.toLowerCase()} times, reveal the most extraordinary inventions, mechanical wonders, and technological leaps that transformed society. Make each story thrilling with fascinating details about how these medieval tech visionaries pushed the boundaries of what was possible!`,
          'Industrial': `Explore 5 groundbreaking technological revolutions from the industrial age! From the explosive innovations of ${epoch.toLowerCase()} times, reveal the most incredible inventions, engineering marvels, and technological breakthroughs that powered the modern world. Make each story electrifying with amazing details about how these industrial pioneers sparked the technological revolution!`,
          'Modern': `Unveil 5 cutting-edge technological breakthroughs from the modern era! From the latest innovations of ${epoch.toLowerCase()} times, reveal the most mind-bending inventions, digital revolutions, and technological leaps that are reshaping our future. Make each story absolutely fascinating with incredible details about how these modern tech visionaries are changing the world!`,
          'Future': `Imagine 5 revolutionary technological marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing inventions, AI breakthroughs, and technological leaps that will transform humanity. Make each story absolutely mind-blowing with fascinating details about how these future tech pioneers will reshape our world!`
        },
        'Science': {
          'Ancient': `Reveal 5 extraordinary scientific discoveries from ancient civilizations! From the brilliant minds of ${epoch.toLowerCase()} times, uncover the most astonishing breakthroughs, natural phenomena, and scientific revelations that laid the foundation for modern science. Make each story absolutely captivating with incredible details about how these ancient scientists unlocked the secrets of the universe!`,
          'Medieval': `Discover 5 revolutionary scientific breakthroughs from the medieval era! From the pioneering minds of ${epoch.toLowerCase()} times, reveal the most extraordinary discoveries, natural wonders, and scientific revelations that advanced human knowledge. Make each story thrilling with fascinating details about how these medieval scientists expanded our understanding of the world!`,
          'Industrial': `Explore 5 groundbreaking scientific revolutions from the industrial age! From the explosive discoveries of ${epoch.toLowerCase()} times, reveal the most incredible breakthroughs, natural phenomena, and scientific revelations that powered the modern scientific revolution. Make each story electrifying with amazing details about how these industrial scientists transformed our understanding of nature!`,
          'Modern': `Unveil 5 cutting-edge scientific breakthroughs from the modern era! From the latest discoveries of ${epoch.toLowerCase()} times, reveal the most mind-bending revelations, natural wonders, and scientific leaps that are reshaping our understanding of the universe. Make each story absolutely fascinating with incredible details about how these modern scientists are unlocking the mysteries of existence!`,
          'Future': `Imagine 5 revolutionary scientific marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing discoveries, AI-powered breakthroughs, and scientific leaps that will transform our understanding of reality. Make each story absolutely mind-blowing with fascinating details about how these future scientists will unlock the secrets of the cosmos!`
        },
        'Art': {
          'Ancient': `Uncover 5 breathtaking artistic masterpieces from ancient civilizations! From the creative genius of ${epoch.toLowerCase()} times, reveal the most astonishing artworks, cultural expressions, and artistic revelations that shaped human creativity. Make each story absolutely captivating with incredible details about how these ancient artists captured the beauty and mystery of their world!`,
          'Medieval': `Discover 5 revolutionary artistic innovations from the medieval era! From the visionary minds of ${epoch.toLowerCase()} times, reveal the most extraordinary masterpieces, cultural expressions, and artistic breakthroughs that transformed human expression. Make each story thrilling with fascinating details about how these medieval artists pushed the boundaries of creativity!`,
          'Industrial': `Explore 5 groundbreaking artistic revolutions from the industrial age! From the explosive creativity of ${epoch.toLowerCase()} times, reveal the most incredible masterpieces, cultural expressions, and artistic revelations that reflected the changing world. Make each story electrifying with amazing details about how these industrial artists captured the spirit of their era!`,
          'Modern': `Unveil 5 cutting-edge artistic breakthroughs from the modern era! From the latest innovations of ${epoch.toLowerCase()} times, reveal the most mind-bending masterpieces, digital art, and artistic leaps that are reshaping creative expression. Make each story absolutely fascinating with incredible details about how these modern artists are redefining what art can be!`,
          'Future': `Imagine 5 revolutionary artistic marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing masterpieces, AI-generated art, and artistic leaps that will transform human creativity. Make each story absolutely mind-blowing with fascinating details about how these future artists will create art beyond our wildest dreams!`
        },
        'Nature': {
          'Ancient': `Reveal 5 extraordinary natural wonders from ancient civilizations! From the pristine beauty of ${epoch.toLowerCase()} times, uncover the most astonishing natural phenomena, environmental discoveries, and ecological revelations that shaped our understanding of Earth. Make each story absolutely captivating with incredible details about how ancient people marveled at the natural world!`,
          'Medieval': `Discover 5 revolutionary natural discoveries from the medieval era! From the exploration of ${epoch.toLowerCase()} times, reveal the most extraordinary natural wonders, environmental phenomena, and ecological breakthroughs that expanded human knowledge of nature. Make each story thrilling with fascinating details about how medieval explorers uncovered Earth's secrets!`,
          'Industrial': `Explore 5 groundbreaking natural revelations from the industrial age! From the changing landscape of ${epoch.toLowerCase()} times, reveal the most incredible natural phenomena, environmental discoveries, and ecological insights that emerged during rapid development. Make each story electrifying with amazing details about how industrial-era naturalists documented Earth's transformation!`,
          'Modern': `Unveil 5 cutting-edge natural breakthroughs from the modern era! From the latest discoveries of ${epoch.toLowerCase()} times, reveal the most mind-bending natural wonders, environmental phenomena, and ecological revelations that are reshaping our understanding of Earth. Make each story absolutely fascinating with incredible details about how modern scientists are uncovering nature's secrets!`,
          'Future': `Imagine 5 revolutionary natural marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing environmental phenomena, AI-assisted discoveries, and ecological leaps that will transform our relationship with nature. Make each story absolutely mind-blowing with fascinating details about how future environmentalists will protect and understand our planet!`
        },
        'Sports': {
          'Ancient': `Uncover 5 extraordinary athletic achievements from ancient civilizations! From the competitive spirit of ${epoch.toLowerCase()} times, reveal the most astonishing sporting events, physical feats, and athletic revelations that celebrated human potential. Make each story absolutely captivating with incredible details about how ancient athletes pushed the limits of human performance!`,
          'Medieval': `Discover 5 revolutionary sporting innovations from the medieval era! From the competitive traditions of ${epoch.toLowerCase()} times, reveal the most extraordinary athletic events, physical challenges, and sporting breakthroughs that tested human limits. Make each story thrilling with fascinating details about how medieval athletes celebrated strength and skill!`,
          'Industrial': `Explore 5 groundbreaking sporting revolutions from the industrial age! From the competitive spirit of ${epoch.toLowerCase()} times, reveal the most incredible athletic events, physical achievements, and sporting revelations that reflected changing society. Make each story electrifying with amazing details about how industrial-era athletes redefined what was possible!`,
          'Modern': `Unveil 5 cutting-edge sporting breakthroughs from the modern era! From the latest achievements of ${epoch.toLowerCase()} times, reveal the most mind-bending athletic feats, technological innovations, and sporting leaps that are redefining human potential. Make each story absolutely fascinating with incredible details about how modern athletes are breaking every record!`,
          'Future': `Imagine 5 revolutionary sporting marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing athletic achievements, AI-enhanced performance, and sporting leaps that will transform human competition. Make each story absolutely mind-blowing with fascinating details about how future athletes will push beyond current limits!`
        },
        'Music': {
          'Ancient': `Reveal 5 extraordinary musical masterpieces from ancient civilizations! From the melodic genius of ${epoch.toLowerCase()} times, uncover the most astonishing musical innovations, cultural expressions, and harmonic revelations that shaped human emotion. Make each story absolutely captivating with incredible details about how ancient musicians created the first sounds that moved the soul!`,
          'Medieval': `Discover 5 revolutionary musical innovations from the medieval era! From the harmonic traditions of ${epoch.toLowerCase()} times, reveal the most extraordinary compositions, cultural expressions, and musical breakthroughs that transformed human expression. Make each story thrilling with fascinating details about how medieval musicians crafted melodies that still resonate today!`,
          'Industrial': `Explore 5 groundbreaking musical revolutions from the industrial age! From the evolving sounds of ${epoch.toLowerCase()} times, reveal the most incredible compositions, cultural expressions, and musical revelations that reflected changing society. Make each story electrifying with amazing details about how industrial-era musicians captured the rhythm of progress!`,
          'Modern': `Unveil 5 cutting-edge musical breakthroughs from the modern era! From the latest innovations of ${epoch.toLowerCase()} times, reveal the most mind-bending compositions, digital music, and musical leaps that are reshaping human expression. Make each story absolutely fascinating with incredible details about how modern musicians are creating sounds never heard before!`,
          'Future': `Imagine 5 revolutionary musical marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing compositions, AI-generated music, and musical leaps that will transform human creativity. Make each story absolutely mind-blowing with fascinating details about how future musicians will create harmonies beyond our imagination!`
        },
        'Space': {
          'Ancient': `Uncover 5 extraordinary cosmic discoveries from ancient civilizations! From the stargazing wisdom of ${epoch.toLowerCase()} times, reveal the most astonishing astronomical observations, celestial phenomena, and space revelations that shaped human understanding of the cosmos. Make each story absolutely captivating with incredible details about how ancient astronomers mapped the heavens!`,
          'Medieval': `Discover 5 revolutionary space observations from the medieval era! From the celestial knowledge of ${epoch.toLowerCase()} times, reveal the most extraordinary astronomical discoveries, cosmic phenomena, and space revelations that expanded human understanding of the universe. Make each story thrilling with fascinating details about how medieval astronomers studied the stars!`,
          'Industrial': `Explore 5 groundbreaking space revelations from the industrial age! From the expanding knowledge of ${epoch.toLowerCase()} times, reveal the most incredible astronomical discoveries, cosmic phenomena, and space revelations that paved the way for modern astronomy. Make each story electrifying with amazing details about how industrial-era astronomers unlocked cosmic secrets!`,
          'Modern': `Unveil 5 cutting-edge space breakthroughs from the modern era! From the latest discoveries of ${epoch.toLowerCase()} times, reveal the most mind-bending cosmic phenomena, technological innovations, and space revelations that are reshaping our understanding of the universe. Make each story absolutely fascinating with incredible details about how modern astronomers are uncovering cosmic mysteries!`,
          'Future': `Imagine 5 revolutionary space marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing cosmic discoveries, AI-powered exploration, and space leaps that will transform our understanding of the universe. Make each story absolutely mind-blowing with fascinating details about how future space explorers will unlock the secrets of the cosmos!`
        },
        'Innovation': {
          'Ancient': `Reveal 5 extraordinary innovative breakthroughs from ancient civilizations! From the creative genius of ${epoch.toLowerCase()} times, uncover the most astonishing inventions, problem-solving feats, and innovative revelations that shaped human progress. Make each story absolutely captivating with incredible details about how ancient innovators solved impossible challenges!`,
          'Medieval': `Discover 5 revolutionary innovative achievements from the medieval era! From the creative minds of ${epoch.toLowerCase()} times, reveal the most extraordinary inventions, problem-solving breakthroughs, and innovative revelations that advanced human civilization. Make each story thrilling with fascinating details about how medieval innovators pushed the boundaries of what was possible!`,
          'Industrial': `Explore 5 groundbreaking innovative revolutions from the industrial age! From the explosive creativity of ${epoch.toLowerCase()} times, reveal the most incredible inventions, problem-solving feats, and innovative revelations that powered the modern world. Make each story electrifying with amazing details about how industrial innovators sparked the age of invention!`,
          'Modern': `Unveil 5 cutting-edge innovative breakthroughs from the modern era! From the latest creations of ${epoch.toLowerCase()} times, reveal the most mind-bending inventions, technological leaps, and innovative revelations that are reshaping our future. Make each story absolutely fascinating with incredible details about how modern innovators are solving tomorrow's problems today!`,
          'Future': `Imagine 5 revolutionary innovative marvels from the future! From the incredible possibilities of ${epoch.toLowerCase()} times, reveal the most astonishing inventions, AI-powered breakthroughs, and innovative leaps that will transform human civilization. Make each story absolutely mind-blowing with fascinating details about how future innovators will create solutions beyond our wildest dreams!`
        }
      };
      
      return categoryPrompts[category]?.[epoch] || `Generate 5 fascinating, positive ${category} stories from ${epoch.toLowerCase()} times. Each story should be engaging, informative, and highlight remarkable achievements or discoveries. Make each story unique and captivating.`;
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
      
      const generateResponse = await fetch(`${BACKEND_URL}/api/orb/generate-news/${category.name}?epoch=${currentEpoch}&model=${selectedModel}&count=5&language=${language}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: category.name,
          epoch: currentEpoch,
          model: selectedModel,
          count: 5,
          language: language,
          prompt: getExcitingPrompt(category.name, currentEpoch, selectedModel)
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
              prompt: getExcitingPrompt(category.name, currentEpoch, selectedModel).replace('5', '3').replace('5 fascinating', '3 incredible')
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
        <select value={currentEpoch} onChange={(e) => handleEpochChange(e.target.value)}>
          {epochs.map(epoch => (
            <option key={epoch} value={epoch}>{t(`epoch.${epoch.toLowerCase()}`)}</option>
          ))}
        </select>
        {isPreloading && (
          <div className="preload-indicator">
            <div className="preload-progress">
              <div className="preload-fill" style={{width: `${preloadProgress}%`}}></div>
            </div>
            <span>Preloading stories... {Math.round(preloadProgress)}%</span>
          </div>
        )}
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
            <select value={selectedModel} onChange={(e) => {
              setSelectedModel(e.target.value);
              // Check if we have preloaded stories for this model and category
              if (orbInCenter && preloadedStories[orbInCenter.name]?.[e.target.value]) {
                const stories = preloadedStories[orbInCenter.name][e.target.value];
                setNewsStories(stories);
                setCurrentNewsIndex(0);
                setCurrentNews(stories[0]);
                setCurrentAISource(aiModels.find(m => m.id === e.target.value).name);
                
                // Play audio if available
                if (stories[0]?.ttsAudio && !isMuted) {
                  setTimeout(() => {
                    playAudio();
                  }, 800);
                }
              }
            }}>
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>
                  {t(`ai.model.${model.id}`)} - {model.description}
                </option>
              ))}
            </select>
            <button 
              onClick={() => {
                // Check if we have preloaded stories for this model and category
                if (orbInCenter && preloadedStories[orbInCenter.name]?.[selectedModel]) {
                  const stories = preloadedStories[orbInCenter.name][selectedModel];
                  setNewsStories(stories);
                  setCurrentNewsIndex(0);
                  setCurrentNews(stories[0]);
                  setCurrentAISource(aiModels.find(m => m.id === selectedModel).name);
                  
                  // Play audio if available
                  if (stories[0]?.ttsAudio && !isMuted) {
                    setTimeout(() => {
                      playAudio();
                    }, 800);
                  }
                } else {
                  // Fallback to generating fresh stories
                  loadStoryForOrb(orbInCenter);
                }
              }}
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

export default OrbGame; 