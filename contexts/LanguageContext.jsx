import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = (key) => {
    const translations = {
      en: {
        // Orb Game UI
        'orb.game.title': 'Orb Game',
        'orb.game.subtitle': 'Discover positive news through interactive 3D exploration!',
        'orb.game.how.to.play': 'How to Play',
        'orb.game.how.to.play.step1': 'Select an epoch using the roller above',
        'orb.game.how.to.play.step2': 'Click on any orb to hear positive news',
        'orb.game.how.to.play.step3': 'Use Previous/Next to explore more stories',
        'orb.game.how.to.play.step4': 'Click ✕ to release the orb back to orbit',
        'orb.game.how.to.play.swipe': 'Swipe in any direction to dismiss',
        'orb.game.how.to.play.click': 'Or click anywhere to dismiss',
        
        // Epochs
        'epoch.ancient': 'Ancient',
        'epoch.medieval': 'Medieval', 
        'epoch.industrial': 'Industrial',
        'epoch.modern': 'Modern',
        'epoch.future': 'Future',
        
        // Categories
        'category.technology': 'Technology',
        'category.science': 'Science',
        'category.art': 'Art',
        'category.nature': 'Nature',
        'category.sports': 'Sports',
        'category.music': 'Music',
        'category.space': 'Space',
        'category.innovation': 'Innovation',
        
        // AI Models
        'ai.model.grok-4': 'Grok 4',
        'ai.model.perplexity-sonar': 'Perplexity Sonar',
        'ai.model.gemini-1.5-flash': 'Gemini 1.5 Flash',
        'ai.model.o4-mini': 'O4-Mini',
        'ai.model.select': 'Select AI Model',
        
        // News Panel
        'news.loading': 'Loading story...',
        'news.generating': 'Generating fresh story...',
        'news.creating': 'Creating fascinating content...',
        'news.alternative': 'Creating alternative story...',
        'news.connection.issue': 'Connection issue',
        'news.try.again': 'Please try again in a moment.',
        'news.unavailable': 'The AI model is temporarily unavailable.',
        'news.switch.model': 'Please try again or switch to a different model.',
        'news.story.of': 'of',
        'news.stories': 'stories',
        'news.previous': 'Previous',
        'news.next': 'Next',
        'news.go': 'Go',
        'news.close': 'Close',
        'news.source': 'Source',
        'news.ai.model': 'AI Model',
        'news.date': 'Date',
        'news.fallback.detected': 'Fallback story detected - click "Go" for fresh AI stories',
        'news.generating.fresh': 'Generating fresh stories with',
        'news.escape.hint': 'Press Esc to exit',
        
        // Audio Controls
        'audio.play': 'Play',
        'audio.pause': 'Pause',
        'audio.mute': 'Mute',
        'audio.unmute': 'Unmute',
        
        // Language Toggle
        'language.english': 'English',
        'language.spanish': 'Español',
        'language.toggle': 'Toggle Language',
        
        // Loading Messages
        'loading.ancient.technology': 'Searching for fascinating Technology stories from ancient civilizations and discoveries using',
        'loading.medieval.technology': 'Searching for fascinating Technology stories from medieval innovations and breakthroughs using',
        'loading.industrial.technology': 'Searching for fascinating Technology stories from industrial revolution and technological advances using',
        'loading.modern.technology': 'Searching for fascinating Technology stories from modern breakthroughs and innovations using',
        'loading.future.technology': 'Searching for fascinating Technology stories from futuristic technologies and possibilities using',
        
        'loading.ancient.science': 'Searching for fascinating Science stories from ancient civilizations and discoveries using',
        'loading.medieval.science': 'Searching for fascinating Science stories from medieval innovations and breakthroughs using',
        'loading.industrial.science': 'Searching for fascinating Science stories from industrial revolution and technological advances using',
        'loading.modern.science': 'Searching for fascinating Science stories from modern breakthroughs and innovations using',
        'loading.future.science': 'Searching for fascinating Science stories from futuristic technologies and possibilities using',
        
        'loading.ancient.art': 'Searching for fascinating Art stories from ancient civilizations and discoveries using',
        'loading.medieval.art': 'Searching for fascinating Art stories from medieval innovations and breakthroughs using',
        'loading.industrial.art': 'Searching for fascinating Art stories from industrial revolution and technological advances using',
        'loading.modern.art': 'Searching for fascinating Art stories from modern breakthroughs and innovations using',
        'loading.future.art': 'Searching for fascinating Art stories from futuristic technologies and possibilities using',
        
        // Generic loading messages
        'loading.ancient': 'Searching for fascinating stories from ancient civilizations and discoveries using',
        'loading.medieval': 'Searching for fascinating stories from medieval innovations and breakthroughs using',
        'loading.industrial': 'Searching for fascinating stories from industrial revolution and technological advances using',
        'loading.modern': 'Searching for fascinating stories from modern breakthroughs and innovations using',
        'loading.future': 'Searching for fascinating stories from futuristic technologies and possibilities using',
      },
      es: {
        // Orb Game UI
        'orb.game.title': 'Juego Orb',
        'orb.game.subtitle': '¡Descubre noticias positivas a través de exploración 3D interactiva!',
        'orb.game.how.to.play': 'Cómo Jugar',
        'orb.game.how.to.play.step1': 'Selecciona una época usando el rodillo de arriba',
        'orb.game.how.to.play.step2': 'Haz clic en cualquier orb para escuchar noticias positivas',
        'orb.game.how.to.play.step3': 'Usa Anterior/Siguiente para explorar más historias',
        'orb.game.how.to.play.step4': 'Haz clic en ✕ para liberar el orb de vuelta a la órbita',
        'orb.game.how.to.play.swipe': 'Desliza en cualquier dirección para cerrar',
        'orb.game.how.to.play.click': 'O haz clic en cualquier lugar para cerrar',
        
        // Epochs
        'epoch.ancient': 'Antigua',
        'epoch.medieval': 'Medieval',
        'epoch.industrial': 'Industrial',
        'epoch.modern': 'Moderno',
        'epoch.future': 'Futuro',
        
        // Categories
        'category.technology': 'Tecnología',
        'category.science': 'Ciencia',
        'category.art': 'Arte',
        'category.nature': 'Naturaleza',
        'category.sports': 'Deportes',
        'category.music': 'Música',
        'category.space': 'Espacio',
        'category.innovation': 'Innovación',
        
        // AI Models
        'ai.model.grok-4': 'Grok 4',
        'ai.model.perplexity-sonar': 'Perplexity Sonar',
        'ai.model.gemini-1.5-flash': 'Gemini 1.5 Flash',
        'ai.model.o4-mini': 'O4-Mini',
        'ai.model.select': 'Seleccionar Modelo IA',
        
        // News Panel
        'news.loading': 'Cargando historia...',
        'news.generating': 'Generando historia fresca...',
        'news.creating': 'Creando contenido fascinante...',
        'news.alternative': 'Creando historia alternativa...',
        'news.connection.issue': 'Problema de conexión',
        'news.try.again': 'Por favor, inténtalo de nuevo en un momento.',
        'news.unavailable': 'El modelo de IA no está disponible temporalmente.',
        'news.switch.model': 'Por favor, inténtalo de nuevo o cambia a un modelo diferente.',
        'news.story.of': 'de',
        'news.stories': 'historias',
        'news.previous': 'Anterior',
        'news.next': 'Siguiente',
        'news.go': 'Ir',
        'news.close': 'Cerrar',
        'news.source': 'Fuente',
        'news.ai.model': 'Modelo IA',
        'news.date': 'Fecha',
        'news.fallback.detected': 'Historia de respaldo detectada - haz clic en "Ir" para historias frescas de IA',
        'news.generating.fresh': 'Generando historias frescas con',
        'news.escape.hint': 'Presiona Esc para salir',
        
        // Audio Controls
        'audio.play': 'Reproducir',
        'audio.pause': 'Pausar',
        'audio.mute': 'Silenciar',
        'audio.unmute': 'Activar sonido',
        
        // Language Toggle
        'language.english': 'English',
        'language.spanish': 'Español',
        'language.toggle': 'Cambiar Idioma',
        
        // Loading Messages
        'loading.ancient.technology': 'Buscando historias fascinantes de Tecnología de civilizaciones antiguas y descubrimientos usando',
        'loading.medieval.technology': 'Buscando historias fascinantes de Tecnología de innovaciones medievales y avances usando',
        'loading.industrial.technology': 'Buscando historias fascinantes de Tecnología de revolución industrial y avances tecnológicos usando',
        'loading.modern.technology': 'Buscando historias fascinantes de Tecnología de avances modernos e innovaciones usando',
        'loading.future.technology': 'Buscando historias fascinantes de Tecnología de tecnologías futuristas y posibilidades usando',
        
        'loading.ancient.science': 'Buscando historias fascinantes de Ciencia de civilizaciones antiguas y descubrimientos usando',
        'loading.medieval.science': 'Buscando historias fascinantes de Ciencia de innovaciones medievales y avances usando',
        'loading.industrial.science': 'Buscando historias fascinantes de Ciencia de revolución industrial y avances tecnológicos usando',
        'loading.modern.science': 'Buscando historias fascinantes de Ciencia de avances modernos e innovaciones usando',
        'loading.future.science': 'Buscando historias fascinantes de Ciencia de tecnologías futuristas y posibilidades usando',
        
        'loading.ancient.art': 'Buscando historias fascinantes de Arte de civilizaciones antiguas y descubrimientos usando',
        'loading.medieval.art': 'Buscando historias fascinantes de Arte de innovaciones medievales y avances usando',
        'loading.industrial.art': 'Buscando historias fascinantes de Arte de revolución industrial y avances tecnológicos usando',
        'loading.modern.art': 'Buscando historias fascinantes de Arte de avances modernos e innovaciones usando',
        'loading.future.art': 'Buscando historias fascinantes de Arte de tecnologías futuristas y posibilidades usando',
        
        // Generic loading messages
        'loading.ancient': 'Buscando historias fascinantes de civilizaciones antiguas y descubrimientos usando',
        'loading.medieval': 'Buscando historias fascinantes de innovaciones medievales y avances usando',
        'loading.industrial': 'Buscando historias fascinantes de revolución industrial y avances tecnológicos usando',
        'loading.modern': 'Buscando historias fascinantes de avances modernos e innovaciones usando',
        'loading.future': 'Buscando historias fascinantes de tecnologías futuristas y posibilidades usando',
      }
    };

    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 