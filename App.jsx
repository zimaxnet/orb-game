import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OrbGame from './components/OrbGame';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Orb Game</h1>
          <p>Discover positive news through interactive 3D exploration!</p>
        </header>
        <Routes>
          <Route path="/" element={<OrbGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 