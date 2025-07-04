import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState('auto');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.aimcs.net/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          useWebSearch: useWebSearch,
        }),
      });

      const data = await response.json();

      if (data.message) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'Zimax AI',
          message: data.message,
          timestamp: new Date().toISOString(),
          aiUsed: data.aiUsed,
          searchUsed: data.searchUsed,
          audioData: data.audioData,
          audioFormat: data.audioFormat,
        };

        setMessages(prev => [...prev, aiMessage]);

        // Play audio if available
        if (data.audioData) {
          playAudio(data.audioData, data.audioFormat);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'System',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioData, format) => {
    try {
      const audio = new Audio(`data:${format};base64,${audioData}`);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-icon">💬</div>
          <h2>Chat with Zimax AI</h2>
        </div>
        <div className="search-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useWebSearch === 'web'}
              onChange={(e) => setUseWebSearch(e.target.checked ? 'web' : 'auto')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Web Search</span>
          </label>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">🚀</div>
            <h3>Welcome to Zimax AI</h3>
            <p>Ask me anything! I can help with information, answer questions, or just chat.</p>
            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">🌐</span>
                <span>Web Search</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎵</span>
                <span>Voice Responses</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time AI</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''}`}
          >
            <div className="message-content">
              <div className="message-header">
                <div className="message-sender">
                  {message.sender === 'user' ? '👤 You' : '🤖 Zimax AI'}
                </div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
              <div className="message-text">{message.message}</div>
              {message.searchUsed && (
                <div className="search-indicator">
                  <span className="search-icon">🔍</span>
                  Web search used
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message loading-message">
            <div className="message-content">
              <div className="message-header">
                <div className="message-sender">🤖 Zimax AI</div>
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || isLoading}
          >
            <span className="send-icon">➤</span>
          </button>
        </div>
        <div className="input-footer">
          <span className="input-hint">
            Press Enter to send • Shift+Enter for new line
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 