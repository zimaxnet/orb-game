import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OrbGame from './components/OrbGame';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<OrbGame />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App; 