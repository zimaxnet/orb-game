import React, { useState, useEffect } from 'react';
import './MemoryPanel.css';

const SORT_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Web Search', value: 'web' },
  { label: 'Local AI', value: 'local' }
];

const VIEW_MODES = [
  { label: 'List', value: 'list', icon: '📋' },
  { label: 'Grid', value: 'grid', icon: '🔲' }
];

const MemoryPanel = ({ isOpen, onClose, onContinueConversation }) => {
  const [memoryStats, setMemoryStats] = useState(null);
  const [allMemories, setAllMemories] = useState([]); // cache all memories
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortType, setSortType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [continueMessage, setContinueMessage] = useState('');
  const [showContinueInput, setShowContinueInput] = useState(false);
  const [activeMemory, setActiveMemory] = useState(null);

  const BACKEND_URL = 'https://api.aimcs.net';

  useEffect(() => {
    if (isOpen) {
      loadMemoryStats();
      loadAllMemories();
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMemory(null);
      setShowContinueInput(false);
      setActiveMemory(null);
    }
  }, [isOpen]);

  const loadMemoryStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/memory/stats`);
      if (response.ok) {
        const stats = await response.json();
        setMemoryStats(stats);
      }
    } catch (error) {
      console.error('Error loading memory stats:', error);
    }
  };

  const loadAllMemories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/memory/export`);
      if (response.ok) {
        const memories = await response.json();
        setAllMemories(Array.isArray(memories) ? memories : []);
      } else {
        setAllMemories([]);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
      setAllMemories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMemories = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(Array.isArray(results.memories) ? results.memories : []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching memories:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const continueConversation = async (memory, additionalMessage = '') => {
    if (!onContinueConversation) return;
    
    const fullMessage = additionalMessage 
      ? `${memory.key} - ${additionalMessage}`
      : memory.key;
    
    onContinueConversation(fullMessage);
    onClose();
  };

  const startContinueConversation = (memory) => {
    setActiveMemory(memory);
    setShowContinueInput(true);
    setContinueMessage('');
  };

  const handleContinueSubmit = () => {
    if (activeMemory && continueMessage.trim()) {
      continueConversation(activeMemory, continueMessage.trim());
    }
  };

  const getMemoryType = (memory) => {
    if (memory.metadata?.searchUsed) return 'web';
    return 'local';
  };

  const getMemoryIcon = (memory) => {
    const type = getMemoryType(memory);
    return type === 'web' ? '🌐' : '🤖';
  };

  const getMemoryColor = (memory) => {
    const type = getMemoryType(memory);
    return type === 'web' ? '#3b82f6' : '#10b981';
  };

  const getUsageBadge = (memory) => {
    const usage = memory.metadata?.usageCount || 0;
    if (usage > 10) return { text: '🔥 Hot', color: '#ef4444' };
    if (usage > 5) return { text: '⭐ Popular', color: '#f59e0b' };
    if (usage > 1) return { text: `${usage} uses`, color: '#6b7280' };
    return null;
  };

  const groupMemoriesByTime = (memories) => {
    const now = new Date();
    const groups = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    if (!Array.isArray(memories)) return groups;

    memories.forEach(memory => {
      const memoryDateStr = memory.metadata?.timestamp || memory.created_at;
      if (!memoryDateStr) {
        groups.older.push(memory);
        return;
      }
      
      const memoryDate = new Date(memoryDateStr);
      if (isNaN(memoryDate.getTime())) {
        groups.older.push(memory);
        return;
      }

      const diffDays = (now - memoryDate) / (1000 * 60 * 60 * 24);

      if (diffDays < 1) groups.today.push(memory);
      else if (diffDays < 7) groups.thisWeek.push(memory);
      else if (diffDays < 30) groups.thisMonth.push(memory);
      else groups.older.push(memory);
    });

    return groups;
  };

  const filterMemories = (memories) => {
    if (sortType === 'all') return memories;
    return memories.filter(memory => getMemoryType(memory) === sortType);
  };

  const displayMemories = searchQuery ? searchResults : filterMemories(allMemories);
  const groupedMemories = groupMemoriesByTime(displayMemories);

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportMemory = (memory) => {
    const data = {
      question: memory.key,
      answer: memory.content,
      timestamp: memory.metadata?.timestamp,
      usageCount: memory.metadata?.usageCount,
      type: getMemoryType(memory)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-${memory.key.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareMemory = (memory) => {
    const text = `Q: ${memory.key}\nA: ${memory.content}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Memory copied to clipboard!');
    }
  };

  const renderMemoryCard = (memory) => {
    const type = getMemoryType(memory);
    const icon = getMemoryIcon(memory);
    const color = getMemoryColor(memory);
    const usageBadge = getUsageBadge(memory);

    return (
      <div 
        key={memory.key} 
        className={`memory-card ${viewMode}`}
        style={{ borderLeftColor: color }}
        onClick={() => setSelectedMemory(selectedMemory?.key === memory.key ? null : memory)}
      >
        <div className="memory-card-header">
          <div className="memory-type">
            <span className="memory-icon">{icon}</span>
            <span className="memory-type-label">{type === 'web' ? 'Web Search' : 'AI Generated'}</span>
          </div>
          {usageBadge && (
            <span className="usage-badge" style={{ backgroundColor: usageBadge.color }}>
              {usageBadge.text}
            </span>
          )}
        </div>
        
        <div className="memory-content">
          <h4 className="memory-question">{memory.key}</h4>
          <p className="memory-answer">
            {selectedMemory?.key === memory.key 
              ? memory.content 
              : memory.content.substring(0, 100) + (memory.content.length > 100 ? '...' : '')
            }
          </p>
        </div>

        <div className="memory-footer">
          <span className="memory-date">{formatDate(memory.metadata?.timestamp || memory.created_at)}</span>
          <div className="memory-actions">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                continueConversation(memory); 
              }} 
              title="Continue Conversation"
              className="continue-btn"
            >
              💬
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                startContinueConversation(memory); 
              }} 
              title="Continue with Additional Context"
              className="continue-with-context-btn"
            >
              ➕
            </button>
            <button onClick={(e) => { e.stopPropagation(); exportMemory(memory); }} title="Export">
              📤
            </button>
            <button onClick={(e) => { e.stopPropagation(); shareMemory(memory); }} title="Share">
              📋
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeGroup = (title, memories, color) => {
    if (memories.length === 0) return null;
    
    return (
      <div key={title} className="time-group">
        <h3 className="time-group-title" style={{ color }}>
          {title} ({memories.length})
        </h3>
        <div className={`memories-container ${viewMode}`}>
          {memories.map(renderMemoryCard)}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="memory-panel-overlay" onClick={onClose}>
      <div className="memory-panel" onClick={(e) => e.stopPropagation()}>
        <div className="memory-panel-header">
          <h2>🧠 Shared Memory System</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {memoryStats && (
          <div className="memory-stats">
            <div className="stat-item">
              <span className="stat-label">Total Memories:</span>
              <span className="stat-value">{memoryStats.totalMemories}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Usage:</span>
              <span className="stat-value">{memoryStats.totalUsage}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Storage Used:</span>
              <span className="stat-value">{memoryStats.storageUsed}</span>
            </div>
          </div>
        )}

        <div className="memory-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMemories()}
              className="search-input"
            />
            <button onClick={searchMemories} className="search-button">
              🔍
            </button>
          </div>

          <div className="filter-section">
            <select 
              value={sortType} 
              onChange={(e) => setSortType(e.target.value)}
              className="sort-select"
            >
              {SORT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <div className="view-toggle">
              {VIEW_MODES.map(mode => (
                <button
                  key={mode.value}
                  className={`view-button ${viewMode === mode.value ? 'active' : ''}`}
                  onClick={() => setViewMode(mode.value)}
                  title={mode.label}
                >
                  {mode.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="memory-content-area">
          {isLoading ? (
            <div className="loading">Loading memories...</div>
          ) : (
            <div className="memories-list">
              {renderTimeGroup('Today', groupedMemories.today, '#ef4444')}
              {renderTimeGroup('This Week', groupedMemories.thisWeek, '#f59e0b')}
              {renderTimeGroup('This Month', groupedMemories.thisMonth, '#3b82f6')}
              {renderTimeGroup('Older', groupedMemories.older, '#6b7280')}
              
              {displayMemories.length === 0 && (
                <div className="no-memories">
                  {searchQuery ? 'No memories found for your search.' : 'No memories available yet.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Continue Conversation Modal */}
        {showContinueInput && activeMemory && (
          <div className="continue-modal">
            <div className="continue-modal-content">
              <h3>💬 Continue Conversation</h3>
              <div className="original-conversation">
                <p><strong>Original:</strong> {activeMemory.key}</p>
                <p><strong>Response:</strong> {activeMemory.content}</p>
              </div>
              <div className="continue-input-section">
                <input
                  type="text"
                  placeholder="Add more context or ask a follow-up question..."
                  value={continueMessage}
                  onChange={(e) => setContinueMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleContinueSubmit()}
                  className="continue-input"
                  autoFocus
                />
                <div className="continue-actions">
                  <button 
                    onClick={handleContinueSubmit}
                    className="continue-submit-btn"
                    disabled={!continueMessage.trim()}
                  >
                    Continue 💬
                  </button>
                  <button 
                    onClick={() => {
                      setShowContinueInput(false);
                      setActiveMemory(null);
                      setContinueMessage('');
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryPanel; 