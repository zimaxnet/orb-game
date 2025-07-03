import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [searchMode, setSearchMode] = useState('auto'); // auto, web, local
  const [showSources, setShowSources] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
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
      playAudio: '🔊 Play Audio',
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
      localAI: '🤖 Local AI only'
    },
    es: {
      title: 'AIMCS',
      subtitle: 'Sistema de Cliente Multimodal con IA',
      welcome: '¡Bienvenido! Comienza una conversación conmigo.',
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      processing: 'Procesando...',
      playAudio: '🔊 Reproducir Audio',
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
      localAI: '🤖 Solo IA local'
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

  const addMessage = (sender, message, type = 'text', audioData = null, sources = null, searchUsed = false) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      message,
      type,
      timestamp: new Date().toISOString(),
      audioData,
      sources,
      searchUsed
    };
    setMessages(prev => [...prev, newMessage]);
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
          useWebSearch: searchMode
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addMessage('AIMCS AI', data.message, 'ai', data.audioData, data.sources, data.searchUsed);
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

  const playAudio = (audioData) => {
    if (!audioData) return;
    
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], {
        type: 'audio/mp3'
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
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
              className="search-mode-toggle"
              onClick={toggleSearchMode}
              title={`${translations[language].searchMode}: ${getSearchModeLabel()}`}
            >
              <span className="search-mode-icon">{getSearchModeIcon()}</span>
              <span className="search-mode-label">{getSearchModeLabel()}</span>
            </button>
            <button 
              className="language-toggle"
              onClick={toggleLanguage}
              title={translations[language].switchLanguage}
            >
              {language === 'en' ? 'ES' : 'EN'}
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
                    {message.searchUsed && (
                      <span className="search-indicator" title={translations[language].webSearchUsed}>
                        🌐
                      </span>
                    )}
                  </div>
                  <div className="message-text">
                    {message.message}
                  </div>
                  {message.audioData && (
                    <button
                      className="audio-button"
                      onClick={() => playAudio(message.audioData)}
                    >
                      {translations[language].playAudio}
                    </button>
                  )}
                  {message.sources && message.sources.length > 0 && (
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
                            {message.sources.map((source, index) => (
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
                    {searchMode === 'web' && (
                      <span className="search-indicator" title={translations[language].webSearchUsed}>
                        🌐
                      </span>
                    )}
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
    </div>
  );
};

export default ChatInterface; 