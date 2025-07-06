import React, { useState, useEffect } from 'react';
import './MemoryPanel.css';

const MemoryPanel = ({ isOpen, onClose }) => {
  const [memoryStats, setMemoryStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const BACKEND_URL = 'https://api.aimcs.net';

  useEffect(() => {
    if (isOpen) {
      loadMemoryStats();
    }
  }, [isOpen]);

  const loadMemoryStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/memory/stats`);
      if (response.ok) {
        const data = await response.json();
        setMemoryStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading memory stats:', error);
    }
  };

  const searchMemories = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/memory/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          userId: 'default',
          limit: 10
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.memories);
      }
    } catch (error) {
      console.error('Error searching memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!isOpen) return null;

  return (
    <div className="memory-panel-overlay" onClick={onClose}>
      <div className="memory-panel" onClick={(e) => e.stopPropagation()}>
        <div className="memory-panel-header">
          <h3>🧠 AIMCS Memory</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="memory-panel-content">
          {/* Memory Statistics */}
          {memoryStats && (
            <div className="memory-stats">
              <h4>Memory Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Memories:</span>
                  <span className="stat-value">{memoryStats.totalMemories}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Usage:</span>
                  <span className="stat-value">{memoryStats.totalUsage}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Usage:</span>
                  <span className="stat-value">{memoryStats.averageUsage.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Memory Search */}
          <div className="memory-search">
            <h4>Search Memories</h4>
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your conversation history..."
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && searchMemories()}
              />
              <button 
                onClick={searchMemories}
                disabled={isLoading || !searchQuery.trim()}
                className="search-button"
              >
                {isLoading ? '🔍' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>Search Results ({searchResults.length})</h4>
              <div className="memory-list">
                {searchResults.map((memory) => (
                  <div key={memory.id} className="memory-item">
                    <div className="memory-header">
                      <span className="memory-score">Score: {memory.score.toFixed(2)}</span>
                      <span className="memory-usage">Used: {memory.usageCount}x</span>
                    </div>
                    <div className="memory-query">
                      <strong>Q:</strong> {truncateText(memory.userMessage)}
                    </div>
                    <div className="memory-response">
                      <strong>A:</strong> {truncateText(memory.aiResponse)}
                    </div>
                    <div className="memory-meta">
                      <span className="memory-date">{formatDate(memory.timestamp)}</span>
                      {memory.metadata.searchUsed && (
                        <span className="memory-search-used">🌐 Web search used</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryPanel; 