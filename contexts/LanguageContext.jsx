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
        'orb.game.subtitle': 'Discover historical figures and their remarkable achievements through interactive 3D exploration!',
        'orb.game.how.to.play': 'How to Play',
        'orb.game.how.to.play.step1': 'Select an epoch using the roller above',
        'orb.game.how.to.play.step2': 'Click on any orb to hear stories about historical figures',
        'orb.game.how.to.play.step3': 'Use Previous/Next to explore more historical figure stories',
        'orb.game.how.to.play.step4': 'Click ✕ to release the orb back to orbit',
        'orb.game.how.to.play.swipe': 'Swipe in any direction to dismiss',
        'orb.game.how.to.play.click': 'Or click anywhere to dismiss',
        
        // Epochs
        'epoch.ancient': 'Ancient',
        'epoch.medieval': 'Medieval', 
        'epoch.industrial': 'Industrial',
        'epoch.modern': 'Modern',
        'epoch.future': 'Future',
        'epoch.enlightenment': 'Enlightenment',
        'epoch.digital': 'Digital',
        
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
        'news.more': 'More',
        'news.source': 'Source',
        'news.ai.model': 'AI Model',
        'news.date': 'Date',
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
        'loading.ancient.technology': 'Searching for fascinating Technology stories about historical figures from ancient civilizations using',
        'loading.medieval.technology': 'Searching for fascinating Technology stories about historical figures from medieval innovations using',
        'loading.industrial.technology': 'Searching for fascinating Technology stories about historical figures from industrial revolution using',
        'loading.modern.technology': 'Searching for fascinating Technology stories about historical figures from modern breakthroughs using',
        'loading.future.technology': 'Searching for fascinating Technology stories about historical figures from futuristic technologies using',
        
        'loading.ancient.science': 'Searching for fascinating Science stories about historical figures from ancient civilizations using',
        'loading.medieval.science': 'Searching for fascinating Science stories about historical figures from medieval innovations using',
        'loading.industrial.science': 'Searching for fascinating Science stories about historical figures from industrial revolution using',
        'loading.modern.science': 'Searching for fascinating Science stories about historical figures from modern breakthroughs using',
        'loading.future.science': 'Searching for fascinating Science stories about historical figures from futuristic technologies using',
        
        'loading.ancient.art': 'Searching for fascinating Art stories about historical figures from ancient civilizations using',
        'loading.medieval.art': 'Searching for fascinating Art stories about historical figures from medieval innovations using',
        'loading.industrial.art': 'Searching for fascinating Art stories about historical figures from industrial revolution using',
        'loading.modern.art': 'Searching for fascinating Art stories about historical figures from modern breakthroughs using',
        'loading.future.art': 'Searching for fascinating Art stories about historical figures from futuristic technologies using',
        
        // Generic loading messages
        'loading.ancient': 'Searching for fascinating stories about historical figures from ancient civilizations using',
        'loading.medieval': 'Searching for fascinating stories about historical figures from medieval innovations using',
        'loading.industrial': 'Searching for fascinating stories about historical figures from industrial revolution using',
        'loading.modern': 'Searching for fascinating stories about historical figures from modern breakthroughs using',
        'loading.future': 'Searching for fascinating stories about historical figures from futuristic technologies using',
      },
      es: {
        // Orb Game UI
        'orb.game.title': 'Juego Orb',
        'orb.game.subtitle': '¡Descubre figuras históricas y sus logros notables a través de exploración 3D interactiva!',
        'orb.game.how.to.play': 'Cómo Jugar',
        'orb.game.how.to.play.step1': 'Selecciona una época usando el rodillo de arriba',
        'orb.game.how.to.play.step2': 'Haz clic en cualquier orb para escuchar historias sobre figuras históricas',
        'orb.game.how.to.play.step3': 'Usa Anterior/Siguiente para explorar más historias de figuras históricas',
        'orb.game.how.to.play.step4': 'Haz clic en ✕ para liberar el orb de vuelta a la órbita',
        'orb.game.how.to.play.swipe': 'Desliza en cualquier dirección para cerrar',
        'orb.game.how.to.play.click': 'O haz clic en cualquier lugar para cerrar',
        
        // Epochs
        'epoch.ancient': 'Antigua',
        'epoch.medieval': 'Medieval',
        'epoch.industrial': 'Industrial',
        'epoch.modern': 'Moderno',
        'epoch.future': 'Futuro',
        'epoch.enlightenment': 'Ilustración',
        'epoch.digital': 'Digital',
        
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
        'news.more': 'Más',
        'news.source': 'Fuente',
        'news.ai.model': 'Modelo IA',
        'news.date': 'Fecha',
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
        'loading.ancient.technology': 'Buscando historias fascinantes de Tecnología sobre figuras históricas de civilizaciones antiguas usando',
        'loading.medieval.technology': 'Buscando historias fascinantes de Tecnología sobre figuras históricas de innovaciones medievales usando',
        'loading.industrial.technology': 'Buscando historias fascinantes de Tecnología sobre figuras históricas de revolución industrial usando',
        'loading.modern.technology': 'Buscando historias fascinantes de Tecnología sobre figuras históricas de avances modernos usando',
        'loading.future.technology': 'Buscando historias fascinantes de Tecnología sobre figuras históricas de tecnologías futuristas usando',
        
        'loading.ancient.science': 'Buscando historias fascinantes de Ciencia sobre figuras históricas de civilizaciones antiguas usando',
        'loading.medieval.science': 'Buscando historias fascinantes de Ciencia sobre figuras históricas de innovaciones medievales usando',
        'loading.industrial.science': 'Buscando historias fascinantes de Ciencia sobre figuras históricas de revolución industrial usando',
        'loading.modern.science': 'Buscando historias fascinantes de Ciencia sobre figuras históricas de avances modernos usando',
        'loading.future.science': 'Buscando historias fascinantes de Ciencia sobre figuras históricas de tecnologías futuristas usando',
        
        'loading.ancient.art': 'Buscando historias fascinantes de Arte sobre figuras históricas de civilizaciones antiguas usando',
        'loading.medieval.art': 'Buscando historias fascinantes de Arte sobre figuras históricas de innovaciones medievales usando',
        'loading.industrial.art': 'Buscando historias fascinantes de Arte sobre figuras históricas de revolución industrial usando',
        'loading.modern.art': 'Buscando historias fascinantes de Arte sobre figuras históricas de avances modernos usando',
        'loading.future.art': 'Buscando historias fascinantes de Arte sobre figuras históricas de tecnologías futuristas usando',
        
        // Generic loading messages
        'loading.ancient': 'Buscando historias fascinantes sobre figuras históricas de civilizaciones antiguas usando',
        'loading.medieval': 'Buscando historias fascinantes sobre figuras históricas de innovaciones medievales usando',
        'loading.industrial': 'Buscando historias fascinantes sobre figuras históricas de revolución industrial usando',
        'loading.modern': 'Buscando historias fascinantes sobre figuras históricas de avances modernos usando',
        'loading.future': 'Buscando historias fascinantes sobre figuras históricas de tecnologías futuristas usando',
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