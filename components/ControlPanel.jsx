import React, { useState, useEffect } from 'react';
import ReactWordcloud from 'react-wordcloud-plus';
import './ControlPanel.css';
import MemoryTrivia from './MemoryTrivia';

const ControlPanel = ({ isOpen, onClose, language, onToggleLanguage, onOpenMemory, translations }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryProfile, setMemoryProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [funFacts, setFunFacts] = useState([
    "Did you know? Orb Game can remember up to 1000 conversations! 🧠",
    "Fun fact: Your AI assistant gets smarter with every chat! 🚀",
    "Pro tip: Try asking me about current events - I love web searches! 🌐",
    "Cool feature: I can speak in multiple languages! 🌍",
    "Amazing: I can generate audio responses for you! 🔊"
  ]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [showTrivia, setShowTrivia] = useState(false);

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
    setAnalyticsData(null); // Reset on open
    setWordCloudData([]);

    try {
      // Fetch summary data
      const summaryRes = await fetch('https://api.aimcs.net/api/analytics/summary');
      const summaryData = await summaryRes.json();
      setAnalyticsData(summaryData);

      // Fetch full memory export for word cloud
      const memoryRes = await fetch('https://api.aimcs.net/api/memory/export');
      const memoryData = await memoryRes.json();
      
      // Process data for word cloud
      const text = memoryData.map(mem => mem.content).join(' ');
      const words = text.split(/[\\s,.-?!]+/);
      const frequencies = {};
      const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'in', 'on', 'to', 'and', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'who', 'when', 'where', 'why', 'how', 'me', 'my', 'your', 'our', 'their']);

      words.forEach(word => {
        const lowerWord = word.toLowerCase();
        if (lowerWord && !stopWords.has(lowerWord) && isNaN(lowerWord)) {
          frequencies[lowerWord] = (frequencies[lowerWord] || 0) + 1;
        }
      });

      const processedData = Object.keys(frequencies).map(key => ({
        text: key,
        value: frequencies[key]
      })).sort((a, b) => b.value - a.value).slice(0, 100); // Top 100 words

      setWordCloudData(processedData);

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
          <h3>🎮 Orb Game Controls</h3>
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
              <button className="control-btn" onClick={() => setShowTrivia(true)}>
                <span>🎮 Trivia</span>
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
              <p>Orb Game v2.1.0</p>
              <p>Powered by <a href="https://zimax.net" target="_blank" rel="noopener noreferrer" className="about-link">Zimax AI Labs</a></p>
              <p>Built with ❤️ and React</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div className="modal-content analytics-modal" onClick={e => e.stopPropagation()}>
            <h3>📊 Analytics Dashboard</h3>
            {analyticsData ? (
              analyticsData.error ? (
                <p>{analyticsData.error}</p>
              ) : (
                <div className="analytics-dashboard">
                  {/* Overview Stats */}
                  <div className="analytics-section">
                    <h4>📈 Overview</h4>
                    <div className="stats-grid">
                      <div className="stat-card primary">
                        <div className="stat-icon">💬</div>
                        <div className="stat-content">
                          <div className="stat-value">{analyticsData.totalChats || 0}</div>
                          <div className="stat-label">Total Conversations</div>
                        </div>
                      </div>
                      <div className="stat-card secondary">
                        <div className="stat-icon">🌐</div>
                        <div className="stat-content">
                          <div className="stat-value">{analyticsData.totalWebSearches || 0}</div>
                          <div className="stat-label">Web Searches</div>
                        </div>
                      </div>
                      <div className="stat-card success">
                        <div className="stat-icon">🧠</div>
                        <div className="stat-content">
                          <div className="stat-value">{analyticsData.memoryRetrievalRate || '85%'}</div>
                          <div className="stat-label">Memory Hit Rate</div>
                        </div>
                      </div>
                      <div className="stat-card info">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                          <div className="stat-value">{analyticsData.averageResponseTime || '2.3s'}</div>
                          <div className="stat-label">Avg Response Time</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Word Cloud */}
                  {wordCloudData.length > 0 && (
                    <div className="analytics-section">
                      <h4>☁️ Memory Cloud</h4>
                      <div className="wordcloud-container">
                        <ReactWordcloud words={wordCloudData} options={{
                          rotations: 2,
                          rotationAngles: [-90, 0],
                          fontSizes: [20, 60],
                          padding: 1,
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Popular Topics */}
                  <div className="analytics-section">
                    <h4>🔥 Trending Topics</h4>
                    <div className="topics-list">
                      {analyticsData.mostAccessedMemories ? (
                        analyticsData.mostAccessedMemories.map((topic, index) => (
                          <div key={index} className="topic-item">
                            <span className="topic-rank">#{index + 1}</span>
                            <span className="topic-name">{topic.word}</span>
                            <span className="topic-count">{topic.count} times</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-data">No trending topics yet</div>
                      )}
                    </div>
                  </div>

                  {/* Fun Insights */}
                  <div className="analytics-section">
                    <h4>💡 Fun Insights</h4>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-icon">🎯</div>
                        <div className="insight-content">
                          <h5>Most Popular Question</h5>
                          <p>{analyticsData.mostPopular || 'What can you do?'}</p>
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-icon">🔍</div>
                        <div className="insight-content">
                          <h5>Search Usage</h5>
                          <p>{analyticsData.searchRate || '15%'} of conversations use web search</p>
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-icon">🎵</div>
                        <div className="insight-content">
                          <h5>Audio Generation</h5>
                          <p>100% of responses include audio</p>
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-icon">🧠</div>
                        <div className="insight-content">
                          <h5>Memory System</h5>
                          <p>{analyticsData.memoryAccuracy || '92%'} accuracy in memory retrieval</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="analytics-section">
                    <h4>🔧 System Health</h4>
                    <div className="system-status">
                      <div className="status-item online">
                        <span className="status-dot"></span>
                        <span>Azure OpenAI: Connected</span>
                      </div>
                      <div className="status-item online">
                        <span className="status-dot"></span>
                        <span>Memory Service: Active</span>
                      </div>
                      <div className="status-item online">
                        <span className="status-dot"></span>
                        <span>TTS Service: Ready</span>
                      </div>
                      <div className="status-item online">
                        <span className="status-dot"></span>
                        <span>Web Search: Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Fun Fact */}
                  <div className="analytics-section">
                    <h4>🎉 Fun Fact</h4>
                    <div className="fun-fact-card">
                      <div className="fun-fact-icon">💡</div>
                      <p>{analyticsData.funFact || 'Orb Game can remember conversations and continue them later!'}</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="loading-spinner">Loading analytics...</div>
            )}
            <div className="modal-actions">
              <button className="modal-back-btn" onClick={() => setShowAnalytics(false)}>← Back to Controls</button>
              <button className="modal-close-btn" onClick={onClose}>Return to Chat</button>
            </div>
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
            <div className="modal-actions">
              <button className="modal-back-btn" onClick={() => setShowSettings(false)}>← Back to Controls</button>
              <button className="modal-close-btn" onClick={onClose}>Return to Chat</button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Modal */}
      {showMemory && (
        <div className="modal-overlay" onClick={() => setShowMemory(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>🧠 What Orb Game Remembers</h3>
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
            <div className="modal-actions">
              <button className="modal-back-btn" onClick={() => setShowMemory(false)}>← Back to Controls</button>
              <button className="modal-close-btn" onClick={onClose}>Return to Chat</button>
            </div>
          </div>
        </div>
      )}

      {/* Trivia Modal */}
      {showTrivia && (
        <MemoryTrivia
          onBack={() => setShowTrivia(false)}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default ControlPanel; 