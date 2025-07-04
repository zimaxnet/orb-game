import React from 'react'
import './App.css'
import ChatInterface from './components/ChatInterface.jsx'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>ai multimodal customer system</h1>
      </header>

      <main className="main">
        <ChatInterface />
      </main>

      <footer className="footer">
        <p>powered by <a href="https://zimax.net" target="_blank" rel="noopener noreferrer">zimax ai labs</a></p>
      </footer>
    </div>
  )
}

export default App 