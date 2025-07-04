import React, { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

const ChatInterface = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState('auto')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('https://api.aimcs.net/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          useWebSearch: useWebSearch
        })
      })

      const data = await response.json()

      if (response.ok) {
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response || 'No response received',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
          searchUsed: data.searchUsed || false,
          searchResults: data.searchResults || null,
          searchAnalysis: data.searchAnalysis || null
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: `Error: ${data.error || 'Failed to get response'}`,
          sender: 'error',
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Network Error: ${error.message}`,
        sender: 'error',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-controls">
          <select 
            value={useWebSearch} 
            onChange={(e) => setUseWebSearch(e.target.value)}
            className="web-search-select"
          >
            <option value="auto">auto search</option>
            <option value="always">always search</option>
            <option value="never">never search</option>
          </select>
          <button onClick={clearChat} className="clear-button">
            clear
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 hello</p>
            <p>ask me anything with real-time web search</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-meta">
                <span className="timestamp">{message.timestamp}</span>
                {message.searchUsed && (
                  <span className="search-indicator">🔍</span>
                )}
              </div>
              {message.searchResults && (
                <details className="search-results">
                  <summary>sources</summary>
                  <div className="search-results-content">
                    {message.searchResults.map((result, index) => (
                      <div key={index} className="search-result">
                        <h4>{result.title}</h4>
                        <p>{result.snippet}</p>
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          {result.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {message.searchAnalysis && (
                <details className="search-analysis">
                  <summary>analysis</summary>
                  <div className="analysis-content">
                    <p><strong>confidence:</strong> {Math.round(message.searchAnalysis.confidence * 100)}%</p>
                    <p><strong>reasoning:</strong> {message.searchAnalysis.reasoning}</p>
                    {message.searchAnalysis.categories.length > 0 && (
                      <p><strong>categories:</strong> {message.searchAnalysis.categories.join(', ')}</p>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="loading-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="type your message..."
          disabled={isLoading}
          className="message-input"
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputMessage.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '...' : 'send'}
        </button>
      </div>
    </div>
  )
}

export default ChatInterface 