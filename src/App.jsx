import React from 'react';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="app-background">
        <div className="gradient-overlay"></div>
        <ChatInterface />
      </div>
    </div>
  );
}

export default App; 