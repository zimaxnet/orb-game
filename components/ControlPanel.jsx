import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ 
  isOpen, 
  onClose, 
  language, 
  searchMode, 
  onToggleLanguage, 
  onToggleSearchMode, 
  onOpenMemory,
  translations 
}) => {
  const getSearchModeLabel = () => {
    switch (searchMode) {
      case 'auto': return translations[language].auto;
      case 'web': return translations[language].web;
      case 'local': return translations[language].local;
      default: return translations[language].auto;
    }
  };

  const getSearchModeIcon = () => {
    switch (searchMode) {
      case 'auto': return '🤖';
      case 'web': return '🌐';
      case 'local': return '🧠';
      default: return '🤖';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="control-panel-overlay" onClick={onClose} />
      )}
      
      {/* Control Panel */}
      <div className={`control-panel ${isOpen ? 'open' : ''}`}>
        <div className="control-panel-header">
          <h3>⚙️ Controls</h3>
          <button className="close-controls-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="control-panel-content">
          {/* Memory Button */}
          <div className="control-section">
            <h4>🧠 Memory</h4>
            <button 
              className="control-btn memory-btn"
              onClick={onOpenMemory}
            >
              View Memory & History
            </button>
          </div>

          {/* Search Mode */}
          <div className="control-section">
            <h4>🔍 Search Mode</h4>
            <button 
              className="control-btn search-mode-btn"
              onClick={onToggleSearchMode}
            >
              <span className="search-mode-icon">{getSearchModeIcon()}</span>
              <span className="search-mode-label">{getSearchModeLabel()}</span>
            </button>
            <p className="control-description">
              {searchMode === 'auto' && 'Automatically uses web search when needed'}
              {searchMode === 'web' && 'Always uses web search for current information'}
              {searchMode === 'local' && 'Uses only local AI knowledge'}
            </p>
          </div>

          {/* Language Toggle */}
          <div className="control-section">
            <h4>🌐 Language</h4>
            <button 
              className="control-btn language-btn"
              onClick={onToggleLanguage}
            >
              {language === 'en' ? 'English' : 'Español'}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="control-section">
            <h4>⚡ Quick Actions</h4>
            <div className="quick-actions">
              <button className="control-btn secondary">
                📊 Analytics
              </button>
              <button className="control-btn secondary">
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel; 