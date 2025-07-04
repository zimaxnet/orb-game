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
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://aimcs-backend-eastus2.icybay-f279066f.eastus2.azurecontainerapps.io/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          useWebSearch: useWebSearch
        }),
      });

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: data.response || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        searchUsed: data.searchUsed || false
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">💬</span>
          <span>AI Assistant</span>
        </div>
        <div className="chat-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useWebSearch === 'auto'}
              onChange={(e) => setUseWebSearch(e.target.checked ? 'auto' : 'none')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Web Search</span>
          </label>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">🚀</div>
            <h4>Welcome to AIMCS</h4>
            <p>Experience our multimodal customer system. Ask me anything!</p>
            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">🔍</span>
                <span>Web Search</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💡</span>
                <span>Smart AI</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Real-time</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.message}</div>
                  <div className="message-meta">
                    <span className="message-time">{message.timestamp}</span>
                    {message.searchUsed && (
                      <span className="search-indicator">🔍 Web Search</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai loading">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="message-input"
            rows="1"
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
      </form>
    </div>
  );
};

export default ChatInterface; 