import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`app ${isLoaded ? 'loaded' : ''}`}>
      {/* Simple Background */}
      <div className="background">
        <div className="gradient-overlay"></div>
      </div>

      {/* Minimal Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">AIMCS</span>
          </div>
          <div className="subtitle">Multimodal Customer System</div>
        </div>
      </header>

      {/* Chat Interface - Main Content */}
      <main className="main">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App; 