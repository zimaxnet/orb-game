import React, { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = ({ isOpen, onClose, language, onToggleLanguage, onOpenMemory, translations }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryProfile, setMemoryProfile] = useState(null);

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
    <div className="control-panel-modal">
      <div className="control-panel">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={fetchAnalytics}>📊 Analytics</button>
          <button className="quick-action-btn" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
          <button className="quick-action-btn" onClick={fetchMemory}>🧠 Memory</button>
        </div>
        <div className="control-section">
          <h4>🌐 Language</h4>
          <button className="control-btn" onClick={onToggleLanguage}>
            {language === 'en' ? 'Switch to Español' : 'Cambiar a English'}
          </button>
        </div>
      </div>
      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Analytics</h3>
            {analyticsData ? (
              analyticsData.error ? (
                <p>{analyticsData.error}</p>
              ) : (
                <ul>
                  <li><strong>Total Chats:</strong> {analyticsData.totalChats}</li>
                  <li><strong>Web Searches:</strong> {analyticsData.totalWebSearches}</li>
                  <li><strong>Most Popular Question:</strong> {analyticsData.mostPopular}</li>
                  <li><strong>Fun Fact:</strong> {analyticsData.funFact}</li>
                </ul>
              )
            ) : (
              <p>Loading...</p>
            )}
            <button onClick={() => setShowAnalytics(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Settings</h3>
            <p>Language: {language === 'en' ? 'English' : 'Español'}</p>
            <p>Audio: (coming soon)</p>
            <button onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Memory Modal */}
      {showMemory && (
        <div className="modal-overlay" onClick={() => setShowMemory(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>What AIMCS Remembers</h3>
            {memoryProfile ? (
              memoryProfile.error ? (
                <p>{memoryProfile.error}</p>
              ) : (
                <ul>
                  <li><strong>Name:</strong> {memoryProfile.name}</li>
                  <li><strong>Favorite Color:</strong> {memoryProfile.favoriteColor}</li>
                  <li><strong>Interests:</strong> {memoryProfile.interests.join(', ')}</li>
                  <li><strong>Fun Fact:</strong> {memoryProfile.funFact}</li>
                  <li><strong>Recent Topics:</strong> {memoryProfile.lastTopics.join(', ')}</li>
                </ul>
              )
            ) : (
              <p>Loading...</p>
            )}
            <button onClick={() => setShowMemory(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 