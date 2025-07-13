import React, { useState, useEffect } from 'react';
import './ControlPanel.css';

const ControlPanel = ({ isOpen, onClose, language, onToggleLanguage, onOpenMemory, translations }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryProfile, setMemoryProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [funFacts, setFunFacts] = useState([
    "Did you know? AIMCS can remember up to 1000 conversations! 🧠",
    "Fun fact: Your AI assistant gets smarter with every chat! 🚀",
    "Pro tip: Try asking me about current events - I love web searches! 🌐",
    "Cool feature: I can speak in multiple languages! 🌍",
    "Amazing: I can generate audio responses for you! 🔊"
  ]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate fun facts every 5 seconds
  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);
    return () => clearInterval(factTimer);
  }, [funFacts.length]);

  const fetchAnalytics = async () => {
    setShowAnalytics(true);
    try {
      const res = await fetch('https://api.aimcs.net/api/analytics/summary');
      const data = await res.json();
      setAnalyticsData(data);
    } catch {
      setAnalyticsData({ error: 'Failed to load analytics.' });
    }
  };

  const fetchMemory = async () => {
    setShowMemory(true);
    try {
      const res = await fetch('https://api.aimcs.net/api/memory/profile');
      const data = await res.json();
      setMemoryProfile(data);
    } catch {
      setMemoryProfile({ error: 'Failed to load memory.' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="control-panel-overlay" onClick={onClose}></div>
      <div className={`control-panel ${isOpen ? 'open' : ''}`}>
        <div className="control-panel-header">
          <h3>🎮 AIMCS Controls</h3>
          <button className="close-controls-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="control-panel-content">
          {/* Real-time Clock */}
          <div className="control-section">
            <h4>🕐 Current Time</h4>
            <div className="time-display">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>

          {/* Fun Fact Rotator */}
          <div className="control-section">
            <h4>💡 Fun Fact</h4>
            <div className="fun-fact-display">
              {funFacts[currentFactIndex]}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="control-section">
            <h4>⚡ Quick Actions</h4>
            <div className="quick-actions">
              <button className="control-btn" onClick={fetchAnalytics}>
                <span>📊 Analytics</span>
                <span className="action-icon">→</span>
              </button>
              <button className="control-btn" onClick={() => setShowSettings(true)}>
                <span>⚙️ Settings</span>
                <span className="action-icon">→</span>
              </button>
              <button className="control-btn" onClick={fetchMemory}>
                <span>🧠 Memory</span>
                <span className="action-icon">→</span>
              </button>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="control-section">
            <h4>🌐 Language</h4>
            <button className="control-btn" onClick={onToggleLanguage}>
              <span>{language === 'en' ? 'Switch to Español' : 'Cambiar a English'}</span>
              <span className="action-icon">🌍</span>
            </button>
          </div>

          {/* System Status */}
          <div className="control-section">
            <h4>🔧 System Status</h4>
            <div className="status-indicators">
              <div className="status-item">
                <span className="status-dot online"></span>
                <span>Backend: Online</span>
              </div>
              <div className="status-item">
                <span className="status-dot online"></span>
                <span>Memory: Active</span>
              </div>
              <div className="status-item">
                <span className="status-dot online"></span>
                <span>TTS: Ready</span>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="control-section">
            <h4>ℹ️ About</h4>
            <div className="version-info">
              <p>AIMCS v2.1.0</p>
              <p>Powered by <a href="https://zimax.net" target="_blank" rel="noopener noreferrer" className="about-link">Zimax AI Labs</a></p>
              <p>Built with ❤️ and React</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>📊 Analytics Dashboard</h3>
            {analyticsData ? (
              analyticsData.error ? (
                <p>{analyticsData.error}</p>
              ) : (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h4>Total Chats</h4>
                    <div className="analytics-value">{analyticsData.totalChats || 0}</div>
                  </div>
                  <div className="analytics-card">
                    <h4>Web Searches</h4>
                    <div className="analytics-value">{analyticsData.totalWebSearches || 0}</div>
                  </div>
                  <div className="analytics-card">
                    <h4>Most Popular</h4>
                    <div className="analytics-value">{analyticsData.mostPopular || 'N/A'}</div>
                  </div>
                  <div className="analytics-card">
                    <h4>Fun Fact</h4>
                    <div className="analytics-value">{analyticsData.funFact || 'Loading...'}</div>
                  </div>
                </div>
              )
            ) : (
              <div className="loading-spinner">Loading analytics...</div>
            )}
            <button className="modal-close-btn" onClick={() => setShowAnalytics(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>⚙️ Settings</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Language</label>
                <span>{language === 'en' ? 'English' : 'Español'}</span>
              </div>
              <div className="setting-item">
                <label>Audio TTS</label>
                <span>Enabled ✅</span>
              </div>
              <div className="setting-item">
                <label>Memory System</label>
                <span>Active ✅</span>
              </div>
              <div className="setting-item">
                <label>Web Search</label>
                <span>Auto 🔄</span>
              </div>
            </div>
            <button className="modal-close-btn" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Memory Modal */}
      {showMemory && (
        <div className="modal-overlay" onClick={() => setShowMemory(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>🧠 What AIMCS Remembers</h3>
            {memoryProfile ? (
              memoryProfile.error ? (
                <p>{memoryProfile.error}</p>
              ) : (
                <div className="memory-grid">
                  <div className="memory-card">
                    <h4>👤 Name</h4>
                    <div className="memory-value">{memoryProfile.name || 'Not set'}</div>
                  </div>
                  <div className="memory-card">
                    <h4>🎨 Favorite Color</h4>
                    <div className="memory-value">{memoryProfile.favoriteColor || 'Not set'}</div>
                  </div>
                  <div className="memory-card">
                    <h4>🎯 Interests</h4>
                    <div className="memory-value">
                      {memoryProfile.interests?.join(', ') || 'Not set'}
                    </div>
                  </div>
                  <div className="memory-card">
                    <h4>💡 Fun Fact</h4>
                    <div className="memory-value">{memoryProfile.funFact || 'Not set'}</div>
                  </div>
                  <div className="memory-card">
                    <h4>📝 Recent Topics</h4>
                    <div className="memory-value">
                      {memoryProfile.lastTopics?.join(', ') || 'None yet'}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="loading-spinner">Loading memory profile...</div>
            )}
            <button className="modal-close-btn" onClick={() => setShowMemory(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ControlPanel; 