import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import MemoryPanel from './MemoryPanel.jsx';
import ControlPanel from './ControlPanel.jsx';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [searchMode, setSearchMode] = useState('auto'); // auto, web, local
  const [showSources, setShowSources] = useState(false);
  const [audioStates, setAudioStates] = useState({}); // Track audio state for each message
  const [showMemoryPanel, setShowMemoryPanel] = useState(false); // New state for memory panel
  const [showControlPanel, setShowControlPanel] = useState(false); // New state for control panel
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const audioRefs = useRef({}); // Store audio elements for each message
  
  // Use Azure default backend URL for now
  const BACKEND_URL = 'https://api.aimcs.net';

  const translations = {
    en: {
      title: 'AIMCS',
      subtitle: 'AI Multimodal Customer System',
      welcome: 'Welcome! Start a conversation with me.',
      placeholder: 'Type your message...',
      send: 'Send',
      processing: 'Processing...',
      playAudio: '🔊 Play',
      pauseAudio: '⏸️ Pause',
      stopAudio: '⏹️ Stop',
      switchLanguage: 'Switch Language',
      poweredBy: 'Powered by Azure OpenAI',
      searchMode: 'Search Mode',
      auto: 'Auto',
      web: 'Web Search',
      local: 'Local Only',
      sources: 'Sources',
      showSources: 'Show Sources',
      hideSources: 'Hide Sources',
      webSearchUsed: '🌐 Web search used',
      localAI: '🤖 Local AI only',
      readingAlong: '📖 Reading along with audio...'
    },
    es: {
      title: 'AIMCS',
      subtitle: 'Sistema de Cliente Multimodal con IA',
      welcome: '¡Bienvenido! Comienza una conversación conmigo.',
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      processing: 'Procesando...',
      playAudio: '🔊 Reproducir',
      pauseAudio: '⏸️ Pausar',
      stopAudio: '⏹️ Detener',
      switchLanguage: 'Cambiar Idioma',
      poweredBy: 'Desarrollado por Azure OpenAI',
      searchMode: 'Modo de Búsqueda',
      auto: 'Automático',
      web: 'Búsqueda Web',
      local: 'Solo Local',
      sources: 'Fuentes',
      showSources: 'Mostrar Fuentes',
      hideSources: 'Ocultar Fuentes',
      webSearchUsed: '🌐 Búsqueda web utilizada',
      localAI: '🤖 Solo IA local',
      readingAlong: '📖 Leyendo junto con el audio...'
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const addMessage = (sender, content, type, audioData = null, searchResults = null, searchUsed = false, fromMemory = false) => {
    const newMessage = {
      id: Date.now().toString(),
      sender,
      content,
      type,
      timestamp: new Date().toISOString(),
      searchUsed,
      fromMemory, // New field for memory indicator
      searchResults: searchResults || []
    };

    if (audioData) {
      newMessage.audioData = audioData;
      newMessage.audioFormat = 'audio/mp3';
    }

    setMessages(prev => [...prev, newMessage]);
    
    // Initialize audio state for this message
    if (audioData) {
      setAudioStates(prev => ({
        ...prev,
        [newMessage.id]: { isPlaying: false, isPaused: false }
      }));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('You', userMessage, 'user');

    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          useWebSearch: searchMode,
          userId: 'default' // You can make this dynamic based on user authentication
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addMessage('AIMCS AI', data.response, 'ai', data.audioData, data.searchResults, data.searchUsed, data.fromMemory);
      } else {
        addMessage('System', 'Sorry, I encountered an error. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('System', 'Connection error. Please check your internet connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createAudioElement = (audioData, messageId) => {
    if (!audioData) return null;
    
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], {
        type: 'audio/mp3'
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Store reference to audio element
      audioRefs.current[messageId] = audio;
      
      // Set up event listeners
      audio.onended = () => {
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { isPlaying: false, isPaused: false }
        }));
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onpause = () => {
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { isPlaying: false, isPaused: true }
        }));
      };
      
      audio.onplay = () => {
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { isPlaying: true, isPaused: false }
        }));
      };
      
      return audio;
    } catch (error) {
      console.error('Error creating audio element:', error);
      return null;
    }
  };

  const playAudio = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.audioData) return;
    
    let audio = audioRefs.current[messageId];
    
    if (!audio) {
      audio = createAudioElement(message.audioData, messageId);
      if (!audio) return;
    }
    
    // Stop any other playing audio
    Object.entries(audioRefs.current).forEach(([id, otherAudio]) => {
      if (id !== messageId && otherAudio) {
        otherAudio.pause();
        setAudioStates(prev => ({
          ...prev,
          [id]: { isPlaying: false, isPaused: false }
        }));
      }
    });
    
    audio.play();
  };

  const pauseAudio = (messageId) => {
    const audio = audioRefs.current[messageId];
    if (audio) {
      audio.pause();
    }
  };

  const stopAudio = (messageId) => {
    const audio = audioRefs.current[messageId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { isPlaying: false, isPaused: false }
      }));
    }
  };

  const getAudioButtonText = (messageId) => {
    const state = audioStates[messageId];
    if (!state) return translations[language].playAudio;
    
    if (state.isPlaying) return translations[language].pauseAudio;
    if (state.isPaused) return translations[language].playAudio;
    return translations[language].playAudio;
  };

  const handleAudioClick = (messageId) => {
    const state = audioStates[messageId];
    if (!state) {
      playAudio(messageId);
    } else if (state.isPlaying) {
      pauseAudio(messageId);
    } else {
      playAudio(messageId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const toggleSearchMode = () => {
    const modes = ['auto', 'web', 'local'];
    const currentIndex = modes.indexOf(searchMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setSearchMode(modes[nextIndex]);
  };

  const getSearchModeLabel = () => {
    const modeLabels = {
      auto: translations[language].auto,
      web: translations[language].web,
      local: translations[language].local
    };
    return modeLabels[searchMode];
  };

  const getSearchModeIcon = () => {
    const modeIcons = {
      auto: '🔄',
      web: '🌐',
      local: '🤖'
    };
    return modeIcons[searchMode];
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🤖</div>
            <div className="logo-text">
              <h1>{translations[language].title}</h1>
              <p>{translations[language].subtitle}</p>
            </div>
          </div>
          <div className="header-controls">
            <button 
              className="menu-toggle"
              onClick={() => setShowControlPanel(true)}
              title="Open Controls"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message fade-in">
            <div className="welcome-icon">👋</div>
            <h2>{translations[language].welcome}</h2>
            <p>I'm here to help you with any questions or tasks you might have.</p>
            <div className="search-mode-info">
              <p>Current search mode: <strong>{getSearchModeIcon()} {getSearchModeLabel()}</strong></p>
              <p className="search-mode-description">
                {searchMode === 'auto' && 'Automatically uses web search when needed'}
                {searchMode === 'web' && 'Always uses web search for current information'}
                {searchMode === 'local' && 'Uses only local AI knowledge'}
              </p>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type} fade-in`}
              >
                <div className="message-content">
                  <div className="message-sender">
                    {message.sender}
                    {message.fromMemory && (
                      <span className="memory-indicator" title="Response from memory">
                        🧠
                      </span>
                    )}
                    {message.searchUsed && (
                      <span className="search-indicator" title={translations[language].webSearchUsed}>
                        🌐
                      </span>
                    )}
                  </div>
                  <div className="message-text">
                    {message.content}
                  </div>
                  {message.audioData && (
                    <div className="audio-available-indicator">
                      🔊 {translations[language].playAudio}
                    </div>
                  )}
                  {message.audioData && (
                    <div className="audio-controls">
                      <div className="audio-status">
                        {audioStates[message.id]?.isPlaying && (
                          <span className="reading-indicator">
                            {translations[language].readingAlong}
                          </span>
                        )}
                      </div>
                      <div className="audio-buttons">
                        <button
                          className="audio-button primary"
                          onClick={() => handleAudioClick(message.id)}
                          title={translations[language].playAudio}
                        >
                          {getAudioButtonText(message.id)}
                        </button>
                        {(audioStates[message.id]?.isPlaying || audioStates[message.id]?.isPaused) && (
                          <button
                            className="audio-button secondary"
                            onClick={() => stopAudio(message.id)}
                            title={translations[language].stopAudio}
                          >
                            {translations[language].stopAudio}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {message.searchResults && message.searchResults.length > 0 && (
                    <div className="sources-section">
                      <button
                        className="sources-toggle"
                        onClick={() => setShowSources(!showSources)}
                      >
                        {showSources ? translations[language].hideSources : translations[language].showSources}
                      </button>
                      {showSources && (
                        <div className="sources-list">
                          <h4>{translations[language].sources}:</h4>
                          <ul>
                            {message.searchResults.map((source, index) => (
                              <li key={index}>
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="source-link"
                                >
                                  {source.title || source.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai fade-in">
                <div className="message-content">
                  <div className="message-sender">
                    AIMCS AI
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={translations[language].placeholder}
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="send-button"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            )}
          </button>
        </div>
        <div className="powered-by">
          {translations[language].poweredBy}
        </div>
      </div>

      {/* Memory Panel */}
      <MemoryPanel 
        isOpen={showMemoryPanel} 
        onClose={() => setShowMemoryPanel(false)} 
      />

      {/* Control Panel */}
      <ControlPanel 
        isOpen={showControlPanel}
        onClose={() => setShowControlPanel(false)}
        language={language}
        searchMode={searchMode}
        onToggleLanguage={toggleLanguage}
        onToggleSearchMode={toggleSearchMode}
        onOpenMemory={() => {
          setShowControlPanel(false);
          setShowMemoryPanel(true);
        }}
        translations={translations}
      />
    </div>
  );
};

export default ChatInterface; 