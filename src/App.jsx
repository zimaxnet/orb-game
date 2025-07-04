import React from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="app">
      <div className="app-background">
        <div className="background-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <h1 className="logo-text">Zimax AI</h1>
          </div>
          <div className="header-subtitle">Intelligent Conversations</div>
        </div>
      </header>

      <main className="app-main">
        <ChatInterface />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>Powered by Zimax AI Labs</span>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 